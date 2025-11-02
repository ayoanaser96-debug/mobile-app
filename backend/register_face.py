#!/usr/bin/env python3
"""
Register a patient's face for recognition
Usage: python3 register_face.py <patient_id> <image_path>
"""

import sys
import os

# Add current directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from face_recognition_module import FaceRecognitionSystem
    
    if len(sys.argv) != 3:
        print("Error: Invalid arguments. Usage: python3 register_face.py <patient_id> <image_path>")
        sys.exit(1)
    
    patient_id = sys.argv[1]
    image_path = sys.argv[2]
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    
    # Initialize face recognition system
    face_recognition = FaceRecognitionSystem()
    
    # Extract face embedding
    print(f"Extracting face features for patient: {patient_id}")
    embedding = face_recognition.extract_face_embedding(image_path)
    
    if embedding is None:
        print("Error: Could not detect face in image")
        sys.exit(1)
    
    # Save encoding
    success = face_recognition.save_encoding(patient_id, embedding)
    
    if success:
        print(f"Success: Face registered for patient {patient_id}")
    else:
        print("Error: Failed to save face encoding")
        sys.exit(1)

except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

