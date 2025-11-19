class ApiEndpoints {
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String profile = '/auth/profile';
  static const String refreshToken = '/auth/refresh';
  
  // Patients
  static const String patientProfile = '/patients/profile';
  static const String patientJourney = '/patients/unified-journey';
  static const String healthTimeline = '/patients/health-timeline';
  static const String billingHistory = '/patients/billing-history';
  static const String suggestedAppointments = '/patients/suggested-appointments';
  static const String prescriptionTracking = '/patients/prescription-tracking';
  static const String aiInsights = '/patients/ai-insights';
  static const String healthDashboard = '/patients/health-dashboard';
  
  // Appointments
  static const String appointments = '/appointments';
  static const String myAppointments = '/appointments/my-appointments';
  static const String appointmentWaitTime = '/patients/appointments';
  
  // Eye Tests
  static const String eyeTests = '/eye-tests';
  static const String myEyeTests = '/eye-tests/my-tests';
  static const String pendingAnalysis = '/eye-tests/pending-analysis';
  static const String analyzeTest = '/eye-tests';
  
  // Prescriptions
  static const String prescriptions = '/prescriptions';
  static const String myPrescriptions = '/prescriptions/my-prescriptions';
  
  // Cases
  static const String cases = '/cases';
  static const String myCases = '/cases/my-cases';
  
  // Notifications
  static const String notifications = '/notifications';
  static const String unreadCount = '/notifications/unread-count';
  
  // Chat
  static const String chatMessages = '/chat/messages';
  
  // Analytics
  static const String analytics = '/analytics';
  static const String testTrends = '/analytics/test-trends';
}




