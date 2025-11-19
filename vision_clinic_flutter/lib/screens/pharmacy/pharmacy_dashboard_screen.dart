import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/services_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/prescription_model.dart';
import '../../models/notification_model.dart' as models;
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';

final pharmacyPendingPrescriptionsProvider = FutureProvider<List<Prescription>>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getPendingPrescriptions();
});

final pharmacyProcessingPrescriptionsProvider = FutureProvider<List<Prescription>>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getProcessingPrescriptions();
});

final pharmacyReadyPrescriptionsProvider = FutureProvider<List<Prescription>>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getReadyPrescriptions();
});

final pharmacyNotificationsProvider = FutureProvider<List<models.Notification>>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getNotifications();
});

final pharmacyUnreadCountProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getUnreadNotificationCount();
});

final pharmacyStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(pharmacyServiceProvider);
  return service.getPharmacyStats();
});

class PharmacyDashboardScreen extends ConsumerStatefulWidget {
  const PharmacyDashboardScreen({super.key});

  @override
  ConsumerState<PharmacyDashboardScreen> createState() => _PharmacyDashboardScreenState();
}

class _PharmacyDashboardScreenState extends ConsumerState<PharmacyDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pharmacy Dashboard'),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final unreadCountAsync = ref.watch(pharmacyUnreadCountProvider);
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
            icon: Icon(Icons.sync),
            label: 'Processing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: 'Ready',
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
        return _buildProcessingTab(context);
      case 3:
        return _buildReadyTab(context);
      default:
        return _buildOverviewTab(context);
    }
  }

  Widget _buildOverviewTab(BuildContext context) {
    final statsAsync = ref.watch(pharmacyStatsProvider);
    final pendingAsync = ref.watch(pharmacyPendingPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(pharmacyStatsProvider);
        ref.invalidate(pharmacyPendingPrescriptionsProvider);
        ref.invalidate(pharmacyProcessingPrescriptionsProvider);
        ref.invalidate(pharmacyReadyPrescriptionsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            statsAsync.when(
              data: (stats) => _buildStatsGrid(context, stats),
              loading: () => const LoadingWidget(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),
            Text(
              'Pending Prescriptions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            pendingAsync.when(
              data: (prescriptions) {
                if (prescriptions.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.check_circle,
                    title: 'No pending prescriptions',
                  );
                }
                return _buildPrescriptionList(prescriptions.take(3).toList());
              },
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorDisplayWidget(
                message: 'Failed to load prescriptions: ${error.toString()}',
                onRetry: () {
                  ref.invalidate(pharmacyPendingPrescriptionsProvider);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, Map<String, dynamic> stats) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                context,
                'Pending',
                stats['pending']?.toString() ?? '0',
                Icons.pending,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                context,
                'Processing',
                stats['processing']?.toString() ?? '0',
                Icons.sync,
                Colors.blue,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                context,
                'Ready',
                stats['ready']?.toString() ?? '0',
                Icons.check_circle,
                Colors.green,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                context,
                'Total',
                stats['total']?.toString() ?? '0',
                Icons.medication,
                Colors.purple,
              ),
            ),
          ],
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
    final pendingAsync = ref.watch(pharmacyPendingPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(pharmacyPendingPrescriptionsProvider);
      },
      child: pendingAsync.when(
        data: (prescriptions) {
          if (prescriptions.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.check_circle,
              title: 'No pending prescriptions',
              message: 'All prescriptions have been processed',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              return _buildPrescriptionCard(context, prescription, true);
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading pending prescriptions...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load prescriptions: ${error.toString()}',
          onRetry: () {
            ref.invalidate(pharmacyPendingPrescriptionsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildProcessingTab(BuildContext context) {
    final processingAsync = ref.watch(pharmacyProcessingPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(pharmacyProcessingPrescriptionsProvider);
      },
      child: processingAsync.when(
        data: (prescriptions) {
          if (prescriptions.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.sync,
              title: 'No processing prescriptions',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              return _buildPrescriptionCard(context, prescription, false);
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading processing prescriptions...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load prescriptions: ${error.toString()}',
          onRetry: () {
            ref.invalidate(pharmacyProcessingPrescriptionsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildReadyTab(BuildContext context) {
    final readyAsync = ref.watch(pharmacyReadyPrescriptionsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(pharmacyReadyPrescriptionsProvider);
      },
      child: readyAsync.when(
        data: (prescriptions) {
          if (prescriptions.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.check_circle,
              title: 'No ready prescriptions',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              return _buildPrescriptionCard(context, prescription, false);
            },
          );
        },
        loading: () => const LoadingWidget(message: 'Loading ready prescriptions...'),
        error: (error, stack) => ErrorDisplayWidget(
          message: 'Failed to load prescriptions: ${error.toString()}',
          onRetry: () {
            ref.invalidate(pharmacyReadyPrescriptionsProvider);
          },
        ),
      ),
    );
  }

  Widget _buildPrescriptionList(List<Prescription> prescriptions) {
    return Column(
      children: prescriptions.map((prescription) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.orange,
              child: const Icon(Icons.medication, color: Colors.white),
            ),
            title: Text(prescription.patient?.fullName ?? 'Patient'),
            subtitle: Text('${prescription.medications.length} medication(s)'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              _showPrescriptionDetails(context, prescription);
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPrescriptionCard(BuildContext context, Prescription prescription, bool showActions) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.orange,
          child: const Icon(Icons.medication, color: Colors.white),
        ),
        title: Text(prescription.patient?.fullName ?? 'Patient'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${prescription.medications.length} medication(s)'),
            if (prescription.diagnosis != null) Text('Diagnosis: ${prescription.diagnosis}'),
          ],
        ),
        trailing: showActions
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.check),
                    color: Colors.green,
                    onPressed: () {
                      _updatePrescriptionStatus(context, prescription, PrescriptionStatus.processing);
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    color: Colors.red,
                    onPressed: () {
                      _rejectPrescription(context, prescription);
                    },
                  ),
                ],
              )
            : Chip(
                label: Text(
                  prescription.status.toString().split('.').last,
                  style: const TextStyle(fontSize: 12),
                ),
              ),
        onTap: () {
          _showPrescriptionDetails(context, prescription);
        },
      ),
    );
  }

  void _updatePrescriptionStatus(BuildContext context, Prescription prescription, PrescriptionStatus status) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Update Status'),
        content: Text('Update prescription status to ${status.toString().split('.').last}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = ref.read(pharmacyServiceProvider);
                await service.updatePrescriptionStatus(prescription.id, status);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Status updated successfully')),
                  );
                  ref.invalidate(pharmacyPendingPrescriptionsProvider);
                  ref.invalidate(pharmacyProcessingPrescriptionsProvider);
                  ref.invalidate(pharmacyReadyPrescriptionsProvider);
                  ref.invalidate(pharmacyStatsProvider);
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

  void _rejectPrescription(BuildContext context, Prescription prescription) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Prescription'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'Reason for rejection',
            hintText: 'Enter reason...',
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (reasonController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a reason')),
                );
                return;
              }

              try {
                final service = ref.read(pharmacyServiceProvider);
                await service.rejectPrescription(prescription.id, reasonController.text);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Prescription rejected')),
                  );
                  ref.invalidate(pharmacyPendingPrescriptionsProvider);
                  ref.invalidate(pharmacyStatsProvider);
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
              backgroundColor: Colors.red,
            ),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }

  void _showPrescriptionDetails(BuildContext context, Prescription prescription) {
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
                'Prescription Details',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Text('Patient: ${prescription.patient?.fullName ?? 'N/A'}'),
              Text('Status: ${prescription.status.toString().split('.').last}'),
              if (prescription.diagnosis != null) Text('Diagnosis: ${prescription.diagnosis}'),
              const SizedBox(height: 16),
              const Text(
                'Medications:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              ...prescription.medications.map((med) => Text('- ${med['name'] ?? 'N/A'}')),
            ],
          ),
        ),
      ),
    );
  }

  void _showNotifications(BuildContext context) {
    final notificationsAsync = ref.watch(pharmacyNotificationsProvider);

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
                    ref.invalidate(pharmacyNotificationsProvider);
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
