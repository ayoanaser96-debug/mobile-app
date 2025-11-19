import '../config/api_endpoints.dart';
import '../models/user_model.dart';
import '../models/appointment_model.dart';
import '../models/eye_test_model.dart';
import '../models/prescription_model.dart';
import 'api_service.dart';

class AdminService {
  final ApiService _apiService = ApiService();

  Future<List<User>> getUsers({String? role}) async {
    try {
      final response = await _apiService.get(
        '/users',
        queryParameters: role != null ? {'role': role} : null,
      );
      return (response.data as List)
          .map((json) => User.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<User> createUser(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post('/users', data: data);
      return User.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<User> updateUser(String userId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('/users/$userId', data: data);
      return User.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteUser(String userId) async {
    try {
      await _apiService.delete('/users/$userId');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Appointment>> getAllAppointments() async {
    try {
      final response = await _apiService.get(ApiEndpoints.appointments);
      return (response.data as List)
          .map((json) => Appointment.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<EyeTest>> getAllEyeTests() async {
    try {
      final response = await _apiService.get(ApiEndpoints.eyeTests);
      return (response.data as List)
          .map((json) => EyeTest.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Prescription>> getAllPrescriptions() async {
    try {
      final response = await _apiService.get(ApiEndpoints.prescriptions);
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _apiService.get('/admin/dashboard-stats');
      return response.data;
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

  Future<List<Map<String, dynamic>>> getUsersActivity() async {
    try {
      final response = await _apiService.get('/admin/users/activity');
      return (response.data as List).cast<Map<String, dynamic>>();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getDevices() async {
    try {
      final response = await _apiService.get('/admin/devices');
      return (response.data as List).cast<Map<String, dynamic>>();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getDeviceAlerts() async {
    try {
      final response = await _apiService.get('/admin/devices/alerts');
      return (response.data as List).cast<Map<String, dynamic>>();
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getComprehensiveAnalytics() async {
    try {
      final response = await _apiService.get('/admin/analytics/comprehensive');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getBillingAnalytics() async {
    try {
      final response = await _apiService.get('/admin/billing/analytics');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getAppointmentAnalytics() async {
    try {
      final response = await _apiService.get('/admin/appointments/analytics');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getSecurityStatus() async {
    try {
      final response = await _apiService.get('/admin/security/status');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> revokeUserAccess(String userId) async {
    try {
      await _apiService.post('/admin/users/$userId/revoke-access');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateUserRole(String userId, String role) async {
    try {
      await _apiService.put('/admin/users/$userId/role', data: {'role': role});
    } catch (e) {
      rethrow;
    }
  }

  Future<void> calibrateDevice(String deviceId) async {
    try {
      await _apiService.post('/admin/devices/$deviceId/calibrate');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> toggleLockdown(bool active) async {
    try {
      await _apiService.post('/admin/controls/lockdown', data: {'active': active});
    } catch (e) {
      rethrow;
    }
  }

  Future<void> sendBroadcast(String message) async {
    try {
      await _apiService.post('/admin/controls/broadcast', data: {'message': message});
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateAutomationRule(String ruleKey, bool enabled) async {
    try {
      await _apiService.put('/admin/automation/$ruleKey', data: {'enabled': enabled});
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateSettings(Map<String, dynamic> settings) async {
    try {
      await _apiService.put('/admin/settings', data: settings);
    } catch (e) {
      rethrow;
    }
  }

  Future<String> exportAuditLogs() async {
    try {
      final response = await _apiService.get('/admin/security/audit-logs');
      return response.data.toString();
    } catch (e) {
      rethrow;
    }
  }
}

