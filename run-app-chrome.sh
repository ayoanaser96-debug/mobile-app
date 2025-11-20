#!/bin/bash

# Quick Chrome Runner - Fastest way to test the app
# This script runs the Flutter app directly on Chrome web browser

set -e

APP_DIR="/Users/ayoa/Documents/GitHub/vision-pro/vision_clinic_flutter"
BACKEND_DIR="/Users/ayoa/Documents/GitHub/vision-pro/backend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vision Clinic - Quick Chrome Runner${NC}"
echo ""

# Quick backend check (non-blocking)
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend not running. Please start it manually:${NC}"
    echo "   cd backend && npm run start:dev"
    echo ""
fi

cd "$APP_DIR"

echo -e "${GREEN}✓ Running on Chrome (http://localhost:8080)${NC}"
echo ""

# Run the app on Chrome
flutter run -d chrome --web-port=8080

