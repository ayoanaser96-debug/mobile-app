import { Module } from '@nestjs/common';
import { FaceRecognitionService } from './face-recognition.service';
import { FaceRecognitionController } from './face-recognition.controller';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [PatientsModule],
  controllers: [FaceRecognitionController],
  providers: [FaceRecognitionService],
  exports: [FaceRecognitionService],
})
export class FaceRecognitionModule {}

