#!/usr/bin/env python3
"""
Recognize a patient from an image
Usage: python3 recognize_face.py <image_path>
Returns JSON with recognition result
"""

import sys
import os
import json

# Add current directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from face_recognition_module import FaceRecognitionSystem
    
    if len(sys.argv) != 2:
        result = {
            "recognized": False,
            "message": "Invalid arguments. Usage: python3 recognize_face.py <image_path>"
        }
        print(json.dumps(result))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Check if image exists
    if not os.path.exists(image_path):
        result = {
            "recognized": False,
            "message": f"Image file not found: {image_path}"
        }
        print(json.dumps(result))
        sys.exit(1)
    
    # Initialize face recognition system
    face_recognition = FaceRecognitionSystem()
    
    # Extract face embedding
    embedding = face_recognition.extract_face_embedding(image_path)
    
    if embedding is None:
        result = {
            "recognized": False,
            "message": "No face detected in image"
        }
        print(json.dumps(result))
        sys.exit(0)
    
    # Find matching patient
    patient_id = face_recognition.find_matching_patient(embedding)
    
    if patient_id:
        # Calculate confidence
        similarity = face_recognition.cosine_similarity(embedding, face_recognition.patient_encodings[patient_id])
        result = {
            "recognized": True,
            "patientId": patient_id,
            "confidence": float(similarity)
        }
    else:
        result = {
            "recognized": False,
            "message": "No matching patient found"
        }
    
    print(json.dumps(result))
    
except Exception as e:
    result = {
        "recognized": False,
        "message": f"Error: {str(e)}"
    }
    print(json.dumps(result))
    sys.exit(1)

