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
import { Label } from '@/components/ui/label';
import { SmartCaseManagement } from '@/components/smart-case-management';
import { ImageViewer } from '@/components/image-viewer';
import { SmartPrescription } from '@/components/smart-prescription';
import api from '@/lib/api';
import { 
  Users, 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Bell, 
  BarChart3, 
  Brain,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertCircle,
  Settings,
  Send,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const { theme, language, setTheme, setLanguage } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    if (!loading && !['doctor', 'admin'].includes(user?.role || '')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
      loadNotifications();
      loadAnalytics();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [casesRes, aptsRes] = await Promise.all([
        api.get('/cases/my-cases'),
        api.get('/doctors/appointments'),
      ]);
      setCases(casesRes.data || []);
      setAppointments(aptsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifsRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/analytics/doctor-performance');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      loadNotifications();
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handlePrescriptionSave = async (prescription: any) => {
    try {
      const res = await api.post('/prescriptions', {
        ...prescription,
        doctorId: user?.id,
      });
      toast({ title: 'Success', description: 'Prescription created successfully' });
      setShowPrescription(false);
      setSelectedPatient(null);
      loadData();
      
      // Automatically assign to pharmacy if glasses are included
      if (prescription.glasses && prescription.glasses.length > 0) {
        // You can add logic here to assign to a specific pharmacy
        toast({ title: 'Info', description: 'Prescription with glasses can be assigned to optical shop' });
      }
      
      return res.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create prescription',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCaseSelect = (caseData: any) => {
    setSelectedCase(caseData);
    setSelectedPatient(caseData.patientId);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Analytics data for charts
  const diseaseDistribution = analytics ? [
    { name: 'Normal', value: 45, color: '#10b981' },
    { name: 'Cataract', value: 25, color: '#f59e0b' },
    { name: 'Glaucoma', value: 15, color: '#ef4444' },
    { name: 'Diabetic Retinopathy', value: 15, color: '#8b5cf6' },
  ] : [];

  const performanceData = analytics ? [
    { name: 'Week 1', cases: 12, prescriptions: 15 },
    { name: 'Week 2', cases: 18, prescriptions: 20 },
    { name: 'Week 3', cases: 15, prescriptions: 18 },
    { name: 'Week 4', cases: 22, prescriptions: 25 },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Smart case management with AI-assisted diagnosis and treatment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="relative btn-modern"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-modern">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button onClick={() => setActiveTab('analytics')} className="btn-modern glow-primary">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Cases</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{cases.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {cases.filter((c: any) => c.priority === 'urgent' || c.priority === 'high').length} urgent
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-red-500/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{unreadCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agreement</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {analytics?.aiAgreementRate ? `${analytics.aiAgreementRate.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Diagnosis accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Recent alerts and updates</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
                    Mark All Read
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif: any) => (
                    <div
                      key={notif._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => markNotificationRead(notif._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={
                                notif.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : notif.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {notif.priority}
                            </Badge>
                            {!notif.isRead && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No notifications</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cases">Case Management</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="cases-view">Case Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Case Management Tab */}
          <TabsContent value="cases" className="space-y-4">
            <SmartCaseManagement 
              doctorId={user?.id || ''} 
              onCaseSelect={(caseData) => {
                handleCaseSelect(caseData);
                setActiveTab('cases-view');
              }}
            />
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Smart Prescription Management</CardTitle>
                  <CardDescription>Create prescriptions with AI suggestions and templates</CardDescription>
                </div>
                {!showPrescription && (
                  <Button onClick={() => setShowPrescription(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                  </Button>
                )}
              </div>
            </CardHeader>
              <CardContent>
                {showPrescription ? (
                  <SmartPrescription
                    patientId={selectedPatient?._id || selectedPatient}
                    diagnosis={selectedCase?.diagnosis}
                    onSave={handlePrescriptionSave}
                    allowPatientSelection={true}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">
                        Your prescriptions
                      </p>
                      <Button onClick={() => setShowPrescription(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Prescription
                      </Button>
                    </div>
                    {/* Show existing prescriptions */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        View prescriptions from Case Management or create a new one.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Performance</CardTitle>
                  <CardDescription>Your key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Cases Reviewed</p>
                        <p className="text-2xl font-bold">{analytics.casesReviewed || 0}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Prescriptions</p>
                        <p className="text-2xl font-bold">{analytics.prescriptions || 0}</p>
                      </div>
                      <div className="p-4 bg-accent/10 dark:bg-accent/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                        <p className="text-2xl font-bold">
                          {analytics.avgResponseTime ? `${analytics.avgResponseTime.toFixed(1)} min` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading analytics...</p>
                  )}
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Disease Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {diseaseDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color || `hsl(${168.4 + index * 10} 83.8% ${78.2 + index * 2}%)`}
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(168.4 83.8% 65% / 30%)" />
                        <XAxis dataKey="name" stroke="hsl(168.4 83.8% 65%)" tick={{ fill: 'hsl(168.4 83.8% 65%)' }} />
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
                        <Legend wrapperStyle={{ color: 'hsl(168.4 83.8% 65%)' }} />
                        <Line 
                          type="monotone" 
                          dataKey="cases" 
                          stroke="hsl(168.4 90% 75%)" 
                          strokeWidth={3}
                          name="Cases"
                          dot={{ r: 5, fill: 'hsl(168.4 90% 75%)' }}
                          activeDot={{ r: 8 }}
                          animationDuration={1000}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prescriptions" 
                          stroke="hsl(168.4 83.8% 65%)" 
                          strokeWidth={3}
                          name="Prescriptions"
                          dot={{ r: 5, fill: 'hsl(168.4 83.8% 65%)' }}
                          activeDot={{ r: 8 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* AI Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>AI vs Doctor Diagnosis</CardTitle>
                  <CardDescription>Comparison of AI recommendations vs your diagnoses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">AI Agreement Rate</p>
                        <p className="text-3xl font-bold text-accent">
                          {analytics?.aiAgreementRate ? `${analytics.aiAgreementRate.toFixed(1)}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Your diagnoses align with AI recommendations
                        </p>
                      </div>
                      <Brain className="h-16 w-16 text-accent/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Case Details View */}
          <TabsContent value="cases-view" className="space-y-4">
            {selectedCase ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Case Overview */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Overview</CardTitle>
                      <CardDescription>Complete case information and timeline</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Patient Information</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium">
                            {selectedCase.patientId?.firstName} {selectedCase.patientId?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedCase.patientId?.email}</p>
                          <p className="text-sm text-muted-foreground">{selectedCase.patientId?.phone}</p>
                        </div>
                      </div>

                      {selectedCase.aiInsights && (
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            AI Insights
                          </h3>
                          <div className="p-4 bg-accent/10 dark:bg-accent/20 rounded-lg border border-accent/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Urgency Score:</span>
                              <Badge className="bg-accent text-accent-foreground">{selectedCase.aiInsights.urgency}%</Badge>
                            </div>
                            {selectedCase.aiInsights.riskFactors.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Risk Factors:</p>
                                <ul className="text-sm list-disc list-inside text-red-600">
                                  {selectedCase.aiInsights.riskFactors.map((risk: string, i: number) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedCase.aiInsights.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Recommendations:</p>
                                <ul className="text-sm list-disc list-inside">
                                  {selectedCase.aiInsights.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div>
                        <h3 className="font-medium mb-3">Case Timeline</h3>
                        <div className="space-y-3">
                          {selectedCase.timeline && selectedCase.timeline.length > 0 ? (
                            selectedCase.timeline.map((entry: any, index: number) => (
                              <div key={index} className="flex gap-3 border-l-2 border-primary pl-4">
                                <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full -ml-[19px] mt-2" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{entry.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No timeline entries</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedPatient(selectedCase.patientId);
                          setShowPrescription(true);
                          setActiveTab('prescriptions');
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Prescription
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push(`/dashboard/patient/chat?patientId=${selectedCase.patientId?._id}`);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat with Patient
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push(`/dashboard/doctor/appointments?patientId=${selectedCase.patientId?._id}`);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Follow-up
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Image Viewer */}
                  {selectedCase.eyeTestId?.retinaImages && 
                   selectedCase.eyeTestId.retinaImages.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Retina Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageViewer
                          images={selectedCase.eyeTestId.retinaImages}
                          showHeatmap={true}
                          heatmapData={[
                            { x: 30, y: 40, intensity: 0.7 },
                            { x: 60, y: 50, intensity: 0.5 },
                            { x: 45, y: 35, intensity: 0.6 },
                          ]}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a case from Case Management to view details
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('cases')}>
                    View Cases
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Settings</CardTitle>
                <CardDescription>Configure preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Language</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm mt-2"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                  </select>
                </div>
                <div>
                  <Label>Theme</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm mt-2"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <Button 
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await api.put('/admin/settings', { language, theme });
                      toast({ title: 'Success', description: 'Settings saved successfully' });
                    } catch (error: any) {
                      toast({
                        title: 'Error',
                        description: error.response?.data?.message || 'Failed to save settings',
                        variant: 'destructive',
                      });
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
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
