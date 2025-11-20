// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'appointment_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Appointment _$AppointmentFromJson(Map<String, dynamic> json) => Appointment(
  id: json['id'] as String,
  patientId: json['patientId'] as String,
  patient: json['patient'] == null
      ? null
      : User.fromJson(json['patient'] as Map<String, dynamic>),
  doctorId: json['doctorId'] as String?,
  doctor: json['doctor'] == null
      ? null
      : User.fromJson(json['doctor'] as Map<String, dynamic>),
  appointmentDate: DateTime.parse(json['appointmentDate'] as String),
  appointmentTime: json['appointmentTime'] as String?,
  type: $enumDecode(_$AppointmentTypeEnumMap, json['type']),
  status: $enumDecode(_$AppointmentStatusEnumMap, json['status']),
  reason: json['reason'] as String?,
  notes: json['notes'] as String?,
  videoLink: json['videoLink'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$AppointmentToJson(Appointment instance) =>
    <String, dynamic>{
      'id': instance.id,
      'patientId': instance.patientId,
      'patient': instance.patient,
      'doctorId': instance.doctorId,
      'doctor': instance.doctor,
      'appointmentDate': instance.appointmentDate.toIso8601String(),
      'appointmentTime': instance.appointmentTime,
      'type': _$AppointmentTypeEnumMap[instance.type]!,
      'status': _$AppointmentStatusEnumMap[instance.status]!,
      'reason': instance.reason,
      'notes': instance.notes,
      'videoLink': instance.videoLink,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$AppointmentTypeEnumMap = {
  AppointmentType.inPerson: 'IN_PERSON',
  AppointmentType.video: 'VIDEO',
  AppointmentType.phone: 'PHONE',
};

const _$AppointmentStatusEnumMap = {
  AppointmentStatus.pending: 'PENDING',
  AppointmentStatus.confirmed: 'CONFIRMED',
  AppointmentStatus.completed: 'COMPLETED',
  AppointmentStatus.cancelled: 'CANCELLED',
};
