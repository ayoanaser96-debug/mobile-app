import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/face_recognition_service.dart';
import '../../widgets/face_camera_capture.dart';

class FaceCheckInScreen extends ConsumerStatefulWidget {
  const FaceCheckInScreen({super.key});

  @override
  ConsumerState<FaceCheckInScreen> createState() => _FaceCheckInScreenState();
}

class _FaceCheckInScreenState extends ConsumerState<FaceCheckInScreen> {
  bool _isRecognizing = false;

  Future<void> _recognizeFace(File imageFile, String base64Image) async {
    setState(() {
      _isRecognizing = true;
    });

    try {
      final service = FaceRecognitionService();
      final result = await service.recognizeFaceBase64(base64Image);

      if (mounted) {
        setState(() {
          _isRecognizing = false;
        });

        if (result['recognized'] == true) {
          _showSuccessDialog(result);
        } else {
          _showFailureDialog(result['message'] ?? 'Face not recognized');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isRecognizing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showSuccessDialog(Map<String, dynamic> result) {
    final patient = result['patient'];
    final confidence = result['confidence'] ?? 0.0;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 32),
            const SizedBox(width: 12),
            const Expanded(child: Text('Check-in Successful')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (patient != null) ...[
              Text(
                'Welcome, ${patient['firstName'] ?? ''} ${patient['lastName'] ?? ''}!',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              if (patient['email'] != null)
                Text('Email: ${patient['email']}'),
              const SizedBox(height: 16),
            ],
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.face, color: Colors.green),
                  const SizedBox(width: 8),
                  Text(
                    'Confidence: ${(confidence * 100).toStringAsFixed(1)}%',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context, true);
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _showFailureDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 32),
            const SizedBox(width: 12),
            const Expanded(child: Text('Not Recognized')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.face_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              'Please try again or contact support',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Try Again'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Face Check-in'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          FaceCameraCapture(
            onImageCaptured: _recognizeFace,
            instructionText: 'Look at the camera and tap to check in',
            showPreview: false,
          ),
          if (_isRecognizing)
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
}

