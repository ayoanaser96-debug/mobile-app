import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ABNORMAL_FINDING = 'abnormal_finding',
  FOLLOW_UP_REMINDER = 'follow_up_reminder',
  PENDING_APPROVAL = 'pending_approval',
  CASE_ASSIGNED = 'case_assigned',
  CASE_DELEGATED = 'case_delegated',
  PRESCRIPTION_READY = 'prescription_ready',
  JOURNEY = 'journey',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EyeTest' })
  relatedTestId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Prescription' })
  relatedPrescriptionId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
  relatedAppointmentId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object })
  metadata?: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);


