# Vision Clinic - App Runner Scripts

Quick shortcuts to run the Flutter app for testing.

## Quick Start

### Option 1: Android Emulator (Recommended for Mobile Testing)
```bash
./run-app-emulator.sh
```

This script will:
- ✅ Launch the Pixel 7 Android emulator (if not already running)
- ✅ Wait for emulator to be ready
- ✅ Check/start backend server
- ✅ Run Flutter app on the emulator

### Option 2: Chrome Browser (Fastest)
```bash
./run-app-chrome.sh
```

Runs the app directly in Chrome browser at `http://localhost:8080`

### Option 3: Interactive Menu
```bash
./run-app.sh
```

Shows a menu to choose between:
1. Android Emulator
2. Chrome Browser  
3. macOS Desktop

## Available Emulators

To see available emulators:
```bash
cd vision_clinic_flutter && flutter emulators
```

Current emulators:
- `Pixel_7` (Default - used by script)
- `Medium_Phone_API_36.1`

## Changing Default Emulator

Edit `run-app-emulator.sh` and change:
```bash
EMULATOR_ID="Pixel_7"  # Change to your preferred emulator
```

## Troubleshooting

### Emulator not starting?
- Check Android Studio is installed
- Verify emulator exists: `flutter emulators`
- Try manually: `flutter emulators --launch Pixel_7`

### Backend not running?
The script will attempt to start it automatically, or manually:
```bash
cd backend && npm run start:dev
```

### Port conflicts?
- Backend: Port 3001
- Chrome: Port 8080
- Kill existing processes if needed

