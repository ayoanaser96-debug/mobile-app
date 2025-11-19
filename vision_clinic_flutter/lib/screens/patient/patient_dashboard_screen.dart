import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';
import '../../models/appointment_model.dart';
import '../../models/eye_test_model.dart';
import '../../models/prescription_model.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/animated_card.dart';
import '../../widgets/slide_in_animation.dart';
import '../../widgets/shimmer_loading.dart';

final patientAppointmentsProvider = FutureProvider<List<Appointment>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getAppointments();
});

final patientEyeTestsProvider = FutureProvider<List<EyeTest>>((ref) async {
  final service = ref.watch(patientServiceProvider);
  return service.getEyeTests();
});

final patientPrescriptionsProvider = FutureProvider<List<Prescription>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getPrescriptions();
});

final patientJourneyProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getUnifiedJourney();
});

class PatientDashboardScreen extends ConsumerStatefulWidget {
  const PatientDashboardScreen({super.key});

  @override
  ConsumerState<PatientDashboardScreen> createState() =>
      _PatientDashboardScreenState();
}

class _PatientDashboardScreenState
    extends ConsumerState<PatientDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.valueOrNull?.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Patient Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.face),
            onPressed: () {
              context.push('/face/checkin');
            },
            tooltip: 'Face Check-in',
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              _showNotifications(context);
            },
            tooltip: 'Notifications',
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
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Appointments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.visibility),
            label: 'Eye Tests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.medication),
            label: 'Prescriptions',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.timeline), label: 'Journey'),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, user) {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab(context, user);
      case 1:
        return _buildAppointmentsTab(context);
      case 2:
        return _buildEyeTestsTab(context);
      case 3:
        return _buildPrescriptionsTab(context);
      case 4:
        return _buildJourneyTab(context);
      default:
        return _buildHomeTab(context, user);
    }
  }

  Widget _buildHomeTab(BuildContext context, user) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientAppointmentsProvider);
        ref.invalidate(patientEyeTestsProvider);
        ref.invalidate(patientPrescriptionsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(context, user?.firstName ?? 'User'),
            const SizedBox(height: 24),
            _buildQuickActions(context),
            const SizedBox(height: 24),
            _buildUpcomingAppointments(context),
            const SizedBox(height: 24),
            _buildRecentTests(context),
            const SizedBox(height: 24),
            _buildRecentPrescriptions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard(BuildContext context, String firstName) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 50),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.primary.withOpacity(0.7),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 800),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.translate(
                    offset: Offset(0, 20 * (1 - value)),
                    child: Text(
                      'Welcome back, $firstName!',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: const Text(
                    'Manage your eye health journey',
                    style: TextStyle(fontSize: 16, color: Colors.white70),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.calendar_today,
                title: 'Book Appointment',
                color: Colors.blue,
                onTap: () {
                  _showBookAppointmentDialog(context);
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.visibility,
                title: 'Eye Test',
                color: Colors.green,
                onTap: () {
                  setState(() {
                    _selectedIndex = 2; // Navigate to Eye Tests tab
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.face,
                title: 'Register Face',
                color: Colors.teal,
                onTap: () {
                  context.push('/face/register');
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.medication,
                title: 'Prescriptions',
                color: Colors.orange,
                onTap: () {
                  setState(() {
                    _selectedIndex = 3;
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.timeline,
                title: 'My Journey',
                color: Colors.purple,
                onTap: () {
                  setState(() {
                    _selectedIndex = 4;
                  });
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 100),
      onTap: onTap,
      hoverColor: color.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 600),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Icon(icon, size: 40, color: color),
                );
              },
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingAppointments(BuildContext context) {
    final appointmentsAsync = ref.watch(patientAppointmentsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Upcoming Appointments',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedIndex = 1;
                });
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        appointmentsAsync.when(
          data: (appointments) {
            final upcoming =
                appointments
                    .where(
                      (a) =>
                          a.status == AppointmentStatus.confirmed ||
                          a.status == AppointmentStatus.pending,
                    )
                    .toList()
                  ..sort(
                    (a, b) => a.appointmentDate.compareTo(b.appointmentDate),
                  );

            if (upcoming.isEmpty) {
              return EmptyStateWidget(
                icon: Icons.calendar_today,
                title: 'No upcoming appointments',
                message: 'Book your first appointment to get started',
                action: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Booking feature coming soon'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Book Now'),
                ),
              );
            }

            return Column(
              children: upcoming.take(3).toList().asMap().entries.map((entry) {
                final index = entry.key;
                final appointment = entry.value;
                return SlideInAnimation(
                  delay: Duration(milliseconds: 200 + (index * 100)),
                  beginOffset: const Offset(0.1, 0),
                  child: AnimatedCard(
                    delay: Duration(milliseconds: 200 + (index * 100)),
                    child: ListTile(
                      leading: Hero(
                        tag: 'appointment_${appointment.id}',
                        child: CircleAvatar(
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          child: const Icon(
                            Icons.calendar_today,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      title: Text(
                        DateFormat(
                          'MMM dd, yyyy',
                        ).format(appointment.appointmentDate),
                      ),
                      subtitle: Text(
                        '${appointment.appointmentTime} - ${appointment.type.toString().split('.').last}',
                      ),
                      trailing: Chip(
                        label: Text(
                          appointment.status.toString().split('.').last,
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: _getStatusColor(appointment.status),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => Column(
            children: List.generate(3, (index) => const ShimmerCard()),
          ),
          error: (error, stack) => ErrorDisplayWidget(
            message: 'Failed to load appointments: ${error.toString()}',
            onRetry: () {
              ref.invalidate(patientAppointmentsProvider);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentTests(BuildContext context) {
    final testsAsync = ref.watch(patientEyeTestsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Eye Tests',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedIndex = 2;
                });
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        testsAsync.when(
          data: (tests) {
            if (tests.isEmpty) {
              return EmptyStateWidget(
                icon: Icons.visibility,
                title: 'No recent tests',
                message: 'Schedule an eye test to track your vision health',
                action: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Eye test feature coming soon'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Schedule'),
                ),
              );
            }

            final recent = tests.take(3).toList();
            return Column(
              children: recent.asMap().entries.map((entry) {
                final index = entry.key;
                final test = entry.value;
                return SlideInAnimation(
                  delay: Duration(milliseconds: 300 + (index * 100)),
                  beginOffset: const Offset(0.1, 0),
                  child: AnimatedCard(
                    delay: Duration(milliseconds: 300 + (index * 100)),
                    onTap: () {
                      _showTestDetails(context, test);
                    },
                    child: ListTile(
                      leading: Hero(
                        tag: 'test_${test.id}',
                        child: CircleAvatar(
                          backgroundColor: Colors.green,
                          child: const Icon(Icons.visibility, color: Colors.white),
                        ),
                      ),
                      title: Text(
                        DateFormat('MMM dd, yyyy').format(test.createdAt),
                      ),
                      subtitle: Text(
                        'Status: ${test.status.toString().split('.').last}',
                      ),
                      trailing: Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => Column(
            children: List.generate(3, (index) => const ShimmerCard()),
          ),
          error: (error, stack) => ErrorDisplayWidget(
            message: 'Failed to load eye tests: ${error.toString()}',
            onRetry: () {
              ref.invalidate(patientEyeTestsProvider);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentPrescriptions(BuildContext context) {
    final prescriptionsAsync = ref.watch(patientPrescriptionsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Prescriptions',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedIndex = 3;
                });
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        prescriptionsAsync.when(
          data: (prescriptions) {
            if (prescriptions.isEmpty) {
              return const SizedBox.shrink();
            }

            final recent = prescriptions.take(2).toList();
            return Column(
              children: recent.asMap().entries.map((entry) {
                final index = entry.key;
                final prescription = entry.value;
                return SlideInAnimation(
                  delay: Duration(milliseconds: 400 + (index * 100)),
                  beginOffset: const Offset(0.1, 0),
                  child: AnimatedCard(
                    delay: Duration(milliseconds: 400 + (index * 100)),
                    child: ListTile(
                      leading: Hero(
                        tag: 'prescription_${prescription.id}',
                        child: CircleAvatar(
                          backgroundColor: Colors.orange,
                          child: const Icon(Icons.medication, color: Colors.white),
                        ),
                      ),
                      title: Text(
                        '${prescription.medications.length} medication(s)',
                      ),
                      subtitle: Text(
                        'Status: ${prescription.status.toString().split('.').last}',
                      ),
                      trailing: Chip(
                        label: Text(
                          prescription.status.toString().split('.').last,
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: _getPrescriptionStatusColor(
                          prescription.status,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => const SizedBox.shrink(),
          error: (error, stack) => const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _buildAppointmentsTab(BuildContext context) {
    final appointmentsAsync = ref.watch(patientAppointmentsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientAppointmentsProvider);
      },
      child: appointmentsAsync.when(
        data: (appointments) {
          if (appointments.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.calendar_today,
              title: 'No appointments',
              message: 'You don\'t have any appointments yet',
              action: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Booking feature coming soon'),
                    ),
                  );
                },
                icon: const Icon(Icons.add),
                label: const Text('Book Appointment'),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: appointments.length,
            itemBuilder: (context, index) {
              final appointment = appointments[index];
              return SlideInAnimation(
                delay: Duration(milliseconds: index * 50),
                beginOffset: const Offset(0.1, 0),
                child: AnimatedCard(
                  delay: Duration(milliseconds: index * 50),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Hero(
                      tag: 'appointment_list_${appointment.id}',
                      child: CircleAvatar(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: const Icon(
                          Icons.calendar_today,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  title: Text(
                    DateFormat(
                      'MMM dd, yyyy',
                    ).format(appointment.appointmentDate),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Time: ${appointment.appointmentTime}'),
                      Text(
                        'Type: ${appointment.type.toString().split('.').last}',
                      ),
                      if (appointment.reason != null)
                        Text('Reason: ${appointment.reason}'),
                    ],
                  ),
                  trailing: Chip(
                    label: Text(
                      appointment.status.toString().split('.').last,
                      style: const TextStyle(fontSize: 12),
                    ),
                    backgroundColor: _getStatusColor(appointment.status),
                  ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => Column(
          children: List.generate(3, (index) => const ShimmerCard()),
        ),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load appointments: ${error.toString()}',
          onRetry: () {
            ref.invalidate(patientAppointmentsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildEyeTestsTab(BuildContext context) {
    final testsAsync = ref.watch(patientEyeTestsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientEyeTestsProvider);
      },
      child: testsAsync.when(
        data: (tests) {
          if (tests.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.visibility,
              title: 'No eye tests',
              message: 'You haven\'t taken any eye tests yet',
              action: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Eye test feature coming soon'),
                    ),
                  );
                },
                icon: const Icon(Icons.add),
                label: const Text('Schedule Test'),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tests.length,
            itemBuilder: (context, index) {
              final test = tests[index];
              return SlideInAnimation(
                delay: Duration(milliseconds: index * 50),
                beginOffset: const Offset(0.1, 0),
                child: AnimatedCard(
                  delay: Duration(milliseconds: index * 50),
                  margin: const EdgeInsets.only(bottom: 12),
                  onTap: () {
                    _showTestDetails(context, test);
                  },
                  child: ListTile(
                    leading: Hero(
                      tag: 'test_list_${test.id}',
                      child: CircleAvatar(
                        backgroundColor: Colors.green,
                        child: const Icon(Icons.visibility, color: Colors.white),
                      ),
                    ),
                    title: Text(
                      DateFormat('MMM dd, yyyy').format(test.createdAt),
                    ),
                    subtitle: Text(
                      'Status: ${test.status.toString().split('.').last}',
                    ),
                    trailing: Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => Column(
          children: List.generate(3, (index) => const ShimmerCard()),
        ),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load eye tests: ${error.toString()}',
          onRetry: () {
            ref.invalidate(patientEyeTestsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildPrescriptionsTab(BuildContext context) {
    final prescriptionsAsync = ref.watch(patientPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientPrescriptionsProvider);
      },
      child: prescriptionsAsync.when(
        data: (prescriptions) {
          if (prescriptions.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.medication,
              title: 'No prescriptions',
              message: 'You don\'t have any prescriptions yet',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              return SlideInAnimation(
                delay: Duration(milliseconds: index * 50),
                beginOffset: const Offset(0.1, 0),
                child: AnimatedCard(
                  delay: Duration(milliseconds: index * 50),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Hero(
                      tag: 'prescription_list_${prescription.id}',
                      child: CircleAvatar(
                        backgroundColor: Colors.orange,
                        child: const Icon(Icons.medication, color: Colors.white),
                      ),
                    ),
                    title: Text(
                      '${prescription.medications.length} medication(s)',
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Status: ${prescription.status.toString().split('.').last}',
                        ),
                        if (prescription.diagnosis != null)
                          Text('Diagnosis: ${prescription.diagnosis}'),
                      ],
                    ),
                    trailing: Chip(
                      label: Text(
                        prescription.status.toString().split('.').last,
                        style: const TextStyle(fontSize: 12),
                      ),
                      backgroundColor: _getPrescriptionStatusColor(
                        prescription.status,
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => Column(
          children: List.generate(3, (index) => const ShimmerCard()),
        ),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load prescriptions: ${error.toString()}',
          onRetry: () {
            ref.invalidate(patientPrescriptionsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildJourneyTab(BuildContext context) {
    final journeyAsync = ref.watch(patientJourneyProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientJourneyProvider);
      },
      child: journeyAsync.when(
        data: (journey) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Health Journey',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                if (journey['timeline'] != null)
                  ...((journey['timeline'] as List).asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return SlideInAnimation(
                      delay: Duration(milliseconds: index * 100),
                      beginOffset: const Offset(0.1, 0),
                      child: AnimatedCard(
                        delay: Duration(milliseconds: index * 100),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: TweenAnimationBuilder<double>(
                            tween: Tween<double>(begin: 0.0, end: 1.0),
                            duration: const Duration(milliseconds: 600),
                            curve: Curves.elasticOut,
                            builder: (context, value, child) {
                              return Transform.scale(
                                scale: value,
                                child: CircleAvatar(
                                  child: Icon(_getJourneyIcon(item['type'])),
                                ),
                              );
                            },
                          ),
                          title: Text(item['title'] ?? ''),
                          subtitle: Text(item['description'] ?? ''),
                          trailing: Text(
                            DateFormat(
                              'MMM dd',
                            ).format(DateTime.parse(item['date'])),
                          ),
                        ),
                      ),
                    );
                  }).toList()),
              ],
            ),
          );
        },
        loading: () => const LoadingWidget(message: 'Loading journey...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load journey: ${error.toString()}',
          onRetry: () {
            ref.invalidate(patientJourneyProvider);
          },
        ),
      ),
    );
  }

  Color _getStatusColor(AppointmentStatus status) {
    switch (status) {
      case AppointmentStatus.confirmed:
        return Colors.green.withOpacity(0.2);
      case AppointmentStatus.pending:
        return Colors.orange.withOpacity(0.2);
      case AppointmentStatus.completed:
        return Colors.blue.withOpacity(0.2);
      case AppointmentStatus.cancelled:
        return Colors.red.withOpacity(0.2);
    }
  }

  Color _getPrescriptionStatusColor(PrescriptionStatus status) {
    switch (status) {
      case PrescriptionStatus.pending:
        return Colors.orange.withOpacity(0.2);
      case PrescriptionStatus.processing:
        return Colors.blue.withOpacity(0.2);
      case PrescriptionStatus.ready:
        return Colors.green.withOpacity(0.2);
      case PrescriptionStatus.delivered:
        return Colors.teal.withOpacity(0.2);
      case PrescriptionStatus.completed:
        return Colors.green.withOpacity(0.2);
      case PrescriptionStatus.filled:
        return Colors.purple.withOpacity(0.2);
      case PrescriptionStatus.cancelled:
        return Colors.red.withOpacity(0.2);
    }
  }

  IconData _getJourneyIcon(String? type) {
    switch (type) {
      case 'appointment':
        return Icons.calendar_today;
      case 'test':
        return Icons.visibility;
      case 'prescription':
        return Icons.medication;
      default:
        return Icons.event;
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

  void _showBookAppointmentDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    DateTime? selectedDate;
    TimeOfDay? selectedTime;
    AppointmentType selectedType = AppointmentType.inPerson;
    final reasonController = TextEditingController();
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Book Appointment'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    title: const Text('Select Date'),
                    subtitle: Text(
                      selectedDate == null
                          ? 'No date selected'
                          : DateFormat('MMM dd, yyyy').format(selectedDate!),
                    ),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (date != null) {
                        setDialogState(() {
                          selectedDate = date;
                        });
                      }
                    },
                  ),
                  ListTile(
                    title: const Text('Select Time'),
                    subtitle: Text(
                      selectedTime == null
                          ? 'No time selected'
                          : selectedTime!.format(context),
                    ),
                    trailing: const Icon(Icons.access_time),
                    onTap: () async {
                      final time = await showTimePicker(
                        context: context,
                        initialTime: TimeOfDay.now(),
                      );
                      if (time != null) {
                        setDialogState(() {
                          selectedTime = time;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text('Appointment Type'),
                  RadioListTile<AppointmentType>(
                    title: const Text('In Person'),
                    value: AppointmentType.inPerson,
                    groupValue: selectedType,
                    onChanged: (value) {
                      setDialogState(() {
                        selectedType = value!;
                      });
                    },
                  ),
                  RadioListTile<AppointmentType>(
                    title: const Text('Video Call'),
                    value: AppointmentType.video,
                    groupValue: selectedType,
                    onChanged: (value) {
                      setDialogState(() {
                        selectedType = value!;
                      });
                    },
                  ),
                  RadioListTile<AppointmentType>(
                    title: const Text('Phone Call'),
                    value: AppointmentType.phone,
                    groupValue: selectedType,
                    onChanged: (value) {
                      setDialogState(() {
                        selectedType = value!;
                      });
                    },
                  ),
                  TextFormField(
                    controller: reasonController,
                    decoration: const InputDecoration(
                      labelText: 'Reason for Visit',
                      hintText: 'Brief description',
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: notesController,
                    decoration: const InputDecoration(
                      labelText: 'Additional Notes (Optional)',
                      hintText: 'Any additional information',
                    ),
                    maxLines: 3,
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
                if (selectedDate == null || selectedTime == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please select date and time'),
                    ),
                  );
                  return;
                }

                try {
                  final service = ref.read(patientServiceProvider);
                  await service.createAppointment({
                    'appointmentDate': selectedDate!.toIso8601String(),
                    'appointmentTime': selectedTime!.format(context),
                    'type': selectedType.toString().split('.').last,
                    'reason': reasonController.text,
                    'notes': notesController.text,
                  });

                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Appointment booked successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    ref.invalidate(patientAppointmentsProvider);
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
              child: const Text('Book Appointment'),
            ),
          ],
        ),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
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
                    'Notifications',
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
                  ListTile(
                    leading: const Icon(Icons.info_outline),
                    title: const Text('Welcome to Vision Clinic'),
                    subtitle: const Text('Your health journey starts here'),
                    trailing: Text(
                      DateFormat('MMM dd').format(DateTime.now()),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.calendar_today),
                    title: const Text('Upcoming Appointment'),
                    subtitle: const Text('You have an appointment scheduled'),
                    trailing: Text(
                      DateFormat('MMM dd').format(DateTime.now().add(const Duration(days: 3))),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.visibility),
                    title: const Text('Eye Test Results Available'),
                    subtitle: const Text('Your latest test results are ready'),
                    trailing: Text(
                      DateFormat('MMM dd').format(DateTime.now().subtract(const Duration(days: 2))),
                      style: Theme.of(context).textTheme.bodySmall,
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
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
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
                        style: const TextStyle(fontSize: 40, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      user.fullName,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      user.email,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  if (user.phone != null) ...[
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        user.phone!,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                  const Divider(height: 32),
                  ListTile(
                    leading: const Icon(Icons.person),
                    title: const Text('Full Name'),
                    subtitle: Text(user.fullName),
                  ),
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
                  if (user.nationalId != null)
                    ListTile(
                      leading: const Icon(Icons.badge),
                      title: const Text('National ID'),
                      subtitle: Text(user.nationalId!),
                    ),
                  ListTile(
                    leading: const Icon(Icons.verified_user),
                    title: const Text('Role'),
                    subtitle: Text(user.role.toString().split('.').last.toUpperCase()),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTestDetails(BuildContext context, EyeTest test) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eye Test Details'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Date: ${DateFormat('MMM dd, yyyy').format(test.createdAt)}'),
              const SizedBox(height: 8),
              Text('Status: ${test.status.toString().split('.').last}'),
              if (test.visualAcuityRight != null) ...[
                const SizedBox(height: 8),
                Text('Right Eye: ${test.visualAcuityRight}'),
              ],
              if (test.visualAcuityLeft != null) ...[
                const SizedBox(height: 8),
                Text('Left Eye: ${test.visualAcuityLeft}'),
              ],
              if (test.colorVisionResult != null) ...[
                const SizedBox(height: 8),
                Text('Color Vision: ${test.colorVisionResult}'),
              ],
              if (test.optometristNotes != null) ...[
                const SizedBox(height: 8),
                Text('Notes: ${test.optometristNotes}'),
              ],
              if (test.doctorNotes != null) ...[
                const SizedBox(height: 8),
                Text('Doctor Notes: ${test.doctorNotes}'),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
