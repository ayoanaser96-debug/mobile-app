# Vision Clinic Flutter App

A comprehensive Flutter mobile application for Vision Clinic management system.

## 📁 Project Structure

```
lib/
├── config/              # App configuration files
│   ├── app_config.dart      # App-wide configuration
│   └── api_endpoints.dart   # API endpoint constants
│
├── models/              # Data models
│   ├── user_model.dart
│   ├── appointment_model.dart
│   ├── eye_test_model.dart
│   ├── prescription_model.dart
│   ├── notification_model.dart
│   └── auth_response_model.dart
│
├── services/           # API and business logic services
│   ├── api_service.dart      # HTTP client wrapper
│   ├── auth_service.dart    # Authentication service
│   └── patient_service.dart # Patient-related services
│
├── providers/          # State management (Provider pattern)
│   └── auth_provider.dart
│
├── screens/            # UI screens
│   ├── auth/
│   │   └── login_screen.dart
│   ├── patient/
│   │   └── patient_dashboard_screen.dart
│   ├── doctor/
│   │   └── doctor_dashboard_screen.dart
│   ├── admin/
│   │   └── admin_dashboard_screen.dart
│   ├── pharmacy/
│   │   └── pharmacy_dashboard_screen.dart
│   └── analyst/
│       └── analyst_dashboard_screen.dart
│
├── widgets/            # Reusable UI components
│   ├── common/         # Common widgets
│   ├── forms/          # Form widgets
│   └── charts/         # Chart widgets
│
├── utils/              # Utility functions
│   └── storage_helper.dart
│
├── theme/              # App theming
│   └── app_theme.dart
│
└── main.dart           # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (3.10.0 or higher)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- Backend API running on `http://localhost:3001`

### Installation

1. **Install dependencies:**
   ```bash
   cd vision_clinic_flutter
   flutter pub get
   ```

2. **Generate JSON serialization code:**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

3. **Run the app:**
   ```bash
   flutter run
   ```

## 🔧 Configuration

### API Configuration

Update the base URL in `lib/config/app_config.dart`:

```dart
static const String baseUrl = 'http://localhost:3001';
```

For production, change this to your production API URL.

## 📱 Features

### Authentication
- Login with email/phone/national ID
- User registration
- Token-based authentication
- Auto-login on app restart

### Patient Features
- Dashboard with quick actions
- Appointment booking
- Eye test scheduling
- Prescription tracking
- Medical journey timeline
- Health records
- Billing history

### Role-Based Dashboards
- **Patient**: Personal health management
- **Doctor**: Case management and prescriptions
- **Admin**: System administration
- **Pharmacy**: Prescription fulfillment
- **Analyst**: Eye test analysis

## 🏗️ Architecture

### State Management
- **Riverpod**: Used for state management (following project rules)
- **Code Generation**: Riverpod providers use code generation for type safety

### API Communication
- **Dio**: HTTP client for API calls
- **Interceptors**: Automatic token injection
- **Error Handling**: Centralized error management

### Data Persistence
- **SharedPreferences**: Local storage for tokens and user data
- **StorageHelper**: Utility class for storage operations

## 📦 Dependencies

### Core
- `flutter_riverpod` - State management (following project rules)
- `riverpod_annotation` & `riverpod_generator` - Code generation for Riverpod
- `dio` - HTTP client
- `go_router` - Navigation
- `shared_preferences` - Local storage

### UI
- `flutter_svg` - SVG support
- `cached_network_image` - Image caching
- `shimmer` - Loading placeholders
- `fl_chart` - Charts and graphs

### Features
- `image_picker` - Image selection
- `camera` - Camera access
- `qr_flutter` - QR code generation
- `pdf` & `printing` - PDF generation

## 🔐 Authentication Flow

1. User enters credentials
2. API call to `/auth/login`
3. Receive access token and user data
4. Store tokens locally
5. Navigate to role-based dashboard

## 🎨 Theming

The app uses Material Design 3 with a custom theme defined in `lib/theme/app_theme.dart`.

## 📝 Code Generation

Models use `json_serializable` for JSON serialization. After modifying models, run:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## 🧪 Testing

```bash
flutter test
```

## 📄 License

This project is part of the Vision Clinic system.

## 🔗 Backend API

The Flutter app connects to the NestJS backend API. Ensure the backend is running before testing the app.

## 📞 Support

For issues or questions, please refer to the main project documentation.
