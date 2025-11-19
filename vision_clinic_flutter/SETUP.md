# Vision Clinic Flutter - Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd vision_clinic_flutter
flutter pub get
```

This will install all required packages including:
- `provider` - State management
- `dio` - HTTP client
- `go_router` - Navigation
- `shared_preferences` - Local storage
- `json_serializable` - JSON serialization
- And many more...

### Step 2: Generate Code

The project uses code generation for:
- **JSON Serialization**: Models use `json_serializable`
- **Riverpod Providers**: State management uses `riverpod_generator`

Generate all required code:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

This will generate:
- `.g.dart` files for all models in the `models/` directory
- `.g.dart` files for all providers in the `providers/` directory

### Step 3: Configure API Base URL

Update the API base URL in `lib/config/app_config.dart`:

```dart
static const String baseUrl = 'http://localhost:3001';
```

For Android emulator, use `http://10.0.2.2:3001`  
For iOS simulator, use `http://localhost:3001`  
For physical device, use your computer's IP address: `http://192.168.x.x:3001`

### Step 4: Run the App

```bash
flutter run
```

Or use your IDE's run button.

## 📱 Platform-Specific Setup

### Android

1. Ensure Android SDK is installed
2. Create an Android emulator or connect a physical device
3. For physical devices, enable USB debugging

### iOS (macOS only)

1. Ensure Xcode is installed
2. Run `pod install` in `ios/` directory:
   ```bash
   cd ios
   pod install
   cd ..
   ```
3. Open Xcode and configure signing certificates

## 🔧 Troubleshooting

### Issue: "Target of URI doesn't exist"

**Solution:** Run `flutter pub get` to install dependencies.

### Issue: "The method '_$ModelFromJson' isn't defined" or "The method 'build' isn't defined"

**Solution:** Run code generation for both JSON serialization and Riverpod:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

This generates code for both models and providers.

### Issue: API connection fails

**Solution:** 
- Check if backend is running on port 3001
- Verify API base URL in `app_config.dart`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Check network permissions in AndroidManifest.xml

### Issue: Build errors

**Solution:**
1. Clean the project:
   ```bash
   flutter clean
   flutter pub get
   ```
2. Regenerate code:
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

## 📦 Required Tools

- Flutter SDK (3.10.0 or higher)
- Dart SDK
- Android Studio / Xcode
- Backend API running

## 🔄 Development Workflow

1. **Make changes to models:**
   - Edit model files in `lib/models/`
   - Run `flutter pub run build_runner build --delete-conflicting-outputs`

2. **Add new dependencies:**
   - Add to `pubspec.yaml`
   - Run `flutter pub get`

3. **Hot Reload:**
   - Press `r` in terminal or use IDE hot reload
   - For state changes, use hot restart (`R`)

## 📝 Next Steps

After setup:
1. Test login functionality
2. Implement additional screens
3. Add more features (camera, face recognition, etc.)
4. Write tests
5. Configure CI/CD

## 🆘 Getting Help

- Check `README.md` for project overview
- Check `STRUCTURE.md` for architecture details
- Review Flutter documentation: https://docs.flutter.dev
- Check backend API documentation


