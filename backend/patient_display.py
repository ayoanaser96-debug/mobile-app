"""
Patient Display Module for Smart Vision Clinic
Shows patient information and history
"""

import cv2
import numpy as np
from typing import Dict, List
from datetime import datetime


class PatientDisplay:
    """Handles displaying patient information overlay on video feed"""
    
    def __init__(self, width: int = 800, height: int = 600):
        self.width = width
        self.height = height
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.font_scale = 0.7
        self.thickness = 2
        self.line_type = cv2.LINE_AA
    
    def create_profile_overlay(self, patient_data: Dict, similarity_score: float) -> np.ndarray:
        """
        Create a profile overlay window with patient information
        Returns image with patient profile displayed
        """
        # Create white background
        overlay = np.ones((self.height, self.width, 3), dtype=np.uint8) * 255
        
        # Title
        title = "PATIENT RECOGNIZED"
        title_size = cv2.getTextSize(title, self.font, 1.2, 3)[0]
        title_x = (self.width - title_size[0]) // 2
        cv2.putText(overlay, title, (title_x, 50), self.font, 1.2, (0, 100, 0), 3, self.line_type)
        
        # Patient Information Section
        y_offset = 100
        line_height = 40
        
        # Patient ID
        patient_id = f"Patient ID: {patient_data.get('patient_id', 'N/A')}"
        cv2.putText(overlay, patient_id, (30, y_offset), self.font, 
                   self.font_scale, (50, 50, 50), self.thickness, self.line_type)
        
        # Name
        y_offset += line_height
        name = f"Name: {patient_data.get('name', 'N/A')}"
        cv2.putText(overlay, name, (30, y_offset), self.font, 
                   self.font_scale, (50, 50, 50), self.thickness, self.line_type)
        
        # Contact Info
        if patient_data.get('phone'):
            y_offset += line_height
            phone = f"Phone: {patient_data.get('phone')}"
            cv2.putText(overlay, phone, (30, y_offset), self.font, 
                       self.font_scale, (50, 50, 50), self.thickness, self.line_type)
        
        if patient_data.get('email'):
            y_offset += line_height
            email = f"Email: {patient_data.get('email')}"
            cv2.putText(overlay, email, (30, y_offset), self.font, 
                       self.font_scale, (50, 50, 50), self.thickness, self.line_type)
        
        # Recognition Score
        y_offset += line_height + 10
        score_text = f"Recognition Score: {similarity_score:.1%}"
        cv2.putText(overlay, score_text, (30, y_offset), self.font, 
                   self.font_scale, (0, 150, 255), self.thickness, self.line_type)
        
        # Divider line
        y_offset += line_height
        cv2.line(overlay, (20, y_offset), (self.width - 20, y_offset), (200, 200, 200), 2)
        
        # Recent Visits Section
        y_offset += 30
        title = "Recent Visit History"
        cv2.putText(overlay, title, (30, y_offset), self.font, 
                   0.9, (0, 0, 150), 2, self.line_type)
        
        y_offset += line_height + 10
        
        visits = patient_data.get('visits', [])
        if visits:
            for i, visit in enumerate(visits[:5]):  # Show last 5 visits
                visit_date = visit.get('visit_date', '')
                purpose = visit.get('purpose', 'General')
                
                # Format date
                try:
                    if visit_date:
                        date_obj = datetime.fromisoformat(visit_date.replace('Z', '+00:00'))
                        date_str = date_obj.strftime('%Y-%m-%d')
                    else:
                        date_str = 'N/A'
                except:
                    date_str = visit_date[:10] if visit_date else 'N/A'
                
                visit_text = f"• {date_str}: {purpose}"
                cv2.putText(overlay, visit_text, (50, y_offset + i * 35), self.font, 
                          0.6, (100, 100, 100), 1, self.line_type)
        else:
            cv2.putText(overlay, "No previous visits", (50, y_offset), self.font, 
                      0.6, (150, 150, 150), 1, self.line_type)
        
        # Instructions
        y_offset = self.height - 50
        cv2.putText(overlay, "Press 'ESC' to close", (30, y_offset), self.font, 
                  0.6, (100, 100, 100), 1, self.line_type)
        cv2.putText(overlay, "Press 'A' to add new visit", (30, y_offset + 25), self.font, 
                  0.6, (100, 100, 100), 1, self.line_type)
        
        return overlay
    
    def overlay_info_on_frame(self, frame: np.ndarray, patient_name: str, 
                              confidence: float) -> np.ndarray:
        """
        Overlay simple recognition info on video frame
        Useful for real-time display
        """
        frame_copy = frame.copy()
        
        # Create semi-transparent overlay
        overlay = np.zeros_like(frame)
        
        # Recognition label background
        cv2.rectangle(overlay, (10, 10), (300, 100), (0, 100, 0), -1)
        frame_copy = cv2.addWeighted(frame_copy, 1.0, overlay, 0.7, 0)
        
        # Recognition text
        cv2.putText(frame_copy, "RECOGNIZED", (20, 40), self.font, 
                   1.0, (255, 255, 255), 2, self.line_type)
        cv2.putText(frame_copy, f"Name: {patient_name}", (20, 70), self.font, 
                   self.font_scale, (255, 255, 255), self.thickness, self.line_type)
        cv2.putText(frame_copy, f"Confidence: {confidence:.1%}", (20, 100), self.font, 
                   self.font_scale, (255, 255, 255), self.thickness, self.line_type)
        
        return frame_copy
    
    def display_waiting_message(self, frame: np.ndarray) -> np.ndarray:
        """Display waiting/scanning message on frame"""
        frame_copy = frame.copy()
        
        text = "Scanning for faces..."
        (text_width, text_height), _ = cv2.getTextSize(text, self.font, 1.0, 2)
        x = (frame.shape[1] - text_width) // 2
        y = (frame.shape[0] + text_height) // 2
        
        cv2.putText(frame_copy, text, (x, y), self.font, 
                   1.0, (0, 255, 0), 2, self.line_type)
        
        return frame_copy


if __name__ == "__main__":
    # Test the display module
    print("Testing Patient Display Module...")
    
    pd = PatientDisplay()
    
    # Sample patient data
    test_patient = {
        'patient_id': 'PAT001',
        'name': 'John Doe',
        'phone': '123-456-7890',
        'email': 'john@example.com',
        'visits': [
            {'visit_date': '2024-01-15T10:00:00', 'purpose': 'General Checkup'},
            {'visit_date': '2024-02-20T14:30:00', 'purpose': 'Follow-up'},
            {'visit_date': '2024-03-10T09:15:00', 'purpose': 'Prescription Renewal'}
        ]
    }
    
    overlay = pd.create_profile_overlay(test_patient, 0.85)
    
    # Save test image
    cv2.imwrite("test_profile_overlay.jpg", overlay)
    print("Test overlay saved as 'test_profile_overlay.jpg'")
    print("Patient display system initialized successfully!")

