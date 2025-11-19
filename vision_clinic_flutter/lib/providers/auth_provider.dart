import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

part 'auth_provider.g.dart';

// Auth Service Provider
@riverpod
AuthService authService(AuthServiceRef ref) {
  return AuthService();
}

// Auth State Provider
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<AuthState> build() async {
    final authService = ref.read(authServiceProvider);
    final isLoggedIn = await authService.isLoggedIn();
    if (isLoggedIn) {
      final user = await authService.getCurrentUser();
      if (user != null) {
        return AuthState.authenticated(user);
      }
    }
    return const AuthState.unauthenticated();
  }

  Future<bool> login(String identifier, String password) async {
    state = const AsyncValue.loading();
    try {
      final authService = ref.read(authServiceProvider);
      final authResponse = await authService.login(identifier, password);
      state = AsyncValue.data(AuthState.authenticated(authResponse.user));
      return true;
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final authService = ref.read(authServiceProvider);
      final authResponse = await authService.register(data);
      state = AsyncValue.data(AuthState.authenticated(authResponse.user));
      return true;
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
      return false;
    }
  }

  Future<void> logout() async {
    final authService = ref.read(authServiceProvider);
    await authService.logout();
    state = const AsyncValue.data(AuthState.unauthenticated());
  }

  Future<void> refresh() async {
    try {
      final authService = ref.read(authServiceProvider);
      final isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        final user = await authService.getCurrentUser();
        if (user != null) {
          state = AsyncValue.data(AuthState.authenticated(user));
        } else {
          state = const AsyncValue.data(AuthState.unauthenticated());
        }
      } else {
        state = const AsyncValue.data(AuthState.unauthenticated());
      }
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

// Auth State Model
class AuthState {
  final bool isAuthenticated;
  final User? user;

  const AuthState.unauthenticated()
      : isAuthenticated = false,
        user = null;

  const AuthState.authenticated(this.user) : isAuthenticated = true;

  UserRole? get userRole => user?.role;
}
