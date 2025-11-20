import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

enum UserRole {
  @JsonValue('PATIENT')
  patient,
  @JsonValue('OPTOMETRIST')
  optometrist,
  @JsonValue('DOCTOR')
  doctor,
  @JsonValue('ADMIN')
  admin,
  @JsonValue('PHARMACY')
  pharmacy,
}

enum UserStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('INACTIVE')
  inactive,
  @JsonValue('SUSPENDED')
  suspended,
}

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String? phone;
  final String? nationalId;
  final String firstName;
  final String lastName;
  final UserRole role;
  @JsonKey(defaultValue: UserStatus.active)
  final UserStatus status;
  final String? specialty;
  final String? profileImage;
  final DateTime? dateOfBirth;
  final String? address;
  @JsonKey(defaultValue: false)
  final bool emailVerified;
  @JsonKey(defaultValue: false)
  final bool phoneVerified;
  @JsonKey(fromJson: _dateTimeFromJson, toJson: _dateTimeToJson)
  final DateTime createdAt;
  @JsonKey(fromJson: _dateTimeFromJson, toJson: _dateTimeToJson)
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    this.phone,
    this.nationalId,
    required this.firstName,
    required this.lastName,
    required this.role,
    UserStatus status = UserStatus.active,
    this.specialty,
    this.profileImage,
    this.dateOfBirth,
    this.address,
    bool emailVerified = false,
    bool phoneVerified = false,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : status = status,
        emailVerified = emailVerified,
        phoneVerified = phoneVerified,
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  static DateTime _dateTimeFromJson(dynamic json) {
    if (json == null) return DateTime.now();
    if (json is String) {
      try {
        return DateTime.parse(json);
      } catch (e) {
        return DateTime.now();
      }
    }
    return DateTime.now();
  }

  static String _dateTimeToJson(DateTime dateTime) => dateTime.toIso8601String();

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}







