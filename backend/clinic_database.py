"""
Database module for Smart Vision Clinic
Handles patient data storage and retrieval
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import Optional, Dict, List, Tuple


class ClinicDatabase:
    """Manages patient database operations"""
    
    def __init__(self, db_path: str = "clinic.db"):
        """Initialize database connection and create tables if needed"""
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Create database tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create patients table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create face encodings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS face_encodings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                encoding_path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
            )
        ''')
        
        # Create visit history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS visit_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                purpose TEXT,
                notes TEXT,
                prescription TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_patient(self, patient_id: str, name: str, phone: str = "", email: str = "") -> bool:
        """Add a new patient to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO patients (patient_id, name, phone, email)
                VALUES (?, ?, ?, ?)
            ''', (patient_id, name, phone, email))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False  # Patient ID already exists
        except Exception as e:
            print(f"Error adding patient: {e}")
            return False
    
    def add_face_encoding(self, patient_id: str, encoding_path: str) -> bool:
        """Store face encoding path for a patient"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO face_encodings (patient_id, encoding_path)
                VALUES (?, ?)
            ''', (patient_id, encoding_path))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding face encoding: {e}")
            return False
    
    def add_visit(self, patient_id: str, purpose: str = "", notes: str = "", prescription: str = "") -> bool:
        """Record a patient visit"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO visit_history (patient_id, purpose, notes, prescription)
                VALUES (?, ?, ?, ?)
            ''', (patient_id, purpose, notes, prescription))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding visit: {e}")
            return False
    
    def get_patient_by_id(self, patient_id: str) -> Optional[Dict]:
        """Retrieve patient information by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM patients WHERE patient_id = ?', (patient_id,))
            row = cursor.fetchone()
            
            conn.close()
            
            if row:
                return dict(row)
            return None
        except Exception as e:
            print(f"Error getting patient: {e}")
            return None
    
    def get_patient_visits(self, patient_id: str, limit: int = 10) -> List[Dict]:
        """Get visit history for a patient"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM visit_history 
                WHERE patient_id = ? 
                ORDER BY visit_date DESC 
                LIMIT ?
            ''', (patient_id, limit))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error getting visits: {e}")
            return []
    
    def get_all_patients(self) -> List[Dict]:
        """Get all patients"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM patients ORDER BY name')
            rows = cursor.fetchall()
            conn.close()
            
            return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error getting all patients: {e}")
            return []
    
    def get_encoding_paths(self) -> List[Tuple[str, str]]:
        """Get all patient IDs and their encoding paths"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT patient_id, encoding_path FROM face_encodings')
            rows = cursor.fetchall()
            conn.close()
            
            return rows
        except Exception as e:
            print(f"Error getting encodings: {e}")
            return []


if __name__ == "__main__":
    # Test the database
    db = ClinicDatabase("test_clinic.db")
    
    # Add a test patient
    db.add_patient("PAT001", "John Doe", "123-456-7890", "john@example.com")
    db.add_face_encoding("PAT001", "encodings/PAT001.npy")
    db.add_visit("PAT001", "General Checkup", "Patient is in good health")
    
    # Retrieve patient info
    patient = db.get_patient_by_id("PAT001")
    print(f"Patient: {patient}")
    
    visits = db.get_patient_visits("PAT001")
    print(f"Visits: {visits}")
    
    # Clean up test database
    os.remove("test_clinic.db")
    print("Database test complete!")

