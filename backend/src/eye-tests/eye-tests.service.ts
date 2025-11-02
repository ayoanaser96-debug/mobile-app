import { Injectable, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EyeTest, EyeTestDocument, TestStatus } from './schemas/eye-test.schema';
import { PatientJourneyService } from '../patients/patient-journey.service';

@Injectable()
export class EyeTestsService {
  constructor(
    @InjectModel(EyeTest.name) private eyeTestModel: Model<EyeTestDocument>,
    @Optional() @Inject(forwardRef(() => PatientJourneyService))
    private patientJourneyService?: PatientJourneyService,
  ) {}

  async create(createDto: any) {
    const test = new this.eyeTestModel(createDto);
    return test.save();
  }

  async runAIAnalysis(testId: string) {
    const test = await this.eyeTestModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Simulate AI analysis (replace with actual AI model integration)
    const aiAnalysis = this.simulateAIAnalysis(test);

    test.aiAnalysis = aiAnalysis;
    test.status = TestStatus.ANALYZED;
    return test.save();
  }

  private simulateAIAnalysis(test: EyeTestDocument): any {
    // Simulate AI analysis results
    // In production, this would call an actual AI model
    return {
      cataract: {
        detected: Math.random() > 0.7,
        severity: Math.random() > 0.5 ? 'mild' : 'none',
        confidence: Math.random() * 0.3 + 0.7,
      },
      glaucoma: {
        detected: Math.random() > 0.8,
        severity: Math.random() > 0.5 ? 'mild' : 'none',
        confidence: Math.random() * 0.3 + 0.7,
      },
      diabeticRetinopathy: {
        detected: Math.random() > 0.85,
        severity: Math.random() > 0.5 ? 'mild' : 'none',
        confidence: Math.random() * 0.3 + 0.7,
      },
      overallAssessment: 'Normal eye examination with no significant abnormalities detected.',
    };
  }

  async findByPatient(patientId: string) {
    return this.eyeTestModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('analystId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findPendingForAnalysis() {
    return this.eyeTestModel
      .find({ status: TestStatus.PENDING })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: 1 });
  }

  async findAnalyzedForDoctor(doctorId?: string) {
    const query: any = { status: TestStatus.ANALYZED };
    if (doctorId) {
      query.doctorId = doctorId;
    }
    return this.eyeTestModel
      .find(query)
      .populate('patientId', 'firstName lastName')
      .populate('analystId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const test = await this.eyeTestModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('analystId');
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async update(id: string, updateDto: any) {
    return this.eyeTestModel.findByIdAndUpdate(id, updateDto, { new: true });
  }

  async addAnalystNotes(id: string, notes: string, analystId: string) {
    const updated = await this.eyeTestModel.findByIdAndUpdate(
      id,
      { analystNotes: notes, analystId, status: TestStatus.DOCTOR_REVIEW },
      { new: true },
    ).populate('patientId');
    
    // Update patient journey - mark analyst step as complete
    if (this.patientJourneyService && updated?.patientId) {
      try {
        const patientId = typeof updated.patientId === 'string' 
          ? updated.patientId 
          : (updated.patientId as any)?._id?.toString() || (updated.patientId as any)?.id?.toString();
        if (patientId) {
          await this.patientJourneyService.markAnalystComplete(patientId, analystId);
        }
      } catch (error) {
        // Journey might not exist, that's okay
        console.log('Journey update skipped:', error.message);
      }
    }
    
    return updated;
  }

  async doctorReview(id: string, review: any) {
    const updated = await this.eyeTestModel.findByIdAndUpdate(
      id,
      {
        doctorNotes: review.notes,
        doctorApproved: review.approved,
        doctorId: review.doctorId,
        status: review.approved ? TestStatus.COMPLETED : TestStatus.DOCTOR_REVIEW,
      },
      { new: true },
    ).populate('patientId');

    // Update patient journey - mark doctor step as complete
    if (this.patientJourneyService && updated?.patientId && review.approved) {
      try {
        const patientId = typeof updated.patientId === 'string' 
          ? updated.patientId 
          : (updated.patientId as any)?._id?.toString() || (updated.patientId as any)?.id?.toString();
        if (patientId) {
          await this.patientJourneyService.markDoctorComplete(patientId, review.doctorId);
        }
      } catch (error) {
        // Journey might not exist, that's okay
        console.log('Journey update skipped:', error.message);
      }
    }

    // Auto-create case when doctor reviews (if case doesn't exist)
    // This will be handled in the doctor review endpoint

    return updated;
  }
}

