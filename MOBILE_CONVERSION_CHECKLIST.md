# Mobile App Conversion - Step-by-Step Checklist

This checklist will guide you through converting the Vision Clinic web application into a mobile app using React Native.

---

## Prerequisites Setup

### Environment Setup
- [ ] Install Node.js (v20 or higher)
- [ ] Install React Native CLI: `npm install -g react-native-cli`
- [ ] Install Xcode (for iOS development on macOS)
- [ ] Install Android Studio (for Android development)
- [ ] Set up Android SDK and emulator
- [ ] Install CocoaPods for iOS: `sudo gem install cocoapods`
- [ ] Install Watchman (recommended): `brew install watchman`
- [ ] Configure environment variables (create `.env` file)

### Verify Backend is Running
- [ ] Backend server running on port 3001
- [ ] MySQL database is running
- [ ] Prisma migrations are applied
- [ ] Backend API endpoints are accessible
- [ ] CORS is configured (update to include mobile app origins)

---

## Phase 1: Project Foundation (Week 1-2)

### Step 1.1: Initialize Mobile App Structure
- [ ] Navigate to `VisionClinicMobile/` directory
- [ ] Install core dependencies:
  ```bash
  npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
  npm install react-native-screens react-native-safe-area-context
  npm install react-native-gesture-handler react-native-reanimated
  npm install @react-native-async-storage/async-storage
  npm install axios
  npm install socket.io-client
  ```
- [ ] Install iOS dependencies: `cd ios && pod install && cd ..`
- [ ] Create folder structure:
  ```
  VisionClinicMobile/
  ├── src/
  │   ├── navigation/
  │   ├── screens/
  │   ├── components/
  │   ├── services/
  │   ├── contexts/
  │   ├── hooks/
  │   ├── utils/
  │   └── types/
  └── assets/
  ```

### Step 1.2: Setup Navigation
- [ ] Create `src/navigation/AppNavigator.tsx`
  - [ ] Implement Stack Navigator for auth flow
  - [ ] Implement Tab Navigator for main app
  - [ ] Add navigation types
- [ ] Create `src/navigation/AuthNavigator.tsx`
- [ ] Create `src/navigation/MainNavigator.tsx`
- [ ] Update `App.tsx` to use navigation
- [ ] Test navigation between screens

### Step 1.3: API Service Layer
- [ ] Create `src/services/api.ts`
  - [ ] Setup Axios instance with base URL
  - [ ] Configure request interceptors (add token)
  - [ ] Configure response interceptors (handle 401)
  - [ ] Export API instance
- [ ] Create `src/services/authService.ts`
  - [ ] Register function
  - [ ] Login function
  - [ ] Logout function
  - [ ] Get profile function
- [ ] Create `src/services/patientService.ts`
- [ ] Create `src/services/appointmentService.ts`
- [ ] Create `src/services/prescriptionService.ts`
- [ ] Create `src/services/chatService.ts`
- [ ] Test API connectivity

### Step 1.4: State Management Setup
- [ ] Create `src/contexts/AuthContext.tsx`
  - [ ] User state
  - [ ] Token state
  - [ ] Loading state
  - [ ] Login function
  - [ ] Logout function
  - [ ] Register function
  - [ ] Check auth status on app start
- [ ] Create `src/utils/storage.ts`
  - [ ] Token storage (use Keychain for security)
  - [ ] User data storage
- [ ] Wrap app with AuthProvider
- [ ] Test authentication flow

### Step 1.5: Type Definitions
- [ ] Create `src/types/index.ts`
  - [ ] User types
  - [ ] Appointment types
  - [ ] Prescription types
  - [ ] EyeTest types
  - [ ] Notification types
  - [ ] Navigation types
- [ ] Copy relevant types from backend Prisma schema

---

## Phase 2: Authentication & Onboarding (Week 2-3)

### Step 2.1: Login Screen
- [ ] Create `src/screens/auth/LoginScreen.tsx`
  - [ ] Email/Phone/National ID input
  - [ ] Password input
  - [ ] Login button
  - [ ] Error handling
  - [ ] Loading states
  - [ ] "Forgot password" link
- [ ] Style login screen (match web design)
- [ ] Test login functionality
- [ ] Handle token storage

### Step 2.2: Register Screen
- [ ] Create `src/screens/auth/RegisterScreen.tsx`
  - [ ] User info form (name, email, phone, etc.)
  - [ ] Role selection (Patient, Doctor, etc.)
  - [ ] Password creation
  - [ ] Terms acceptance checkbox
  - [ ] Submit registration
- [ ] Add form validation
- [ ] Test registration flow
- [ ] Handle different user roles

### Step 2.3: Face Recognition Integration
- [ ] Install camera library: `npm install react-native-vision-camera`
- [ ] Request camera permissions
- [ ] Create `src/components/FaceCapture.tsx`
  - [ ] Camera view
  - [ ] Face detection overlay
  - [ ] Capture button
  - [ ] Image preview
- [ ] Create `src/services/faceRecognitionService.ts`
  - [ ] Upload face image to backend
  - [ ] Handle face recognition response
- [ ] Integrate face capture in registration/login flow
- [ ] Test face recognition authentication

### Step 2.4: Document Scanner Integration
- [ ] Create `src/components/DocumentScanner.tsx`
  - [ ] Camera view for document scanning
  - [ ] Document detection overlay
  - [ ] Auto-capture on detection
  - [ ] Manual capture option
  - [ ] Image preview and confirmation
- [ ] Create `src/services/documentScannerService.ts`
  - [ ] Upload document image
  - [ ] Handle OCR response
- [ ] Integrate document scanner in registration
- [ ] Test document scanning

### Step 2.5: Biometric Authentication
- [ ] Install: `npm install react-native-biometrics`
- [ ] Create `src/utils/biometrics.ts`
  - [ ] Check biometric availability
  - [ ] Prompt biometric authentication
  - [ ] Handle biometric result
- [ ] Integrate biometric login option
- [ ] Test Face ID/Touch ID (iOS) and Fingerprint (Android)

---

## Phase 3: Core Patient Features (Week 3-5)

### Step 3.1: Patient Dashboard
- [ ] Create `src/screens/patient/DashboardScreen.tsx`
  - [ ] Overview cards (appointments, tests, prescriptions)
  - [ ] Quick actions
  - [ ] Recent activity
  - [ ] Statistics widgets
- [ ] Create dashboard layout with tabs
- [ ] Style dashboard (match web design)
- [ ] Test dashboard data loading

### Step 3.2: Appointments
- [ ] Create `src/screens/patient/AppointmentsScreen.tsx`
  - [ ] List of appointments
  - [ ] Filter by status (upcoming, past, cancelled)
  - [ ] Appointment details view
  - [ ] Pull to refresh
- [ ] Create `src/screens/patient/BookAppointmentScreen.tsx`
  - [ ] Date picker
  - [ ] Time slot selection
  - [ ] Doctor selection (if applicable)
  - [ ] Reason/notes input
  - [ ] Appointment type selection (in-person, video, phone)
- [ ] Create `src/components/AppointmentCard.tsx`
- [ ] Implement appointment booking API calls
- [ ] Test appointment creation and viewing

### Step 3.3: Eye Tests
- [ ] Create `src/screens/patient/EyeTestsScreen.tsx`
  - [ ] List of eye tests
  - [ ] Test status indicators
  - [ ] Test details view
- [ ] Create `src/screens/patient/EyeTestDetailScreen.tsx`
  - [ ] Visual acuity results
  - [ ] Color vision results
  - [ ] Refraction results
  - [ ] Retina images gallery
  - [ ] AI analysis results
- [ ] Create image gallery component
- [ ] Test eye test viewing

### Step 3.4: Prescriptions
- [ ] Create `src/screens/patient/PrescriptionsScreen.tsx`
  - [ ] List of prescriptions
  - [ ] Prescription status
  - [ ] Filter options
- [ ] Create `src/screens/patient/PrescriptionDetailScreen.tsx`
  - [ ] Medication list
  - [ ] Glasses prescription
  - [ ] Doctor notes
  - [ ] QR code for pharmacy
  - [ ] Download/share PDF button
- [ ] Create `src/components/PrescriptionCard.tsx`
- [ ] Implement PDF viewing (install `react-native-pdf`)
- [ ] Test prescription viewing

### Step 3.5: Medical History
- [ ] Create `src/screens/patient/MedicalHistoryScreen.tsx`
  - [ ] Timeline view of medical history
  - [ ] Filter by date range
  - [ ] Filter by type (appointments, tests, prescriptions)
- [ ] Create `src/components/MedicalHistoryCard.tsx`
- [ ] Test medical history display

### Step 3.6: Profile & Settings
- [ ] Create `src/screens/patient/ProfileScreen.tsx`
  - [ ] User information display
  - [ ] Edit profile button
  - [ ] Profile picture
- [ ] Create `src/screens/patient/EditProfileScreen.tsx`
  - [ ] Editable form fields
  - [ ] Save changes
- [ ] Create `src/screens/SettingsScreen.tsx`
  - [ ] Theme toggle
  - [ ] Notification settings
  - [ ] Language selection
  - [ ] Logout button
- [ ] Test profile editing

---

## Phase 4: Doctor Features (Week 5-6)

### Step 4.1: Doctor Dashboard
- [ ] Create `src/screens/doctor/DashboardScreen.tsx`
  - [ ] Pending cases count
  - [ ] Upcoming appointments
  - [ ] Quick actions
  - [ ] Statistics
- [ ] Style doctor dashboard
- [ ] Test dashboard loading

### Step 4.2: Cases Management
- [ ] Create `src/screens/doctor/CasesScreen.tsx`
  - [ ] List of assigned cases
  - [ ] Filter by priority/status
  - [ ] Search functionality
- [ ] Create `src/screens/doctor/CaseDetailScreen.tsx`
  - [ ] Patient information
  - [ ] Eye test results
  - [ ] Analyst notes
  - [ ] AI analysis results
  - [ ] Action buttons (approve, reject, add notes)
- [ ] Create `src/components/CaseCard.tsx`
- [ ] Implement case review API calls
- [ ] Test case management

### Step 4.3: Prescription Creation
- [ ] Create `src/screens/doctor/CreatePrescriptionScreen.tsx`
  - [ ] Patient selection
  - [ ] Medication input (search/add)
  - [ ] Glasses prescription form
  - [ ] Diagnosis field
  - [ ] Notes field
  - [ ] Digital signature capture
  - [ ] Preview and submit
- [ ] Create `src/components/MedicationInput.tsx`
- [ ] Create `src/components/SignaturePad.tsx` (install `react-native-signature-canvas`)
- [ ] Test prescription creation

### Step 4.4: Patient Review
- [ ] Create `src/screens/doctor/PatientReviewScreen.tsx`
  - [ ] Patient profile overview
  - [ ] Medical history
  - [ ] Recent tests
  - [ ] Prescription history
- [ ] Test patient review flow

---

## Phase 5: Chat & Notifications (Week 6-7)

### Step 5.1: Chat Implementation
- [ ] Install Socket.io client (already installed)
- [ ] Create `src/services/socketService.ts`
  - [ ] Socket connection setup
  - [ ] Event listeners
  - [ ] Send message function
  - [ ] Handle reconnection
- [ ] Create `src/screens/chat/ChatListScreen.tsx`
  - [ ] List of conversations
  - [ ] Unread message indicators
  - [ ] Last message preview
- [ ] Create `src/screens/chat/ChatScreen.tsx`
  - [ ] Message list (FlatList)
  - [ ] Message input
  - [ ] Send button
  - [ ] Message bubbles (sent/received)
  - [ ] Typing indicators
  - [ ] Read receipts
- [ ] Create `src/components/MessageBubble.tsx`
- [ ] Test real-time chat

### Step 5.2: Push Notifications Setup
- [ ] Install Firebase: `npm install @react-native-firebase/app @react-native-firebase/messaging`
- [ ] Configure Firebase project
- [ ] Setup iOS push certificates (APNS)
- [ ] Setup Android FCM configuration
- [ ] Create `src/services/notificationService.ts`
  - [ ] Request notification permissions
  - [ ] Get FCM token
  - [ ] Send token to backend
  - [ ] Handle notification received
  - [ ] Handle notification opened
- [ ] Create notification handler component
- [ ] Test push notifications

### Step 5.3: In-App Notifications
- [ ] Create `src/screens/NotificationsScreen.tsx`
  - [ ] List of notifications
  - [ ] Filter by type/priority
  - [ ] Mark as read
  - [ ] Navigate to related content
- [ ] Create `src/components/NotificationCard.tsx`
- [ ] Create notification badge component
- [ ] Test notification display

---

## Phase 6: Advanced Features (Week 7-9)

### Step 6.1: Eye Test Forms
- [ ] Create `src/screens/patient/EyeTestFormScreen.tsx`
  - [ ] Visual acuity test interface
    - [ ] Snellen chart display
    - [ ] Touch-based letter selection
    - [ ] Left/right eye toggle
  - [ ] Color vision test
    - [ ] Ishihara plates display
    - [ ] Number input
  - [ ] Refraction test form
    - [ ] Sphere, cylinder, axis inputs
  - [ ] Retina image upload
    - [ ] Camera access
    - [ ] Image capture
    - [ ] Preview and confirm
- [ ] Create `src/components/VisualAcuityTest.tsx`
- [ ] Create `src/components/ColorVisionTest.tsx`
- [ ] Test eye test form submission

### Step 6.2: Patient Journey Tracking
- [ ] Create `src/screens/patient/JourneyScreen.tsx`
  - [ ] Step-by-step progress indicator
  - [ ] Current step highlight
  - [ ] Step details
  - [ ] Time tracking
- [ ] Create `src/components/JourneyStep.tsx`
- [ ] Test journey tracking

### Step 6.3: Billing & Receipts
- [ ] Create `src/screens/patient/BillingScreen.tsx`
  - [ ] Billing history
  - [ ] Outstanding payments
  - [ ] Payment methods
- [ ] Create `src/screens/patient/ReceiptScreen.tsx`
  - [ ] Receipt PDF viewer
  - [ ] Download button
  - [ ] Share button (native share)
- [ ] Install PDF viewer: `npm install react-native-pdf`
- [ ] Install share: `npm install react-native-share`
- [ ] Test receipt viewing and sharing

### Step 6.4: Pharmacy Features (if needed)
- [ ] Create `src/screens/pharmacy/DashboardScreen.tsx`
- [ ] Create `src/screens/pharmacy/PrescriptionsScreen.tsx`
- [ ] Create `src/screens/pharmacy/InventoryScreen.tsx`
- [ ] Implement QR code scanning: `npm install react-native-qrcode-scanner`
- [ ] Implement barcode scanning
- [ ] Test pharmacy workflow

---

## Phase 7: Analyst Features (Week 9-10)

### Step 7.1: Analyst Dashboard
- [ ] Create `src/screens/analyst/DashboardScreen.tsx`
  - [ ] Pending tests count
  - [ ] Recent tests
  - [ ] Statistics
- [ ] Test dashboard

### Step 7.2: Test Analysis
- [ ] Create `src/screens/analyst/PendingTestsScreen.tsx`
  - [ ] List of pending tests
  - [ ] Filter options
- [ ] Create `src/screens/analyst/AnalyzeTestScreen.tsx`
  - [ ] Test data display
  - [ ] AI analysis results
  - [ ] Analyst notes input
  - [ ] Approve/reject buttons
- [ ] Test analysis workflow

---

## Phase 8: Admin Features (Week 10, Optional)

### Step 8.1: Admin Dashboard (Simplified Mobile Version)
- [ ] Create `src/screens/admin/DashboardScreen.tsx`
  - [ ] Key metrics
  - [ ] Quick actions
- [ ] Note: Full admin features may remain web-only

---

## Phase 9: Polish & Optimization (Week 10-11)

### Step 9.1: Error Handling
- [ ] Create error boundary component
- [ ] Add error handling to all API calls
- [ ] Create user-friendly error messages
- [ ] Add retry mechanisms
- [ ] Test error scenarios

### Step 9.2: Loading States
- [ ] Add loading indicators to all screens
- [ ] Create `src/components/LoadingSpinner.tsx`
- [ ] Implement skeleton screens for better UX
- [ ] Test loading states

### Step 9.3: Offline Support
- [ ] Install: `npm install @react-native-community/netinfo`
- [ ] Create `src/utils/offline.ts`
  - [ ] Network status detection
  - [ ] Queue offline actions
  - [ ] Sync when online
- [ ] Cache frequently accessed data
- [ ] Show offline indicator
- [ ] Test offline functionality

### Step 9.4: Performance Optimization
- [ ] Optimize image loading (use FastImage)
- [ ] Implement list pagination
- [ ] Add memoization where needed
- [ ] Optimize FlatList rendering
- [ ] Profile app performance
- [ ] Fix performance bottlenecks

### Step 9.5: UI/UX Improvements
- [ ] Consistent spacing and styling
- [ ] Smooth animations (React Native Reanimated)
- [ ] Haptic feedback (install `react-native-haptic-feedback`)
- [ ] Accessibility improvements
  - [ ] Screen reader labels
  - [ ] Touch target sizes
  - [ ] Color contrast
- [ ] Dark mode support (if not already done)

### Step 9.6: Testing
- [ ] Write unit tests for utilities
- [ ] Write integration tests for API services
- [ ] Write component tests
- [ ] Setup E2E testing with Detox
- [ ] Test on multiple devices
- [ ] Test on iOS and Android

---

## Phase 10: Deployment Preparation (Week 11-12)

### Step 10.1: Configuration
- [ ] Setup environment configurations (dev, staging, prod)
- [ ] Configure API endpoints per environment
- [ ] Setup build configurations
- [ ] Configure app icons and splash screens

### Step 10.2: iOS Preparation
- [ ] Configure app bundle identifier
- [ ] Setup signing certificates
- [ ] Configure Info.plist permissions
- [ ] Add app icons (all sizes)
- [ ] Add launch screen
- [ ] Test on physical iOS device
- [ ] Archive build for App Store

### Step 10.3: Android Preparation
- [ ] Configure package name
- [ ] Setup signing keys
- [ ] Configure AndroidManifest.xml
- [ ] Add app icons (all densities)
- [ ] Add splash screen
- [ ] Test on physical Android device
- [ ] Generate release APK/AAB

### Step 10.4: App Store Assets
- [ ] Write app description
- [ ] Create app screenshots (multiple sizes)
- [ ] Create app preview video (optional)
- [ ] Design app icon
- [ ] Write privacy policy
- [ ] Prepare App Store listing

### Step 10.5: Backend Updates for Mobile
- [ ] Update CORS to include mobile app origins
- [ ] Add mobile app version tracking
- [ ] Configure push notification endpoints
- [ ] Test all API endpoints from mobile app
- [ ] Monitor API usage

### Step 10.6: Final Testing
- [ ] Test all user flows
- [ ] Test on multiple devices (iOS and Android)
- [ ] Test different screen sizes
- [ ] Test with slow network
- [ ] Test offline scenarios
- [ ] Security audit
- [ ] Performance testing

### Step 10.7: Submission
- [ ] Submit to Apple App Store
- [ ] Submit to Google Play Store
- [ ] Monitor submission status
- [ ] Respond to review feedback

---

## Ongoing Maintenance

### Post-Launch
- [ ] Monitor crash reports (Firebase Crashlytics or Sentry)
- [ ] Monitor analytics (Firebase Analytics or similar)
- [ ] Collect user feedback
- [ ] Plan feature updates
- [ ] Schedule regular updates
- [ ] Keep dependencies updated

---

## Quick Reference Commands

### Development
```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
npm start -- --reset-cache
```

### Building
```bash
# iOS
cd ios && pod install && cd ..
npm run ios -- --configuration Release

# Android
cd android && ./gradlew assembleRelease
```

### Testing
```bash
npm test
npm run test:e2e
```

---

## Notes

- Check off items as you complete them
- Some tasks may be done in parallel
- Adjust timeline based on team size and experience
- Regular testing is crucial throughout development
- Keep backend API documentation handy
- Refer to React Native and React Navigation documentation
- Use the overview document (`MOBILE_CONVERSION_OVERVIEW.md`) for detailed context

---

## Helpful Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [React Native Vision Camera](https://react-native-vision-camera.github.io/docs/)
- [React Native Firebase](https://rnfirebase.io/)
- [NativeWind Docs](https://www.nativewind.dev/)











