# Vision Clinic Flutter - Project Structure

## 📂 Complete Directory Structure

```
vision_clinic_flutter/
├── lib/
│   ├── config/                    # Configuration files
│   │   ├── app_config.dart        # App-wide settings (API URLs, timeouts, keys)
│   │   └── api_endpoints.dart     # All API endpoint constants
│   │
│   ├── models/                    # Data models (with JSON serialization)
│   │   ├── user_model.dart        # User model with roles
│   │   ├── appointment_model.dart # Appointment model
│   │   ├── eye_test_model.dart   # Eye test model
│   │   ├── prescription_model.dart # Prescription model
│   │   ├── notification_model.dart # Notification model
│   │   └── auth_response_model.dart # Auth response model
│   │
│   ├── services/                  # Business logic & API services
│   │   ├── api_service.dart       # Dio HTTP client wrapper
│   │   ├── auth_service.dart      # Authentication service
│   │   └── patient_service.dart   # Patient-related API calls
│   │
│   ├── providers/                 # State management (Riverpod)
│   │   └── auth_provider.dart     # Authentication state provider (uses code generation)
│   │
│   ├── screens/                   # UI Screens
│   │   ├── auth/
│   │   │   └── login_screen.dart  # Login screen
│   │   ├── patient/
│   │   │   └── patient_dashboard_screen.dart # Patient dashboard
│   │   ├── doctor/
│   │   │   └── doctor_dashboard_screen.dart   # Doctor dashboard
│   │   ├── admin/
│   │   │   └── admin_dashboard_screen.dart    # Admin dashboard
│   │   ├── pharmacy/
│   │   │   └── pharmacy_dashboard_screen.dart # Pharmacy dashboard
│   │   └── analyst/
│   │       └── analyst_dashboard_screen.dart  # Analyst dashboard
│   │
│   ├── widgets/                   # Reusable UI components
│   │   ├── common/
│   │   │   ├── loading_widget.dart    # Loading indicator
│   │   │   └── error_widget.dart     # Error display widget
│   │   ├── forms/                 # Form widgets (to be added)
│   │   └── charts/                # Chart widgets (to be added)
│   │
│   ├── utils/                     # Utility functions
│   │   └── storage_helper.dart   # SharedPreferences wrapper
│   │
│   ├── theme/                     # App theming
│   │   └── app_theme.dart         # Material Design 3 theme
│   │
│   └── main.dart                  # App entry point with routing
│
├── assets/                        # Static assets
│   ├── images/                    # Image assets
│   └── icons/                     # Icon assets
│
├── test/                          # Unit & widget tests
│   └── widget_test.dart
│
├── pubspec.yaml                   # Dependencies & configuration
├── README.md                      # Project documentation
└── STRUCTURE.md                   # This file
```

## 🏗️ Architecture Overview

### 1. **Configuration Layer** (`config/`)
- Centralized app configuration
- API endpoints management
- Environment-specific settings

### 2. **Data Layer** (`models/`)
- Data models with JSON serialization
- Type-safe data structures
- Enums for status types

### 3. **Service Layer** (`services/`)
- API communication
- Business logic
- Data transformation

### 4. **State Management** (`providers/`)
- Riverpod for state management (following project rules)
- Code generation for type safety
- Reactive state updates
- Centralized state

### 5. **UI Layer** (`screens/` & `widgets/`)
- Screen components
- Reusable widgets
- Form components

### 6. **Utilities** (`utils/`)
- Helper functions
- Storage utilities
- Common operations

## 🔄 Data Flow

```
User Action → Screen → Riverpod Provider → Service → API → Backend
                ↓            ↓              ↓
              Widget ← AsyncValue ← Response
```

## 📱 Screen Organization

### Authentication Flow
- Login Screen → Role-based Dashboard

### Role-Based Dashboards
- **Patient**: Health management, appointments, tests
- **Doctor**: Case management, prescriptions
- **Admin**: System administration
- **Pharmacy**: Prescription fulfillment
- **Analyst**: Eye test analysis

## 🔐 Authentication Flow

1. User enters credentials
2. `AuthService.login()` called
3. API request to `/auth/login`
4. Response contains token + user data
5. Store tokens in `SharedPreferences`
6. Update `AuthProvider` state
7. Navigate to role-based dashboard

## 📦 Key Dependencies

- **flutter_riverpod**: State management (following project rules)
- **riverpod_annotation** & **riverpod_generator**: Code generation
- **dio**: HTTP client
- **go_router**: Navigation
- **shared_preferences**: Local storage
- **json_serializable**: JSON serialization
- **flutter_spinkit**: Loading indicators

## 🚀 Next Steps

1. **Run code generation:**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Add more screens:**
   - Appointment booking
   - Eye test forms
   - Prescription details
   - Profile screens

4. **Implement features:**
   - Face recognition
   - Camera integration
   - PDF generation
   - Charts and analytics

5. **Add tests:**
   - Unit tests for services
   - Widget tests for screens
   - Integration tests

## 📝 Notes

- **Code Generation**: Both models (`json_serializable`) and providers (`riverpod_generator`) use code generation - run `build_runner` after changes
- **State Management**: Uses Riverpod (following project cursor rules)
- **Navigation**: Uses GoRouter with proper `canPop()` checks
- **Code Hygiene**: All code follows cursor rules - checks `mounted`, disposes controllers, handles errors gracefully
- API base URL configured in `app_config.dart`
- Theme can be customized in `app_theme.dart`


