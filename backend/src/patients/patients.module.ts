import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsEnhancedService } from './patients-enhanced.service';
import { PatientJourneyService } from './patient-journey.service';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { MedicalHistory, MedicalHistorySchema } from './schemas/medical-history.schema';
import { PatientJourney, PatientJourneySchema } from './schemas/patient-journey.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { EyeTest, EyeTestSchema } from '../eye-tests/schemas/eye-test.schema';
import { Prescription, PrescriptionSchema } from '../prescriptions/schemas/prescription.schema';
import { Case, CaseSchema } from '../cases/schemas/case.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: MedicalHistory.name, schema: MedicalHistorySchema },
      { name: PatientJourney.name, schema: PatientJourneySchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: EyeTest.name, schema: EyeTestSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Case.name, schema: CaseSchema },
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientsEnhancedService, PatientJourneyService],
  exports: [PatientsService, PatientsEnhancedService, PatientJourneyService],
})
export class PatientsModule {}
