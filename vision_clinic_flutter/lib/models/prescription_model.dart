import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';
import 'eye_test_model.dart';

part 'prescription_model.g.dart';

enum PrescriptionStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('PROCESSING')
  processing,
  @JsonValue('READY')
  ready,
  @JsonValue('DELIVERED')
  delivered,
  @JsonValue('COMPLETED')
  completed,
  @JsonValue('FILLED')
  filled,
  @JsonValue('CANCELLED')
  cancelled,
}

@JsonSerializable()
class Prescription {
  final String id;
  final String patientId;
  final User? patient;
  final String doctorId;
  final User? doctor;
  final List<Map<String, dynamic>> medications;
  final List<Map<String, dynamic>>? glasses;
  final String? notes;
  final PrescriptionStatus status;
  final String? pharmacyId;
  final User? pharmacy;
  final String? pharmacyNotes;
  final String? relatedTestId;
  final EyeTest? relatedTest;
  final double? totalAmount;
  final String? diagnosis;
  final Map<String, dynamic>? metadata;
  final Map<String, dynamic>? deliveryInfo;
  final DateTime? readyAt;
  final DateTime? deliveredAt;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Prescription({
    required this.id,
    required this.patientId,
    this.patient,
    required this.doctorId,
    this.doctor,
    required this.medications,
    this.glasses,
    this.notes,
    required this.status,
    this.pharmacyId,
    this.pharmacy,
    this.pharmacyNotes,
    this.relatedTestId,
    this.relatedTest,
    this.totalAmount,
    this.diagnosis,
    this.metadata,
    this.deliveryInfo,
    this.readyAt,
    this.deliveredAt,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) =>
      _$PrescriptionFromJson(json);
  Map<String, dynamic> toJson() => _$PrescriptionToJson(this);
}








