import { Module, forwardRef } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [forwardRef(() => PatientsModule)],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}

