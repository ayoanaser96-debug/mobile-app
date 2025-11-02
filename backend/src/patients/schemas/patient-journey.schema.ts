import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientJourneyDocument = PatientJourney & Document;

export enum JourneyStep {
  REGISTRATION = 'registration',
  PAYMENT = 'payment',
  ANALYST = 'analyst',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
  COMPLETED = 'completed',
}

export enum JourneyStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Schema({ _id: false, timestamps: false })
export class JourneyStepStatus {
  @Prop({ required: true, enum: JourneyStep, type: String })
  step: JourneyStep;

  @Prop({ required: true, enum: JourneyStatus, default: JourneyStatus.PENDING, type: String })
  status: JourneyStatus;

  @Prop({ required: false, type: Date })
  completedAt?: Date;

  @Prop({ required: false, type: String })
  notes?: string;

  @Prop({ required: false, type: String })
  staffId?: string; // ID of staff member who processed this step
}

@Schema({ timestamps: true })
export class PatientJourney {
  @Prop({ required: true, unique: true })
  patientId: string;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: false })
  patientEmail?: string;

  @Prop({ required: false })
  patientPhone?: string;

  @Prop({ required: true, default: Date.now })
  checkInTime: Date;

  @Prop({ required: false })
  checkOutTime?: Date;

  @Prop({
    type: [{
      step: { type: String, enum: Object.values(JourneyStep), required: true },
      status: { type: String, enum: Object.values(JourneyStatus), required: true, default: JourneyStatus.PENDING },
      completedAt: { type: Date, required: false },
      notes: { type: String, required: false },
      staffId: { type: String, required: false },
    }],
    default: [],
  })
  steps: JourneyStepStatus[];

  @Prop({ required: true, enum: JourneyStatus, default: JourneyStatus.PENDING })
  overallStatus: JourneyStatus;

  @Prop({ required: false })
  currentStep?: JourneyStep;

  @Prop({ required: false })
  appointmentId?: string;

  @Prop({ required: false })
  prescriptionId?: string;

  @Prop({ required: false, type: Object })
  costs?: {
    registration?: number;
    payment?: number;
    analyst?: number;
    doctor?: number;
    pharmacy?: number;
    total?: number;
  };

  @Prop({ required: false, default: false })
  receiptGenerated?: boolean;
}

export const PatientJourneySchema = SchemaFactory.createForClass(PatientJourney);

