# Face Recognition Integration - Complete Guide

## ✅ Integration Complete!

Your Smart Vision Clinic now includes AI-powered face recognition for patient management!

## 📁 Files Added

### Python Modules (in `/backend/`)
- `clinic_database.py` - Database operations for patient management
- `face_recognition_module.py` - DeepFace-powered face recognition engine
- `patient_display.py` - UI display components
- `register_face.py` - CLI script to register patient faces
- `recognize_face.py` - CLI script to recognize patients
- `check_dependencies.py` - Dependency checker

### NestJS Modules (in `/backend/src/face-recognition/`)
- `face-recognition.module.ts` - Main module
- `face-recognition.service.ts` - Service layer for Python integration
- `face-recognition.controller.ts` - REST API endpoints

## 🚀 How to Use

### 1. Register a Patient's Face

**API Endpoint:**
```
POST /face-recognition/register/:patientId
Content-Type: multipart/form-data
```

**Example using curl:**
```bash
curl -X POST \
  http://localhost:3001/face-recognition/register/PAT001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/patient/photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Face registered successfully",
  "patientId": "PAT001",
  "imagePath": "./uploads/faces/PAT001-1234567890.jpg"
}
```

### 2. Recognize a Patient

**API Endpoint:**
```
POST /face-recognition/recognize
Content-Type: multipart/form-data
```

**Example using curl:**
```bash
curl -X POST \
  http://localhost:3001/face-recognition/recognize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/camera/capture.jpg"
```

**Response:**
```json
{
  "recognized": true,
  "patientId": "PAT001",
  "confidence": 0.92,
  "patient": {
    "userId": "...",
    "profile": { ... }
  }
}
```

### 3. Get All Registered Patients

**API Endpoint:**
```
GET /face-recognition/registered
```

**Response:**
```json
{
  "count": 5,
  "patientIds": ["PAT001", "PAT002", "PAT003", "PAT004", "PAT005"]
}
```

### 4. Remove a Patient's Face

**API Endpoint:**
```
DELETE /face-recognition/remove/:patientId
```

**Response:**
```json
{
  "success": true,
  "message": "Face encoding deleted successfully"
}
```

### 5. Check Dependencies

**API Endpoint:**
```
GET /face-recognition/check-dependencies
```

**Response:**
```json
{
  "installed": true,
  "message": "All dependencies are installed"
}
```

## 🎯 Integration Workflow

### For Reception/Check-in

1. Patient arrives at clinic
2. Camera captures patient's face
3. Upload image to `/face-recognition/recognize` endpoint
4. System returns patient ID and details if recognized
5. Automatically check-in patient in your system

### For Patient Registration

1. New patient arrives
2. Create patient account in your system
3. Take clear photo of patient's face
4. Upload to `/face-recognition/register/:patientId`
5. Face encoding stored for future recognition

## 🔧 Technical Details

### Architecture

```
Frontend (React)
     ↓
NestJS Backend (TypeScript)
     ↓
Face Recognition Service
     ↓
Python Scripts (DeepFace AI)
     ↓
Face Encodings Storage
```

### File Storage

- **Upload directory**: `backend/uploads/faces/` (for registration)
- **Recognition directory**: `backend/uploads/recognition/` (for recognition attempts)
- **Face encodings**: `backend/face_encodings/*.pkl` (binary face data)

### Python Dependencies

All Python dependencies are already installed:
- opencv-python
- numpy
- deepface
- pillow
- tf-keras

## 🔒 Security

- All endpoints require JWT authentication
- Files automatically cleaned up after processing
- Face encodings stored securely on server
- No patient data in face encodings (only biometric features)

## 🎨 Frontend Integration Example

### React Component Example

```typescript
import { useState } from 'react';
import axios from 'axios';

function PatientFaceRecognition() {
  const [recognized, setRecognized] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageCapture = async (imageFile: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.post(
        '/api/face-recognition/recognize',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.recognized) {
        setRecognized(response.data);
      } else {
        alert('Patient not recognized. Please register first.');
      }
    } catch (error) {
      console.error('Recognition error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFace = async (patientId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    await axios.post(
      `/api/face-recognition/register/${patientId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  };

  return (
    <div>
      {/* Recognition UI */}
    </div>
  );
}
```

## 📊 Database Integration

The face recognition system uses MongoDB for patient data and filesystem for face encodings:

- **MongoDB**: Stores patient profiles, appointments, visits
- **Filesystem**: Stores face encodings (binary .pkl files)
- **Automatic cleanup**: Temporary recognition images auto-deleted

## 🧪 Testing

### Test Registration

```bash
# Register a test patient
curl -X POST http://localhost:3001/face-recognition/register/TEST001 \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test_patient.jpg"
```

### Test Recognition

```bash
# Recognize the patient
curl -X POST http://localhost:3001/face-recognition/recognize \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test_patient_capture.jpg"
```

## 🐛 Troubleshooting

### Python Not Found
```bash
# Make sure Python 3 is in PATH
which python3
# If not found, add to PATH or use full path
```

### Dependencies Missing
```bash
# Reinstall Python dependencies
cd backend
export PATH="$HOME/.local/bin:$PATH"
pip3 install --user --break-system-packages -r requirements.txt
```

### Recognition Not Working
1. Ensure good lighting in patient photos
2. Face should be forward-facing and clear
3. Minimum image size: 100x100 pixels
4. Supported formats: JPG, PNG, GIF

## 🚀 Production Deployment

1. **Environment Variables**: Set proper paths and security keys
2. **File Cleanup**: Implement automated cleanup of old uploads
3. **Backup**: Regularly backup face encodings directory
4. **Monitoring**: Monitor Python script execution times
5. **Security**: Use HTTPS for all API calls
6. **Performance**: Consider GPU acceleration for faster recognition

## 📝 API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/face-recognition/register/:patientId` | Register patient face |
| POST | `/face-recognition/recognize` | Recognize patient |
| GET | `/face-recognition/registered` | List registered patients |
| DELETE | `/face-recognition/remove/:patientId` | Remove face encoding |
| GET | `/face-recognition/check-dependencies` | Check Python setup |

## ✅ Next Steps

1. Test registration with real patient photos
2. Test recognition workflow
3. Integrate with frontend UI
4. Set up automated patient check-in
5. Add face recognition to appointment booking
6. Configure file cleanup schedules

---

**Your Smart Vision Clinic now has AI-powered patient recognition! 🎉**

