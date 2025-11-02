"""
Face Recognition Module for Smart Vision Clinic
Uses DeepFace for face recognition and encoding
"""

import cv2
import numpy as np
import os
from deepface import DeepFace
from typing import Optional, Tuple, List, Dict
import pickle


class FaceRecognitionSystem:
    """Handles face recognition and encoding operations"""
    
    def __init__(self, encodings_dir: str = "face_encodings"):
        """Initialize face recognition system"""
        self.encodings_dir = encodings_dir
        os.makedirs(self.encodings_dir, exist_ok=True)
        
        # Store loaded encodings in memory for faster lookup
        self.patient_encodings = {}
        self.load_all_encodings()
    
    def extract_face_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """
        Extract face embedding from an image
        Returns the embedding vector or None if no face found
        """
        try:
            # Use DeepFace to get embedding
            embedding = DeepFace.represent(
                img_path=image_path,
                model_name="VGG-Face",  # Using VGG-Face for embeddings
                enforce_detection=False  # Don't fail if face detection is uncertain
            )
            
            if embedding:
                return np.array(embedding[0]['embedding'])
            return None
        except Exception as e:
            print(f"Error extracting face embedding: {e}")
            return None
    
    def save_encoding(self, patient_id: str, embedding: np.ndarray) -> bool:
        """Save face encoding to file"""
        try:
            encoding_path = os.path.join(self.encodings_dir, f"{patient_id}.pkl")
            with open(encoding_path, 'wb') as f:
                pickle.dump(embedding, f)
            
            # Also store in memory
            self.patient_encodings[patient_id] = embedding
            return True
        except Exception as e:
            print(f"Error saving encoding: {e}")
            return False
    
    def load_encoding(self, patient_id: str) -> Optional[np.ndarray]:
        """Load face encoding from file"""
        try:
            encoding_path = os.path.join(self.encodings_dir, f"{patient_id}.pkl")
            if os.path.exists(encoding_path):
                with open(encoding_path, 'rb') as f:
                    embedding = pickle.load(f)
                    self.patient_encodings[patient_id] = embedding
                    return embedding
            return None
        except Exception as e:
            print(f"Error loading encoding: {e}")
            return None
    
    def load_all_encodings(self):
        """Load all encodings from the encodings directory"""
        try:
            if os.path.exists(self.encodings_dir):
                for filename in os.listdir(self.encodings_dir):
                    if filename.endswith('.pkl'):
                        patient_id = filename[:-4]  # Remove .pkl extension
                        self.load_encoding(patient_id)
        except Exception as e:
            print(f"Error loading all encodings: {e}")
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_norm = np.linalg.norm(vec1)
        vec2_norm = np.linalg.norm(vec2)
        
        if vec1_norm == 0 or vec2_norm == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (vec1_norm * vec2_norm)
    
    def find_matching_patient(self, test_embedding: np.ndarray, threshold: float = 0.6) -> Optional[str]:
        """
        Find matching patient based on face embedding
        Returns patient_id if match found, None otherwise
        threshold: similarity threshold (0-1), higher is stricter
        """
        best_match = None
        best_similarity = 0.0
        
        for patient_id, encoding in self.patient_encodings.items():
            similarity = self.cosine_similarity(test_embedding, encoding)
            
            if similarity > best_similarity and similarity >= threshold:
                best_similarity = similarity
                best_match = patient_id
        
        return best_match
    
    def recognize_face_from_frame(self, frame: np.ndarray) -> Optional[Tuple[str, float]]:
        """
        Recognize face from a video frame
        Returns (patient_id, similarity_score) or None
        """
        try:
            # Save frame temporarily for DeepFace processing
            temp_path = os.path.join(self.encodings_dir, "temp_frame.jpg")
            cv2.imwrite(temp_path, frame)
            
            # Extract embedding from frame
            embedding = self.extract_face_embedding(temp_path)
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            if embedding is not None:
                # Find matching patient
                patient_id = self.find_matching_patient(embedding)
                if patient_id:
                    # Calculate similarity score
                    similarity = self.cosine_similarity(embedding, self.patient_encodings[patient_id])
                    return (patient_id, similarity)
            
            return None
        except Exception as e:
            print(f"Error recognizing face: {e}")
            return None
    
    def detect_faces_in_frame(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a frame and return bounding boxes
        Returns list of (x, y, width, height) tuples
        """
        # Use OpenCV cascade for face detection (faster and more reliable)
        return self._detect_faces_opencv(frame)
    
    def _detect_faces_opencv(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Fallback face detection using OpenCV"""
        try:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            return [(x, y, w, h) for (x, y, w, h) in faces]
        except Exception as e:
            print(f"Error with OpenCV face detection: {e}")
            return []


if __name__ == "__main__":
    # Test the face recognition system
    print("Testing Face Recognition System...")
    
    frs = FaceRecognitionSystem()
    print(f"Loaded {len(frs.patient_encodings)} patient encodings")
    
    print("Face recognition system initialized successfully!")

