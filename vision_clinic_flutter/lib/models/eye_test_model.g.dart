// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'eye_test_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EyeTest _$EyeTestFromJson(Map<String, dynamic> json) => EyeTest(
  id: json['id'] as String,
  patientId: json['patientId'] as String,
  patient: json['patient'] == null
      ? null
      : User.fromJson(json['patient'] as Map<String, dynamic>),
  doctorId: json['doctorId'] as String?,
  doctor: json['doctor'] == null
      ? null
      : User.fromJson(json['doctor'] as Map<String, dynamic>),
  optometristId: json['optometristId'] as String?,
  optometrist: json['optometrist'] == null
      ? null
      : User.fromJson(json['optometrist'] as Map<String, dynamic>),
  status: $enumDecode(_$TestStatusEnumMap, json['status']),
  visualAcuityRight: json['visualAcuityRight'] as String?,
  visualAcuityLeft: json['visualAcuityLeft'] as String?,
  colorVisionResult: json['colorVisionResult'] as String?,
  refractionRight: json['refractionRight'] as Map<String, dynamic>?,
  refractionLeft: json['refractionLeft'] as Map<String, dynamic>?,
  retinaImages: (json['retinaImages'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  aiAnalysis: json['aiAnalysis'] as Map<String, dynamic>?,
  optometristNotes: json['optometristNotes'] as String?,
  doctorNotes: json['doctorNotes'] as String?,
  doctorApproved: json['doctorApproved'] as bool?,
  rawData: json['rawData'] as Map<String, dynamic>?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$EyeTestToJson(EyeTest instance) => <String, dynamic>{
  'id': instance.id,
  'patientId': instance.patientId,
  'patient': instance.patient,
  'doctorId': instance.doctorId,
  'doctor': instance.doctor,
  'optometristId': instance.optometristId,
  'optometrist': instance.optometrist,
  'status': _$TestStatusEnumMap[instance.status]!,
  'visualAcuityRight': instance.visualAcuityRight,
  'visualAcuityLeft': instance.visualAcuityLeft,
  'colorVisionResult': instance.colorVisionResult,
  'refractionRight': instance.refractionRight,
  'refractionLeft': instance.refractionLeft,
  'retinaImages': instance.retinaImages,
  'aiAnalysis': instance.aiAnalysis,
  'optometristNotes': instance.optometristNotes,
  'doctorNotes': instance.doctorNotes,
  'doctorApproved': instance.doctorApproved,
  'rawData': instance.rawData,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$TestStatusEnumMap = {
  TestStatus.pending: 'PENDING',
  TestStatus.analyzing: 'ANALYZING',
  TestStatus.analyzed: 'ANALYZED',
  TestStatus.doctorReview: 'DOCTOR_REVIEW',
  TestStatus.completed: 'COMPLETED',
};
