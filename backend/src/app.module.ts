import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { EyeTestsModule } from './eye-tests/eye-tests.module';
import { AnalystsModule } from './analysts/analysts.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AdminModule } from './admin/admin.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CasesModule } from './cases/cases.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/vision-clinic',
    ),
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    EyeTestsModule,
    AnalystsModule,
    DoctorsModule,
    AdminModule,
    PrescriptionsModule,
    PharmacyModule,
    ChatModule,
    NotificationsModule,
    CasesModule,
    AuditModule,
    AnalyticsModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

