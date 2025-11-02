import { Injectable, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientJourney, PatientJourneyDocument, JourneyStep, JourneyStatus } from './schemas/patient-journey.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationPriority } from '../notifications/schemas/notification.schema';

@Injectable()
export class PatientJourneyService {
  constructor(
    @InjectModel(PatientJourney.name)
    private journeyModel: Model<PatientJourneyDocument>,
    @Optional() @Inject(forwardRef(() => NotificationsService))
    private notificationsService?: NotificationsService,
  ) {}

  async checkIn(patientId: string, patientData: any) {
    // Check if journey already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let journey = await this.journeyModel.findOne({
      patientId,
      checkInTime: { $gte: today },
    });

    if (!journey) {
      // Create new journey with all steps
      const steps = [
        { step: JourneyStep.REGISTRATION, status: JourneyStatus.COMPLETED, completedAt: new Date() },
        { step: JourneyStep.PAYMENT, status: JourneyStatus.PENDING },
        { step: JourneyStep.ANALYST, status: JourneyStatus.PENDING },
        { step: JourneyStep.DOCTOR, status: JourneyStatus.PENDING },
        { step: JourneyStep.PHARMACY, status: JourneyStatus.PENDING },
      ];

      // Default costs
      const costs = {
        registration: 0,
        payment: 100,
        analyst: 50,
        doctor: 150,
        pharmacy: 75,
        total: 375,
      };

      journey = new this.journeyModel({
        patientId,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientEmail: patientData.email,
        patientPhone: patientData.phone,
        checkInTime: new Date(),
        steps,
        overallStatus: JourneyStatus.IN_PROGRESS,
        currentStep: JourneyStep.PAYMENT,
        costs,
      });

      await journey.save();

      // Send notification
      await this.sendStepNotification(patientId, JourneyStep.REGISTRATION, 'Registration completed! Please proceed to payment.');
    }

    return journey;
  }

  private async sendStepNotification(patientId: string, step: JourneyStep, message: string) {
    if (this.notificationsService) {
      try {
        await this.notificationsService.create({
          userId: patientId,
          title: `Step Completed: ${step.charAt(0).toUpperCase() + step.slice(1)}`,
          message,
          type: NotificationType.JOURNEY,
          priority: NotificationPriority.MEDIUM,
        });
      } catch (error: any) {
        console.log('Notification creation skipped:', error.message);
      }
    }
  }

  async getJourney(patientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const journey = await this.journeyModel.findOne({
      patientId,
      checkInTime: { $gte: today },
    }).sort({ checkInTime: -1 });

    if (!journey) {
      throw new NotFoundException('No active journey found for today');
    }

    return journey;
  }

  async updateStep(
    patientId: string,
    step: JourneyStep,
    status: JourneyStatus,
    staffId?: string,
    notes?: string,
  ) {
    const journey = await this.getJourney(patientId);

    const stepIndex = journey.steps.findIndex((s) => s.step === step);
    if (stepIndex === -1) {
      throw new NotFoundException(`Step ${step} not found in journey`);
    }

    const wasPending = journey.steps[stepIndex].status === JourneyStatus.PENDING;
    journey.steps[stepIndex].status = status;
    if (status === JourneyStatus.COMPLETED) {
      journey.steps[stepIndex].completedAt = new Date();
      if (wasPending) {
        // Send notification when step is completed
        const stepNames: Record<JourneyStep, string> = {
          [JourneyStep.REGISTRATION]: 'Registration',
          [JourneyStep.PAYMENT]: 'Payment',
          [JourneyStep.ANALYST]: 'Eye Test & Analysis',
          [JourneyStep.DOCTOR]: 'Doctor Consultation',
          [JourneyStep.PHARMACY]: 'Pharmacy',
          [JourneyStep.COMPLETED]: 'Completed',
        };
        
        const nextStepMessages: Record<JourneyStep, string> = {
          [JourneyStep.REGISTRATION]: 'Please proceed to the Finance counter for payment.',
          [JourneyStep.PAYMENT]: 'Payment completed! Please proceed to the Analyst station for eye testing.',
          [JourneyStep.ANALYST]: 'Eye test completed! Please proceed to see the Doctor.',
          [JourneyStep.DOCTOR]: 'Consultation completed! Please proceed to the Pharmacy.',
          [JourneyStep.PHARMACY]: 'All steps completed! Please collect your receipt.',
          [JourneyStep.COMPLETED]: '',
        };

        await this.sendStepNotification(
          patientId,
          step,
          `${stepNames[step]} completed successfully! ${nextStepMessages[step]}`
        );
      }
    }
    if (staffId) {
      journey.steps[stepIndex].staffId = staffId;
    }
    if (notes) {
      journey.steps[stepIndex].notes = notes;
    }

    // Update current step
    const nextPendingStep = journey.steps.find(
      (s) => s.status === JourneyStatus.PENDING,
    );
    if (nextPendingStep) {
      journey.currentStep = nextPendingStep.step;
    } else {
      journey.currentStep = JourneyStep.COMPLETED;
      journey.overallStatus = JourneyStatus.COMPLETED;
      journey.checkOutTime = new Date();
      
      // Generate receipt when all steps are complete
      if (!journey.receiptGenerated) {
        journey.receiptGenerated = true;
        await this.sendStepNotification(
          patientId,
          JourneyStep.COMPLETED,
          `Your visit is complete! Total cost: $${journey.costs?.total || 0}. Receipt has been generated.`
        );
      }
    }

    await journey.save();
    return journey;
  }

  async generateReceipt(patientId: string) {
    const journey = await this.getJourney(patientId);
    
    if (journey.overallStatus !== JourneyStatus.COMPLETED) {
      throw new NotFoundException('Journey is not yet completed');
    }

    return {
      patientName: journey.patientName,
      patientId: journey.patientId,
      checkInTime: journey.checkInTime,
      checkOutTime: journey.checkOutTime,
      costs: journey.costs,
      steps: journey.steps.map(s => ({
        step: s.step,
        completedAt: s.completedAt,
      })),
      totalCost: journey.costs?.total || 0,
      receiptDate: new Date(),
    };
  }

  async markPaymentComplete(patientId: string, staffId?: string) {
    return this.updateStep(patientId, JourneyStep.PAYMENT, JourneyStatus.COMPLETED, staffId);
  }

  async markAnalystComplete(patientId: string, staffId?: string) {
    return this.updateStep(patientId, JourneyStep.ANALYST, JourneyStatus.COMPLETED, staffId);
  }

  async markDoctorComplete(patientId: string, staffId?: string, appointmentId?: string) {
    const journey = await this.updateStep(patientId, JourneyStep.DOCTOR, JourneyStatus.COMPLETED, staffId);
    if (appointmentId) {
      journey.appointmentId = appointmentId;
      await journey.save();
    }
    return journey;
  }

  async markPharmacyComplete(patientId: string, staffId?: string, prescriptionId?: string) {
    const journey = await this.updateStep(patientId, JourneyStep.PHARMACY, JourneyStatus.COMPLETED, staffId);
    if (prescriptionId) {
      journey.prescriptionId = prescriptionId;
      await journey.save();
    }
    return journey;
  }

  async getAllActiveJourneys() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.journeyModel.find({
      checkInTime: { $gte: today },
      overallStatus: { $ne: JourneyStatus.COMPLETED },
    }).sort({ checkInTime: -1 });
  }
}

