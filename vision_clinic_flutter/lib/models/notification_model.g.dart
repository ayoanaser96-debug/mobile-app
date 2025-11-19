// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Notification _$NotificationFromJson(Map<String, dynamic> json) => Notification(
  id: json['id'] as String,
  userId: json['userId'] as String,
  type: $enumDecode(_$NotificationTypeEnumMap, json['type']),
  priority: $enumDecode(_$NotificationPriorityEnumMap, json['priority']),
  title: json['title'] as String,
  message: json['message'] as String,
  isRead: json['isRead'] as bool,
  relatedTestId: json['relatedTestId'] as String?,
  relatedPrescriptionId: json['relatedPrescriptionId'] as String?,
  relatedAppointmentId: json['relatedAppointmentId'] as String?,
  metadata: json['metadata'] as Map<String, dynamic>?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$NotificationToJson(Notification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'type': _$NotificationTypeEnumMap[instance.type]!,
      'priority': _$NotificationPriorityEnumMap[instance.priority]!,
      'title': instance.title,
      'message': instance.message,
      'isRead': instance.isRead,
      'relatedTestId': instance.relatedTestId,
      'relatedPrescriptionId': instance.relatedPrescriptionId,
      'relatedAppointmentId': instance.relatedAppointmentId,
      'metadata': instance.metadata,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$NotificationTypeEnumMap = {
  NotificationType.abnormalFinding: 'ABNORMAL_FINDING',
  NotificationType.followUpReminder: 'FOLLOW_UP_REMINDER',
  NotificationType.pendingApproval: 'PENDING_APPROVAL',
  NotificationType.caseAssigned: 'CASE_ASSIGNED',
  NotificationType.caseDelegated: 'CASE_DELEGATED',
  NotificationType.prescriptionReady: 'PRESCRIPTION_READY',
  NotificationType.journey: 'JOURNEY',
};

const _$NotificationPriorityEnumMap = {
  NotificationPriority.low: 'LOW',
  NotificationPriority.medium: 'MEDIUM',
  NotificationPriority.high: 'HIGH',
  NotificationPriority.urgent: 'URGENT',
};
