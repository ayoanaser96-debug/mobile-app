import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EyeTestsController } from './eye-tests.controller';
import { EyeTestsService } from './eye-tests.service';
import { EyeTest, EyeTestSchema } from './schemas/eye-test.schema';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EyeTest.name, schema: EyeTestSchema },
    ]),
    forwardRef(() => PatientsModule),
  ],
  controllers: [EyeTestsController],
  providers: [EyeTestsService],
  exports: [EyeTestsService],
})
export class EyeTestsModule {}


