import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'appointment_model.g.dart';

enum AppointmentStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('CONFIRMED')
  confirmed,
  @JsonValue('COMPLETED')
  completed,
  @JsonValue('CANCELLED')
  cancelled,
}

enum AppointmentType {
  @JsonValue('IN_PERSON')
  inPerson,
  @JsonValue('VIDEO')
  video,
  @JsonValue('PHONE')
  phone,
}

@JsonSerializable()
class Appointment {
  final String id;
  final String patientId;
  final User? patient;
  final String? doctorId;
  final User? doctor;
  final DateTime appointmentDate;
  final String appointmentTime;
  final AppointmentType type;
  final AppointmentStatus status;
  final String? reason;
  final String? notes;
  final String? videoLink;
  final DateTime createdAt;
  final DateTime updatedAt;

  Appointment({
    required this.id,
    required this.patientId,
    this.patient,
    this.doctorId,
    this.doctor,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.type,
    required this.status,
    this.reason,
    this.notes,
    this.videoLink,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) =>
      _$AppointmentFromJson(json);
  Map<String, dynamic> toJson() => _$AppointmentToJson(this);
}


