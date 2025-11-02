'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { 
  Users, 
  Eye, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Monitor,
  Bell,
  FileText,
  Globe,
  Lock,
  Database,
  Zap,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { theme, language, currency, setTheme, setLanguage, setCurrency } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState<any>(null);
  const [billingAnalytics, setBillingAnalytics] = useState<any>(null);
  const [appointmentAnalytics, setAppointmentAnalytics] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      const [
        analyticsRes,
        usersRes,
        devicesRes,
        alertsRes,
        comprehensiveRes,
        billingRes,
        appointmentRes,
        securityRes,
      ] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users/activity'),
        api.get('/admin/devices'),
        api.get('/admin/devices/alerts'),
        api.get('/admin/analytics/comprehensive'),
        api.get('/admin/billing/analytics'),
        api.get('/admin/appointments/analytics'),
        api.get('/admin/security/status'),
      ]);
      
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data || []);
      setDevices(devicesRes.data || []);
      setDeviceAlerts(alertsRes.data || []);
      setComprehensiveAnalytics(comprehensiveRes.data);
      setBillingAnalytics(billingRes.data);
      setAppointmentAnalytics(appointmentRes.data);
      setSecurityStatus(securityRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/revoke-access`);
      toast({ title: 'Success', description: 'User access revoked' });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to revoke access',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast({ title: 'Success', description: 'User role updated' });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast({ title: 'Success', description: 'User deleted successfully' });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/admin/settings', {
        currency,
        language,
        theme,
      });
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    // Save immediately
    api.put('/admin/settings', {
      currency,
      language,
      theme: newTheme,
    }).catch(() => {
      // Silently fail
    });
  };

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
    // Save immediately
    api.put('/admin/settings', {
      currency,
      language: newLanguage,
      theme,
    }).catch(() => {
      // Silently fail
    });
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Save immediately
    api.put('/admin/settings', {
      currency: newCurrency,
      language,
      theme,
    }).catch(() => {
      // Silently fail
    });
  };

  const handleDeviceCalibrate = async (deviceId: string) => {
    try {
      await api.post(`/admin/devices/${deviceId}/calibrate`);
      toast({
        title: 'Success',
        description: 'Calibration started for device',
      });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start calibration',
        variant: 'destructive',
      });
    }
  };

  const handleViewDeviceLogs = (deviceId: string) => {
    toast({
      title: 'Device Logs',
      description: `Viewing logs for device ${deviceId}. Logs will be displayed here.`,
    });
    // In production, this would open a modal or navigate to logs page
  };

  const handleExportLogs = async () => {
    try {
      const res = await api.get('/admin/security/audit-logs', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Success',
        description: 'Audit logs exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export logs',
        variant: 'destructive',
      });
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = !searchTerm || 
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Chart data
  const diseaseDistribution = comprehensiveAnalytics?.diseaseDistribution || [];
  const patientGrowth = comprehensiveAnalytics?.patientGrowth || [];
  const appointmentByDay = appointmentAnalytics?.byDay || [];
  const billingByDay = billingAnalytics?.byDay || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete system management and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setActiveTab('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comprehensiveAnalytics?.overview?.totalPatients || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{patientGrowth[patientGrowth.length - 1]?.count || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comprehensiveAnalytics?.overview?.activeDoctors || 0}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Est.)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${billingAnalytics?.revenue?.total?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {billingAnalytics?.currency || 'USD'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Device Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{deviceAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users & RBAC</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Overall system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Status</span>
                    <Badge className={securityStatus?.encryptionEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityStatus?.encryptionEnabled ? 'Secure' : 'Insecure'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">
                      {securityStatus?.lastBackup ? new Date(securityStatus.lastBackup).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Frequency</span>
                    <Badge variant="outline">{securityStatus?.backupFrequency || 'Not set'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2FA Enabled</span>
                    <Badge className={securityStatus?.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {securityStatus?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Device Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Status</CardTitle>
                  <CardDescription>Connected diagnostic devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Devices</span>
                    <span className="font-bold">{devices.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Online</span>
                    <Badge className="bg-green-100 text-green-800">
                      {devices.filter((d: any) => d.status === 'online').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Offline</span>
                    <Badge className="bg-red-100 text-red-800">
                      {devices.filter((d: any) => d.status === 'offline').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Needs Calibration</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {devices.filter((d: any) => d.calibrationStatus === 'needs_calibration').length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            {deviceAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Device Alerts
                  </CardTitle>
                  <CardDescription>Recent device issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deviceAlerts.slice(0, 5).map((alert: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alert.deviceName}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                          <Badge 
                            className={
                              alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users & RBAC Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User & Role Management</CardTitle>
                    <CardDescription>Manage users, roles, and permissions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="analyst">Analyst</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => (
                      <div key={u._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{u.role}</Badge>
                              <Badge className={u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {u.failedLoginAttempts > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {u.failedLoginAttempts} failed logins
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            {u.lastLogin && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last login: {new Date(u.lastLogin).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                              <option value="analyst">Analyst</option>
                              <option value="pharmacy">Pharmacy</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeAccess(u._id)}
                            >
                              Revoke Access
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>IoT Device Dashboard</CardTitle>
                <CardDescription>Monitor diagnostic devices in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device: any) => (
                    <Card key={device.deviceId}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                className={
                                  device.status === 'online' ? 'bg-green-100 text-green-800' :
                                  device.status === 'offline' ? 'bg-red-100 text-red-800' :
                                  device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {device.status}
                              </Badge>
                              <Badge 
                                className={
                                  device.calibrationStatus === 'calibrated' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {device.calibrationStatus === 'calibrated' ? 'Calibrated' : 'Needs Calibration'}
                              </Badge>
                            </div>
                            <p className="font-medium">{device.deviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {device.deviceType} • Location: {device.location}
                            </p>
                            {device.lastDataSync && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last sync: {new Date(device.lastDataSync).toLocaleString()}
                              </p>
                            )}
                            {device.firmwareVersion && (
                              <p className="text-xs text-muted-foreground">
                                Firmware: {device.firmwareVersion}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeviceCalibrate(device.deviceId)}
                              disabled={device.status === 'offline'}
                            >
                              Calibrate
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDeviceLogs(device.deviceId)}
                            >
                              View Logs
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {devices.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No devices registered</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-bold">{appointmentAnalytics?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled</span>
                      <Badge className="bg-blue-100 text-blue-800">{appointmentAnalytics?.scheduled || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <Badge className="bg-green-100 text-green-800">{appointmentAnalytics?.completed || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled</span>
                      <Badge className="bg-red-100 text-red-800">{appointmentAnalytics?.cancelled || 0}</Badge>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between mb-2">
                        <span>Avg Wait Time</span>
                        <span className="font-bold">{appointmentAnalytics?.avgWaitTime || 0} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Predicted Wait</span>
                        <span className="font-bold text-blue-600">{appointmentAnalytics?.predictedWaitTime || 0} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Day</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={appointmentByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(168.4 83.8% 65% / 30%)" />
                        <XAxis dataKey="date" stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                        <YAxis stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(175.9 55% 22%)', 
                            border: '1px solid hsl(168.4 83.8% 65% / 40%)',
                            color: 'hsl(168.4 83.8% 65%)',
                            borderRadius: '8px'
                          }}
                          cursor={{ stroke: 'hsl(168.4 83.8% 65%)', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="hsl(168.4 90% 75%)" 
                          strokeWidth={3}
                          name="Appointments"
                          dot={{ r: 5, fill: 'hsl(168.4 90% 75%)' }}
                          activeDot={{ r: 8 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${billingAnalytics?.revenue?.total?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>From Prescriptions</span>
                      <span>${billingAnalytics?.revenue?.prescriptions?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>From Appointments</span>
                      <span>${billingAnalytics?.revenue?.appointments?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span>Pending Invoices</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {billingAnalytics?.pendingInvoices || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span>Paid Invoices</span>
                        <Badge className="bg-green-100 text-green-800">
                          {billingAnalytics?.paidInvoices || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {billingAnalytics?.fraudAlerts && billingAnalytics.fraudAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Fraud Detection Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {billingAnalytics.fraudAlerts.map((alert: any, index: number) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-medium text-sm">{alert.type}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <Badge className="mt-1" variant="destructive">
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {billingByDay.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={billingByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(168.4 83.8% 65% / 30%)" />
                      <XAxis dataKey="date" stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                      <YAxis stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(175.9 55% 22%)', 
                          border: '1px solid hsl(168.4 83.8% 65% / 40%)',
                          color: 'hsl(168.4 83.8% 65%)',
                          borderRadius: '8px'
                        }}
                        cursor={{ fill: 'hsl(168.4 83.8% 65% / 10%)' }}
                      />
                      <Legend wrapperStyle={{ color: 'hsl(168.4 83.8% 65%)' }} />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(168.4 90% 75%)" 
                        name="Revenue ($)"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Disease Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {diseaseDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={diseaseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(168.4 83.8% 78.2%)"
                          dataKey="count"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {diseaseDistribution.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(${168.4 + index * 10} 83.8% ${78.2 + index * 2}%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(175.9 55% 22%)', 
                            border: '1px solid hsl(168.4 83.8% 65% / 40%)',
                            color: 'hsl(168.4 83.8% 65%)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={patientGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(168.4 83.8% 65% / 30%)" />
                        <XAxis dataKey="month" stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                        <YAxis stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(175.9 55% 22%)', 
                            border: '1px solid hsl(168.4 83.8% 65% / 40%)',
                            color: 'hsl(168.4 83.8% 65%)',
                            borderRadius: '8px'
                          }}
                          cursor={{ stroke: 'hsl(168.4 83.8% 65%)', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="hsl(168.4 90% 75%)" 
                          strokeWidth={3}
                          name="New Patients"
                          dot={{ r: 5, fill: 'hsl(168.4 90% 75%)' }}
                          activeDot={{ r: 8 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Predictions */}
            {comprehensiveAnalytics?.predictions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    AI Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Expected Patients Next Month</p>
                      <p className="text-2xl font-bold">{comprehensiveAnalytics.predictions.expectedPatientsNextMonth}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Peak Hours</p>
                      <div className="flex flex-wrap gap-1">
                        {comprehensiveAnalytics.predictions.peakHours.map((hour: string) => (
                          <Badge key={hour} variant="outline">{hour}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Expected Revenue</p>
                      <p className="text-2xl font-bold">${comprehensiveAnalytics.predictions.expectedRevenue?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Encryption</span>
                    </div>
                    <Badge className={securityStatus?.encryptionEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityStatus?.encryptionEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>2FA</span>
                    </div>
                    <Badge className={securityStatus?.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {securityStatus?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>SSL</span>
                    </div>
                    <Badge className={securityStatus?.sslEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityStatus?.sslEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Last Backup</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {securityStatus?.lastBackup ? new Date(securityStatus.lastBackup).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Backup Frequency</span>
                    </div>
                    <Badge variant="outline">{securityStatus?.backupFrequency || 'Not set'}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Recent system activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Audit logging is active. View detailed logs in the audit service.
                  </p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={handleExportLogs}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (ع.د)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'ar')}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Changes apply immediately. Use "Save Settings" to persist to backend.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
