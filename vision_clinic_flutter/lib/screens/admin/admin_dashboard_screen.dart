import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/services_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/user_model.dart';
import '../../models/appointment_model.dart';
import '../../models/eye_test_model.dart';
import '../../models/prescription_model.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/animated_card.dart';
import '../../widgets/animated_stat_card.dart';
import '../../widgets/pulse_indicator.dart';
import '../../widgets/animated_button.dart';
import '../../widgets/slide_in_animation.dart';
import '../../widgets/shimmer_loading.dart';

// Providers
final adminUsersProvider = FutureProvider<List<User>>((ref) async {
  final service = ref.watch(adminServiceProvider);
  return service.getUsers();
});

final adminUsersActivityProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getUsersActivity();
});

final adminDashboardStatsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getDashboardStats();
});

final adminComprehensiveAnalyticsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
      final service = ref.watch(adminServiceProvider);
      return service.getComprehensiveAnalytics();
    });

final adminBillingAnalyticsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getBillingAnalytics();
});

final adminAppointmentAnalyticsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getAppointmentAnalytics();
});

final adminSecurityStatusProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getSecurityStatus();
});

final adminDevicesProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getDevices();
});

final adminDeviceAlertsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getDeviceAlerts();
});

final adminAppointmentsProvider = FutureProvider<List<Appointment>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getAllAppointments();
});

final adminEyeTestsProvider = FutureProvider<List<EyeTest>>((ref) async {
  final service = ref.watch(adminServiceProvider);
  return service.getAllEyeTests();
});

final adminPrescriptionsProvider = FutureProvider<List<Prescription>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getAllPrescriptions();
});

final adminAnalyticsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(adminServiceProvider);
  return service.getAnalytics();
});

final adminActiveJourneysProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final service = ref.watch(patientServiceProvider);
  return service.getActiveJourneys();
});

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _searchTerm = '';
  String _roleFilter = 'ALL';
  bool _lockdownActive = false;
  final TextEditingController _broadcastController = TextEditingController();
  final List<Map<String, dynamic>> _broadcastHistory = [];
  Map<String, bool> _automationRules = {
    'autoDisableUser': true,
    'autoCalibrateDevices': true,
    'autoFlagTransactions': true,
  };
  String _currency = 'USD';
  String _language = 'en';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 10, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _broadcastController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(adminDashboardStatsProvider);
              ref.invalidate(adminUsersProvider);
              ref.invalidate(adminComprehensiveAnalyticsProvider);
            },
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              _showAddUserDialog(context);
            },
            tooltip: 'Add User',
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle),
            onSelected: (value) {
              if (value == 'profile') {
                _showProfile(context);
              } else if (value == 'logout') {
                _handleLogout(context);
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person, size: 20),
                    SizedBox(width: 8),
                    Text('Profile'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Logout', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Overview', icon: Icon(Icons.dashboard)),
            Tab(text: 'Users', icon: Icon(Icons.people)),
            Tab(text: 'Devices', icon: Icon(Icons.devices)),
            Tab(text: 'Appointments', icon: Icon(Icons.calendar_today)),
            Tab(text: 'Billing', icon: Icon(Icons.attach_money)),
            Tab(text: 'Analytics', icon: Icon(Icons.bar_chart)),
            Tab(text: 'Security', icon: Icon(Icons.security)),
            Tab(text: 'Journeys', icon: Icon(Icons.route)),
            Tab(text: 'Controls', icon: Icon(Icons.settings_remote)),
            Tab(text: 'Settings', icon: Icon(Icons.settings)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(context),
          _buildUsersTab(context),
          _buildDevicesTab(context),
          _buildAppointmentsTab(context),
          _buildBillingTab(context),
          _buildAnalyticsTab(context),
          _buildSecurityTab(context),
          _buildJourneysTab(context),
          _buildControlsTab(context),
          _buildSettingsTab(context),
        ],
      ),
    );
  }

  Widget _buildOverviewTab(BuildContext context) {
    final comprehensiveAsync = ref.watch(adminComprehensiveAnalyticsProvider);
    final deviceAlertsAsync = ref.watch(adminDeviceAlertsProvider);
    final securityAsync = ref.watch(adminSecurityStatusProvider);
    final devicesAsync = ref.watch(adminDevicesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminDashboardStatsProvider);
        ref.invalidate(adminComprehensiveAnalyticsProvider);
        ref.invalidate(adminDeviceAlertsProvider);
        ref.invalidate(adminSecurityStatusProvider);
        ref.invalidate(adminDevicesProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            comprehensiveAsync.when(
              data: (analytics) => _buildQuickStats(context, analytics),
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorDisplayWidget(
                message: 'Failed to load stats: ${error.toString()}',
                onRetry: () {
                  ref.invalidate(adminComprehensiveAnalyticsProvider);
                },
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: securityAsync.when(
                    data: (security) =>
                        _buildSystemHealthCard(context, security),
                    loading: () => const Card(child: LoadingWidget()),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: devicesAsync.when(
                    data: (devices) => _buildDeviceStatusCard(context, devices),
                    loading: () => const Card(child: LoadingWidget()),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            deviceAlertsAsync.when(
              data: (alerts) {
                if (alerts.isEmpty) return const SizedBox.shrink();
                return _buildDeviceAlertsCard(context, alerts);
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStats(
    BuildContext context,
    Map<String, dynamic> analytics,
  ) {
    final overview = analytics['overview'] as Map<String, dynamic>? ?? {};
    final billingAsync = ref.watch(adminBillingAnalyticsProvider);
    final deviceAlertsAsync = ref.watch(adminDeviceAlertsProvider);

    return SlideInAnimation(
      delay: const Duration(milliseconds: 50),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  context,
                  'Total Patients',
                  overview['totalPatients']?.toString() ?? '0',
                  Icons.people,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  context,
                  'Active Doctors',
                  overview['activeDoctors']?.toString() ?? '0',
                  Icons.local_hospital,
                  Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: billingAsync.when(
                  data: (billing) {
                    final revenue =
                        billing['revenue']?['total']?.toString() ?? '0';
                    return _buildStatCard(
                      context,
                      'Revenue',
                      '\$$revenue',
                      Icons.attach_money,
                      Colors.green,
                    );
                  },
                  loading: () => const ShimmerCard(),
                  error: (_, __) => _buildStatCard(
                    context,
                    'Revenue',
                    '0',
                    Icons.attach_money,
                    Colors.green,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: deviceAlertsAsync.when(
                  data: (alerts) => _buildStatCard(
                    context,
                    'Device Alerts',
                    alerts.length.toString(),
                    Icons.warning,
                    Colors.red,
                  ),
                  loading: () => const ShimmerCard(),
                  error: (_, __) => _buildStatCard(
                    context,
                    'Alerts',
                    '0',
                    Icons.warning,
                    Colors.red,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return AnimatedStatCard(
      title: title,
      value: value,
      icon: icon,
      color: color,
      delay: const Duration(milliseconds: 100),
    );
  }

  Widget _buildSystemHealthCard(
    BuildContext context,
    Map<String, dynamic> security,
  ) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 200),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'System Health',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(width: 8),
                PulseIndicator(
                  color: security['encryptionEnabled'] == true
                      ? Colors.green
                      : Colors.red,
                  size: 8,
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildHealthRow(
              'Security Status',
              security['encryptionEnabled'] == true ? 'Secure' : 'Insecure',
              security['encryptionEnabled'] == true,
            ),
            _buildHealthRow(
              'Last Backup',
              security['lastBackup'] != null
                  ? DateFormat(
                      'MMM dd, yyyy',
                    ).format(DateTime.parse(security['lastBackup']))
                  : 'Never',
              null,
            ),
            _buildHealthRow(
              '2FA Enabled',
              security['twoFactorEnabled'] == true ? 'Enabled' : 'Disabled',
              security['twoFactorEnabled'] == true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceStatusCard(
    BuildContext context,
    List<Map<String, dynamic>> devices,
  ) {
    final online = devices.where((d) => d['status'] == 'online').length;
    final offline = devices.where((d) => d['status'] == 'offline').length;
    final needsCalibration = devices
        .where((d) => d['calibrationStatus'] == 'needs_calibration')
        .length;

    return AnimatedCard(
      delay: const Duration(milliseconds: 250),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Device Status',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(width: 8),
                if (online > 0) PulseIndicator(color: Colors.green, size: 8),
              ],
            ),
            const SizedBox(height: 16),
            _buildHealthRow('Total Devices', devices.length.toString(), null),
            _buildHealthRow('Online', online.toString(), true),
            _buildHealthRow('Offline', offline.toString(), false),
            _buildHealthRow(
              'Needs Calibration',
              needsCalibration.toString(),
              null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthRow(String label, String value, bool? isGood) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          if (isGood != null)
            Chip(
              label: Text(value),
              backgroundColor: isGood
                  ? Colors.green.withOpacity(0.2)
                  : Colors.red.withOpacity(0.2),
            )
          else
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildDeviceAlertsCard(
    BuildContext context,
    List<Map<String, dynamic>> alerts,
  ) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 300),
      hoverColor: Colors.red.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.elasticOut,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: const Icon(Icons.warning, color: Colors.red),
                    );
                  },
                ),
                const SizedBox(width: 8),
                Text(
                  'Device Alerts',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...alerts.take(5).toList().asMap().entries.map((entry) {
              final index = entry.key;
              final alert = entry.value;
              return SlideInAnimation(
                delay: Duration(milliseconds: 350 + (index * 50).toInt()),
                beginOffset: const Offset(-0.1, 0),
                child: Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  color: Colors.red.withOpacity(0.1),
                  child: ListTile(
                    leading: PulseIndicator(color: Colors.red, size: 6),
                    title: Text(alert['deviceName'] ?? 'Unknown'),
                    subtitle: Text(alert['message'] ?? ''),
                    trailing: Chip(
                      label: Text(
                        alert['severity'] ?? 'medium',
                        style: const TextStyle(fontSize: 12),
                      ),
                      backgroundColor: _getSeverityColor(alert['severity']),
                    ),
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String? severity) {
    switch (severity?.toLowerCase()) {
      case 'high':
        return Colors.red.withOpacity(0.2);
      case 'medium':
        return Colors.orange.withOpacity(0.2);
      default:
        return Colors.blue.withOpacity(0.2);
    }
  }

  Widget _buildUsersTab(BuildContext context) {
    final usersAsync = ref.watch(adminUsersProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search users...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchTerm = value;
                    });
                  },
                ),
              ),
              const SizedBox(width: 12),
              DropdownButton<String>(
                value: _roleFilter,
                items: const [
                  DropdownMenuItem(value: 'ALL', child: Text('All Roles')),
                  DropdownMenuItem(value: 'PATIENT', child: Text('Patient')),
                  DropdownMenuItem(value: 'DOCTOR', child: Text('Doctor')),
                  DropdownMenuItem(
                    value: 'OPTOMETRIST',
                    child: Text('Analyst'),
                  ),
                  DropdownMenuItem(value: 'PHARMACY', child: Text('Pharmacy')),
                  DropdownMenuItem(value: 'ADMIN', child: Text('Admin')),
                ],
                onChanged: (value) {
                  setState(() {
                    _roleFilter = value ?? 'ALL';
                  });
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(adminUsersProvider);
            },
            child: usersAsync.when(
              data: (users) {
                final filtered = users.where((user) {
                  final matchesSearch =
                      _searchTerm.isEmpty ||
                      user.firstName.toLowerCase().contains(
                        _searchTerm.toLowerCase(),
                      ) ||
                      user.lastName.toLowerCase().contains(
                        _searchTerm.toLowerCase(),
                      ) ||
                      user.email.toLowerCase().contains(
                        _searchTerm.toLowerCase(),
                      );
                  final matchesRole =
                      _roleFilter == 'ALL' ||
                      user.role.toString().split('.').last.toUpperCase() ==
                          _roleFilter;
                  return matchesSearch && matchesRole;
                }).toList();

                if (filtered.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.people,
                    title: 'No users found',
                    message: 'No users match your search criteria',
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final user = filtered[index];
                    return SlideInAnimation(
                      delay: Duration(milliseconds: index * 50),
                      beginOffset: const Offset(0.1, 0),
                      child: _buildUserCard(context, user),
                    );
                  },
                );
              },
              loading: () => const LoadingWidget(message: 'Loading users...'),
              error: (error, stack) => ErrorDisplayWidget(
                message: 'Failed to load users: ${error.toString()}',
                onRetry: () {
                  ref.invalidate(adminUsersProvider);
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUserCard(BuildContext context, User user) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 100),
      onTap: () {
        // Could navigate to user details
      },
      child: ListTile(
        leading: Hero(
          tag: 'user_avatar_${user.id}',
          child: CircleAvatar(
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: Text(
              user.firstName[0].toUpperCase(),
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ),
        title: Text(user.fullName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.email),
            Text(
              'Role: ${user.role.toString().split('.').last}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'edit',
              child: Row(
                children: [
                  Icon(Icons.edit, size: 18),
                  SizedBox(width: 8),
                  Text('Edit Role'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'revoke',
              child: Row(
                children: [
                  Icon(Icons.block, size: 18),
                  SizedBox(width: 8),
                  Text('Revoke Access'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, size: 18, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Delete', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
          onSelected: (value) {
            if (value == 'edit') {
              _showEditRoleDialog(context, user);
            } else if (value == 'revoke') {
              _revokeAccess(context, user);
            } else if (value == 'delete') {
              _deleteUser(context, user);
            }
          },
        ),
      ),
    );
  }

  Widget _buildDevicesTab(BuildContext context) {
    final devicesAsync = ref.watch(adminDevicesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminDevicesProvider);
      },
      child: devicesAsync.when(
        data: (devices) {
          if (devices.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.devices,
              title: 'No devices',
              message: 'No devices registered',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: devices.length,
            itemBuilder: (context, index) {
              final device = devices[index];
              return SlideInAnimation(
                delay: Duration(milliseconds: index * 50),
                beginOffset: const Offset(0.1, 0),
                child: _buildDeviceCard(context, device),
              );
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading devices...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load devices: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminDevicesProvider);
          },
        ),
      ),
    );
  }

  Widget _buildDeviceCard(BuildContext context, Map<String, dynamic> device) {
    final isOnline = device['status'] == 'online';

    return AnimatedCard(
      delay: const Duration(milliseconds: 100),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Stack(
                  children: [
                    Chip(
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isOnline) ...[
                            PulseIndicator(color: Colors.green, size: 6),
                            const SizedBox(width: 4),
                          ],
                          Text(device['status'] ?? 'unknown'),
                        ],
                      ),
                      backgroundColor: isOnline
                          ? Colors.green.withOpacity(0.2)
                          : Colors.red.withOpacity(0.2),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                Chip(
                  label: Text(
                    device['calibrationStatus'] == 'calibrated'
                        ? 'Calibrated'
                        : 'Needs Calibration',
                  ),
                  backgroundColor: device['calibrationStatus'] == 'calibrated'
                      ? Colors.green.withOpacity(0.2)
                      : Colors.orange.withOpacity(0.2),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              device['deviceName'] ?? 'Unknown Device',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'Type: ${device['deviceType'] ?? 'N/A'} • Location: ${device['location'] ?? 'N/A'}',
            ),
            if (device['lastDataSync'] != null)
              Text(
                'Last sync: ${DateFormat('MMM dd, yyyy HH:mm').format(DateTime.parse(device['lastDataSync']))}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                AnimatedButton(
                  onPressed: device['status'] == 'offline'
                      ? null
                      : () {
                          _calibrateDevice(context, device['deviceId']);
                        },
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.build, size: 18),
                      SizedBox(width: 4),
                      Text('Calibrate'),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                AnimatedButton(
                  onPressed: () {
                    _viewDeviceLogs(context, device['deviceId']);
                  },
                  backgroundColor: Colors.transparent,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.description,
                        size: 18,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'View Logs',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentsTab(BuildContext context) {
    final analyticsAsync = ref.watch(adminAppointmentAnalyticsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminAppointmentAnalyticsProvider);
      },
      child: analyticsAsync.when(
        data: (analytics) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Appointment Statistics',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        _buildStatRow(
                          'Total',
                          analytics['total']?.toString() ?? '0',
                        ),
                        _buildStatRow(
                          'Scheduled',
                          analytics['scheduled']?.toString() ?? '0',
                        ),
                        _buildStatRow(
                          'Completed',
                          analytics['completed']?.toString() ?? '0',
                        ),
                        _buildStatRow(
                          'Cancelled',
                          analytics['cancelled']?.toString() ?? '0',
                        ),
                        const Divider(),
                        _buildStatRow(
                          'Avg Wait Time',
                          '${analytics['avgWaitTime'] ?? 0} min',
                        ),
                        _buildStatRow(
                          'Predicted Wait',
                          '${analytics['predictedWaitTime'] ?? 0} min',
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () =>
            const LoadingWidget(message: 'Loading appointment analytics...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load analytics: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminAppointmentAnalyticsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildBillingTab(BuildContext context) {
    final billingAsync = ref.watch(adminBillingAnalyticsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminBillingAnalyticsProvider);
      },
      child: billingAsync.when(
        data: (billing) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Financial Summary',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        _buildStatRow(
                          'Total Revenue',
                          '\$${(billing['revenue']?['total']?.toString() ?? '0')}',
                        ),
                        _buildStatRow(
                          'From Prescriptions',
                          '\$${(billing['revenue']?['prescriptions']?.toString() ?? '0')}',
                        ),
                        _buildStatRow(
                          'From Appointments',
                          '\$${(billing['revenue']?['appointments']?.toString() ?? '0')}',
                        ),
                        const Divider(),
                        _buildStatRow(
                          'Pending Invoices',
                          billing['pendingInvoices']?.toString() ?? '0',
                        ),
                        _buildStatRow(
                          'Paid Invoices',
                          billing['paidInvoices']?.toString() ?? '0',
                        ),
                      ],
                    ),
                  ),
                ),
                if (billing['fraudAlerts'] != null &&
                    (billing['fraudAlerts'] as List).isNotEmpty)
                  Card(
                    margin: const EdgeInsets.only(top: 16),
                    color: Colors.red.withOpacity(0.1),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.warning, color: Colors.red),
                              const SizedBox(width: 8),
                              Text(
                                'Fraud Detection Alerts',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ...((billing['fraudAlerts'] as List).map((alert) {
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ListTile(
                                title: Text(alert['type'] ?? ''),
                                subtitle: Text(alert['message'] ?? ''),
                                trailing: Chip(
                                  label: Text(alert['severity'] ?? 'medium'),
                                  backgroundColor: Colors.red.withOpacity(0.2),
                                ),
                              ),
                            );
                          }).toList()),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () =>
            const LoadingWidget(message: 'Loading billing analytics...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load billing analytics: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminBillingAnalyticsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildAnalyticsTab(BuildContext context) {
    final analyticsAsync = ref.watch(adminComprehensiveAnalyticsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminComprehensiveAnalyticsProvider);
      },
      child: analyticsAsync.when(
        data: (analytics) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (analytics['predictions'] != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.auto_awesome,
                                color: Colors.blue,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'AI Predictions',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildPredictionCard(
                                  'Expected Patients',
                                  analytics['predictions']['expectedPatientsNextMonth']
                                          ?.toString() ??
                                      '0',
                                  Colors.blue,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildPredictionCard(
                                  'Expected Revenue',
                                  '\$${(analytics['predictions']['expectedRevenue']?.toString() ?? '0')}',
                                  Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () => const LoadingWidget(message: 'Loading analytics...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load analytics: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminComprehensiveAnalyticsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildPredictionCard(String title, String value, Color color) {
    return Card(
      color: color.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 12)),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityTab(BuildContext context) {
    final securityAsync = ref.watch(adminSecurityStatusProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminSecurityStatusProvider);
      },
      child: securityAsync.when(
        data: (security) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Security Status',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        _buildSecurityRow(
                          Icons.lock,
                          'Encryption',
                          security['encryptionEnabled'] == true
                              ? 'Enabled'
                              : 'Disabled',
                          security['encryptionEnabled'] == true,
                        ),
                        _buildSecurityRow(
                          Icons.security,
                          '2FA',
                          security['twoFactorEnabled'] == true
                              ? 'Enabled'
                              : 'Disabled',
                          security['twoFactorEnabled'] == true,
                        ),
                        _buildSecurityRow(
                          Icons.language,
                          'SSL',
                          security['sslEnabled'] == true
                              ? 'Enabled'
                              : 'Disabled',
                          security['sslEnabled'] == true,
                        ),
                        _buildSecurityRow(
                          Icons.storage,
                          'Last Backup',
                          security['lastBackup'] != null
                              ? DateFormat(
                                  'MMM dd, yyyy HH:mm',
                                ).format(DateTime.parse(security['lastBackup']))
                              : 'Never',
                          null,
                        ),
                      ],
                    ),
                  ),
                ),
                Card(
                  margin: const EdgeInsets.only(top: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Audit Logs',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Audit logging is active. View detailed logs in the audit service.',
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            _exportAuditLogs(context);
                          },
                          icon: const Icon(Icons.download),
                          label: const Text('Export Logs'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () =>
            const LoadingWidget(message: 'Loading security status...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load security status: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminSecurityStatusProvider);
          },
        ),
      ),
    );
  }

  Widget _buildSecurityRow(
    IconData icon,
    String label,
    String value,
    bool? isGood,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          if (isGood != null)
            Chip(
              label: Text(value),
              backgroundColor: isGood
                  ? Colors.green.withOpacity(0.2)
                  : Colors.red.withOpacity(0.2),
            )
          else
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildJourneysTab(BuildContext context) {
    final journeysAsync = ref.watch(adminActiveJourneysProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(adminActiveJourneysProvider);
      },
      child: journeysAsync.when(
        data: (journeys) {
          if (journeys.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.route,
              title: 'No active journeys',
              message: 'There are no active patient journeys at the moment',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: journeys.length,
            itemBuilder: (context, index) {
              final journey = journeys[index];
              final steps = journey['steps'] as List? ?? [];
              final overallStatus = journey['overallStatus'] as String? ?? 'PENDING';
              final currentStep = journey['currentStep'] as String?;
              final patientName = journey['patientName'] as String? ?? 'Unknown';
              final checkInTime = journey['checkInTime'] != null
                  ? DateTime.parse(journey['checkInTime'])
                  : DateTime.now();

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  leading: CircleAvatar(
                    backgroundColor: overallStatus == 'COMPLETED'
                        ? Colors.green
                        : overallStatus == 'IN_PROGRESS'
                            ? Colors.blue
                            : Colors.grey,
                    child: Icon(
                      overallStatus == 'COMPLETED'
                          ? Icons.check_circle
                          : Icons.pending,
                      color: Colors.white,
                    ),
                  ),
                  title: Text(patientName),
                  subtitle: Text(
                    'Checked in: ${DateFormat('MMM dd, yyyy • hh:mm a').format(checkInTime)}',
                  ),
                  trailing: Chip(
                    label: Text(
                      overallStatus.toString().split('.').last,
                      style: const TextStyle(fontSize: 12),
                    ),
                    backgroundColor: overallStatus == 'COMPLETED'
                        ? Colors.green.withOpacity(0.2)
                        : overallStatus == 'IN_PROGRESS'
                            ? Colors.blue.withOpacity(0.2)
                            : Colors.grey.withOpacity(0.2),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Current Step: ${currentStep ?? 'N/A'}',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 12),
                          ...steps.map((step) {
                            final stepName = step['step'] as String? ?? '';
                            final stepStatus = step['status'] as String? ?? 'PENDING';
                            final completedAt = step['completedAt'] != null
                                ? DateTime.parse(step['completedAt'])
                                : null;

                            return ListTile(
                              dense: true,
                              leading: Icon(
                                stepStatus == 'COMPLETED'
                                    ? Icons.check_circle
                                    : stepStatus == 'IN_PROGRESS'
                                        ? Icons.radio_button_checked
                                        : Icons.radio_button_unchecked,
                                color: stepStatus == 'COMPLETED'
                                    ? Colors.green
                                    : stepStatus == 'IN_PROGRESS'
                                        ? Colors.blue
                                        : Colors.grey,
                              ),
                              title: Text(stepName),
                              subtitle: completedAt != null
                                  ? Text('Completed: ${DateFormat('hh:mm a').format(completedAt)}')
                                  : null,
                              trailing: stepStatus != 'COMPLETED'
                                  ? ElevatedButton(
                                      onPressed: () async {
                                        try {
                                          final patientService = ref.read(patientServiceProvider);
                                          await patientService.markJourneyStepComplete(
                                            stepName.toLowerCase(),
                                            journey['patientId'] as String,
                                          );
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Step $stepName marked as complete'),
                                                backgroundColor: Colors.green,
                                              ),
                                            );
                                            ref.invalidate(adminActiveJourneysProvider);
                                          }
                                        } catch (e) {
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Error: ${e.toString()}'),
                                                backgroundColor: Colors.red,
                                              ),
                                            );
                                          }
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      ),
                                      child: const Text('Mark Complete', style: TextStyle(fontSize: 12)),
                                    )
                                  : null,
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading active journeys...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load journeys: ${error.toString()}',
          onRetry: () {
            ref.invalidate(adminActiveJourneysProvider);
          },
        ),
      ),
    );
  }

  Widget _buildControlsTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          AnimatedCard(
            delay: const Duration(milliseconds: 100),
            hoverColor: Colors.red.withOpacity(0.15),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0.0, end: 1.0),
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.elasticOut,
                        builder: (context, value, child) {
                          return Transform.rotate(
                            angle: value * 0.2,
                            child: Icon(
                              _lockdownActive ? Icons.lock : Icons.lock_open,
                              color: _lockdownActive
                                  ? Colors.red
                                  : Colors.green,
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Emergency Controls',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _lockdownActive
                        ? 'All non-admin sessions are temporarily blocked.'
                        : 'Users currently have normal access.',
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: AnimatedButton(
                      onPressed: () {
                        _toggleLockdown(context);
                      },
                      backgroundColor: _lockdownActive
                          ? Colors.red
                          : Colors.green,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _lockdownActive ? Icons.lock_open : Icons.lock,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _lockdownActive
                                ? 'Release Lockdown'
                                : 'Activate Emergency Lockdown',
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCard(
            delay: const Duration(milliseconds: 150),
            margin: const EdgeInsets.only(top: 16),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0.0, end: 1.0),
                        duration: const Duration(milliseconds: 800),
                        curve: Curves.elasticOut,
                        builder: (context, value, child) {
                          return Transform.scale(
                            scale: value,
                            child: const Icon(
                              Icons.campaign,
                              color: Colors.blue,
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Broadcast Message',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _broadcastController,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: 'Enter broadcast message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: AnimatedButton(
                      onPressed: () {
                        _sendBroadcast(context);
                      },
                      backgroundColor: Colors.blue,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.send, size: 20),
                          SizedBox(width: 8),
                          Text('Send Broadcast'),
                        ],
                      ),
                    ),
                  ),
                  if (_broadcastHistory.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Divider(),
                    const Text(
                      'Recent broadcasts:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ..._broadcastHistory.map((entry) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          title: Text(entry['message'] ?? ''),
                          subtitle: Text(
                            DateFormat(
                              'MMM dd, yyyy HH:mm',
                            ).format(DateTime.parse(entry['timestamp'])),
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ],
              ),
            ),
          ),
          Card(
            margin: const EdgeInsets.only(top: 16),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.smart_toy, color: Colors.purple),
                      const SizedBox(width: 8),
                      Text(
                        'AI Automation Rules',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildAutomationRule(
                    context,
                    'Auto-disable user on failed logins',
                    'Automatically locks accounts after 5 consecutive failed attempts.',
                    'autoDisableUser',
                    Icons.lock,
                    Colors.red,
                  ),
                  _buildAutomationRule(
                    context,
                    'Auto-schedule device calibration',
                    'AI flags devices for calibration when performance drifts.',
                    'autoCalibrateDevices',
                    Icons.build,
                    Colors.blue,
                  ),
                  _buildAutomationRule(
                    context,
                    'Auto-flag high-risk transactions',
                    'Automatically queues suspicious billing for manual review.',
                    'autoFlagTransactions',
                    Icons.warning,
                    Colors.orange,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAutomationRule(
    BuildContext context,
    String title,
    String description,
    String key,
    IconData icon,
    Color color,
  ) {
    final enabled = _automationRules[key] ?? false;
    return AnimatedCard(
      delay: const Duration(milliseconds: 100),
      child: ListTile(
        leading: TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0.0, end: 1.0),
          duration: const Duration(milliseconds: 600),
          curve: Curves.elasticOut,
          builder: (context, value, child) {
            return Transform.rotate(
              angle: value * 0.1,
              child: Icon(icon, color: color),
            );
          },
        ),
        title: Text(title),
        subtitle: Text(description),
        trailing: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) {
            return ScaleTransition(scale: animation, child: child);
          },
          child: Switch(
            key: ValueKey(enabled),
            value: enabled,
            onChanged: (value) {
              _toggleAutomationRule(context, key, value);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'System Settings',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 24),
              DropdownButtonFormField<String>(
                value: _currency,
                decoration: const InputDecoration(
                  labelText: 'Currency',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'USD', child: Text('USD (\$)')),
                  DropdownMenuItem(value: 'IQD', child: Text('IQD (ع.د)')),
                  DropdownMenuItem(value: 'EUR', child: Text('EUR (€)')),
                ],
                onChanged: (value) {
                  setState(() {
                    _currency = value ?? 'USD';
                  });
                  _saveSettings(context);
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _language,
                decoration: const InputDecoration(
                  labelText: 'Language',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(
                    value: 'ar',
                    child: Text('Arabic (العربية)'),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _language = value ?? 'en';
                  });
                  _saveSettings(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _showAddUserDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final firstNameController = TextEditingController();
    final lastNameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final passwordController = TextEditingController();
    String selectedRole = 'PATIENT';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add New User'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: firstNameController,
                    decoration: const InputDecoration(
                      labelText: 'First Name',
                      prefixIcon: Icon(Icons.person),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter first name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: lastNameController,
                    decoration: const InputDecoration(
                      labelText: 'Last Name',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter last name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Phone (Optional)',
                      prefixIcon: Icon(Icons.phone),
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: passwordController,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(Icons.lock),
                    ),
                    obscureText: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text('Role'),
                  DropdownButton<String>(
                    value: selectedRole,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(
                        value: 'PATIENT',
                        child: Text('Patient'),
                      ),
                      DropdownMenuItem(value: 'DOCTOR', child: Text('Doctor')),
                      DropdownMenuItem(
                        value: 'OPTOMETRIST',
                        child: Text('Analyst'),
                      ),
                      DropdownMenuItem(
                        value: 'PHARMACY',
                        child: Text('Pharmacy'),
                      ),
                      DropdownMenuItem(value: 'ADMIN', child: Text('Admin')),
                    ],
                    onChanged: (value) {
                      setDialogState(() {
                        selectedRole = value ?? selectedRole;
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;

                try {
                  final service = ref.read(adminServiceProvider);
                  await service.createUser({
                    'firstName': firstNameController.text,
                    'lastName': lastNameController.text,
                    'email': emailController.text,
                    'phone': phoneController.text.isNotEmpty
                        ? phoneController.text
                        : null,
                    'password': passwordController.text,
                    'role': selectedRole,
                  });

                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('User created successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    ref.invalidate(adminUsersProvider);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              child: const Text('Create User'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditRoleDialog(BuildContext context, User user) {
    String selectedRole = user.role.toString().split('.').last.toUpperCase();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Role'),
        content: StatefulBuilder(
          builder: (context, setState) => DropdownButton<String>(
            value: selectedRole,
            isExpanded: true,
            items: const [
              DropdownMenuItem(value: 'PATIENT', child: Text('Patient')),
              DropdownMenuItem(value: 'DOCTOR', child: Text('Doctor')),
              DropdownMenuItem(value: 'OPTOMETRIST', child: Text('Analyst')),
              DropdownMenuItem(value: 'PHARMACY', child: Text('Pharmacy')),
              DropdownMenuItem(value: 'ADMIN', child: Text('Admin')),
            ],
            onChanged: (value) {
              setState(() {
                selectedRole = value ?? selectedRole;
              });
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.updateUserRole(user.id, selectedRole);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Role updated successfully')),
                  );
                  ref.invalidate(adminUsersProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _revokeAccess(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Revoke Access'),
        content: Text(
          'Are you sure you want to revoke access for ${user.fullName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.revokeUserAccess(user.id);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Access revoked successfully'),
                    ),
                  );
                  ref.invalidate(adminUsersProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Revoke'),
          ),
        ],
      ),
    );
  }

  void _deleteUser(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: Text(
          'Are you sure you want to delete ${user.fullName}? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.deleteUser(user.id);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('User deleted successfully')),
                  );
                  ref.invalidate(adminUsersProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _calibrateDevice(BuildContext context, String deviceId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Calibrate Device'),
        content: const Text('Start calibration for this device?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.calibrateDevice(deviceId);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Calibration started')),
                  );
                  ref.invalidate(adminDevicesProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Calibrate'),
          ),
        ],
      ),
    );
  }

  void _viewDeviceLogs(BuildContext context, String deviceId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Viewing logs for device $deviceId')),
    );
  }

  void _toggleLockdown(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(_lockdownActive ? 'Release Lockdown' : 'Activate Lockdown'),
        content: Text(
          _lockdownActive
              ? 'Are you sure you want to release the lockdown?'
              : 'Are you sure you want to activate emergency lockdown? All non-admin sessions will be blocked.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.toggleLockdown(!_lockdownActive);
                if (context.mounted) {
                  setState(() {
                    _lockdownActive = !_lockdownActive;
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        _lockdownActive
                            ? 'Lockdown released'
                            : 'Emergency lockdown activated',
                      ),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _lockdownActive ? Colors.green : Colors.red,
            ),
            child: Text(_lockdownActive ? 'Release' : 'Activate'),
          ),
        ],
      ),
    );
  }

  void _sendBroadcast(BuildContext context) {
    if (_broadcastController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter a message')));
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Broadcast'),
        content: const Text('Send this message to all active users?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(adminServiceProvider);
                await service.sendBroadcast(_broadcastController.text);
                if (context.mounted) {
                  setState(() {
                    _broadcastHistory.insert(0, {
                      'message': _broadcastController.text,
                      'timestamp': DateTime.now().toIso8601String(),
                    });
                    if (_broadcastHistory.length > 4) {
                      _broadcastHistory.removeLast();
                    }
                    _broadcastController.clear();
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Broadcast sent successfully'),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }

  void _toggleAutomationRule(BuildContext context, String key, bool enabled) {
    setState(() {
      _automationRules[key] = enabled;
    });
    try {
      final service = ref.read(adminServiceProvider);
      service.updateAutomationRule(key, enabled);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Automation rule ${enabled ? 'enabled' : 'disabled'}'),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    }
  }

  void _saveSettings(BuildContext context) {
    try {
      final service = ref.read(adminServiceProvider);
      service.updateSettings({'currency': _currency, 'language': _language});
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Settings saved')));
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    }
  }

  void _exportAuditLogs(BuildContext context) async {
    try {
      final service = ref.read(adminServiceProvider);
      final logs = await service.exportAuditLogs();
      await Clipboard.setData(ClipboardData(text: logs));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Audit logs copied to clipboard')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
      }
    }
  }

  Future<void> _handleLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authNotifierProvider.notifier).logout();
      if (mounted) {
        context.go('/login');
      }
    }
  }

  void _showProfile(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.valueOrNull?.user;

    if (user == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Profile',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                children: [
                  Center(
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: Text(
                        user.firstName[0].toUpperCase(),
                        style: const TextStyle(
                          fontSize: 40,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      user.fullName,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                  const Divider(height: 32),
                  ListTile(
                    leading: const Icon(Icons.email),
                    title: const Text('Email'),
                    subtitle: Text(user.email),
                  ),
                  if (user.phone != null)
                    ListTile(
                      leading: const Icon(Icons.phone),
                      title: const Text('Phone'),
                      subtitle: Text(user.phone!),
                    ),
                  ListTile(
                    leading: const Icon(Icons.verified_user),
                    title: const Text('Role'),
                    subtitle: Text(
                      user.role.toString().split('.').last.toUpperCase(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
