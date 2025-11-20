import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'eye_test_model.g.dart';

enum TestStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('ANALYZING')
  analyzing,
  @JsonValue('ANALYZED')
  analyzed,
  @JsonValue('DOCTOR_REVIEW')
  doctorReview,
  @JsonValue('COMPLETED')
  completed,
}

@JsonSerializable()
class EyeTest {
  final String id;
  final String patientId;
  final User? patient;
  final String? doctorId;
  final User? doctor;
  final String? optometristId;
  final User? optometrist;
  final TestStatus status;
  final String? visualAcuityRight;
  final String? visualAcuityLeft;
  final String? colorVisionResult;
  final Map<String, dynamic>? refractionRight;
  final Map<String, dynamic>? refractionLeft;
  final List<String> retinaImages;
  final Map<String, dynamic>? aiAnalysis;
  final String? optometristNotes;
  final String? doctorNotes;
  final bool? doctorApproved;
  final Map<String, dynamic>? rawData;
  final DateTime createdAt;
  final DateTime updatedAt;

  EyeTest({
    required this.id,
    required this.patientId,
    this.patient,
    this.doctorId,
    this.doctor,
    this.optometristId,
    this.optometrist,
    required this.status,
    this.visualAcuityRight,
    this.visualAcuityLeft,
    this.colorVisionResult,
    this.refractionRight,
    this.refractionLeft,
    required this.retinaImages,
    this.aiAnalysis,
    this.optometristNotes,
    this.doctorNotes,
    this.doctorApproved,
    this.rawData,
    required this.createdAt,
    required this.updatedAt,
  });

  factory EyeTest.fromJson(Map<String, dynamic> json) =>
      _$EyeTestFromJson(json);
  Map<String, dynamic> toJson() => _$EyeTestToJson(this);
}








