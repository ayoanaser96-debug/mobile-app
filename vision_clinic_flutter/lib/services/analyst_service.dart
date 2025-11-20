import '../config/api_endpoints.dart';
import '../models/eye_test_model.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class AnalystService {
  final ApiService _apiService = ApiService();

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

  Future<EyeTest> analyzeTest(String testId, Map<String, dynamic> analysisData) async {
    try {
      final response = await _apiService.put(
        '${ApiEndpoints.analyzeTest}/$testId/analyze',
        data: analysisData,
      );
      return EyeTest.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<EyeTest>> getMyTests() async {
    try {
      final response = await _apiService.get('/eye-tests/analyst/my-tests');
      return (response.data as List)
          .map((json) => EyeTest.fromJson(json))
          .toList();
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

  Future<Map<String, dynamic>> getTestTrends() async {
    try {
      final response = await _apiService.get(ApiEndpoints.testTrends);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}





