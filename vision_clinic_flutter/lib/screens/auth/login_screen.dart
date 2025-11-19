import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../models/user_model.dart';
import '../../widgets/animated_card.dart';
import '../../widgets/animated_button.dart';
import '../../widgets/slide_in_animation.dart';
import '../../services/face_recognition_service.dart';
import '../../widgets/face_camera_capture.dart';
import 'dart:io';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _showFaceLogin = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeIn,
      ),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    if (!mounted) return;

    final success = await ref.read(authNotifierProvider.notifier).login(
          _identifierController.text.trim(),
          _passwordController.text,
        );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      final authState = ref.read(authNotifierProvider).valueOrNull;
      if (authState?.user != null) {
        _navigateToDashboard(authState!.user!.role);
      }
    } else {
      final error = ref.read(authNotifierProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error?.toString() ?? 'Login failed'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleFaceLogin(File imageFile, String base64Image) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final service = FaceRecognitionService();
      final result = await service.recognizeFaceBase64(base64Image);

      if (!mounted) return;

      if (result['recognized'] == true && result['patient'] != null) {
        final patient = result['patient'];
        
        // Use biometric check-in endpoint for proper login
        final biometricService = FaceRecognitionService();
        final loginResult = await biometricService.loginWithFace(base64Image);
        
        if (loginResult['success'] == true && loginResult['token'] != null) {
          // Store the token and user info
          final authService = ref.read(authNotifierProvider.notifier);
          // The token is already stored by the service, refresh auth state
          await authService.refresh();
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Welcome back, ${patient['firstName'] ?? 'User'}!'),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
            ),
          );

          // Navigate based on user role
          final userRoleStr = loginResult['user']?['role']?.toString().toUpperCase();
          if (mounted && userRoleStr != null) {
            UserRole? userRole;
            try {
              userRole = UserRole.values.firstWhere(
                (role) => role.toString().split('.').last.toUpperCase() == userRoleStr,
              );
            } catch (e) {
              // Default to patient if role not found
              userRole = UserRole.patient;
            }
            _navigateToDashboard(userRole);
          } else if (mounted) {
            context.go('/patient');
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(loginResult['message'] ?? 'Login failed'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Face not recognized. Please try again or use password login.'),
            backgroundColor: Colors.orange,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _showFaceLogin = false;
        });
      }
    }
  }

  void _navigateToDashboard(UserRole role) {
    if (!mounted) return;

    String route = '/patient';
    switch (role) {
      case UserRole.patient:
        route = '/patient';
        break;
      case UserRole.doctor:
        route = '/doctor';
        break;
      case UserRole.admin:
        route = '/admin';
        break;
      case UserRole.pharmacy:
        route = '/pharmacy';
        break;
      case UserRole.optometrist:
        route = '/analyst';
        break;
    }

    context.go(route);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    if (_showFaceLogin) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Face Recognition Login'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              setState(() {
                _showFaceLogin = false;
              });
            },
          ),
        ),
        body: Stack(
          children: [
            FaceCameraCapture(
              onImageCaptured: _handleFaceLogin,
              instructionText: 'Look at the camera to login',
              showPreview: false,
            ),
            if (_isLoading)
              Container(
                color: Colors.black54,
                child: const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(
                        color: Colors.white,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Recognizing face...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 100),
                    beginOffset: const Offset(0, -0.1),
                    child: TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0.0, end: 1.0),
                      duration: const Duration(milliseconds: 800),
                      curve: Curves.elasticOut,
                      builder: (context, value, child) {
                        return Transform.scale(
                          scale: value,
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.remove_red_eye,
                              size: 80,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 32),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 200),
                    beginOffset: const Offset(0, 0.1),
                    child: const Text(
                      'Vision Clinic',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 300),
                    beginOffset: const Offset(0, 0.1),
                    child: Text(
                      'Sign in to your account',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 48),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 400),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 400),
                      child: TextFormField(
                        controller: _identifierController,
                        decoration: InputDecoration(
                          labelText: 'Email / Phone / National ID',
                          prefixIcon: Icon(
                            Icons.person,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        keyboardType: TextInputType.text,
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your identifier';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 500),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 500),
                      child: TextFormField(
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: Icon(
                            Icons.lock,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: Colors.grey,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _handleLogin(),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your password';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        // TODO: Implement forgot password
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Forgot password feature coming soon'),
                          ),
                        );
                      },
                      child: const Text('Forgot Password?'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 600),
                    beginOffset: const Offset(0, 0.1),
                    child: AnimatedButton(
                      onPressed: _isLoading || authState.isLoading ? null : _handleLogin,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: _isLoading || authState.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Sign In',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(child: Divider(color: Colors.grey[300])),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.grey[300])),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 700),
                    beginOffset: const Offset(0, 0.1),
                    child: AnimatedButton(
                      onPressed: () {
                        setState(() {
                          _showFaceLogin = true;
                        });
                      },
                      backgroundColor: Colors.teal,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.face, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Login with Face Recognition',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Don\'t have an account? '),
                      TextButton(
                        onPressed: () {
                          // TODO: Navigate to register
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Registration feature coming soon'),
                            ),
                          );
                        },
                        child: const Text(
                          'Register',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
