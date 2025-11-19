class AppConfig {
  // API Configuration
  static const String baseUrl = 'http://localhost:3001';
  static const String apiVersion = '/api';
  
  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/auth/profile';
  static const String refreshTokenEndpoint = '/auth/refresh';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String refreshTokenKey = 'refresh_token';
  
  // App Info
  static const String appName = 'Vision Clinic';
  static const String appVersion = '1.0.0';
}




