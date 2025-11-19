// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['id'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String?,
  nationalId: json['nationalId'] as String?,
  firstName: json['firstName'] as String,
  lastName: json['lastName'] as String,
  role: $enumDecode(_$UserRoleEnumMap, json['role']),
  status: $enumDecode(_$UserStatusEnumMap, json['status']),
  specialty: json['specialty'] as String?,
  profileImage: json['profileImage'] as String?,
  dateOfBirth: json['dateOfBirth'] == null
      ? null
      : DateTime.parse(json['dateOfBirth'] as String),
  address: json['address'] as String?,
  emailVerified: json['emailVerified'] as bool,
  phoneVerified: json['phoneVerified'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'phone': instance.phone,
  'nationalId': instance.nationalId,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'role': _$UserRoleEnumMap[instance.role]!,
  'status': _$UserStatusEnumMap[instance.status]!,
  'specialty': instance.specialty,
  'profileImage': instance.profileImage,
  'dateOfBirth': instance.dateOfBirth?.toIso8601String(),
  'address': instance.address,
  'emailVerified': instance.emailVerified,
  'phoneVerified': instance.phoneVerified,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$UserRoleEnumMap = {
  UserRole.patient: 'PATIENT',
  UserRole.optometrist: 'OPTOMETRIST',
  UserRole.doctor: 'DOCTOR',
  UserRole.admin: 'ADMIN',
  UserRole.pharmacy: 'PHARMACY',
};

const _$UserStatusEnumMap = {
  UserStatus.active: 'ACTIVE',
  UserStatus.inactive: 'INACTIVE',
  UserStatus.suspended: 'SUSPENDED',
};
