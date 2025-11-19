import '../config/api_endpoints.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';
import '../utils/storage_helper.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final StorageHelper _storageHelper = StorageHelper();

  Future<AuthResponse> login(String identifier, String password) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.login,
        data: {
          'identifier': identifier,
          'password': password,
        },
      );

      final authResponse = AuthResponse.fromJson(response.data);
      
      // Store tokens
      await _storageHelper.saveToken(authResponse.accessToken);
      if (authResponse.refreshToken != null) {
        await _storageHelper.saveRefreshToken(authResponse.refreshToken!);
      }
      await _storageHelper.saveUser(authResponse.user);

      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> register(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.register,
        data: data,
      );

      final authResponse = AuthResponse.fromJson(response.data);
      
      // Store tokens
      await _storageHelper.saveToken(authResponse.accessToken);
      if (authResponse.refreshToken != null) {
        await _storageHelper.saveRefreshToken(authResponse.refreshToken!);
      }
      await _storageHelper.saveUser(authResponse.user);

      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<User> getProfile() async {
    try {
      final response = await _apiService.get(ApiEndpoints.profile);
      return User.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storageHelper.clearAll();
  }

  Future<bool> isLoggedIn() async {
    final token = await _storageHelper.getToken();
    return token != null;
  }

  Future<User?> getCurrentUser() async {
    return await _storageHelper.getUser();
  }
}
