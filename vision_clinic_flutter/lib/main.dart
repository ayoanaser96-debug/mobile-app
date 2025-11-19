import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'theme/app_theme.dart';
import 'models/user_model.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/patient/patient_dashboard_screen.dart';
import 'screens/doctor/doctor_dashboard_screen.dart';
import 'screens/admin/admin_dashboard_screen.dart';
import 'screens/pharmacy/pharmacy_dashboard_screen.dart';
import 'screens/analyst/analyst_dashboard_screen.dart';
import 'screens/face/face_register_screen.dart';
import 'screens/face/face_checkin_screen.dart';

void main() {
  runApp(const ProviderScope(child: VisionClinicApp()));
}

class VisionClinicApp extends ConsumerWidget {
  const VisionClinicApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Vision Clinic',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}

// Router Provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggingIn = state.matchedLocation == '/login';
      final isAuthenticated = authState.valueOrNull?.isAuthenticated ?? false;

      if (!isAuthenticated && !isLoggingIn) {
        return '/login';
      }

      if (isAuthenticated && isLoggingIn) {
        final userRole = authState.valueOrNull?.userRole;
        if (userRole != null) {
          switch (userRole) {
            case UserRole.patient:
              return '/patient';
            case UserRole.doctor:
              return '/doctor';
            case UserRole.admin:
              return '/admin';
            case UserRole.pharmacy:
              return '/pharmacy';
            case UserRole.optometrist:
              return '/analyst';
          }
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/patient',
        builder: (context, state) => const PatientDashboardScreen(),
      ),
      GoRoute(
        path: '/doctor',
        builder: (context, state) => const DoctorDashboardScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/pharmacy',
        builder: (context, state) => const PharmacyDashboardScreen(),
      ),
      GoRoute(
        path: '/analyst',
        builder: (context, state) => const AnalystDashboardScreen(),
      ),
      GoRoute(
        path: '/face/register',
        builder: (context, state) => const FaceRegisterScreen(),
      ),
      GoRoute(
        path: '/face/checkin',
        builder: (context, state) => const FaceCheckInScreen(),
      ),
    ],
  );
});
