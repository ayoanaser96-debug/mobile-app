import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FaceRecognitionService } from './face-recognition.service';
import { PatientsService } from '../patients/patients.service';

@Controller('face-recognition')
@UseGuards(JwtAuthGuard)
export class FaceRecognitionController {
  constructor(
    private readonly faceRecognitionService: FaceRecognitionService,
    private readonly patientService: PatientsService,
  ) {}

  /**
   * Upload and register a patient's face
   */
  @Post('register/:patientId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/faces',
        filename: (req, file, cb) => {
          const patientId = req.params.patientId;
          const fileExtName = extname(file.originalname);
          const fileName = `${patientId}-${Date.now()}${fileExtName}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async registerFace(
    @Param('patientId') patientId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.faceRecognitionService.registerPatientFace(
      patientId,
      file.path,
    );

    if (result.success) {
      return {
        success: true,
        message: result.message,
        patientId,
        imagePath: file.path,
      };
    }

    throw new BadRequestException(result.message);
  }

  /**
   * Recognize a patient from uploaded image
   */
  @Post('recognize')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/recognition',
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          const fileName = `recognize-${Date.now()}${fileExtName}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async recognizeFace(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.faceRecognitionService.recognizePatient(file.path);

    if (result.recognized && result.patientId) {
      // Get full patient details using userId
      const patient = await this.patientService.getPatientProfile(result.patientId);
      return {
        recognized: true,
        patientId: result.patientId,
        confidence: result.confidence,
        patient: patient || null,
      };
    }

    return {
      recognized: false,
      message: result.message || 'No patient recognized',
    };
  }

  /**
   * Get all registered patients with face recognition
   */
  @Get('registered')
  async getRegisteredPatients() {
    const patientIds = await this.faceRecognitionService.getRegisteredPatients();
    return {
      count: patientIds.length,
      patientIds,
    };
  }

  /**
   * Delete a patient's face encoding
   */
  @Delete('remove/:patientId')
  async deleteFaceEncoding(@Param('patientId') patientId: string) {
    const result = await this.faceRecognitionService.deletePatientEncoding(patientId);

    if (result.success) {
      return {
        success: true,
        message: result.message,
      };
    }

    throw new BadRequestException(result.message);
  }

  /**
   * Check if Python dependencies are installed
   */
  @Get('check-dependencies')
  async checkDependencies() {
    return await this.faceRecognitionService.checkDependencies();
  }
  
  /**
   * Register face from base64 image (for web usage)
   */
  @Post('register-base64/:patientId')
  async registerFaceBase64(
    @Param('patientId') patientId: string,
    @Body('image') base64Image: string,
  ) {
    if (!base64Image) {
      throw new BadRequestException('No image data provided');
    }

    // Convert base64 to temporary file
    const result = await this.faceRecognitionService.registerPatientFaceFromBase64(
      patientId,
      base64Image,
    );

    if (result.success) {
      return {
        success: true,
        message: result.message,
        patientId,
      };
    }

    throw new BadRequestException(result.message);
  }

  /**
   * Recognize face from base64 image (for web usage)
   */
  @Post('recognize-base64')
  async recognizeFaceBase64(@Body('image') base64Image: string) {
    if (!base64Image) {
      throw new BadRequestException('No image data provided');
    }

    const result = await this.faceRecognitionService.recognizePatientFromBase64(base64Image);

    if (result.recognized && result.patientId) {
      // Get full patient details using userId
      const patient = await this.patientService.getPatientProfile(result.patientId);
      return {
        recognized: true,
        patientId: result.patientId,
        confidence: result.confidence,
        patient: patient || null,
      };
    }

    return {
      recognized: false,
      message: result.message || 'No patient recognized',
    };
  }
}

