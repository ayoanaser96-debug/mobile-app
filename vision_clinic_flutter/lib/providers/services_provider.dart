import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../services/patient_service.dart';
import '../services/doctor_service.dart';
import '../services/admin_service.dart';
import '../services/pharmacy_service.dart';
import '../services/analyst_service.dart';
import '../services/face_recognition_service.dart';

part 'services_provider.g.dart';

@riverpod
PatientService patientService(PatientServiceRef ref) {
  return PatientService();
}

@riverpod
DoctorService doctorService(DoctorServiceRef ref) {
  return DoctorService();
}

@riverpod
AdminService adminService(AdminServiceRef ref) {
  return AdminService();
}

@riverpod
PharmacyService pharmacyService(PharmacyServiceRef ref) {
  return PharmacyService();
}

@riverpod
AnalystService analystService(AnalystServiceRef ref) {
  return AnalystService();
}

@riverpod
FaceRecognitionService faceRecognitionService(FaceRecognitionServiceRef ref) {
  return FaceRecognitionService();
}

