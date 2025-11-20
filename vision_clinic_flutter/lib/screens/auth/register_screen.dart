import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../models/user_model.dart';
import '../../widgets/animated_card.dart';
import '../../widgets/animated_button.dart';
import '../../widgets/slide_in_animation.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _nationalIdController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _addressController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  UserRole _selectedRole = UserRole.patient;
  DateTime? _selectedDateOfBirth;
  
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
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _nationalIdController.dispose();
    _specialtyController.dispose();
    _addressController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _selectDateOfBirth() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 25)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDateOfBirth) {
      setState(() {
        _selectedDateOfBirth = picked;
      });
    }
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    if (!mounted) return;

    final registrationData = <String, dynamic>{
      'email': _emailController.text.trim(),
      'password': _passwordController.text,
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'role': _selectedRole.toString().split('.').last.toUpperCase(),
    };

    if (_phoneController.text.trim().isNotEmpty) {
      registrationData['phone'] = _phoneController.text.trim();
    }

    if (_nationalIdController.text.trim().isNotEmpty) {
      registrationData['nationalId'] = _nationalIdController.text.trim();
    }

    if (_selectedRole == UserRole.doctor || _selectedRole == UserRole.optometrist) {
      if (_specialtyController.text.trim().isNotEmpty) {
        registrationData['specialty'] = _specialtyController.text.trim();
      }
    }

    if (_selectedDateOfBirth != null) {
      registrationData['dateOfBirth'] = _selectedDateOfBirth!.toIso8601String();
    }

    if (_addressController.text.trim().isNotEmpty) {
      registrationData['address'] = _addressController.text.trim();
    }

    final success = await ref.read(authNotifierProvider.notifier).register(registrationData);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      final authState = ref.read(authNotifierProvider).valueOrNull;
      if (authState?.user != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration successful! Welcome, ${authState!.user!.firstName}!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _navigateToDashboard(authState.user!.role);
      }
    } else {
      final error = ref.read(authNotifierProvider).error;
      String errorMessage = 'Registration failed. Please try again.';
      
      if (error != null) {
        // Extract error message from exception
        final errorString = error.toString();
        if (errorString.contains('Exception: ')) {
          errorMessage = errorString.replaceFirst('Exception: ', '');
        } else {
          errorMessage = errorString;
        }
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
        ),
      );
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
    final showSpecialty = _selectedRole == UserRole.doctor || _selectedRole == UserRole.optometrist;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 100),
                    beginOffset: const Offset(0, -0.1),
                    child: const Text(
                      'Create Your Account',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 200),
                    beginOffset: const Offset(0, 0.1),
                    child: Text(
                      'Fill in your details to get started',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 300),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 300),
                      child: TextFormField(
                        controller: _firstNameController,
                        decoration: InputDecoration(
                          labelText: 'First Name *',
                          prefixIcon: Icon(
                            Icons.person_outline,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your first name';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 350),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 350),
                      child: TextFormField(
                        controller: _lastNameController,
                        decoration: InputDecoration(
                          labelText: 'Last Name *',
                          prefixIcon: Icon(
                            Icons.person_outline,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your last name';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 400),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 400),
                      child: TextFormField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          labelText: 'Email *',
                          prefixIcon: Icon(
                            Icons.email_outlined,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your email';
                          }
                          if (!value.contains('@')) {
                            return 'Please enter a valid email';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 450),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 450),
                      child: TextFormField(
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: 'Password *',
                          prefixIcon: Icon(
                            Icons.lock_outline,
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
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a password';
                          }
                          if (value.length < 6) {
                            return 'Password must be at least 6 characters';
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
                        controller: _confirmPasswordController,
                        decoration: InputDecoration(
                          labelText: 'Confirm Password *',
                          prefixIcon: Icon(
                            Icons.lock_outline,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: Colors.grey,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword = !_obscureConfirmPassword;
                              });
                            },
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        obscureText: _obscureConfirmPassword,
                        textInputAction: TextInputAction.next,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please confirm your password';
                          }
                          if (value != _passwordController.text) {
                            return 'Passwords do not match';
                          }
                          return null;
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 550),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 550),
                      child: DropdownButtonFormField<UserRole>(
                        value: _selectedRole,
                        decoration: InputDecoration(
                          labelText: 'Role *',
                          prefixIcon: Icon(
                            Icons.work_outline,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        items: UserRole.values.map((role) {
                          return DropdownMenuItem(
                            value: role,
                            child: Text(
                              role.toString().split('.').last.toUpperCase(),
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _selectedRole = value;
                            });
                          }
                        },
                      ),
                    ),
                  ),
                  if (showSpecialty) ...[
                    const SizedBox(height: 16),
                    SlideInAnimation(
                      delay: const Duration(milliseconds: 600),
                      beginOffset: const Offset(0.1, 0),
                      child: AnimatedCard(
                        delay: const Duration(milliseconds: 600),
                        child: TextFormField(
                          controller: _specialtyController,
                          decoration: InputDecoration(
                            labelText: 'Specialty',
                            prefixIcon: Icon(
                              Icons.medical_services_outlined,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            filled: true,
                            fillColor: Colors.grey[50],
                          ),
                          textInputAction: TextInputAction.next,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 650),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 650),
                      child: TextFormField(
                        controller: _phoneController,
                        decoration: InputDecoration(
                          labelText: 'Phone',
                          prefixIcon: Icon(
                            Icons.phone_outlined,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 700),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 700),
                      child: TextFormField(
                        controller: _nationalIdController,
                        decoration: InputDecoration(
                          labelText: 'National ID',
                          prefixIcon: Icon(
                            Icons.badge_outlined,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        textInputAction: TextInputAction.next,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 750),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 750),
                      child: InkWell(
                        onTap: _selectDateOfBirth,
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Date of Birth',
                            prefixIcon: Icon(
                              Icons.calendar_today_outlined,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            filled: true,
                            fillColor: Colors.grey[50],
                          ),
                          child: Text(
                            _selectedDateOfBirth == null
                                ? 'Select date'
                                : '${_selectedDateOfBirth!.day}/${_selectedDateOfBirth!.month}/${_selectedDateOfBirth!.year}',
                            style: TextStyle(
                              color: _selectedDateOfBirth == null
                                  ? Colors.grey[600]
                                  : Colors.black87,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 800),
                    beginOffset: const Offset(0.1, 0),
                    child: AnimatedCard(
                      delay: const Duration(milliseconds: 800),
                      child: TextFormField(
                        controller: _addressController,
                        decoration: InputDecoration(
                          labelText: 'Address',
                          prefixIcon: Icon(
                            Icons.home_outlined,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        maxLines: 2,
                        textInputAction: TextInputAction.done,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  SlideInAnimation(
                    delay: const Duration(milliseconds: 850),
                    beginOffset: const Offset(0, 0.1),
                    child: AnimatedButton(
                      onPressed: _isLoading || authState.isLoading ? null : _handleRegister,
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
                              'Create Account',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already have an account? '),
                      TextButton(
                        onPressed: () => context.pop(),
                        child: const Text(
                          'Sign In',
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

