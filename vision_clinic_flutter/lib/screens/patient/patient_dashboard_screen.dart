import 'dart:async';
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

final patientCurrentJourneyProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final service = ref.watch(patientServiceProvider);
  try {
    return await service.getJourney();
  } catch (e) {
    return null; // No active journey
  }
});

final patientHealthTimelineProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getHealthTimeline();
});

final patientAiInsightsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getAiInsights();
});

final patientBillingHistoryProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getBillingHistory();
});

final patientHealthDashboardProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getHealthDashboard();
});

final patientFinalResultsProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getFinalResults();
});

final patientPrescriptionTrackingProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getPrescriptionTracking();
});

final patientSuggestedAppointmentsProvider = FutureProvider<List<Appointment>>((
  ref,
) async {
  final service = ref.watch(patientServiceProvider);
  return service.getSuggestedAppointments();
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
  Timer? _journeyRefreshTimer;

  @override
  void initState() {
    super.initState();
    // Auto-refresh journey status every 5 seconds when on journey tab
    _startJourneyAutoRefresh();
  }

  @override
  void dispose() {
    _journeyRefreshTimer?.cancel();
    super.dispose();
  }

  void _startJourneyAutoRefresh() {
    _journeyRefreshTimer?.cancel();
    _journeyRefreshTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      // Only refresh if we're on the journey tab (index 4)
      if (_selectedIndex == 4 && mounted) {
        ref.invalidate(patientCurrentJourneyProvider);
      }
    });
  }

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
              // Restart auto-refresh when switching to journey tab
              if (index == 4) {
                _startJourneyAutoRefresh();
              } else {
                _journeyRefreshTimer?.cancel();
              }
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
    final aiInsightsAsync = ref.watch(patientAiInsightsProvider);
    final healthDashboardAsync = ref.watch(patientHealthDashboardProvider);
    final billingAsync = ref.watch(patientBillingHistoryProvider);
    
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientAppointmentsProvider);
        ref.invalidate(patientEyeTestsProvider);
        ref.invalidate(patientPrescriptionsProvider);
        ref.invalidate(patientJourneyProvider);
        ref.invalidate(patientAiInsightsProvider);
        ref.invalidate(patientHealthDashboardProvider);
        ref.invalidate(patientBillingHistoryProvider);
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
            // AI Insights Section
            aiInsightsAsync.when(
              data: (insights) => insights.isNotEmpty 
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI Health Insights',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildAiInsightsCard(context, insights),
                      const SizedBox(height: 24),
                    ],
                  )
                : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            // Health Dashboard Summary
            healthDashboardAsync.when(
              data: (dashboard) => dashboard.isNotEmpty
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Health Overview',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildHealthDashboardSummary(context, dashboard),
                      const SizedBox(height: 24),
                    ],
                  )
                : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _buildUpcomingAppointments(context),
            const SizedBox(height: 24),
            _buildRecentTests(context),
            const SizedBox(height: 24),
            _buildRecentPrescriptions(context),
            const SizedBox(height: 24),
            // Billing Summary
            billingAsync.when(
              data: (billing) => billing.isNotEmpty
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Billing Summary',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              // Navigate to billing tab if exists
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('View full billing history'),
                                ),
                              );
                            },
                            child: const Text('View All'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildBillingSummary(context, billing),
                      const SizedBox(height: 24),
                    ],
                  )
                : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            // Journey Summary
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Medical Journey',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedIndex = 4; // Navigate to Journey tab
                        });
                      },
                      child: const Text('View Full Journey'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildAnimatedJourneyFlowchart(context),
              ],
            ),
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
                    _showBookAppointmentDialog(context);
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
                        '${appointment.appointmentTime ?? 'N/A'} - ${appointment.type.toString().split('.').last}',
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
                    _showScheduleEyeTestDialog(context);
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
    final suggestedAsync = ref.watch(patientSuggestedAppointmentsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientAppointmentsProvider);
        ref.invalidate(patientSuggestedAppointmentsProvider);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            // Suggested Appointments Section
            suggestedAsync.when(
              data: (suggested) {
                if (suggested.isNotEmpty) {
                  return Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Suggested Appointments',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                _showBookAppointmentDialog(context);
                              },
                              child: const Text('Book Now'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...suggested.take(3).map((apt) => AnimatedCard(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: const Icon(Icons.calendar_today, color: Colors.blue),
                            title: Text('Dr. ${apt.doctorId}'),
                            subtitle: Text(
                              '${DateFormat('MMM dd, yyyy').format(apt.appointmentDate)} at ${apt.appointmentTime}',
                            ),
                            trailing: ElevatedButton(
                              onPressed: () {
                                _showBookAppointmentDialog(context, suggestedAppointment: apt);
                              },
                              child: const Text('Book'),
                            ),
                          ),
                        )),
                      ],
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            // Existing Appointments
            appointmentsAsync.when(
              data: (appointments) {
                if (appointments.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.calendar_today,
                    title: 'No appointments',
                    message: 'You don\'t have any appointments yet',
                    action: ElevatedButton.icon(
                      onPressed: () {
                        _showBookAppointmentDialog(context);
                      },
                      icon: const Icon(Icons.add),
                      label: const Text('Book Appointment'),
                    ),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
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
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Chip(
                        label: Text(
                          appointment.status.toString().split('.').last,
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: _getStatusColor(appointment.status),
                      ),
                      if (appointment.status == AppointmentStatus.confirmed ||
                          appointment.status == AppointmentStatus.pending)
                        TextButton.icon(
                          onPressed: () async {
                            try {
                              final service = ref.read(patientServiceProvider);
                              final waitTime = await service.getWaitTime(appointment.id);
                              if (context.mounted) {
                                _showWaitTimeDialog(context, waitTime, appointment);
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Failed to get wait time: ${e.toString()}'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          icon: const Icon(Icons.access_time, size: 16),
                          label: const Text('Wait Time', style: TextStyle(fontSize: 10)),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          ),
                        ),
                    ],
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
          ],
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
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with Schedule Button
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Eye Tests',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      _showScheduleEyeTestDialog(context);
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Schedule Test'),
                  ),
                ],
              ),
            ),
            // Tests List
            testsAsync.when(
              data: (tests) {
                if (tests.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.all(32),
                    child: EmptyStateWidget(
                      icon: Icons.visibility,
                      title: 'No eye tests',
                      message: 'You haven\'t taken any eye tests yet. Schedule your first test to track your vision health.',
                      action: ElevatedButton.icon(
                        onPressed: () {
                          _showScheduleEyeTestDialog(context);
                        },
                        icon: const Icon(Icons.add),
                        label: const Text('Schedule Test'),
                      ),
                    ),
                  );
                }

                // Group tests by status
                final pendingTests = tests.where((t) => t.status == TestStatus.pending).toList();
                final analyzingTests = tests.where((t) => t.status == TestStatus.analyzing).toList();
                final completedTests = tests.where((t) => t.status == TestStatus.completed || t.status == TestStatus.doctorReview).toList();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Pending Tests Section
                    if (pendingTests.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          'Pending (${pendingTests.length})',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.orange,
                          ),
                        ),
                      ),
                      ...pendingTests.map((test) => _buildTestCard(context, test)),
                    ],
                    // Analyzing Tests Section
                    if (analyzingTests.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          'In Progress (${analyzingTests.length})',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ),
                      ...analyzingTests.map((test) => _buildTestCard(context, test)),
                    ],
                    // Completed Tests Section
                    if (completedTests.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          'Completed (${completedTests.length})',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ),
                      ...completedTests.map((test) => _buildTestCard(context, test)),
                    ],
                  ],
                );
              },
              loading: () => Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: List.generate(3, (index) => const ShimmerCard()),
                ),
              ),
              error: (error, stack) => Padding(
                padding: const EdgeInsets.all(16),
                child: ErrorDisplayWidget(
                  message: 'Failed to load eye tests: ${error.toString()}',
                  onRetry: () {
                    ref.invalidate(patientEyeTestsProvider);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestCard(BuildContext context, EyeTest test) {
    final statusColor = _getTestStatusColor(test.status);
    final statusText = _getTestStatusText(test.status);
    
    return SlideInAnimation(
      delay: Duration(milliseconds: test.hashCode % 200),
      beginOffset: const Offset(0.1, 0),
      child: AnimatedCard(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        onTap: () {
          _showTestDetails(context, test);
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Hero(
                    tag: 'test_list_${test.id}',
                    child: CircleAvatar(
                      backgroundColor: statusColor.withOpacity(0.2),
                      radius: 24,
                      child: Icon(
                        _getTestStatusIcon(test.status),
                        color: statusColor,
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          DateFormat('MMM dd, yyyy • hh:mm a').format(test.createdAt),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: statusColor.withOpacity(0.3)),
                              ),
                              child: Text(
                                statusText,
                                style: TextStyle(
                                  color: statusColor,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            if (test.optometrist != null) ...[
                              const SizedBox(width: 8),
                              Icon(Icons.person_outline, size: 14, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Text(
                                '${test.optometrist!.firstName} ${test.optometrist!.lastName}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                ],
              ),
              // Show test type if available
              if (test.rawData != null && test.rawData!['testType'] != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: Colors.blue[700]),
                      const SizedBox(width: 8),
                      Text(
                        'Test Type: ${test.rawData!['testType']}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              // Show AI Analysis indicator
              if (test.aiAnalysis != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.psychology, size: 16, color: Colors.purple[700]),
                    const SizedBox(width: 4),
                    Text(
                      'AI Analysis Available',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.purple[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getTestStatusColor(TestStatus status) {
    switch (status) {
      case TestStatus.pending:
        return Colors.orange;
      case TestStatus.analyzing:
        return Colors.blue;
      case TestStatus.analyzed:
        return Colors.purple;
      case TestStatus.doctorReview:
        return Colors.indigo;
      case TestStatus.completed:
        return Colors.green;
    }
  }

  String _getTestStatusText(TestStatus status) {
    switch (status) {
      case TestStatus.pending:
        return 'Pending';
      case TestStatus.analyzing:
        return 'Analyzing';
      case TestStatus.analyzed:
        return 'Analyzed';
      case TestStatus.doctorReview:
        return 'Doctor Review';
      case TestStatus.completed:
        return 'Completed';
    }
  }

  IconData _getTestStatusIcon(TestStatus status) {
    switch (status) {
      case TestStatus.pending:
        return Icons.schedule;
      case TestStatus.analyzing:
        return Icons.autorenew;
      case TestStatus.analyzed:
        return Icons.check_circle_outline;
      case TestStatus.doctorReview:
        return Icons.medical_services;
      case TestStatus.completed:
        return Icons.check_circle;
    }
  }

  Widget _buildPrescriptionsTab(BuildContext context) {
    final prescriptionsAsync = ref.watch(patientPrescriptionsProvider);
    final trackingAsync = ref.watch(patientPrescriptionTrackingProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientPrescriptionsProvider);
        ref.invalidate(patientPrescriptionTrackingProvider);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            // Prescription Tracking Summary
            trackingAsync.when(
              data: (tracking) {
                if (tracking.isNotEmpty) {
                  final trackingList = tracking['prescriptions'] as List? ?? [];
                  if (trackingList.isNotEmpty) {
                    return Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Prescription Tracking',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...trackingList.take(3).map((item) => AnimatedCard(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: Icon(
                                _getPrescriptionTrackingIcon(item['status']),
                                color: _getPrescriptionTrackingColor(item['status']),
                              ),
                              title: Text(item['medicationName'] ?? 'Prescription'),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Status: ${item['status'] ?? 'Unknown'}'),
                                  if (item['pharmacyName'] != null)
                                    Text('Pharmacy: ${item['pharmacyName']}'),
                                  if (item['estimatedReadyTime'] != null)
                                    Text('Ready: ${item['estimatedReadyTime']}'),
                                ],
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.info_outline),
                                onPressed: () {
                                  _showPrescriptionTrackingDetails(context, item);
                                },
                              ),
                            ),
                          )),
                        ],
                      ),
                    );
                  }
                }
                return const SizedBox.shrink();
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            // Prescriptions List
            prescriptionsAsync.when(
              data: (prescriptions) {
                if (prescriptions.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.medication,
                    title: 'No prescriptions',
                    message: 'You don\'t have any prescriptions yet',
                  );
                }

                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'All Prescriptions',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...prescriptions.asMap().entries.map((entry) {
                        final index = entry.key;
                        final prescription = entry.value;
                        return SlideInAnimation(
                          delay: Duration(milliseconds: index * 50),
                          beginOffset: const Offset(0.1, 0),
                          child: AnimatedCard(
                            delay: Duration(milliseconds: index * 50),
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ExpansionTile(
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
                              subtitle: Text(
                                'Status: ${prescription.status.toString().split('.').last}',
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Chip(
                                    label: Text(
                                      prescription.status.toString().split('.').last,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                    backgroundColor: _getPrescriptionStatusColor(
                                      prescription.status,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.download),
                                    onPressed: () {
                                      _downloadPrescription(context, prescription);
                                    },
                                    tooltip: 'Download Prescription',
                                  ),
                                ],
                              ),
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (prescription.diagnosis != null) ...[
                                        Text(
                                          'Diagnosis: ${prescription.diagnosis}',
                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                      ],
                                      const Text(
                                        'Medications:',
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 8),
                                      ...prescription.medications.map((med) => Padding(
                                        padding: const EdgeInsets.only(bottom: 4),
                                        child: Text('• ${med['name'] ?? med.toString()}'),
                                      )),
                                      if (prescription.doctor != null) ...[
                                        const SizedBox(height: 12),
                                        Text(
                                          'Prescribed by: Dr. ${prescription.doctor!.firstName} ${prescription.doctor!.lastName}',
                                          style: Theme.of(context).textTheme.bodySmall,
                                        ),
                                      ],
                                      const SizedBox(height: 12),
                                      Text(
                                        'Date: ${DateFormat('MMM dd, yyyy').format(prescription.createdAt)}',
                                        style: Theme.of(context).textTheme.bodySmall,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
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
          ],
        ),
      ),
    );
  }

  IconData _getPrescriptionTrackingIcon(String? status) {
    switch (status?.toUpperCase()) {
      case 'READY':
      case 'FILLED':
        return Icons.check_circle;
      case 'PROCESSING':
        return Icons.hourglass_empty;
      case 'DELIVERED':
        return Icons.local_shipping;
      case 'PENDING':
        return Icons.pending;
      default:
        return Icons.medication;
    }
  }

  Color _getPrescriptionTrackingColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'READY':
      case 'FILLED':
        return Colors.green;
      case 'PROCESSING':
        return Colors.blue;
      case 'DELIVERED':
        return Colors.purple;
      case 'PENDING':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  void _showPrescriptionTrackingDetails(BuildContext context, Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Prescription Tracking'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Medication: ${item['medicationName'] ?? 'N/A'}'),
              const SizedBox(height: 8),
              Text('Status: ${item['status'] ?? 'Unknown'}'),
              if (item['pharmacyName'] != null) ...[
                const SizedBox(height: 8),
                Text('Pharmacy: ${item['pharmacyName']}'),
              ],
              if (item['estimatedReadyTime'] != null) ...[
                const SizedBox(height: 8),
                Text('Estimated Ready: ${item['estimatedReadyTime']}'),
              ],
              if (item['trackingNumber'] != null) ...[
                const SizedBox(height: 8),
                Text('Tracking: ${item['trackingNumber']}'),
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

  void _downloadPrescription(BuildContext context, Prescription prescription) {
    // Generate prescription text
    final prescriptionText = '''
PRESCRIPTION
========================
Date: ${DateFormat('MMM dd, yyyy').format(prescription.createdAt)}
Patient: ${prescription.patient?.fullName ?? 'N/A'}
Doctor: ${prescription.doctor?.fullName ?? 'N/A'}

Diagnosis: ${prescription.diagnosis ?? 'N/A'}

Medications:
${prescription.medications.map((med) => '  • ${med['name'] ?? med.toString()}').join('\n')}

Status: ${prescription.status.toString().split('.').last}
========================
Vision Clinic - Smart Eye Care Solutions
    ''';

    // Show dialog with prescription text and download option
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Prescription'),
        content: SingleChildScrollView(
          child: Text(prescriptionText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              // In a real app, this would use a file download package
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Prescription download feature - would save to device'),
                ),
              );
              Navigator.pop(context);
            },
            icon: const Icon(Icons.download),
            label: const Text('Download'),
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyTab(BuildContext context) {
    final currentJourneyAsync = ref.watch(patientCurrentJourneyProvider);
    final journeyAsync = ref.watch(patientJourneyProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(patientCurrentJourneyProvider);
        ref.invalidate(patientJourneyProvider);
      },
      child: currentJourneyAsync.when(
        data: (currentJourney) {
          // Show checklist if there's an active journey
          if (currentJourney != null) {
            return _buildJourneyChecklist(context, currentJourney);
          }
          
          // Show unified journey timeline if no active journey
          return journeyAsync.when(
            data: (journey) {
              final summary = journey['summary'] as Map<String, dynamic>? ?? {};
              return SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Your Health Journey',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () async {
                            try {
                              final service = ref.read(patientServiceProvider);
                              await service.checkInJourney();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Checked in successfully!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                                ref.invalidate(patientCurrentJourneyProvider);
                                ref.invalidate(patientJourneyProvider);
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Check-in failed: ${e.toString()}'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          icon: const Icon(Icons.check_circle),
                          label: const Text('Check In'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Journey Summary Cards
                    if (summary.isNotEmpty) ...[
                      Row(
                        children: [
                          Expanded(
                            child: AnimatedCard(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  children: [
                                    Text(
                                      '${summary['totalAppointments'] ?? 0}',
                                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text('Appointments'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AnimatedCard(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  children: [
                                    Text(
                                      '${summary['totalTests'] ?? 0}',
                                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text('Eye Tests'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AnimatedCard(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  children: [
                                    Text(
                                      '${summary['totalPrescriptions'] ?? 0}',
                                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.orange,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text('Prescriptions'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],
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
          );
        },
        loading: () => const LoadingWidget(message: 'Loading journey...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load journey: ${error.toString()}',
          onRetry: () {
            ref.invalidate(patientCurrentJourneyProvider);
          },
        ),
      ),
    );
  }

  Widget _buildJourneyChecklist(BuildContext context, Map<String, dynamic> journey) {
    final steps = journey['steps'] as List? ?? [];
    final overallStatus = journey['overallStatus'] as String? ?? 'PENDING';
    final currentStep = journey['currentStep'] as String?;
    final checkInTime = journey['checkInTime'] != null 
        ? DateTime.parse(journey['checkInTime']) 
        : DateTime.now();
    final checkOutTime = journey['checkOutTime'] != null 
        ? DateTime.parse(journey['checkOutTime']) 
        : null;
    final costs = journey['costs'] as Map<String, dynamic>? ?? {};
    
    // Define all journey steps in order
    final allSteps = [
      {'step': 'REGISTRATION', 'title': 'Registration', 'icon': Icons.person_add, 'description': 'Check-in at clinic reception'},
      {'step': 'PAYMENT', 'title': 'Payment', 'icon': Icons.payment, 'description': 'Complete payment at finance counter'},
      {'step': 'OPTOMETRIST', 'title': 'Eye Test', 'icon': Icons.visibility, 'description': 'Complete eye examination with optometrist'},
      {'step': 'DOCTOR', 'title': 'Doctor Consultation', 'icon': Icons.medical_services, 'description': 'See the doctor for consultation'},
      {'step': 'PHARMACY', 'title': 'Pharmacy', 'icon': Icons.local_pharmacy, 'description': 'Collect medication from pharmacy'},
    ];
    
    // Calculate progress
    final completedSteps = steps.where((s) => s['status'] == 'COMPLETED').length;
    final totalSteps = allSteps.length;
    final progress = completedSteps / totalSteps;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Clinic Visit',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Checked in: ${DateFormat('MMM dd, yyyy • hh:mm a').format(checkInTime)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              if (overallStatus == 'COMPLETED' && checkOutTime != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle, color: Colors.white, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Completed',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Progress Card
          AnimatedCard(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Progress',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${(progress * 100).toInt()}%',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 12,
                      backgroundColor: Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        overallStatus == 'COMPLETED' 
                            ? Colors.green 
                            : Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$completedSteps of $totalSteps steps completed',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          // Checklist
          Text(
            'Visit Checklist',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          ...allSteps.asMap().entries.map((entry) {
            final index = entry.key;
            final stepDef = entry.value;
            final stepName = stepDef['step'] as String;
            
            // Find step status from journey
            final stepData = steps.firstWhere(
              (s) => s['step'] == stepName,
              orElse: () => {'status': 'PENDING'},
            );
            final stepStatus = stepData['status'] as String? ?? 'PENDING';
            final completedAt = stepData['completedAt'] != null
                ? DateTime.parse(stepData['completedAt'])
                : null;
            final isCompleted = stepStatus == 'COMPLETED';
            final isCurrent = currentStep == stepName && !isCompleted;
            
            return SlideInAnimation(
              delay: Duration(milliseconds: index * 100),
              beginOffset: const Offset(0.1, 0),
              child: AnimatedCard(
                delay: Duration(milliseconds: index * 100),
                margin: const EdgeInsets.only(bottom: 12),
                child: Container(
                  decoration: BoxDecoration(
                    border: isCurrent
                        ? Border.all(
                            color: Theme.of(context).colorScheme.primary,
                            width: 2,
                          )
                        : null,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        // Step Number & Status Icon
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isCompleted
                                ? Colors.green.withOpacity(0.1)
                                : isCurrent
                                    ? Theme.of(context).colorScheme.primary.withOpacity(0.1)
                                    : Colors.grey.withOpacity(0.1),
                          ),
                          child: isCompleted
                              ? const Icon(Icons.check_circle, color: Colors.green, size: 32)
                              : isCurrent
                                  ? Icon(
                                      Icons.radio_button_checked,
                                      color: Theme.of(context).colorScheme.primary,
                                      size: 32,
                                    )
                                  : Center(
                                      child: Text(
                                        '${index + 1}',
                                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ),
                        ),
                        const SizedBox(width: 16),
                        // Step Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    stepDef['icon'] as IconData,
                                    size: 20,
                                    color: isCompleted
                                        ? Colors.green
                                        : isCurrent
                                            ? Theme.of(context).colorScheme.primary
                                            : Colors.grey[600],
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      stepDef['title'] as String,
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: isCompleted
                                            ? Colors.green
                                            : isCurrent
                                                ? Theme.of(context).colorScheme.primary
                                                : Colors.grey[800],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                stepDef['description'] as String,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              if (isCompleted && completedAt != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  'Completed: ${DateFormat('hh:mm a').format(completedAt)}',
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.green,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                              if (isCurrent) ...[
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    'Current Step',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context).colorScheme.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        // Status Indicator
                        if (isCompleted)
                          const Icon(Icons.check_circle_outline, color: Colors.green, size: 24)
                        else if (isCurrent)
                          Icon(
                            Icons.arrow_forward,
                            color: Theme.of(context).colorScheme.primary,
                            size: 24,
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
          
          // Summary Card (if completed)
          if (overallStatus == 'COMPLETED' && checkOutTime != null) ...[
            const SizedBox(height: 24),
            AnimatedCard(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Visit Summary',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () async {
                            try {
                              final service = ref.read(patientServiceProvider);
                              final receipt = await service.getJourneyReceipt();
                              if (context.mounted) {
                                _showReceiptDialog(context, receipt);
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Failed to load receipt: ${e.toString()}'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          icon: const Icon(Icons.receipt),
                          label: const Text('View Receipt'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Check-in',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                            Text(
                              DateFormat('hh:mm a').format(checkInTime),
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Check-out',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                            Text(
                              DateFormat('hh:mm a').format(checkOutTime),
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total Cost',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '\$${costs['total']?.toStringAsFixed(2) ?? '0.00'}',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _showReceiptDialog(BuildContext context, Map<String, dynamic> receipt) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Visit Receipt'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Patient: ${receipt['patientName'] ?? 'N/A'}'),
              const SizedBox(height: 8),
              Text('Check-in: ${DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(receipt['checkInTime']))}'),
              if (receipt['checkOutTime'] != null)
                Text('Check-out: ${DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(receipt['checkOutTime']))}'),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                'Total: \$${receipt['totalCost']?.toStringAsFixed(2) ?? '0.00'}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
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
      case 'case':
        return Icons.medical_services;
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

  void _showBookAppointmentDialog(BuildContext context, {Appointment? suggestedAppointment}) {
    final formKey = GlobalKey<FormState>();
    DateTime? selectedDate = suggestedAppointment?.appointmentDate;
    TimeOfDay? selectedTime;
    if (suggestedAppointment?.appointmentTime != null) {
      try {
        final timeStr = suggestedAppointment!.appointmentTime!;
        final parts = timeStr.split(':');
        if (parts.length >= 2) {
          selectedTime = TimeOfDay(
            hour: int.parse(parts[0]),
            minute: int.parse(parts[1]),
          );
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    AppointmentType selectedType = suggestedAppointment?.type ?? AppointmentType.inPerson;
    String? selectedDoctorId = suggestedAppointment?.doctorId;
    String? selectedEyeTestType;
    final reasonController = TextEditingController(text: suggestedAppointment?.reason ?? '');
    final notesController = TextEditingController(text: suggestedAppointment?.notes ?? '');
    
    // Load doctors
    final patientService = ref.read(patientServiceProvider);
    final doctorsFuture = patientService.getAvailableDoctors();

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Book Appointment'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Doctor Selection
                  FutureBuilder<List<Map<String, dynamic>>>(
                    future: doctorsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: CircularProgressIndicator(),
                        );
                      }
                      if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Text('No doctors available'),
                        );
                      }
                      final doctors = snapshot.data!;
                      return DropdownButtonFormField<String>(
                        value: selectedDoctorId,
                        decoration: const InputDecoration(
                          labelText: 'Select Doctor *',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.medical_services),
                        ),
                        items: doctors.map((doctor) {
                          final name = '${doctor['firstName']} ${doctor['lastName']}';
                          final specialty = doctor['specialty'] != null ? ' - ${doctor['specialty']}' : '';
                          return DropdownMenuItem<String>(
                            value: doctor['id'] as String,
                            child: Text('$name$specialty'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setDialogState(() {
                            selectedDoctorId = value;
                          });
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please select a doctor';
                          }
                          return null;
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  // Eye Test Type Selection
                  DropdownButtonFormField<String>(
                    value: selectedEyeTestType,
                    decoration: const InputDecoration(
                      labelText: 'Eye Test Type (Optional)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.visibility),
                    ),
                    items: const [
                      DropdownMenuItem<String>(
                        value: 'comprehensive',
                        child: Text('Comprehensive Eye Exam'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'refraction',
                        child: Text('Refraction Test'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'glaucoma',
                        child: Text('Glaucoma Screening'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'diabetic',
                        child: Text('Diabetic Retinopathy'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'followup',
                        child: Text('Follow-up Exam'),
                      ),
                    ],
                    onChanged: (value) {
                      setDialogState(() {
                        selectedEyeTestType = value;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    title: const Text('Select Date *'),
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
                    title: const Text('Select Time *'),
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
                      labelText: 'Reason for Visit *',
                      hintText: 'Brief description (e.g., Eye exam, Vision check)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter reason for visit';
                      }
                      return null;
                    },
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
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) {
                  return;
                }
                
                if (selectedDate == null || selectedTime == null || selectedDoctorId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please fill all required fields'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  return;
                }

                try {
                  // Format time as HH:mm
                  final timeStr = '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}';
                  
                  await patientService.createAppointment({
                    'doctorId': selectedDoctorId,
                    'appointmentDate': selectedDate!.toIso8601String(),
                    'appointmentTime': timeStr,
                    'type': selectedType.toString().split('.').last.toUpperCase(),
                    'reason': reasonController.text.trim(),
                    'notes': selectedEyeTestType != null 
                        ? 'Eye Test Type: $selectedEyeTestType\n${notesController.text.trim()}'
                        : notesController.text.trim(),
                  });

                  if (dialogContext.mounted) {
                    Navigator.pop(dialogContext);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Appointment booked successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    ref.invalidate(patientAppointmentsProvider);
                  }
                } catch (e) {
                  if (dialogContext.mounted) {
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

  void _showScheduleEyeTestDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    String? selectedTestType;
    String? selectedOptometristId;
    final notesController = TextEditingController();
    
    // Load optometrists (they can perform eye tests)
    final patientService = ref.read(patientServiceProvider);
    final optometristsFuture = patientService.getAvailableDoctors().then((doctors) {
      // Filter for optometrists or use all doctors if no optometrist role
      return doctors.where((d) => d['specialty']?.toString().toLowerCase().contains('optometrist') ?? true).toList();
    });

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Schedule Eye Test'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Eye Test Type Selection
                  DropdownButtonFormField<String>(
                    value: selectedTestType,
                    decoration: const InputDecoration(
                      labelText: 'Test Type *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.visibility),
                    ),
                    items: const [
                      DropdownMenuItem<String>(
                        value: 'comprehensive',
                        child: Text('Comprehensive Eye Exam'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'refraction',
                        child: Text('Refraction Test'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'glaucoma',
                        child: Text('Glaucoma Screening'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'diabetic',
                        child: Text('Diabetic Retinopathy'),
                      ),
                      DropdownMenuItem<String>(
                        value: 'followup',
                        child: Text('Follow-up Exam'),
                      ),
                    ],
                    onChanged: (value) {
                      setDialogState(() {
                        selectedTestType = value;
                      });
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please select test type';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  // Optometrist Selection
                  FutureBuilder<List<Map<String, dynamic>>>(
                    future: optometristsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: CircularProgressIndicator(),
                        );
                      }
                      if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                        return const SizedBox.shrink(); // Optional field
                      }
                      final optometrists = snapshot.data!;
                      return DropdownButtonFormField<String>(
                        value: selectedOptometristId,
                        decoration: const InputDecoration(
                          labelText: 'Optometrist (Optional)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person),
                        ),
                        items: optometrists.map((opt) {
                          final name = '${opt['firstName']} ${opt['lastName']}';
                          return DropdownMenuItem<String>(
                            value: opt['id'] as String,
                            child: Text(name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setDialogState(() {
                            selectedOptometristId = value;
                          });
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: notesController,
                    decoration: const InputDecoration(
                      labelText: 'Notes (Optional)',
                      hintText: 'Any specific concerns or notes',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) {
                  return;
                }

                try {
                  await patientService.createEyeTest({
                    'status': 'PENDING',
                    'optometristId': selectedOptometristId,
                    'rawData': {
                      'testType': selectedTestType,
                      'notes': notesController.text.trim(),
                      'scheduledAt': DateTime.now().toIso8601String(),
                    },
                  });

                  // Update journey step if needed
                  try {
                    await patientService.markJourneyStepComplete('optometrist', ref.read(authNotifierProvider).valueOrNull?.user?.id ?? '');
                  } catch (e) {
                    // Journey update is optional, don't fail the whole operation
                  }

                  if (dialogContext.mounted) {
                    Navigator.pop(dialogContext);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Eye test scheduled successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    ref.invalidate(patientEyeTestsProvider);
                    ref.invalidate(patientCurrentJourneyProvider);
                  }
                } catch (e) {
                  if (dialogContext.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              child: const Text('Schedule Test'),
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
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Eye Test Details',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('MMM dd, yyyy • hh:mm a').format(test.createdAt),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Card
                      AnimatedCard(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: _getTestStatusColor(test.status).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _getTestStatusColor(test.status).withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                _getTestStatusIcon(test.status),
                                color: _getTestStatusColor(test.status),
                                size: 32,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _getTestStatusText(test.status),
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: _getTestStatusColor(test.status),
                                      ),
                                    ),
                                    if (test.optometrist != null)
                                      Text(
                                        'Optometrist: ${test.optometrist!.firstName} ${test.optometrist!.lastName}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    if (test.doctor != null)
                                      Text(
                                        'Doctor: ${test.doctor!.firstName} ${test.doctor!.lastName}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Visual Acuity Results
                      if (test.visualAcuityRight != null || test.visualAcuityLeft != null) ...[
                        Text(
                          'Visual Acuity',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: AnimatedCard(
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      const Icon(Icons.visibility, size: 32, color: Colors.blue),
                                      const SizedBox(height: 8),
                                      const Text(
                                        'Right Eye',
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        test.visualAcuityRight ?? 'N/A',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: AnimatedCard(
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      const Icon(Icons.visibility, size: 32, color: Colors.green),
                                      const SizedBox(height: 8),
                                      const Text(
                                        'Left Eye',
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        test.visualAcuityLeft ?? 'N/A',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.green,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                      // Refraction Results
                      if (test.refractionRight != null || test.refractionLeft != null) ...[
                        Text(
                          'Refraction',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (test.refractionRight != null)
                          _buildRefractionCard(context, 'Right Eye', test.refractionRight!, Colors.blue),
                        if (test.refractionLeft != null)
                          _buildRefractionCard(context, 'Left Eye', test.refractionLeft!, Colors.green),
                        const SizedBox(height: 16),
                      ],
                      // Color Vision
                      if (test.colorVisionResult != null) ...[
                        Text(
                          'Color Vision',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        AnimatedCard(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                const Icon(Icons.palette, size: 32, color: Colors.purple),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    test.colorVisionResult!,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // AI Analysis
                      if (test.aiAnalysis != null) ...[
                        Text(
                          'AI Analysis',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildAIAnalysisCard(context, test.aiAnalysis!),
                        const SizedBox(height: 16),
                      ],
                      // Notes
                      if (test.optometristNotes != null || test.doctorNotes != null) ...[
                        Text(
                          'Notes',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (test.optometristNotes != null)
                          AnimatedCard(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.person_outline, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Optometrist Notes',
                                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(test.optometristNotes!),
                                ],
                              ),
                            ),
                          ),
                        if (test.doctorNotes != null) ...[
                          const SizedBox(height: 12),
                          AnimatedCard(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.medical_services, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Doctor Notes',
                                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(test.doctorNotes!),
                                ],
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                      ],
                      // Retina Images
                      if (test.retinaImages.isNotEmpty) ...[
                        Text(
                          'Retina Images',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 200,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: test.retinaImages.length,
                            itemBuilder: (context, index) {
                              return Container(
                                width: 200,
                                margin: const EdgeInsets.only(right: 12),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  color: Colors.grey[200],
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    test.retinaImages[index],
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return const Center(
                                        child: Icon(Icons.image_not_supported),
                                      );
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // Actions
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                try {
                                  final service = ref.read(patientServiceProvider);
                                  final analysis = await service.getComparativeAnalysis(testId: test.id);
                                  if (context.mounted) {
                                    Navigator.pop(context);
                                    _showComparativeAnalysis(context, analysis);
                                  }
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Failed to load analysis: ${e.toString()}'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              },
                              icon: const Icon(Icons.compare_arrows),
                              label: const Text('Compare'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                _downloadTestReport(context, test);
                              },
                              icon: const Icon(Icons.download),
                              label: const Text('Download'),
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
        ),
      ),
    );
  }

  Widget _buildRefractionCard(BuildContext context, String title, Map<String, dynamic> refraction, Color color) {
    return AnimatedCard(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildRefractionItem('Sphere', refraction['sphere']?.toString() ?? 'N/A'),
                _buildRefractionItem('Cylinder', refraction['cylinder']?.toString() ?? 'N/A'),
                _buildRefractionItem('Axis', refraction['axis']?.toString() ?? 'N/A'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRefractionItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildAIAnalysisCard(BuildContext context, Map<String, dynamic> analysis) {
    return AnimatedCard(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.purple.withOpacity(0.1),
              Colors.blue.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.psychology, color: Colors.purple),
                const SizedBox(width: 8),
                const Text(
                  'AI Analysis Results',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (analysis['cataract'] != null)
              _buildAIFinding('Cataract', analysis['cataract']),
            if (analysis['glaucoma'] != null)
              _buildAIFinding('Glaucoma', analysis['glaucoma']),
            if (analysis['diabeticRetinopathy'] != null)
              _buildAIFinding('Diabetic Retinopathy', analysis['diabeticRetinopathy']),
            if (analysis['overallAssessment'] != null) ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 12),
              Text(
                'Overall Assessment',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(analysis['overallAssessment']),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAIFinding(String name, Map<String, dynamic> finding) {
    final detected = finding['detected'] == true;
    final severity = finding['severity']?.toString() ?? 'N/A';
    final confidence = finding['confidence']?.toDouble() ?? 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(
            detected ? Icons.warning : Icons.check_circle,
            color: detected ? Colors.orange : Colors.green,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  detected ? 'Detected: $severity' : 'Not Detected',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${(confidence * 100).toStringAsFixed(0)}%',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: detected ? Colors.orange : Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiInsightsCard(BuildContext context, Map<String, dynamic> insights) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 200),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.purple.withOpacity(0.1),
              Colors.blue.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.psychology, color: Colors.purple),
                const SizedBox(width: 8),
                Text(
                  'AI Health Score',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (insights['healthScore'] != null)
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: (insights['healthScore'] as num? ?? 0) / 100,
                      backgroundColor: Colors.grey[300],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        (insights['healthScore'] as num? ?? 0) > 70 
                          ? Colors.green 
                          : (insights['healthScore'] as num? ?? 0) > 50 
                            ? Colors.orange 
                            : Colors.red,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${insights['healthScore'] ?? 0}%',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            if (insights['recommendations'] != null && 
                (insights['recommendations'] as List).isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Recommendations',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              ...(insights['recommendations'] as List).take(2).map((rec) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 16,
                      color: Colors.green,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        rec['action'] ?? rec.toString(),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHealthDashboardSummary(BuildContext context, Map<String, dynamic> dashboard) {
    return AnimatedCard(
      delay: const Duration(milliseconds: 300),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildHealthMetric(
                  context,
                  'Vision Score',
                  dashboard['visionScore']?.toString() ?? 'N/A',
                  Icons.visibility,
                  Colors.blue,
                ),
                _buildHealthMetric(
                  context,
                  'Tests',
                  dashboard['totalTests']?.toString() ?? '0',
                  Icons.medical_services,
                  Colors.green,
                ),
                _buildHealthMetric(
                  context,
                  'Appointments',
                  dashboard['totalAppointments']?.toString() ?? '0',
                  Icons.calendar_today,
                  Colors.orange,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthMetric(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildBillingSummary(BuildContext context, Map<String, dynamic> billing) {
    final invoices = billing['invoices'] as List? ?? [];
    final totalDue = billing['totalDue'] ?? 0.0;
    final totalPaid = billing['totalPaid'] ?? 0.0;
    
    return AnimatedCard(
      delay: const Duration(milliseconds: 400),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Paid',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    Text(
                      '\$${totalPaid.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Total Due',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    Text(
                      '\$${totalDue.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (invoices.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              ...invoices.take(2).map((invoice) => ListTile(
                leading: Icon(
                  invoice['status'] == 'paid' ? Icons.check_circle : Icons.pending,
                  color: invoice['status'] == 'paid' ? Colors.green : Colors.orange,
                ),
                title: Text(invoice['description'] ?? 'Invoice'),
                trailing: Text(
                  '\$${(invoice['amount'] ?? 0).toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  DateFormat('MMM dd, yyyy').format(
                    DateTime.tryParse(invoice['date'] ?? '') ?? DateTime.now(),
                  ),
                ),
                onTap: () {
                  if (invoice['status'] == 'paid') {
                    _showInvoiceDialog(context, invoice);
                  } else {
                    _showPaymentDialog(context, invoice);
                  }
                },
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedJourneyFlowchart(BuildContext context) {
    final currentJourneyAsync = ref.watch(patientCurrentJourneyProvider);
    
    // Define all journey steps
    final allSteps = [
      {'step': 'REGISTRATION', 'title': 'Registration', 'icon': Icons.person_add, 'subtitle': 'Clinic Check-in'},
      {'step': 'PAYMENT', 'title': 'Payment', 'icon': Icons.payment, 'subtitle': 'Finance'},
      {'step': 'OPTOMETRIST', 'title': 'Eye Test', 'icon': Icons.visibility, 'subtitle': 'Optometrist'},
      {'step': 'DOCTOR', 'title': 'Doctor', 'icon': Icons.medical_services, 'subtitle': 'Consultation'},
      {'step': 'PHARMACY', 'title': 'Pharmacy', 'icon': Icons.local_pharmacy, 'subtitle': 'Medication'},
    ];
    
    return currentJourneyAsync.when(
      data: (currentJourney) {
        // Get step statuses from current journey (or empty if no journey)
        final steps = currentJourney?['steps'] as List? ?? [];
        final currentStep = currentJourney?['currentStep'] as String?;
        
        return AnimatedCard(
          delay: const Duration(milliseconds: 500),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Animated connected line flowchart
                ...allSteps.asMap().entries.map((entry) {
                  final index = entry.key;
                  final stepDef = entry.value;
                  final stepName = stepDef['step'] as String;
                  
                  // Find step status
                  final stepData = steps.firstWhere(
                    (s) => s['step'] == stepName,
                    orElse: () => {'status': 'PENDING'},
                  );
                  final stepStatus = stepData['status'] as String? ?? 'PENDING';
                  final isCompleted = stepStatus == 'COMPLETED';
                  final isCurrent = currentStep == stepName && !isCompleted;
                  
                  // Check if previous step is completed (for connecting line)
                  final prevIndex = index > 0 ? index - 1 : -1;
                  final prevStepCompleted = prevIndex >= 0 
                      ? (steps.firstWhere(
                          (s) => s['step'] == allSteps[prevIndex]['step'] as String,
                          orElse: () => {'status': 'PENDING'},
                        )['status'] == 'COMPLETED')
                      : false;
                  
                  return Column(
                    children: [
                      // Step Circle
                      TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0.0, end: 1.0),
                        duration: Duration(milliseconds: 600 + (index * 200)),
                        curve: Curves.elasticOut,
                        builder: (context, value, child) {
                          return Transform.scale(
                            scale: value,
                            child: Column(
                              children: [
                                // Step Circle with Icon
                                Container(
                                  width: 64,
                                  height: 64,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isCompleted
                                        ? Colors.green
                                        : isCurrent
                                            ? Theme.of(context).colorScheme.primary
                                            : Colors.grey[300],
                                    border: isCurrent
                                        ? Border.all(
                                            color: Theme.of(context).colorScheme.primary,
                                            width: 3,
                                          )
                                        : null,
                                    boxShadow: isCurrent
                                        ? [
                                            BoxShadow(
                                              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                              blurRadius: 12,
                                              spreadRadius: 2,
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Center(
                                    child: isCompleted
                                        ? const Icon(Icons.check, color: Colors.white, size: 32)
                                        : Icon(
                                            stepDef['icon'] as IconData,
                                            color: isCurrent
                                                ? Colors.white
                                                : Colors.grey[600],
                                            size: 28,
                                          ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                // Step Title
                                Text(
                                  stepDef['title'] as String,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: isCompleted || isCurrent
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                    color: isCompleted
                                        ? Colors.green
                                        : isCurrent
                                            ? Theme.of(context).colorScheme.primary
                                            : Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 2),
                                // Step Subtitle
                                Text(
                                  stepDef['subtitle'] as String,
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.grey[500],
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      
                      // Connecting Line (except for last step)
                      if (index < allSteps.length - 1)
                        TweenAnimationBuilder<double>(
                          tween: Tween<double>(begin: 0.0, end: 1.0),
                          duration: Duration(milliseconds: 800 + (index * 200)),
                          curve: Curves.easeInOut,
                          builder: (context, value, child) {
                            return Container(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              height: 4,
                              width: double.infinity,
                              child: Stack(
                                children: [
                                  // Background line
                                  Container(
                                    decoration: BoxDecoration(
                                      color: Colors.grey[200],
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                  ),
                                  // Animated progress line (fills when previous step is completed)
                                  FractionallySizedBox(
                                    widthFactor: prevStepCompleted ? value : 0.0,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.green,
                                            Theme.of(context).colorScheme.primary,
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  );
                }).toList(),
              ],
            ),
          ),
        );
      },
      loading: () => AnimatedCard(
        delay: const Duration(milliseconds: 500),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: CircularProgressIndicator(),
          ),
        ),
      ),
      error: (_, __) {
        // Show flowchart even when there's no active journey
        return AnimatedCard(
          delay: const Duration(milliseconds: 500),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Text(
                  'Start your clinic visit journey',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                ...allSteps.asMap().entries.map((entry) {
                  final index = entry.key;
                  final stepDef = entry.value;
                  
                  return Column(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.grey[300],
                        ),
                        child: Icon(
                          stepDef['icon'] as IconData,
                          color: Colors.grey[600],
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        stepDef['title'] as String,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        stepDef['subtitle'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[500],
                          fontSize: 10,
                        ),
                      ),
                      if (index < allSteps.length - 1)
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          height: 4,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                    ],
                  );
                }).toList(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildJourneyMetric(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.grey[600]),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Color _getJourneyColor(String? type) {
    switch (type) {
      case 'appointment':
        return Colors.blue;
      case 'test':
        return Colors.green;
      case 'prescription':
        return Colors.orange;
      case 'case':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  void _showInvoiceDialog(BuildContext context, Map<String, dynamic> invoice) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Receipt'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Transaction ID: ${invoice['transactionId'] ?? invoice['id']}'),
              const SizedBox(height: 8),
              Text('Amount: \$${(invoice['amount'] ?? 0).toStringAsFixed(2)}'),
              const SizedBox(height: 8),
              Text('Date: ${DateFormat('MMM dd, yyyy').format(DateTime.tryParse(invoice['date'] ?? '') ?? DateTime.now())}'),
              const SizedBox(height: 8),
              Text('Status: ${invoice['status'] ?? 'paid'}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              // Download receipt functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Receipt download feature coming soon'),
                ),
              );
            },
            icon: const Icon(Icons.download),
            label: const Text('Download'),
          ),
        ],
      ),
    );
  }

  void _showPaymentDialog(BuildContext context, Map<String, dynamic> invoice) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Make Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Amount Due: \$${(invoice['amount'] ?? 0).toStringAsFixed(2)}'),
            const SizedBox(height: 16),
            const Text('Payment methods will be available here'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Payment processing feature coming soon'),
                ),
              );
            },
            child: const Text('Pay Now'),
          ),
        ],
      ),
    );
  }

  void _showComparativeAnalysis(BuildContext context, Map<String, dynamic> analysis) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Comparative Analysis'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (analysis['improvement'] != null)
                Text('Improvement: ${analysis['improvement']}'),
              if (analysis['trends'] != null) ...[
                const SizedBox(height: 8),
                const Text('Trends:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(analysis['trends'].toString()),
              ],
              if (analysis['recommendations'] != null) ...[
                const SizedBox(height: 8),
                const Text('Recommendations:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(analysis['recommendations'].toString()),
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

  void _downloadTestReport(BuildContext context, EyeTest test) {
    final reportText = '''
EYE TEST REPORT
========================
Date: ${DateFormat('MMM dd, yyyy').format(test.createdAt)}
Status: ${test.status.toString().split('.').last}

Visual Acuity:
  Right Eye: ${test.visualAcuityRight ?? 'N/A'}
  Left Eye: ${test.visualAcuityLeft ?? 'N/A'}

Color Vision: ${test.colorVisionResult ?? 'N/A'}

${test.optometristNotes != null ? 'Optometrist Notes:\n${test.optometristNotes}\n' : ''}
${test.doctorNotes != null ? 'Doctor Notes:\n${test.doctorNotes}\n' : ''}
${test.aiAnalysis != null ? 'AI Analysis:\n${test.aiAnalysis}\n' : ''}
========================
Vision Clinic - Smart Eye Care Solutions
    ''';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Test Report'),
        content: SingleChildScrollView(
          child: Text(reportText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Test report download feature - would save to device'),
                ),
              );
              Navigator.pop(context);
            },
            icon: const Icon(Icons.download),
            label: const Text('Download'),
          ),
        ],
      ),
    );
  }

  void _showWaitTimeDialog(BuildContext context, Map<String, dynamic> waitTime, Appointment appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Wait Time Information'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Appointment: ${DateFormat('MMM dd, yyyy').format(appointment.appointmentDate)}'),
            const SizedBox(height: 12),
            if (waitTime['position'] != null)
              Text('Position in queue: ${waitTime['position']}'),
            if (waitTime['estimatedWaitTime'] != null)
              Text('Estimated wait: ${waitTime['estimatedWaitTime']}'),
            if (waitTime['estimatedWaitMinutes'] != null)
              Text('Estimated wait: ${waitTime['estimatedWaitMinutes']} minutes'),
            if (waitTime['currentWaitTime'] != null)
              Text('Current wait: ${waitTime['currentWaitTime']} minutes'),
          ],
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
