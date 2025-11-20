#!/bin/bash

# Vision Clinic - Emulator Runner
# This script launches an Android emulator and runs the Flutter app on it

set -e

APP_DIR="/Users/ayoa/Documents/GitHub/vision-pro/vision_clinic_flutter"
BACKEND_DIR="/Users/ayoa/Documents/GitHub/vision-pro/backend"
EMULATOR_ID="Pixel_7"  # Default emulator, can be changed

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vision Clinic - Emulator Runner${NC}"
echo ""

# Function to get Android device ID
get_android_device_id() {
    cd "$APP_DIR"
    # Parse flutter devices output: "Device Name • device_id • platform • description"
    # Extract device_id (second field after bullet separator)
    local device_line=$(flutter devices 2>/dev/null | grep -iE "android|emulator|sdk gphone" | head -1)
    if [ -n "$device_line" ]; then
        # Split by bullet and get second field, trim whitespace
        echo "$device_line" | sed 's/•/\n/g' | sed -n '2p' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
    fi
}

# Function to check if Android device is available
check_android_device() {
    local device_id=$(get_android_device_id)
    [ -n "$device_id" ] && [ "$device_id" != "" ]
}

# Function to wait for emulator to be ready
wait_for_emulator() {
    echo -e "${YELLOW}⏳ Waiting for emulator to be ready...${NC}"
    local max_attempts=90  # Increased timeout for slower systems
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if check_android_device; then
            local device_id=$(get_android_device_id)
            echo -e "${GREEN}✓ Emulator is ready! (Device: $device_id)${NC}"
            sleep 3  # Give it a moment to fully boot
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -n "."
        fi
        sleep 2
    done
    
    echo -e "${RED}✗ Emulator failed to start in time${NC}"
    return 1
}

# Check if Android device is already available
if check_android_device; then
    DEVICE_ID=$(get_android_device_id)
    echo -e "${GREEN}✓ Android device already available (Device: $DEVICE_ID)${NC}"
else
    echo -e "${BLUE}📱 Launching emulator: ${EMULATOR_ID}${NC}"
    cd "$APP_DIR"
    flutter emulators --launch "$EMULATOR_ID" > /dev/null 2>&1 &
    EMULATOR_PID=$!
    
    # Wait for emulator to be ready
    if ! wait_for_emulator; then
        echo -e "${RED}✗ Failed to start emulator${NC}"
        echo -e "${YELLOW}💡 Try manually: flutter emulators --launch ${EMULATOR_ID}${NC}"
        echo -e "${YELLOW}💡 Or check: flutter devices${NC}"
        exit 1
    fi
    
    DEVICE_ID=$(get_android_device_id)
fi

# Quick backend check (non-blocking)
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend not running. Starting backend...${NC}"
    cd "$BACKEND_DIR"
    # Kill any existing backend process on port 3001
    kill $(lsof -ti:3001) 2>/dev/null || true
    sleep 2
    npm run start:dev > backend.out 2>&1 &
    echo -e "${GREEN}✓ Backend starting in background${NC}"
    sleep 5  # Give backend time to start
    cd "$APP_DIR"
fi

cd "$APP_DIR"

# Get the actual device ID
if [ -z "$DEVICE_ID" ]; then
    DEVICE_ID=$(get_android_device_id)
fi

if [ -z "$DEVICE_ID" ]; then
    echo -e "${RED}✗ No Android device found${NC}"
    echo -e "${YELLOW}Available devices:${NC}"
    flutter devices
    echo ""
    echo -e "${YELLOW}💡 Try: flutter emulators --launch ${EMULATOR_ID}${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Running Flutter app on Android device${NC}"
echo -e "${BLUE}📱 Device: $DEVICE_ID${NC}"
echo ""

# Run the app on the Android device
flutter run -d "$DEVICE_ID"

