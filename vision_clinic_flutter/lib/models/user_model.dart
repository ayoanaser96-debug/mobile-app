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
  final UserStatus status;
  final String? specialty;
  final String? profileImage;
  final DateTime? dateOfBirth;
  final String? address;
  final bool emailVerified;
  final bool phoneVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    this.phone,
    this.nationalId,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.status,
    this.specialty,
    this.profileImage,
    this.dateOfBirth,
    this.address,
    required this.emailVerified,
    required this.phoneVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}




