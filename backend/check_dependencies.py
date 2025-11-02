#!/usr/bin/env python3
"""
Check if required Python dependencies are installed
"""

import sys

try:
    import cv2
    import numpy
    from deepface import DeepFace
    from PIL import Image
    
    print("Success: All dependencies are installed")
    sys.exit(0)
    
except ImportError as e:
    print(f"Error: Missing dependency - {str(e)}")
    print("\nPlease install dependencies using:")
    print("  pip3 install --user --break-system-packages -r requirements.txt")
    sys.exit(1)
    
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)

