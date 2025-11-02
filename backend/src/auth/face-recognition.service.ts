import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFace, UserFaceDocument } from './schemas/user-face.schema';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FaceRecognitionService {
  private readonly logger = new Logger(FaceRecognitionService.name);

  constructor(
    @InjectModel(UserFace.name)
    private userFaceModel: Model<UserFaceDocument>,
  ) {}

  async registerFace(userId: string, faceImage: string): Promise<UserFaceDocument> {
    try {
      // Extract face descriptor from image
      const descriptor = await this.extractFaceDescriptor(faceImage);

      // Check if face already exists for this user
      const existing = await this.userFaceModel.findOne({ userId });
      
      if (existing) {
        // Update existing face data
        existing.faceDescriptor = descriptor;
        existing.faceImage = faceImage;
        existing.confidence = 0.95; // Set confidence after registration
        return existing.save();
      } else {
        // Create new face record
        const userFace = new this.userFaceModel({
          userId,
          faceDescriptor: descriptor,
          faceImage,
          confidence: 0.95,
          isActive: true,
        });
        return userFace.save();
      }
    } catch (error: any) {
      throw new Error(`Failed to register face: ${error.message}`);
    }
  }

  async recognizeFace(faceImage: string, threshold: number = 0.6): Promise<any> {
    try {
      // Extract face descriptor from provided image
      const queryDescriptor = await this.extractFaceDescriptor(faceImage);

      // Find all active face records
      const allFaces = await this.userFaceModel.find({ isActive: true }).populate('userId');

      let bestMatch = null;
      let bestDistance = Infinity;

      // Compare with all registered faces
      for (const face of allFaces) {
        const distance = this.calculateDistance(queryDescriptor, face.faceDescriptor);
        
        if (distance < threshold && distance < bestDistance) {
          bestDistance = distance;
          bestMatch = {
            userId: face.userId,
            confidence: 1 - distance, // Convert distance to confidence
            faceId: face._id,
            user: face.userId,
          };
        }
      }

      return bestMatch;
    } catch (error: any) {
      throw new Error(`Failed to recognize face: ${error.message}`);
    }
  }

  private async extractFaceDescriptor(imageBase64: string): Promise<string> {
    try {
      // Try using Python DeepFace for real face recognition
      const pythonResult = await this.runPythonFaceRecognition('extract', imageBase64);
      
      if (pythonResult.success && pythonResult.descriptor) {
        // Convert descriptor array to string for storage
        return JSON.stringify(pythonResult.descriptor);
      }
      
      // Fallback to hash-based descriptor if Python fails
      this.logger.warn('Python face recognition not available, using hash-based fallback');
      const hash = this.imageHash(imageBase64);
      return Buffer.from(hash).toString('base64');
    } catch (error: any) {
      this.logger.error(`Failed to extract face descriptor: ${error.message}`);
      const hash = this.imageHash(imageBase64);
      return Buffer.from(hash).toString('base64');
    }
  }

  /**
   * Run Python face recognition scripts with proper error handling
   */
  private async runPythonFaceRecognition(operation: string, imageBase64: string, patientId?: string): Promise<any> {
    return new Promise((resolve) => {
      const tempImagePath = join(process.cwd(), `temp_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.jpg`);
      
      try {
        // Write base64 image to temp file
        const buffer = Buffer.from(imageBase64, 'base64');
        writeFileSync(tempImagePath, buffer);
        
        // Build Python command
        const pythonScript = join(process.cwd(), 'auth_face_helper.py');
        const args = [pythonScript, operation, tempImagePath];
        if (patientId) {
          args.push(patientId);
        }
        
        const python = spawn('python3', args);
        let output = '';
        let error = '';
        
        python.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        python.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        python.on('close', (code) => {
          // Clean up temp file
          if (existsSync(tempImagePath)) {
            unlinkSync(tempImagePath);
          }
          
          if (code === 0 && output) {
            try {
              const result = JSON.parse(output.trim());
              resolve(result);
            } catch (e) {
              this.logger.error('Failed to parse Python output', e);
              resolve({ success: false, error: 'Failed to parse Python output' });
            }
          } else {
            this.logger.error(`Python script failed: ${error}`);
            resolve({ success: false, error: error || 'Python script failed' });
          }
        });
        
        python.on('error', (err) => {
          // Clean up temp file
          if (existsSync(tempImagePath)) {
            unlinkSync(tempImagePath);
          }
          this.logger.error(`Python spawn error: ${err.message}`);
          resolve({ success: false, error: err.message });
        });
      } catch (error: any) {
        // Clean up temp file
        if (existsSync(tempImagePath)) {
          unlinkSync(tempImagePath);
        }
        this.logger.error(`Error running Python script: ${error.message}`);
        resolve({ success: false, error: error.message });
      }
    });
  }

  private calculateDistance(descriptor1: string, descriptor2: string): number {
    try {
      // Try parsing as JSON array (DeepFace descriptor)
      try {
        const d1Array = JSON.parse(descriptor1);
        const d2Array = JSON.parse(descriptor2);
        
        if (Array.isArray(d1Array) && Array.isArray(d2Array)) {
          // Calculate cosine similarity for vectors
          return this.cosineDistance(d1Array, d2Array);
        }
      } catch (e) {
        // Not JSON, continue with base64 decoding
      }
      
      // Fallback to base64 comparison
      const d1 = Buffer.from(descriptor1, 'base64');
      const d2 = Buffer.from(descriptor2, 'base64');

      // Calculate Euclidean distance (simplified)
      let distance = 0;
      const minLength = Math.min(d1.length, d2.length);
      
      for (let i = 0; i < minLength; i++) {
        const diff = d1[i] - d2[i];
        distance += diff * diff;
      }
      
      return Math.sqrt(distance / minLength);
    } catch (error) {
      return 1.0; // Maximum distance if comparison fails
    }
  }

  /**
   * Calculate cosine distance between two vectors
   * Returns 0 for identical vectors, 1 for completely different
   */
  private cosineDistance(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 1.0;
    }
    
    const similarity = dotProduct / (norm1 * norm2);
    return 1 - similarity; // Return distance (0 = same, 1 = different)
  }

  private imageHash(imageBase64: string): string {
    // Create a hash from the image data
    // In production, use actual face recognition algorithm (face-api.js, MediaPipe, etc.)
    const hash = crypto.createHash('sha256');
    hash.update(imageBase64);
    return hash.digest('hex').substring(0, 128); // Return first 128 chars as descriptor
  }

  async getFaceData(userId: string): Promise<UserFaceDocument | null> {
    return this.userFaceModel.findOne({ userId, isActive: true });
  }

  async deleteFace(userId: string): Promise<boolean> {
    const result = await this.userFaceModel.updateOne(
      { userId },
      { isActive: false },
    );
    return result.modifiedCount > 0;
  }
}

