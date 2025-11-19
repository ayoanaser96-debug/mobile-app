import '../config/api_endpoints.dart';
import '../models/appointment_model.dart';
import '../models/eye_test_model.dart';
import '../models/prescription_model.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class DoctorService {
  final ApiService _apiService = ApiService();

  Future<List<Appointment>> getAppointments() async {
    try {
      final response = await _apiService.get(ApiEndpoints.appointments);
      return (response.data as List)
          .map((json) => Appointment.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<EyeTest>> getPendingTests() async {
    try {
      final response = await _apiService.get(ApiEndpoints.pendingAnalysis);
      return (response.data as List)
          .map((json) => EyeTest.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Prescription>> getPendingPrescriptions() async {
    try {
      final response = await _apiService.get('${ApiEndpoints.prescriptions}/pending');
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<EyeTest> approveTest(String testId, {String? notes, bool approved = true}) async {
    try {
      final response = await _apiService.put(
        '${ApiEndpoints.analyzeTest}/$testId/approve',
        data: {'approved': approved, 'notes': notes},
      );
      return EyeTest.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Prescription> createPrescription(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.prescriptions,
        data: data,
      );
      return Prescription.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getAnalytics() async {
    try {
      final response = await _apiService.get(ApiEndpoints.analytics);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Notification>> getNotifications() async {
    try {
      final response = await _apiService.get(ApiEndpoints.notifications);
      return (response.data as List)
          .map((json) => Notification.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<int> getUnreadNotificationCount() async {
    try {
      final response = await _apiService.get(ApiEndpoints.unreadCount);
      return response.data['count'] as int;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      await _apiService.put('${ApiEndpoints.notifications}/$notificationId/read');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> sendMessage(String recipientId, String message, {String recipientType = 'patient'}) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.chatMessages,
        data: {
          'recipientId': recipientId,
          'recipientType': recipientType,
          'message': message,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}

