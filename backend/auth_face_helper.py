#!/usr/bin/env python3
"""
Helper script for auth face recognition module
Usage: python3 auth_face_helper.py <operation> <image_path> [patient_id]
"""
import sys
import os
import json

# Add current directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from face_recognition_module import FaceRecognitionSystem
    
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
    
    operation = sys.argv[1]
    image_path = sys.argv[2]
    patient_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)
    
    # Initialize face recognition system
    frs = FaceRecognitionSystem()
    
    if operation == 'extract':
        # Extract face embedding
        embedding = frs.extract_face_embedding(image_path)
        
        if embedding is None:
            print(json.dumps({"error": "Could not detect face in image"}))
            sys.exit(1)
        
        # Convert numpy array to list and then to base64
        embedding_list = embedding.tolist()
        result = {
            "success": True,
            "descriptor": embedding_list,
            "vector_length": len(embedding_list)
        }
        print(json.dumps(result))
        
    elif operation == 'recognize':
        # Recognize face
        embedding = frs.extract_face_embedding(image_path)
        
        if embedding is None:
            print(json.dumps({"recognized": False, "error": "Could not detect face"}))
            sys.exit(0)
        
        # Find matching patient
        best_match = None
        best_similarity = 0.0
        threshold = 0.6
        
        for pid, enc in frs.patient_encodings.items():
            similarity = frs.cosine_similarity(embedding, enc)
            if similarity > best_similarity and similarity >= threshold:
                best_similarity = similarity
                best_match = pid
        
        if best_match:
            result = {
                "recognized": True,
                "patient_id": best_match,
                "confidence": best_similarity
            }
            print(json.dumps(result))
        else:
            result = {
                "recognized": False,
                "message": "No matching face found"
            }
            print(json.dumps(result))
        
    elif operation == 'register' and patient_id:
        # Register face
        embedding = frs.extract_face_embedding(image_path)
        
        if embedding is None:
            print(json.dumps({"error": "Could not detect face in image"}))
            sys.exit(1)
        
        success = frs.save_encoding(patient_id, embedding)
        
        if success:
            print(json.dumps({"success": True, "patient_id": patient_id}))
        else:
            print(json.dumps({"error": "Failed to save encoding"}))
            sys.exit(1)
    else:
        print(json.dumps({"error": "Invalid operation"}))
        sys.exit(1)

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)

