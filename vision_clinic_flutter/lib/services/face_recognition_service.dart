import 'dart:io';
import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/user_model.dart';

class FaceRecognitionService {
  final ApiService _apiService = ApiService();

  /// Register patient face from image file
  Future<Map<String, dynamic>> registerFace(String patientId, File imageFile) async {
    try {
      // Use Dio directly for multipart uploads
      final dio = Dio();
      final token = await _apiService.storageHelper.getToken();
      
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        ),
      });

      final response = await dio.post(
        '${_apiService.dio.options.baseUrl}/face-recognition/register/$patientId',
        data: formData,
        options: Options(
          headers: {
            if (token != null) 'Authorization': 'Bearer $token',
          },
          contentType: 'multipart/form-data',
        ),
      );

      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Register patient face from base64 image
  Future<Map<String, dynamic>> registerFaceBase64(String patientId, String base64Image) async {
    try {
      // Remove data URL prefix if present
      String imageData = base64Image;
      if (base64Image.contains(',')) {
        imageData = base64Image.split(',')[1];
      }

      final response = await _apiService.post(
        '/face-recognition/register-base64/$patientId',
        data: {'image': imageData},
      );

      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Recognize face from image file
  Future<Map<String, dynamic>> recognizeFace(File imageFile) async {
    try {
      // Use Dio directly for multipart uploads
      final dio = Dio();
      final token = await _apiService.storageHelper.getToken();
      
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        ),
      });

      final response = await dio.post(
        '${_apiService.dio.options.baseUrl}/face-recognition/recognize',
        data: formData,
        options: Options(
          headers: {
            if (token != null) 'Authorization': 'Bearer $token',
          },
          contentType: 'multipart/form-data',
        ),
      );

      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Recognize face from base64 image
  Future<Map<String, dynamic>> recognizeFaceBase64(String base64Image) async {
    try {
      // Remove data URL prefix if present
      String imageData = base64Image;
      if (base64Image.contains(',')) {
        imageData = base64Image.split(',')[1];
      }

      final response = await _apiService.post(
        '/face-recognition/recognize-base64',
        data: {'image': imageData},
      );

      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Get all registered patients
  Future<List<String>> getRegisteredPatients() async {
    try {
      final response = await _apiService.get('/face-recognition/registered');
      return (response.data['patientIds'] as List).cast<String>();
    } catch (e) {
      rethrow;
    }
  }

  /// Delete face encoding for a patient
  Future<Map<String, dynamic>> deleteFaceEncoding(String patientId) async {
    try {
      final response = await _apiService.delete('/face-recognition/remove/$patientId');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Check if dependencies are installed
  Future<Map<String, dynamic>> checkDependencies() async {
    try {
      final response = await _apiService.get('/face-recognition/check-dependencies');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Login with face recognition (biometric check-in)
  Future<Map<String, dynamic>> loginWithFace(String base64Image) async {
    try {
      // Remove data URL prefix if present
      String imageData = base64Image;
      if (base64Image.contains(',')) {
        imageData = base64Image.split(',')[1];
      }

      final response = await _apiService.post(
        '/biometric/face/check-in',
        data: {'faceImage': imageData},
      );

      // If login successful, store token
      if (response.data['success'] == true && response.data['token'] != null) {
        await _apiService.storageHelper.saveToken(response.data['token']);
        if (response.data['user'] != null) {
          // Convert user data to User model format
          final userData = response.data['user'];
          // Ensure the user data has all required fields
          final userJson = {
            'id': userData['id'] ?? '',
            'email': userData['email'] ?? '',
            'phone': userData['phone'],
            'nationalId': userData['nationalId'],
            'firstName': userData['firstName'] ?? '',
            'lastName': userData['lastName'] ?? '',
            'role': userData['role'] ?? 'PATIENT',
            'status': userData['status'] ?? 'ACTIVE',
            'specialty': userData['specialty'],
            'profileImage': userData['profileImage'],
            'dateOfBirth': userData['dateOfBirth'],
            'address': userData['address'],
            'emailVerified': userData['emailVerified'] ?? false,
            'phoneVerified': userData['phoneVerified'] ?? false,
            'createdAt': userData['createdAt'] ?? DateTime.now().toIso8601String(),
            'updatedAt': userData['updatedAt'] ?? DateTime.now().toIso8601String(),
          };
          final user = User.fromJson(userJson);
          await _apiService.storageHelper.saveUser(user);
        }
      }

      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}

