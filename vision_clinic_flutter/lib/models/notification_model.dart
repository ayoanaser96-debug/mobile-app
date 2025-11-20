import 'package:json_annotation/json_annotation.dart';

part 'notification_model.g.dart';

enum NotificationType {
  @JsonValue('ABNORMAL_FINDING')
  abnormalFinding,
  @JsonValue('FOLLOW_UP_REMINDER')
  followUpReminder,
  @JsonValue('PENDING_APPROVAL')
  pendingApproval,
  @JsonValue('CASE_ASSIGNED')
  caseAssigned,
  @JsonValue('CASE_DELEGATED')
  caseDelegated,
  @JsonValue('PRESCRIPTION_READY')
  prescriptionReady,
  @JsonValue('JOURNEY')
  journey,
}

enum NotificationPriority {
  @JsonValue('LOW')
  low,
  @JsonValue('MEDIUM')
  medium,
  @JsonValue('HIGH')
  high,
  @JsonValue('URGENT')
  urgent,
}

@JsonSerializable()
class Notification {
  final String id;
  final String userId;
  final NotificationType type;
  final NotificationPriority priority;
  final String title;
  final String message;
  final bool isRead;
  final String? relatedTestId;
  final String? relatedPrescriptionId;
  final String? relatedAppointmentId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  Notification({
    required this.id,
    required this.userId,
    required this.type,
    required this.priority,
    required this.title,
    required this.message,
    required this.isRead,
    this.relatedTestId,
    this.relatedPrescriptionId,
    this.relatedAppointmentId,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) =>
      _$NotificationFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationToJson(this);
}








