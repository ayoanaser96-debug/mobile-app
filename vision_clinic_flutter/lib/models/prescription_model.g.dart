// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'prescription_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Prescription _$PrescriptionFromJson(Map<String, dynamic> json) => Prescription(
  id: json['id'] as String,
  patientId: json['patientId'] as String,
  patient: json['patient'] == null
      ? null
      : User.fromJson(json['patient'] as Map<String, dynamic>),
  doctorId: json['doctorId'] as String,
  doctor: json['doctor'] == null
      ? null
      : User.fromJson(json['doctor'] as Map<String, dynamic>),
  medications: (json['medications'] as List<dynamic>)
      .map((e) => e as Map<String, dynamic>)
      .toList(),
  glasses: (json['glasses'] as List<dynamic>?)
      ?.map((e) => e as Map<String, dynamic>)
      .toList(),
  notes: json['notes'] as String?,
  status: $enumDecode(_$PrescriptionStatusEnumMap, json['status']),
  pharmacyId: json['pharmacyId'] as String?,
  pharmacy: json['pharmacy'] == null
      ? null
      : User.fromJson(json['pharmacy'] as Map<String, dynamic>),
  pharmacyNotes: json['pharmacyNotes'] as String?,
  relatedTestId: json['relatedTestId'] as String?,
  relatedTest: json['relatedTest'] == null
      ? null
      : EyeTest.fromJson(json['relatedTest'] as Map<String, dynamic>),
  totalAmount: (json['totalAmount'] as num?)?.toDouble(),
  diagnosis: json['diagnosis'] as String?,
  metadata: json['metadata'] as Map<String, dynamic>?,
  deliveryInfo: json['deliveryInfo'] as Map<String, dynamic>?,
  readyAt: json['readyAt'] == null
      ? null
      : DateTime.parse(json['readyAt'] as String),
  deliveredAt: json['deliveredAt'] == null
      ? null
      : DateTime.parse(json['deliveredAt'] as String),
  completedAt: json['completedAt'] == null
      ? null
      : DateTime.parse(json['completedAt'] as String),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$PrescriptionToJson(Prescription instance) =>
    <String, dynamic>{
      'id': instance.id,
      'patientId': instance.patientId,
      'patient': instance.patient,
      'doctorId': instance.doctorId,
      'doctor': instance.doctor,
      'medications': instance.medications,
      'glasses': instance.glasses,
      'notes': instance.notes,
      'status': _$PrescriptionStatusEnumMap[instance.status]!,
      'pharmacyId': instance.pharmacyId,
      'pharmacy': instance.pharmacy,
      'pharmacyNotes': instance.pharmacyNotes,
      'relatedTestId': instance.relatedTestId,
      'relatedTest': instance.relatedTest,
      'totalAmount': instance.totalAmount,
      'diagnosis': instance.diagnosis,
      'metadata': instance.metadata,
      'deliveryInfo': instance.deliveryInfo,
      'readyAt': instance.readyAt?.toIso8601String(),
      'deliveredAt': instance.deliveredAt?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$PrescriptionStatusEnumMap = {
  PrescriptionStatus.pending: 'PENDING',
  PrescriptionStatus.processing: 'PROCESSING',
  PrescriptionStatus.ready: 'READY',
  PrescriptionStatus.delivered: 'DELIVERED',
  PrescriptionStatus.completed: 'COMPLETED',
  PrescriptionStatus.filled: 'FILLED',
  PrescriptionStatus.cancelled: 'CANCELLED',
};
