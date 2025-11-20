import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';
import '../../models/appointment_model.dart';
import '../../services/patient_service.dart';
import '../../models/eye_test_model.dart';
import '../../models/prescription_model.dart';
import '../../models/user_model.dart';
import '../../models/notification_model.dart' as models;
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';

final doctorAppointmentsProvider = FutureProvider<List<Appointment>>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getAppointments();
});

final doctorPendingTestsProvider = FutureProvider<List<EyeTest>>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getPendingTests();
});

final doctorPendingPrescriptionsProvider = FutureProvider<List<Prescription>>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getPendingPrescriptions();
});

final doctorNotificationsProvider = FutureProvider<List<models.Notification>>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getNotifications();
});

final doctorUnreadCountProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getUnreadNotificationCount();
});

final doctorAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(doctorServiceProvider);
  return service.getAnalytics();
});

class DoctorDashboardScreen extends ConsumerStatefulWidget {
  const DoctorDashboardScreen({super.key});

  @override
  ConsumerState<DoctorDashboardScreen> createState() => _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends ConsumerState<DoctorDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.valueOrNull?.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Doctor Dashboard'),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final unreadCountAsync = ref.watch(doctorUnreadCountProvider);
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications),
                    onPressed: () {
                      _showNotifications(context);
                    },
                    tooltip: 'Notifications',
                  ),
                  unreadCountAsync.when(
                    data: (count) {
                      if (count > 0) {
                        return Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 16,
                              minHeight: 16,
                            ),
                            child: Text(
                              count > 99 ? '99+' : count.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                ],
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle),
            onSelected: (value) {
              if (value == 'profile') {
                // TODO: Navigate to profile
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
      ),
      body: _buildBody(context, user),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Patients',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: 'Approvals',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Analytics',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, user) {
    switch (_selectedIndex) {
      case 0:
        return _buildOverviewTab(context);
      case 1:
        return _buildPatientsTab(context);
      case 2:
        return _buildApprovalsTab(context);
      case 3:
        return _buildAnalyticsTab(context);
      default:
        return _buildOverviewTab(context);
    }
  }

  Widget _buildOverviewTab(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(doctorAppointmentsProvider);
        ref.invalidate(doctorPendingTestsProvider);
        ref.invalidate(doctorPendingPrescriptionsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatsCards(context),
            const SizedBox(height: 24),
            _buildPendingApprovals(context),
            const SizedBox(height: 24),
            _buildUpcomingAppointments(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(BuildContext context) {
    final appointmentsAsync = ref.watch(doctorAppointmentsProvider);
    final pendingTestsAsync = ref.watch(doctorPendingTestsProvider);

    return Row(
      children: [
        Expanded(
          child: appointmentsAsync.when(
            data: (appointments) => _buildStatCard(
              context,
              'Today\'s Appointments',
              appointments.length.toString(),
              Icons.calendar_today,
              Colors.blue,
            ),
            loading: () => _buildStatCard(context, 'Appointments', '...', Icons.calendar_today, Colors.blue),
            error: (_, __) => _buildStatCard(context, 'Appointments', '0', Icons.calendar_today, Colors.blue),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: pendingTestsAsync.when(
            data: (tests) => _buildStatCard(
              context,
              'Pending Tests',
              tests.length.toString(),
              Icons.visibility,
              Colors.orange,
            ),
            loading: () => _buildStatCard(context, 'Pending Tests', '...', Icons.visibility, Colors.orange),
            error: (_, __) => _buildStatCard(context, 'Pending Tests', '0', Icons.visibility, Colors.orange),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingApprovals(BuildContext context) {
    final pendingTestsAsync = ref.watch(doctorPendingTestsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pending Approvals',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        pendingTestsAsync.when(
          data: (tests) {
            if (tests.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.check_circle,
                title: 'No pending approvals',
                message: 'All tests have been reviewed',
              );
            }

            return Column(
              children: tests.take(3).map((test) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.orange,
                      child: const Icon(Icons.visibility, color: Colors.white),
                    ),
                    title: Text('Test from ${test.patient?.fullName ?? "Patient"}'),
                    subtitle: Text(
                      DateFormat('MMM dd, yyyy').format(test.createdAt),
                    ),
                    trailing: ElevatedButton(
                      onPressed: () {
                        _approveTest(context, test);
                      },
                      child: const Text('Review'),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => const LoadingWidget(),
          error: (error, stack) => ErrorDisplayWidget(
            message: 'Failed to load pending tests: ${error.toString()}',
            onRetry: () {
              ref.invalidate(doctorPendingTestsProvider);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildUpcomingAppointments(BuildContext context) {
    final appointmentsAsync = ref.watch(doctorAppointmentsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upcoming Appointments',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        appointmentsAsync.when(
          data: (appointments) {
            final upcoming = appointments
                .where((a) =>
                    a.status == AppointmentStatus.confirmed ||
                    a.status == AppointmentStatus.pending)
                .toList()
              ..sort((a, b) => a.appointmentDate.compareTo(b.appointmentDate));

            if (upcoming.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.calendar_today,
                title: 'No upcoming appointments',
              );
            }

            return Column(
              children: upcoming.take(5).map((appointment) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: const Icon(Icons.person, color: Colors.white),
                    ),
                    title: Text(appointment.patient?.fullName ?? 'Patient'),
                    subtitle: Text(
                      '${DateFormat('MMM dd, yyyy').format(appointment.appointmentDate)} at ${appointment.appointmentTime}',
                    ),
                    trailing: Chip(
                      label: Text(
                        appointment.status.toString().split('.').last,
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => const LoadingWidget(),
          error: (error, stack) => ErrorDisplayWidget(
            message: 'Failed to load appointments: ${error.toString()}',
            onRetry: () {
              ref.invalidate(doctorAppointmentsProvider);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPatientsTab(BuildContext context) {
    final appointmentsAsync = ref.watch(doctorAppointmentsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(doctorAppointmentsProvider);
      },
      child: appointmentsAsync.when(
        data: (appointments) {
          final patients = appointments
              .map((a) => a.patient)
              .where((p) => p != null)
              .cast<User>()
              .toSet()
              .toList();

          if (patients.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.people,
              title: 'No patients',
              message: 'You don\'t have any patients yet',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: patients.length,
            itemBuilder: (context, index) {
              final patient = patients[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    child: Text(
                      patient.firstName[0].toUpperCase(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text(patient.fullName),
                  subtitle: Text(patient.email),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    _showPatientDetails(context, patient);
                  },
                ),
              );
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading patients...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load patients: ${error.toString()}',
          onRetry: () {
            ref.invalidate(doctorAppointmentsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildApprovalsTab(BuildContext context) {
    final _ = ref.watch(doctorPendingPrescriptionsProvider);
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            tabs: [
              Tab(text: 'Eye Tests', icon: Icon(Icons.visibility)),
              Tab(text: 'Prescriptions', icon: Icon(Icons.medication)),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildPendingTestsList(context),
                _buildPendingPrescriptionsList(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingTestsList(BuildContext context) {
    final pendingTestsAsync = ref.watch(doctorPendingTestsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(doctorPendingTestsProvider);
      },
      child: pendingTestsAsync.when(
        data: (tests) {
          if (tests.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.check_circle,
              title: 'No pending tests',
              message: 'All tests have been reviewed',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tests.length,
            itemBuilder: (context, index) {
              final test = tests[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.orange,
                    child: const Icon(Icons.visibility, color: Colors.white),
                  ),
                  title: Text(test.patient?.fullName ?? 'Patient'),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        DateFormat('MMM dd, yyyy').format(test.createdAt),
                      ),
                      Text('Status: ${test.status.toString().split('.').last}'),
                    ],
                  ),
                  trailing: ElevatedButton(
                    onPressed: () {
                      _approveTest(context, test);
                    },
                    child: const Text('Review'),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading pending tests...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load pending tests: ${error.toString()}',
          onRetry: () {
            ref.invalidate(doctorPendingTestsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildPendingPrescriptionsList(BuildContext context) {
    final pendingPrescriptionsAsync = ref.watch(doctorPendingPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(doctorPendingPrescriptionsProvider);
      },
      child: pendingPrescriptionsAsync.when(
        data: (prescriptions) {
          if (prescriptions.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.check_circle,
              title: 'No pending prescriptions',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.orange,
                    child: const Icon(Icons.medication, color: Colors.white),
                  ),
                  title: Text(prescription.patient?.fullName ?? 'Patient'),
                  subtitle: Text(
                    '${prescription.medications.length} medication(s)',
                  ),
                  trailing: ElevatedButton(
                    onPressed: () {
                      _reviewPrescription(context, prescription);
                    },
                    child: const Text('Review'),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading pending prescriptions...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load pending prescriptions: ${error.toString()}',
          onRetry: () {
            ref.invalidate(doctorPendingPrescriptionsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildAnalyticsTab(BuildContext context) {
    final analyticsAsync = ref.watch(doctorAnalyticsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(doctorAnalyticsProvider);
      },
      child: analyticsAsync.when(
        data: (analytics) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Analytics',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Statistics',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        if (analytics['totalPatients'] != null)
                          _buildStatRow('Total Patients', analytics['totalPatients'].toString()),
                        if (analytics['totalTests'] != null)
                          _buildStatRow('Total Tests', analytics['totalTests'].toString()),
                        if (analytics['totalPrescriptions'] != null)
                          _buildStatRow('Total Prescriptions', analytics['totalPrescriptions'].toString()),
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
            ref.invalidate(doctorAnalyticsProvider);
          },
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
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  void _approveTest(BuildContext context, EyeTest test) async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Review Test'),
        content: Text('Review test from ${test.patient?.fullName ?? "Patient"}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(doctorServiceProvider);
                await service.approveTest(test.id, approved: true);
                
                // Mark doctor journey step as complete when test is approved
                try {
                  final patientService = ref.read(patientServiceProvider);
                  await patientService.markJourneyStepComplete('doctor', test.patientId);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Test approved and journey step completed!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  } catch (journeyError) {
                    // Journey update failed, but test approval succeeded
                    print('Journey update error: $journeyError');
                  }
                
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Test approved successfully')),
                  );
                  ref.invalidate(doctorPendingTestsProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Approve'),
          ),
        ],
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    final notificationsAsync = ref.watch(doctorNotificationsProvider);

    showModalBottomSheet(
      context: context,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Notifications',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
            Expanded(
              child: notificationsAsync.when(
                data: (notifications) {
                  if (notifications.isEmpty) {
                    return const EmptyStateWidget(
                      icon: Icons.notifications_none,
                      title: 'No notifications',
                    );
                  }

                  return ListView.builder(
                    controller: scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: notifications.length,
                    itemBuilder: (context, index) {
                      final notification = notifications[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        color: notification.isRead ? null : Colors.blue.withOpacity(0.1),
                        child: ListTile(
                          leading: Icon(_getNotificationIcon(notification.type)),
                          title: Text(notification.title),
                          subtitle: Text(notification.message),
                          trailing: Text(
                            DateFormat('MMM dd').format(notification.createdAt),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          onTap: () async {
                            if (!notification.isRead) {
                              try {
                                final service = ref.read(doctorServiceProvider);
                                await service.markNotificationAsRead(notification.id);
                                ref.invalidate(doctorNotificationsProvider);
                                ref.invalidate(doctorUnreadCountProvider);
                              } catch (e) {
                                // Handle error
                              }
                            }
                          },
                        ),
                      );
                    },
                  );
                },
                loading: () => const LoadingWidget(),
                error: (error, stack) => ErrorDisplayWidget(
                  message: 'Failed to load notifications: ${error.toString()}',
                  onRetry: () {
                    ref.invalidate(doctorNotificationsProvider);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getNotificationIcon(models.NotificationType type) {
    switch (type) {
      case models.NotificationType.pendingApproval:
        return Icons.pending;
      case models.NotificationType.caseAssigned:
        return Icons.assignment;
      default:
        return Icons.notifications;
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

  void _showPatientDetails(BuildContext context, User patient) {
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
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Patient Details',
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
                        patient.firstName[0].toUpperCase(),
                        style: const TextStyle(fontSize: 40, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      patient.fullName,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  const Divider(height: 32),
                  ListTile(
                    leading: const Icon(Icons.email),
                    title: const Text('Email'),
                    subtitle: Text(patient.email),
                  ),
                  if (patient.phone != null)
                    ListTile(
                      leading: const Icon(Icons.phone),
                      title: const Text('Phone'),
                      subtitle: Text(patient.phone!),
                    ),
                  if (patient.nationalId != null)
                    ListTile(
                      leading: const Icon(Icons.badge),
                      title: const Text('National ID'),
                      subtitle: Text(patient.nationalId!),
                    ),
                  ListTile(
                    leading: const Icon(Icons.calendar_today),
                    title: const Text('View Appointments'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      Navigator.pop(context);
                      setState(() {
                        _selectedIndex = 0; // Navigate to appointments tab
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _reviewPrescription(BuildContext context, Prescription prescription) {
    final notesController = TextEditingController();
    bool approved = true;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Review Prescription'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Patient: ${prescription.patient?.fullName ?? "Unknown"}'),
                const SizedBox(height: 8),
                Text('Status: ${prescription.status.toString().split('.').last}'),
                const SizedBox(height: 16),
                const Text('Review Decision:'),
                RadioListTile<bool>(
                  title: const Text('Approve'),
                  value: true,
                  groupValue: approved,
                  onChanged: (value) {
                    setDialogState(() {
                      approved = value!;
                    });
                  },
                ),
                RadioListTile<bool>(
                  title: const Text('Reject'),
                  value: false,
                  groupValue: approved,
                  onChanged: (value) {
                    setDialogState(() {
                      approved = value!;
                    });
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes (Optional)',
                    hintText: 'Add review notes',
                  ),
                  maxLines: 3,
                ),
              ],
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
                  // Prescription approval logic would be implemented here
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(approved ? 'Prescription approved' : 'Prescription rejected'),
                        backgroundColor: approved ? Colors.green : Colors.orange,
                      ),
                    );
                    ref.invalidate(doctorPendingPrescriptionsProvider);
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
              child: Text(approved ? 'Approve' : 'Reject'),
            ),
          ],
        ),
      ),
    );
  }
}
