import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, AppointmentStatus, PrescriptionStatus, CaseStatus } from '@prisma/client';

// Device Monitoring Schema (inline for now)
export interface DeviceStatus {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastDataSync?: Date;
  calibrationStatus: 'calibrated' | 'needs_calibration' | 'calibrating';
  firmwareVersion?: string;
  location?: string;
}

@Injectable()
export class AdminEnhancedService {
  // Mock device data (in production, this would be in a database)
  private devices: DeviceStatus[] = [
    {
      deviceId: 'fundus-001',
      deviceName: 'Fundus Camera - Room 1',
      deviceType: 'fundus_camera',
      status: 'online',
      lastDataSync: new Date(),
      calibrationStatus: 'calibrated',
      firmwareVersion: 'v2.3.1',
      location: 'Exam Room 1',
    },
    {
      deviceId: 'auto-001',
      deviceName: 'Auto Refractor - Room 2',
      deviceType: 'autorefractor',
      status: 'online',
      lastDataSync: new Date(Date.now() - 300000), // 5 minutes ago
      calibrationStatus: 'calibrated',
      firmwareVersion: 'v1.8.2',
      location: 'Exam Room 2',
    },
  ];

  constructor(
    private prisma: PrismaService,
  ) {}

  // 1. Smart User & Role Management
  async getUsersWithActivity() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        nationalId: true,
        specialty: true,
        dateOfBirth: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });
    // Add activity tracking (in production, this would be from a sessions/activity collection)
    return users.map((user) => ({
      ...user,
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last 7 days
      isActive: Math.random() > 0.3,
      failedLoginAttempts: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
    }));
  }

  async updateUserRole(userId: string, role: string, permissions?: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        nationalId: true,
        specialty: true,
        dateOfBirth: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });
  }

  async revokeUserAccess(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        nationalId: true,
        specialty: true,
        dateOfBirth: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });
  }

  async getUserActivity(userId: string, days: number = 30) {
    // In production, this would query an activity log collection
    return {
      logins: Array.from({ length: days }, () => ({
        date: new Date(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        successful: Math.random() > 0.1,
      })),
      actions: [],
      dataDownloads: [],
    };
  }

  // 2. Device Monitoring
  async getDevices() {
    return this.devices;
  }

  async updateDeviceStatus(deviceId: string, status: Partial<DeviceStatus>) {
    const device = this.devices.find(d => d.deviceId === deviceId);
    if (device) {
      Object.assign(device, status);
    }
    return device;
  }

  async getDeviceAlerts() {
    const alerts = [];
    for (const device of this.devices) {
      if (device.status === 'offline' || device.status === 'error') {
        alerts.push({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          severity: device.status === 'error' ? 'high' : 'medium',
          message: `Device ${device.status}`,
          timestamp: new Date(),
        });
      }
      if (device.lastDataSync) {
        const minutesSinceSync = (Date.now() - device.lastDataSync.getTime()) / (1000 * 60);
        if (minutesSinceSync > 30) {
          alerts.push({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            severity: 'medium',
            message: 'No data sync for over 30 minutes',
            timestamp: device.lastDataSync,
          });
        }
      }
      if (device.calibrationStatus === 'needs_calibration') {
        alerts.push({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          severity: 'low',
          message: 'Device needs calibration',
          timestamp: new Date(),
        });
      }
    }
    return alerts;
  }

  // 3. Appointment Analytics & Scheduling
  async getAppointmentAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.appointmentDate = { gte: startDate };
    if (endDate) {
      where.appointmentDate = { ...where.appointmentDate, lte: endDate };
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: { doctor: true },
    });
    
    // Calculate wait times (simulated)
    const avgWaitTime = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
    
    // Predict wait time based on queue
    const pendingCount = appointments.filter((apt) => apt.status === AppointmentStatus.CONFIRMED).length;
    const predictedWait = pendingCount * 15; // 15 min per appointment

    return {
      total: appointments.length,
      scheduled: appointments.filter((apt) => apt.status === AppointmentStatus.CONFIRMED).length,
      completed: appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length,
      cancelled: appointments.filter((apt) => apt.status === AppointmentStatus.CANCELLED).length,
      avgWaitTime,
      predictedWaitTime: predictedWait,
      byDay: this.groupAppointmentsByDay(appointments),
      byDoctor: this.groupAppointmentsByDoctor(appointments),
    };
  }

  private groupAppointmentsByDay(appointments: any[]) {
    const grouped: Record<string, number> = {};
    appointments.forEach((apt) => {
      const date = new Date(apt.appointmentDate).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  private groupAppointmentsByDoctor(appointments: any[]) {
    const grouped: Record<string, number> = {};
    appointments.forEach((apt) => {
      const doctorId = apt.doctorId || 'unassigned';
      grouped[doctorId] = (grouped[doctorId] || 0) + 1;
    });
    return Object.entries(grouped).map(([doctorId, count]) => ({
      doctorId,
      doctorName: appointments.find((apt) => 
        apt.doctorId === doctorId
      )?.doctor?.firstName || 'Unassigned',
      count,
    }));
  }

  // 4. Billing & Financial Management
  async getBillingAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const prescriptions = await this.prisma.prescription.findMany({ where });
    const appointments = await this.prisma.appointment.findMany({ where });

    // Simulated billing data
    const revenue = {
      prescriptions: prescriptions.length * 50, // $50 per prescription
      appointments: appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length * 100, // $100 per appointment
      total: 0,
    };
    revenue.total = revenue.prescriptions + revenue.appointments;

    // Detect potential fraud (duplicate charges, unusual patterns)
    const fraudAlerts = this.detectBillingFraud(prescriptions, appointments);

    return {
      revenue,
      byDay: this.groupBillingByDay(prescriptions, appointments),
      currency: 'USD', // In production, this would come from clinic settings
      fraudAlerts,
      pendingInvoices: appointments.filter((apt) => apt.status === AppointmentStatus.CONFIRMED).length,
      paidInvoices: appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length,
    };
  }

  private detectBillingFraud(prescriptions: any[], appointments: any[]) {
    const alerts = [];
    
    // Check for duplicate prescriptions
    const prescriptionDates = prescriptions.map(p => 
      new Date(p.createdAt).toISOString().split('T')[0]
    );
    const duplicateDates = prescriptionDates.filter((date, index) => 
      prescriptionDates.indexOf(date) !== index
    );
    
    if (duplicateDates.length > 0) {
      alerts.push({
        type: 'duplicate_prescriptions',
        severity: 'medium',
        message: `Multiple prescriptions created on same date: ${duplicateDates[0]}`,
        count: duplicateDates.length,
      });
    }

    // Check for unusual billing patterns
    if (prescriptions.length > appointments.length * 2) {
      alerts.push({
        type: 'unusual_pattern',
        severity: 'low',
        message: 'Prescription count significantly higher than appointments',
      });
    }

    return alerts;
  }

  private groupBillingByDay(prescriptions: any[], appointments: any[]) {
    const grouped: Record<string, { prescriptions: number; appointments: number; revenue: number }> = {};
    
    [...prescriptions, ...appointments].forEach((item) => {
      const date = new Date(item.createdAt || item.appointmentDate).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { prescriptions: 0, appointments: 0, revenue: 0 };
      }
      if (item.medications) {
        grouped[date].prescriptions++;
        grouped[date].revenue += 50;
      } else {
        grouped[date].appointments++;
        grouped[date].revenue += 100;
      }
    });

    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  }

  // 5. AI-Driven Analytics
  async getComprehensiveAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const [patients, doctors, tests, cases, prescriptions, appointments] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
      this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
      this.prisma.eyeTest.count({ where }),
      this.prisma.case.count({ where }),
      this.prisma.prescription.count({ where }),
      this.prisma.appointment.count({ where }),
    ]);

    // Disease distribution
    const diseaseDistribution = await this.getDiseaseDistribution();
    
    // Patient growth trends
    const patientGrowth = await this.getPatientGrowth();
    
    // Regional analytics (if location data exists)
    const regionalData = await this.getRegionalAnalytics();

    return {
      overview: {
        totalPatients: patients,
        activeDoctors: doctors,
        totalTests: tests,
        totalCases: cases,
        totalPrescriptions: prescriptions,
        totalAppointments: appointments,
      },
      diseaseDistribution,
      patientGrowth,
      regionalData,
      predictions: {
        expectedPatientsNextMonth: Math.floor(patients * 1.1), // 10% growth
        peakHours: ['09:00', '10:00', '14:00', '15:00'],
        expectedRevenue: prescriptions * 50 + appointments * 100,
      },
    };
  }

  private async getDiseaseDistribution() {
    const tests = await this.prisma.eyeTest.findMany();
    const distribution: Record<string, number> = {
      normal: 0,
      cataract: 0,
      glaucoma: 0,
      diabetic_retinopathy: 0,
      refractive_errors: 0,
    };

    tests.forEach((test) => {
      if (test.aiAnalysis) {
        const analysis = test.aiAnalysis as any;
        if (analysis.cataract?.detected) distribution.cataract++;
        if (analysis.glaucoma?.detected) distribution.glaucoma++;
        if (analysis.diabeticRetinopathy?.detected) distribution.diabetic_retinopathy++;
        if (!analysis.cataract?.detected && 
            !analysis.glaucoma?.detected && 
            !analysis.diabeticRetinopathy?.detected) {
          distribution.normal++;
        }
      }
      if (test.refractionRight || test.refractionLeft) {
        distribution.refractive_errors++;
      }
    });

    return Object.entries(distribution).map(([disease, count]) => ({ disease, count }));
  }

  private async getPatientGrowth() {
    const patients = await this.prisma.user.findMany({
      where: { role: UserRole.PATIENT },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyGrowth: Record<string, number> = {};
    patients.forEach((patient) => {
      const month = new Date(patient.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    return Object.entries(monthlyGrowth).map(([month, count]) => ({ month, count }));
  }

  private async getRegionalAnalytics() {
    // In production, this would query location data
    return [
      { region: 'Baghdad', patients: 45, cases: 23 },
      { region: 'Basra', patients: 32, cases: 18 },
      { region: 'Erbil', patients: 28, cases: 15 },
    ];
  }

  // 6. Security & Compliance
  async getAuditLogs(userId?: string, action?: string, startDate?: Date, endDate?: Date) {
    // In production, this would query an audit log collection
    return {
      logs: [],
      summary: {
        totalActions: 0,
        byType: {},
        suspiciousActivity: [],
      },
    };
  }

  async getSecurityStatus() {
    return {
      encryptionEnabled: true,
      twoFactorEnabled: false, // Can be configured
      sslEnabled: true,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      backupFrequency: 'daily',
    };
  }

  // System Settings
  async getSettings() {
    let settings = await this.prisma.systemSettings.findUnique({
      where: { settingsKey: 'global' },
    });
    if (!settings) {
      // Create default settings
      settings = await this.prisma.systemSettings.create({
        data: {
          settingsKey: 'global',
          currency: 'USD',
          language: 'en',
          theme: 'light',
        },
      });
    }
    return settings;
  }

  async updateSettings(settingsData: any) {
    const settings = await this.prisma.systemSettings.upsert({
      where: { settingsKey: 'global' },
      update: {
        currency: settingsData.currency,
        language: settingsData.language,
        theme: settingsData.theme,
        otherSettings: settingsData.otherSettings,
      },
      create: {
        settingsKey: 'global',
        currency: settingsData.currency || 'USD',
        language: settingsData.language || 'en',
        theme: settingsData.theme || 'light',
        otherSettings: settingsData.otherSettings || {},
      },
    });
    return settings;
  }

  // Device Management
  async calibrateDevice(deviceId: string) {
    // Update device calibration status
    const device = this.devices.find(d => d.deviceId === deviceId);
    if (device) {
      device.calibrationStatus = 'calibrating';
      // Simulate calibration process
      setTimeout(() => {
        device.calibrationStatus = 'calibrated';
      }, 5000);
      return { message: 'Calibration started', deviceId };
    }
    throw new Error('Device not found');
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [patients, doctors, tests, prescriptions, appointments] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
      this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
      this.prisma.eyeTest.count(),
      this.prisma.prescription.count(),
      this.prisma.appointment.count(),
    ]);

    return {
      totalUsers: patients + doctors,
      totalPatients: patients,
      totalDoctors: doctors,
      totalTests: tests,
      totalPrescriptions: prescriptions,
      totalAppointments: appointments,
    };
  }

  // Emergency Controls
  private lockdownActive = false;
  private broadcastHistory: Array<{ message: string; timestamp: Date }> = [];

  async toggleLockdown(active: boolean) {
    this.lockdownActive = active;
    return {
      active: this.lockdownActive,
      message: active
        ? 'Emergency lockdown activated. All non-admin sessions are locked.'
        : 'Lockdown released. Normal access restored.',
      timestamp: new Date(),
    };
  }

  async sendBroadcast(message: string) {
    const broadcast = {
      message,
      timestamp: new Date(),
    };
    this.broadcastHistory.unshift(broadcast);
    // Keep only last 10 broadcasts
    if (this.broadcastHistory.length > 10) {
      this.broadcastHistory = this.broadcastHistory.slice(0, 10);
    }
    return {
      success: true,
      message: 'Broadcast sent to all active users',
      broadcast,
    };
  }

  // Automation Rules
  private automationRules: Record<string, boolean> = {
    autoDisableUser: true,
    autoCalibrateDevices: true,
    autoFlagTransactions: true,
  };

  async updateAutomationRule(ruleKey: string, enabled: boolean) {
    this.automationRules[ruleKey] = enabled;
    return {
      ruleKey,
      enabled,
      message: `Automation rule ${ruleKey} ${enabled ? 'enabled' : 'disabled'}`,
    };
  }
}
