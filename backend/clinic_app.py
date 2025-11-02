"""
Smart Vision Clinic - Main Application
Real-time face recognition for patient management
"""

import cv2
import numpy as np
from clinic_database import ClinicDatabase
from face_recognition_module import FaceRecognitionSystem
from patient_display import PatientDisplay
import os
from datetime import datetime


class ClinicApp:
    """Main application for Smart Vision Clinic"""
    
    def __init__(self):
        """Initialize the clinic application"""
        self.db = ClinicDatabase()
        self.face_recognition = FaceRecognitionSystem()
        self.display = PatientDisplay(width=900, height=700)
        
        # State management
        self.current_patient_id = None
        self.last_recognition_time = 0
        self.recognition_interval = 2  # Recognize every 2 seconds
        self.profile_window_open = False
        
        print("Smart Vision Clinic initialized")
        print(f"Database loaded with {len(self.face_recognition.patient_encodings)} registered patients")
    
    def add_new_patient(self, image_path: str, patient_id: str, name: str, 
                       phone: str = "", email: str = ""):
        """
        Register a new patient with face encoding
        """
        print(f"\nAdding new patient: {name} ({patient_id})")
        
        # Extract face embedding
        print("Extracting face features...")
        embedding = self.face_recognition.extract_face_embedding(image_path)
        
        if embedding is None:
            print("Error: Could not detect face in image")
            return False
        
        print("Face features extracted successfully")
        
        # Save to database
        success = self.db.add_patient(patient_id, name, phone, email)
        if not success:
            print(f"Error: Patient ID {patient_id} may already exist")
            return False
        
        # Save face encoding
        encoding_path = f"face_encodings/{patient_id}.pkl"
        success = self.face_recognition.save_encoding(patient_id, embedding)
        if not success:
            print("Error: Failed to save face encoding")
            return False
        
        # Record encoding in database
        self.db.add_face_encoding(patient_id, encoding_path)
        
        print(f"Patient {name} successfully registered!")
        return True
    
    def recognize_and_display(self, frame: np.ndarray) -> tuple:
        """
        Recognize patient from frame and return recognition info
        Returns (recognized, patient_id, similarity_score)
        """
        import time
        current_time = time.time()
        
        # Throttle recognition to avoid excessive processing
        if current_time - self.last_recognition_time < self.recognition_interval:
            return (False, None, 0.0)
        
        self.last_recognition_time = current_time
        
        # Perform face recognition
        result = self.face_recognition.recognize_face_from_frame(frame)
        
        if result:
            patient_id, similarity = result
            return (True, patient_id, similarity)
        
        return (False, None, 0.0)
    
    def run_recognition_mode(self, camera_index: int = 0):
        """
        Run the real-time patient recognition system
        """
        print("\nStarting patient recognition mode...")
        print("Controls:")
        print("  - 'q': Quit")
        print("  - 'p': Show profile window")
        print("  - 'a': Add new visit record")
        print("  - 'r': Register new patient")
        print("  - ESC: Close windows\n")
        
        # Open camera
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print("Error: Could not open camera")
            return
        
        # Set camera resolution
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        recognized_patient = None
        recognition_confidence = 0.0
        recognition_timeout = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Create display frame
            display_frame = frame.copy()
            
            # Detect faces in frame
            faces = self.face_recognition.detect_faces_in_frame(frame)
            
            # Draw face rectangles
            for (x, y, w, h) in faces:
                cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Perform recognition
            import time
            if time.time() - recognition_timeout > 2:
                recognized, patient_id, confidence = self.recognize_and_display(frame)
                
                if recognized:
                    recognized_patient = patient_id
                    recognition_confidence = confidence
                    recognition_timeout = time.time()
                    print(f"Patient recognized: {patient_id} (Confidence: {confidence:.1%})")
                    
                    # Add visit record
                    self.db.add_visit(patient_id, "Face Recognition Check-in", 
                                    f"Automated check-in at {datetime.now()}")
                else:
                    # Clear after 5 seconds
                    if time.time() - recognition_timeout > 5:
                        recognized_patient = None
            
            # Overlay recognition info
            if recognized_patient:
                patient_data = self.db.get_patient_by_id(recognized_patient)
                if patient_data:
                    display_frame = self.display.overlay_info_on_frame(
                        display_frame, 
                        patient_data['name'], 
                        recognition_confidence
                    )
            else:
                display_frame = self.display.display_waiting_message(display_frame)
            
            # Display frame
            cv2.imshow('Smart Vision Clinic - Patient Recognition', display_frame)
            
            # Handle keyboard input
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('p') and recognized_patient:
                self.show_patient_profile(recognized_patient, recognition_confidence)
            elif key == ord('a') and recognized_patient:
                self.add_visit_dialog(recognized_patient)
            elif key == ord('r'):
                self.register_patient_dialog()
            elif key == 27:  # ESC
                cv2.destroyAllWindows()
        
        cap.release()
        cv2.destroyAllWindows()
        print("\nRecognition mode ended")
    
    def show_patient_profile(self, patient_id: str, similarity_score: float):
        """Display detailed patient profile window"""
        patient_data = self.db.get_patient_by_id(patient_id)
        if not patient_data:
            print(f"Patient {patient_id} not found in database")
            return
        
        # Get visit history
        visits = self.db.get_patient_visits(patient_id, limit=10)
        patient_data['visits'] = visits
        
        # Create and display overlay
        overlay = self.display.create_profile_overlay(patient_data, similarity_score)
        
        cv2.imshow('Patient Profile', overlay)
        
        # Wait for key press
        while True:
            key = cv2.waitKey(1) & 0xFF
            if key == 27 or key == ord('q'):  # ESC or Q
                cv2.destroyWindow('Patient Profile')
                break
            elif key == ord('a'):  # Add visit
                cv2.destroyWindow('Patient Profile')
                self.add_visit_dialog(patient_id)
                break
    
    def add_visit_dialog(self, patient_id: str):
        """Interactive dialog to add a visit record"""
        print("\n--- Add Visit Record ---")
        purpose = input("Purpose (press Enter for 'General Checkup'): ").strip()
        if not purpose:
            purpose = "General Checkup"
        
        notes = input("Notes (optional): ").strip()
        prescription = input("Prescription (optional): ").strip()
        
        success = self.db.add_visit(patient_id, purpose, notes, prescription)
        if success:
            print(f"Visit record added successfully for {patient_id}")
        else:
            print("Error adding visit record")
    
    def register_patient_dialog(self):
        """Interactive dialog to register a new patient"""
        print("\n--- Register New Patient ---")
        
        patient_id = input("Patient ID (e.g., PAT001): ").strip()
        if not patient_id:
            print("Patient ID is required")
            return
        
        name = input("Full Name: ").strip()
        if not name:
            print("Name is required")
            return
        
        phone = input("Phone (optional): ").strip()
        email = input("Email (optional): ").strip()
        
        image_path = input("Image file path: ").strip()
        if not os.path.exists(image_path):
            print(f"Error: Image file not found: {image_path}")
            return
        
        success = self.add_new_patient(image_path, patient_id, name, phone, email)
        if success:
            print(f"\nPatient {name} registered successfully!")
        else:
            print("Error registering patient")
    
    def run(self):
        """Main entry point for the application"""
        print("\n" + "="*60)
        print("    SMART VISION CLINIC - Patient Recognition System")
        print("="*60)
        print("\nStarting the application...")
        
        try:
            self.run_recognition_mode()
        except KeyboardInterrupt:
            print("\n\nApplication interrupted by user")
        except Exception as e:
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("\nThank you for using Smart Vision Clinic!")


def main():
    """Main function"""
    app = ClinicApp()
    app.run()


if __name__ == "__main__":
    main()

