import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class FaceRecognitionService {
  private readonly logger = new Logger(FaceRecognitionService.name);
  private readonly pythonScriptsPath = path.join(__dirname, '../../../');
  private readonly encodingsPath = path.join(__dirname, '../../../face_encodings');

  constructor(private readonly patientService: PatientsService) {
    // Ensure encodings directory exists
    if (!fs.existsSync(this.encodingsPath)) {
      fs.mkdirSync(this.encodingsPath, { recursive: true });
    }
  }

  /**
   * Register a patient's face encoding
   */
  async registerPatientFace(
    patientId: string,
    imagePath: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Registering face for patient: ${patientId}`);

      // Run Python script to extract and save face encoding
      const pythonScript = path.join(this.pythonScriptsPath, 'register_face.py');
      const result = await this.runPythonScript(pythonScript, [patientId, imagePath]);

      if (result.success) {
        this.logger.log(`Face registered successfully for patient: ${patientId}`);
        return { success: true, message: 'Face registered successfully' };
      }

      return { success: false, message: result.error || 'Failed to register face' };
    } catch (error) {
      this.logger.error(`Error registering face: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Recognize a patient from an image
   */
  async recognizePatient(imagePath: string): Promise<{
    recognized: boolean;
    patientId?: string;
    confidence?: number;
    message?: string;
  }> {
    try {
      this.logger.log('Attempting to recognize patient from image');

      // Run Python script to recognize face
      const pythonScript = path.join(this.pythonScriptsPath, 'recognize_face.py');
      const result = await this.runPythonScript(pythonScript, [imagePath]);

      if (result.success && result.output) {
        const data = JSON.parse(result.output);
        if (data.recognized && data.patientId) {
          this.logger.log(`Patient recognized: ${data.patientId} (confidence: ${data.confidence})`);
          return {
            recognized: true,
            patientId: data.patientId,
            confidence: data.confidence,
          };
        }
      }

      return { recognized: false, message: 'No matching patient found' };
    } catch (error) {
      this.logger.error(`Error recognizing face: ${error.message}`);
      return { recognized: false, message: error.message };
    }
  }

  /**
   * Get all registered patients
   */
  async getRegisteredPatients(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.encodingsPath)) {
        return [];
      }

      const files = fs.readdirSync(this.encodingsPath);
      return files
        .filter((file) => file.endsWith('.pkl'))
        .map((file) => file.replace('.pkl', ''));
    } catch (error) {
      this.logger.error(`Error getting registered patients: ${error.message}`);
      return [];
    }
  }

  /**
   * Delete a patient's face encoding
   */
  async deletePatientEncoding(patientId: string): Promise<{ success: boolean; message: string }> {
    try {
      const encodingPath = path.join(this.encodingsPath, `${patientId}.pkl`);
      if (fs.existsSync(encodingPath)) {
        fs.unlinkSync(encodingPath);
        this.logger.log(`Face encoding deleted for patient: ${patientId}`);
        return { success: true, message: 'Face encoding deleted successfully' };
      }

      return { success: false, message: 'Face encoding not found' };
    } catch (error) {
      this.logger.error(`Error deleting face encoding: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Run a Python script and return the result
   */
  private async runPythonScript(
    scriptPath: string,
    args: string[],
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const python = spawn('python3', [scriptPath, ...args]);
      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: output.trim() });
        } else {
          resolve({ success: false, error: error || `Process exited with code ${code}` });
        }
      });

      python.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * Check if Python dependencies are installed
   */
  async checkDependencies(): Promise<{ installed: boolean; message: string }> {
    try {
      // Try to import the required Python modules
      const result = await this.runPythonScript(
        path.join(this.pythonScriptsPath, 'check_dependencies.py'),
        [],
      );

      if (result.success) {
        return { installed: true, message: 'All dependencies are installed' };
      }

      return { installed: false, message: result.error || 'Dependencies not installed' };
    } catch (error) {
      return { installed: false, message: error.message };
    }
  }

  /**
   * Register face from base64 image
   */
  async registerPatientFaceFromBase64(
    patientId: string,
    base64Image: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Convert base64 to temporary file
      const buffer = Buffer.from(base64Image, 'base64');
      const tempImagePath = path.join(this.pythonScriptsPath, `temp_${Date.now()}.jpg`);
      
      fs.writeFileSync(tempImagePath, buffer);
      
      try {
        const result = await this.registerPatientFace(patientId, tempImagePath);
        return result;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
    } catch (error) {
      this.logger.error(`Error registering face from base64: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Recognize face from base64 image
   */
  async recognizePatientFromBase64(base64Image: string): Promise<{
    recognized: boolean;
    patientId?: string;
    confidence?: number;
    message?: string;
  }> {
    try {
      // Convert base64 to temporary file
      const buffer = Buffer.from(base64Image, 'base64');
      const tempImagePath = path.join(this.pythonScriptsPath, `temp_recognition_${Date.now()}.jpg`);
      
      fs.writeFileSync(tempImagePath, buffer);
      
      try {
        const result = await this.recognizePatient(tempImagePath);
        return result;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
    } catch (error) {
      this.logger.error(`Error recognizing face from base64: ${error.message}`);
      return { recognized: false, message: error.message };
    }
  }
}

