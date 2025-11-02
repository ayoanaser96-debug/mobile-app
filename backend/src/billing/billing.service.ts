import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PatientJourneyService } from '../patients/patient-journey.service';

@Injectable()
export class BillingService {
  constructor(
    @Inject(forwardRef(() => PatientJourneyService))
    private patientJourneyService: PatientJourneyService,
  ) {}

  async processPayment(patientId: string, amount: number, staffId?: string) {
    // Process payment logic here
    // After successful payment, mark payment step as complete
    try {
      await this.patientJourneyService.markPaymentComplete(patientId, staffId);
    } catch (error) {
      // Journey might not exist yet, that's okay
      console.log('Journey update skipped:', error.message);
    }
    
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount,
      paidAt: new Date(),
    };
  }
}

