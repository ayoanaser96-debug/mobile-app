import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/face_recognition_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/face_camera_capture.dart';

final faceRecognitionServiceProvider = Provider<FaceRecognitionService>((ref) {
  return FaceRecognitionService();
});

class FaceRegisterScreen extends ConsumerStatefulWidget {
  const FaceRegisterScreen({super.key});

  @override
  ConsumerState<FaceRegisterScreen> createState() => _FaceRegisterScreenState();
}

class _FaceRegisterScreenState extends ConsumerState<FaceRegisterScreen> {
  bool _isRegistering = false;
  File? _capturedImage;
  String? _base64Image;

  Future<void> _registerFace() async {
    if (_capturedImage == null || _base64Image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please capture your face first'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final authState = ref.read(authNotifierProvider);
    final user = authState.valueOrNull?.user;

    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login first'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isRegistering = true;
    });

    try {
      final service = ref.read(faceRecognitionServiceProvider);
      final result = await service.registerFaceBase64(user.id, _base64Image!);

      if (mounted) {
        if (result['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Face registered successfully'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Failed to register face'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isRegistering = false;
        });
      }
    }
  }

  void _onImageCaptured(File imageFile, String base64Image) {
    setState(() {
      _capturedImage = imageFile;
      _base64Image = base64Image;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Face'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: _capturedImage == null
                ? FaceCameraCapture(
                    onImageCaptured: _onImageCaptured,
                    instructionText: 'Position your face within the guide and tap to capture',
                  )
                : Stack(
                    children: [
                      Center(
                        child: Image.file(
                          _capturedImage!,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                        ),
                      ),
                      Positioned(
                        bottom: 20,
                        left: 0,
                        right: 0,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _capturedImage = null;
                                      _base64Image = null;
                                    });
                                  },
                                  icon: const Icon(Icons.refresh),
                                  label: const Text('Retake'),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _isRegistering ? null : _registerFace,
                                  icon: _isRegistering
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      : const Icon(Icons.check),
                                  label: Text(_isRegistering ? 'Registering...' : 'Register'),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    backgroundColor: Colors.green,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

