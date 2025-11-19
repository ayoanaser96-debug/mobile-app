import 'dart:convert';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class FaceCameraCapture extends StatefulWidget {
  final Function(File imageFile, String base64Image) onImageCaptured;
  final String? instructionText;
  final bool showPreview;

  const FaceCameraCapture({
    super.key,
    required this.onImageCaptured,
    this.instructionText,
    this.showPreview = true,
  });

  @override
  State<FaceCameraCapture> createState() => _FaceCameraCaptureState();
}

class _FaceCameraCaptureState extends State<FaceCameraCapture> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isInitialized = false;
  bool _isCapturing = false;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    // Request camera permission
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Camera permission is required for face recognition'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    try {
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        throw Exception('No cameras available');
      }

      // Use front camera for face recognition
      final frontCamera = _cameras!.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.front,
        orElse: () => _cameras!.first,
      );

      _controller = CameraController(
        frontCamera,
        ResolutionPreset.high,
        enableAudio: false,
      );

      await _controller!.initialize();

      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error initializing camera: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _captureImage() async {
    if (_controller == null || !_controller!.value.isInitialized) {
      return;
    }

    try {
      setState(() {
        _isCapturing = true;
      });

      final image = await _controller!.takePicture();
      
      // Convert to base64
      final bytes = await File(image.path).readAsBytes();
      final base64 = base64Encode(bytes);


      if (widget.showPreview) {
        // Show preview dialog
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => _PreviewDialog(
            imagePath: image.path,
          ),
        );

        if (confirmed == true && mounted) {
          widget.onImageCaptured(File(image.path), base64);
        }
      } else {
        widget.onImageCaptured(File(image.path), base64);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error capturing image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCapturing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return Stack(
      children: [
        // Camera preview
        Positioned.fill(
          child: CameraPreview(_controller!),
        ),
        
        // Overlay with face guide
        Positioned.fill(
          child: CustomPaint(
            painter: FaceGuidePainter(),
            child: Container(),
          ),
        ),

        // Instructions
        if (widget.instructionText != null)
          Positioned(
            top: 50,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.instructionText!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),

        // Capture button
        Positioned(
          bottom: 50,
          left: 0,
          right: 0,
          child: Center(
            child: GestureDetector(
              onTap: _isCapturing ? null : _captureImage,
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isCapturing ? Colors.grey : Colors.white,
                  border: Border.all(color: Colors.white, width: 4),
                ),
                child: _isCapturing
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: Colors.blue,
                        ),
                      )
                    : const Icon(
                        Icons.camera_alt,
                        color: Colors.blue,
                        size: 40,
                      ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _PreviewDialog extends StatelessWidget {
  final String imagePath;

  const _PreviewDialog({required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                File(imagePath),
                height: 300,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Use this photo?',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Retake'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Use Photo'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class FaceGuidePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    // Draw oval guide for face positioning
    final center = Offset(size.width / 2, size.height / 2);
    final ovalRect = Rect.fromCenter(
      center: center,
      width: size.width * 0.7,
      height: size.height * 0.5,
    );

    canvas.drawOval(ovalRect, paint);

    // Draw corner guides
    final cornerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final cornerLength = 30.0;
    final cornerOffset = 20.0;

    // Top-left corner
    canvas.drawLine(
      Offset(ovalRect.left + cornerOffset, ovalRect.top),
      Offset(ovalRect.left + cornerOffset + cornerLength, ovalRect.top),
      cornerPaint,
    );
    canvas.drawLine(
      Offset(ovalRect.left, ovalRect.top + cornerOffset),
      Offset(ovalRect.left, ovalRect.top + cornerOffset + cornerLength),
      cornerPaint,
    );

    // Top-right corner
    canvas.drawLine(
      Offset(ovalRect.right - cornerOffset, ovalRect.top),
      Offset(ovalRect.right - cornerOffset - cornerLength, ovalRect.top),
      cornerPaint,
    );
    canvas.drawLine(
      Offset(ovalRect.right, ovalRect.top + cornerOffset),
      Offset(ovalRect.right, ovalRect.top + cornerOffset + cornerLength),
      cornerPaint,
    );

    // Bottom-left corner
    canvas.drawLine(
      Offset(ovalRect.left + cornerOffset, ovalRect.bottom),
      Offset(ovalRect.left + cornerOffset + cornerLength, ovalRect.bottom),
      cornerPaint,
    );
    canvas.drawLine(
      Offset(ovalRect.left, ovalRect.bottom - cornerOffset),
      Offset(ovalRect.left, ovalRect.bottom - cornerOffset - cornerLength),
      cornerPaint,
    );

    // Bottom-right corner
    canvas.drawLine(
      Offset(ovalRect.right - cornerOffset, ovalRect.bottom),
      Offset(ovalRect.right - cornerOffset - cornerLength, ovalRect.bottom),
      cornerPaint,
    );
    canvas.drawLine(
      Offset(ovalRect.right, ovalRect.bottom - cornerOffset),
      Offset(ovalRect.right, ovalRect.bottom - cornerOffset - cornerLength),
      cornerPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

