import '../config/api_endpoints.dart';
import '../models/appointment_model.dart';
import '../models/eye_test_model.dart';
import '../models/prescription_model.dart';
import 'api_service.dart';

class PatientService {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> getUnifiedJourney() async {
    try {
      final response = await _apiService.get(ApiEndpoints.patientJourney);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Appointment>> getAppointments() async {
    try {
      final response = await _apiService.get(ApiEndpoints.myAppointments);
      return (response.data as List)
          .map((json) {
            // Handle null appointmentTime
            if (json['appointmentTime'] == null) {
              json['appointmentTime'] = '09:00'; // Default time
            }
            return Appointment.fromJson(json);
          })
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Appointment>> getSuggestedAppointments() async {
    try {
      final response = await _apiService.get(ApiEndpoints.suggestedAppointments);
      return (response.data as List)
          .map((json) => Appointment.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<EyeTest>> getEyeTests() async {
    try {
      final response = await _apiService.get(ApiEndpoints.myEyeTests);
      return (response.data as List)
          .map((json) => EyeTest.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Prescription>> getPrescriptions() async {
    try {
      final response = await _apiService.get(ApiEndpoints.myPrescriptions);
      return (response.data as List)
          .map((json) => Prescription.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getHealthTimeline() async {
    try {
      final response = await _apiService.get(ApiEndpoints.healthTimeline);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getBillingHistory() async {
    try {
      final response = await _apiService.get(ApiEndpoints.billingHistory);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getAiInsights() async {
    try {
      final response = await _apiService.get(ApiEndpoints.aiInsights);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getHealthDashboard() async {
    try {
      final response = await _apiService.get(ApiEndpoints.healthDashboard);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getFinalResults() async {
    try {
      final response = await _apiService.get(ApiEndpoints.finalResults);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getPrescriptionTracking() async {
    try {
      final response = await _apiService.get(ApiEndpoints.prescriptionTracking);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getComparativeAnalysis({String? testId}) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.comparativeAnalysis,
        queryParameters: testId != null ? {'testId': testId} : null,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getWaitTime(String appointmentId) async {
    try {
      final response = await _apiService.get(
        '${ApiEndpoints.appointmentWaitTime}/$appointmentId/wait-time',
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> checkInJourney() async {
    try {
      final response = await _apiService.post(ApiEndpoints.patientJourneyCheckIn);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getJourney() async {
    try {
      final response = await _apiService.get(ApiEndpoints.patientJourneyGet);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getJourneyReceipt() async {
    try {
      final response = await _apiService.get(ApiEndpoints.patientJourneyReceipt);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> markJourneyStepComplete(String step, String patientId, {String? notes}) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.patientJourneyStepComplete(step.toLowerCase()),
        data: {
          'patientId': patientId,
          if (notes != null) 'notes': notes,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getActiveJourneys() async {
    try {
      final response = await _apiService.get(ApiEndpoints.patientJourneyActive);
      return (response.data as List).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getAvailableDoctors() async {
    try {
      final response = await _apiService.get(ApiEndpoints.doctors);
      return (response.data as List).map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<EyeTest> createEyeTest(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(ApiEndpoints.eyeTests, data: data);
      return EyeTest.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Appointment> createAppointment(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.appointments,
        data: data,
      );
      return Appointment.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
