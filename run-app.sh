#!/bin/bash

# Vision Clinic - Universal App Runner
# This script provides a menu to choose how to run the app

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vision Clinic - App Runner${NC}"
echo ""
echo -e "${CYAN}Choose how to run the app:${NC}"
echo ""
echo "  1) Android Emulator (Pixel 7)"
echo "  2) Chrome Browser (Fastest)"
echo "  3) macOS Desktop"
echo ""
read -p "Enter choice [1-3] (default: 1): " choice
choice=${choice:-1}

case $choice in
    1)
        echo -e "${GREEN}📱 Launching on Android Emulator...${NC}"
        exec "$(dirname "$0")/run-app-emulator.sh"
        ;;
    2)
        echo -e "${GREEN}🌐 Launching on Chrome...${NC}"
        exec "$(dirname "$0")/run-app-chrome.sh"
        ;;
    3)
        echo -e "${GREEN}💻 Launching on macOS Desktop...${NC}"
        cd "$(dirname "$0")/vision_clinic_flutter"
        flutter run -d macos
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Using default: Android Emulator${NC}"
        exec "$(dirname "$0")/run-app-emulator.sh"
        ;;
esac

