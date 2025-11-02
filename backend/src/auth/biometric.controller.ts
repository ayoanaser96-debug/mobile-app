import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { FaceRecognitionService } from './face-recognition.service';
import { DocumentScannerService } from './document-scanner.service';
import { DocumentType } from './schemas/user-document.schema';

@Controller('biometric')
export class BiometricController {
  constructor(
    private readonly faceRecognitionService: FaceRecognitionService,
    private readonly documentScannerService: DocumentScannerService,
    private readonly authService: AuthService,
  ) {}

  // Face Recognition Endpoints
  @Post('face/register')
  @UseGuards(JwtAuthGuard)
  async registerFace(@Request() req, @Body() body: { faceImage: string }) {
    const userId = req.user.id;
    return this.faceRecognitionService.registerFace(userId, body.faceImage);
  }

  @Post('face/recognize')
  async recognizeFace(@Body() body: { faceImage: string; threshold?: number }) {
    return this.faceRecognitionService.recognizeFace(
      body.faceImage,
      body.threshold || 0.6,
    );
  }

  @Get('face/my-face')
  @UseGuards(JwtAuthGuard)
  async getMyFace(@Request() req) {
    return this.faceRecognitionService.getFaceData(req.user.id);
  }

  @Post('face/check-in')
  async checkInWithFace(@Body() body: { faceImage: string }) {
    const match = await this.faceRecognitionService.recognizeFace(body.faceImage);
    
    if (match && match.user) {
      // Generate login token using AuthService
      const loginResult = await this.authService.login(match.user);
      
      return {
        success: true,
        user: loginResult.user,
        token: loginResult.access_token,
        confidence: match.confidence,
        message: 'Face recognized successfully',
      };
    } else {
      return {
        success: false,
        message: 'Face not recognized. Please register or use alternative login.',
      };
    }
  }

  // Document Scanning Endpoints
  @Post('document/scan')
  @UseGuards(JwtAuthGuard)
  async scanDocument(
    @Request() req,
    @Body() body: {
      documentType: DocumentType;
      frontImage: string;
      backImage?: string;
    },
  ) {
    const userId = req.user.id;
    return this.documentScannerService.scanDocument(
      userId,
      body.documentType,
      body.frontImage,
      body.backImage,
    );
  }

  @Get('document/my-documents')
  @UseGuards(JwtAuthGuard)
  async getMyDocuments(@Request() req) {
    return this.documentScannerService.getDocuments(req.user.id);
  }

  @Get('document/:type')
  @UseGuards(JwtAuthGuard)
  async getDocument(@Request() req, @Param('type') type: DocumentType) {
    return this.documentScannerService.getDocument(req.user.id, type);
  }

  @Post('document/:id/verify')
  @UseGuards(JwtAuthGuard)
  async verifyDocument(@Request() req, @Param('id') id: string) {
    return this.documentScannerService.verifyDocument(id, req.user.id);
  }
}

