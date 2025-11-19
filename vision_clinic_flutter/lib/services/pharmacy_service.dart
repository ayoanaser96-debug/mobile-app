import '../config/api_endpoints.dart';
import '../models/prescription_model.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class PharmacyService {
  final ApiService _apiService = ApiService();

  Future<List<Prescription>> getPendingPrescriptions() async {
    try {
      final response = await _apiService.get('${ApiEndpoints.prescriptions}/pharmacy/pending');
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Prescription>> getProcessingPrescriptions() async {
    try {
      final response = await _apiService.get('${ApiEndpoints.prescriptions}/pharmacy/processing');
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Prescription>> getReadyPrescriptions() async {
    try {
      final response = await _apiService.get('${ApiEndpoints.prescriptions}/pharmacy/ready');
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Prescription> updatePrescriptionStatus(
    String prescriptionId,
    PrescriptionStatus status, {
    String? notes,
  }) async {
    try {
      final response = await _apiService.put(
        '${ApiEndpoints.prescriptions}/$prescriptionId/status',
        data: {
          'status': status.toString().split('.').last,
          'notes': notes,
        },
      );
      return Prescription.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Prescription> rejectPrescription(String prescriptionId, String reason) async {
    try {
      final response = await _apiService.put(
        '${ApiEndpoints.prescriptions}/$prescriptionId/reject',
        data: {'reason': reason},
      );
      return Prescription.fromJson(response.data);
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

  Future<Map<String, dynamic>> getPharmacyStats() async {
    try {
      final response = await _apiService.get('${ApiEndpoints.prescriptions}/pharmacy/stats');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}

