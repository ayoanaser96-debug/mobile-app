#!/bin/bash

# Vision Clinic Flutter - Build Script
# This script installs dependencies and generates required code

echo "🚀 Vision Clinic Flutter - Building project..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
flutter pub get

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 2: Generate code
echo "🔧 Step 2: Generating code (JSON serialization + Riverpod)..."
flutter pub run build_runner build --delete-conflicting-outputs

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate code"
    exit 1
fi

echo "✅ Code generation complete"
echo ""

# Step 3: Format code
echo "✨ Step 3: Formatting code..."
dart format lib/

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Code formatting had issues"
else
    echo "✅ Code formatted"
fi

echo ""
echo "🎉 Build complete! You can now run: flutter run"







