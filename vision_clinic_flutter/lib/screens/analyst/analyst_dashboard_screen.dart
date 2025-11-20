import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/services_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/eye_test_model.dart';
import '../../services/patient_service.dart';
import '../../models/notification_model.dart' as models;
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';

final analystPendingTestsProvider = FutureProvider<List<EyeTest>>((ref) async {
  final service = ref.watch(analystServiceProvider);
  return service.getPendingTests();
});

final analystMyTestsProvider = FutureProvider<List<EyeTest>>((ref) async {
  final service = ref.watch(analystServiceProvider);
  return service.getMyTests();
});

final analystNotificationsProvider = FutureProvider<List<models.Notification>>((ref) async {
  final service = ref.watch(analystServiceProvider);
  return service.getNotifications();
});

final analystUnreadCountProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(analystServiceProvider);
  return service.getUnreadNotificationCount();
});

final analystTestTrendsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(analystServiceProvider);
  return service.getTestTrends();
});

class AnalystDashboardScreen extends ConsumerStatefulWidget {
  const AnalystDashboardScreen({super.key});

  @override
  ConsumerState<AnalystDashboardScreen> createState() => _AnalystDashboardScreenState();
}

class _AnalystDashboardScreenState extends ConsumerState<AnalystDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyst Dashboard'),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final unreadCountAsync = ref.watch(analystUnreadCountProvider);
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
      body: _buildBody(context),
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
            icon: Icon(Icons.pending),
            label: 'Pending',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.visibility),
            label: 'My Tests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up),
            label: 'Trends',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    switch (_selectedIndex) {
      case 0:
        return _buildOverviewTab(context);
      case 1:
        return _buildPendingTab(context);
      case 2:
        return _buildMyTestsTab(context);
      case 3:
        return _buildTrendsTab(context);
      default:
        return _buildOverviewTab(context);
    }
  }

  Widget _buildOverviewTab(BuildContext context) {
    final pendingAsync = ref.watch(analystPendingTestsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(analystPendingTestsProvider);
        ref.invalidate(analystMyTestsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatsCards(context),
            const SizedBox(height: 24),
            Text(
              'Pending Tests',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            pendingAsync.when(
              data: (tests) {
                if (tests.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.check_circle,
                    title: 'No pending tests',
                    message: 'All tests have been analyzed',
                  );
                }
                return _buildTestList(tests.take(3).toList());
              },
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorDisplayWidget(
                message: 'Failed to load tests: ${error.toString()}',
                onRetry: () {
                  ref.invalidate(analystPendingTestsProvider);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(BuildContext context) {
    final pendingAsync = ref.watch(analystPendingTestsProvider);
    final myTestsAsync = ref.watch(analystMyTestsProvider);

    return Row(
      children: [
        Expanded(
          child: pendingAsync.when(
            data: (tests) => _buildStatCard(
              context,
              'Pending Tests',
              tests.length.toString(),
              Icons.pending,
              Colors.orange,
            ),
            loading: () => _buildStatCard(context, 'Pending', '...', Icons.pending, Colors.orange),
            error: (_, __) => _buildStatCard(context, 'Pending', '0', Icons.pending, Colors.orange),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: myTestsAsync.when(
            data: (tests) => _buildStatCard(
              context,
              'My Tests',
              tests.length.toString(),
              Icons.visibility,
              Colors.blue,
            ),
            loading: () => _buildStatCard(context, 'My Tests', '...', Icons.visibility, Colors.blue),
            error: (_, __) => _buildStatCard(context, 'My Tests', '0', Icons.visibility, Colors.blue),
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

  Widget _buildPendingTab(BuildContext context) {
    final pendingAsync = ref.watch(analystPendingTestsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(analystPendingTestsProvider);
      },
      child: pendingAsync.when(
        data: (tests) {
          if (tests.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.check_circle,
              title: 'No pending tests',
              message: 'All tests have been analyzed',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tests.length,
            itemBuilder: (context, index) {
              final test = tests[index];
              return _buildTestCard(context, test, true);
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading pending tests...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load tests: ${error.toString()}',
          onRetry: () {
            ref.invalidate(analystPendingTestsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildMyTestsTab(BuildContext context) {
    final myTestsAsync = ref.watch(analystMyTestsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(analystMyTestsProvider);
      },
      child: myTestsAsync.when(
        data: (tests) {
          if (tests.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.visibility,
              title: 'No tests',
              message: 'You haven\'t analyzed any tests yet',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tests.length,
            itemBuilder: (context, index) {
              final test = tests[index];
              return _buildTestCard(context, test, false);
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading tests...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load tests: ${error.toString()}',
          onRetry: () {
            ref.invalidate(analystMyTestsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildTrendsTab(BuildContext context) {
    final trendsAsync = ref.watch(analystTestTrendsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(analystTestTrendsProvider);
      },
      child: trendsAsync.when(
        data: (trends) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Test Trends',
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
                        if (trends['totalTests'] != null)
                          _buildStatRow('Total Tests', trends['totalTests'].toString()),
                        if (trends['averagePerDay'] != null)
                          _buildStatRow('Average per Day', trends['averagePerDay'].toString()),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const LoadingWidget(message: 'Loading trends...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load trends: ${error.toString()}',
          onRetry: () {
            ref.invalidate(analystTestTrendsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildTestList(List<EyeTest> tests) {
    return Column(
      children: tests.map((test) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.orange,
              child: const Icon(Icons.visibility, color: Colors.white),
            ),
            title: Text(test.patient?.fullName ?? 'Patient'),
            subtitle: Text(
              DateFormat('MMM dd, yyyy').format(test.createdAt),
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              _showTestDetails(context, test);
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTestCard(BuildContext context, EyeTest test, bool showActions) {
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
        trailing: showActions
            ? ElevatedButton(
                onPressed: () {
                  _analyzeTest(context, test);
                },
                child: const Text('Analyze'),
              )
            : Chip(
                label: Text(
                  test.status.toString().split('.').last,
                  style: const TextStyle(fontSize: 12),
                ),
              ),
        onTap: () {
          _showTestDetails(context, test);
        },
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

  void _analyzeTest(BuildContext context, EyeTest test) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Analyze Test'),
        content: Text('Analyze test from ${test.patient?.fullName ?? "Patient"}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(analystServiceProvider);
                await service.analyzeTest(test.id, {
                  'status': 'ANALYZED',
                  'notes': 'Test analyzed',
                });
                
                // Mark optometrist journey step as complete when test is analyzed
                try {
                  final patientService = ref.read(patientServiceProvider);
                  await patientService.markJourneyStepComplete('optometrist', test.patientId);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Test analyzed and journey step completed!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  } catch (journeyError) {
                    // Journey update failed, but test analysis succeeded
                    print('Journey update error: $journeyError');
                  }
                
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Test analyzed successfully')),
                  );
                  ref.invalidate(analystPendingTestsProvider);
                  ref.invalidate(analystMyTestsProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Analyze'),
          ),
        ],
      ),
    );
  }

  void _showTestDetails(BuildContext context, EyeTest test) {
    showModalBottomSheet(
      context: context,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Test Details',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Text('Patient: ${test.patient?.fullName ?? 'N/A'}'),
              Text('Status: ${test.status.toString().split('.').last}'),
              Text('Created: ${DateFormat('MMM dd, yyyy').format(test.createdAt)}'),
              if (test.visualAcuityRight != null)
                Text('Right Eye: ${test.visualAcuityRight}'),
              if (test.visualAcuityLeft != null)
                Text('Left Eye: ${test.visualAcuityLeft}'),
            ],
          ),
        ),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    final notificationsAsync = ref.watch(analystNotificationsProvider);

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
                        child: ListTile(
                          leading: const Icon(Icons.notifications),
                          title: Text(notification.title),
                          subtitle: Text(notification.message),
                          trailing: Text(
                            DateFormat('MMM dd').format(notification.createdAt),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      );
                    },
                  );
                },
                loading: () => const LoadingWidget(),
                error: (error, stack) => ErrorDisplayWidget(
                  message: 'Failed to load notifications: ${error.toString()}',
                  onRetry: () {
                    ref.invalidate(analystNotificationsProvider);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
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
}
