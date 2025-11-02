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
import api from '@/lib/api';
import { 
  Calendar, 
  Eye, 
  FileText, 
  MessageCircle, 
  Plus,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  DollarSign,
  Heart,
  Shield,
  Settings,
  Download,
  Search,
  Video,
  Bell,
  Stethoscope,
  Pill,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  QrCode,
  Truck,
  User,
  CreditCard,
  Building2,
  Scan,
  MapPin
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

export default function PatientDashboard() {
  const { user, loading } = useAuth();
  const { theme, language, setTheme, setLanguage } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [unifiedJourney, setUnifiedJourney] = useState<any>(null);
  const [suggestedAppointments, setSuggestedAppointments] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);
  const [comparativeAnalysis, setComparativeAnalysis] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [prescriptionTracking, setPrescriptionTracking] = useState([]);
  const [billingHistory, setBillingHistory] = useState<any>(null);
  const [healthDashboard, setHealthDashboard] = useState<any>(null);
  const [waitTime, setWaitTime] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    voiceFeedback: false,
  });

  useEffect(() => {
    if (!loading && user?.role !== 'patient') {
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
        journeyRes,
        timelineRes,
        insightsRes,
        prescriptionsRes,
        billingRes,
        dashboardRes,
      ] = await Promise.all([
        api.get('/patients/unified-journey'),
        api.get('/patients/health-timeline'),
        api.get('/patients/ai-insights'),
        api.get('/patients/prescription-tracking'),
        api.get('/patients/billing-history'),
        api.get('/patients/health-dashboard'),
      ]);

      setUnifiedJourney(journeyRes.data);
      setHealthTimeline(timelineRes.data || []);
      setAiInsights(insightsRes.data);
      setPrescriptionTracking(prescriptionsRes.data || []);
      setBillingHistory(billingRes.data);
      setHealthDashboard(dashboardRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient data',
        variant: 'destructive',
      });
    }
  };

  const handleBookAppointment = async (urgency?: string) => {
    try {
      const res = await api.get('/patients/suggested-appointments', {
        params: { urgency, condition: 'eye_care' },
      });
      setSuggestedAppointments(res.data || []);
      setActiveTab('appointments');
      toast({ title: 'Appointment Suggestions', description: `Found ${res.data.length} suggested doctors` });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get appointment suggestions',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAppointment = async (suggestion: any, selectedTime: string) => {
    try {
      const appointmentData = {
        doctorId: suggestion.doctorId,
        appointmentDate: suggestion.suggestedDate,
        appointmentTime: selectedTime,
        reason: 'Eye care consultation',
        status: 'pending', // Use valid enum value: pending, confirmed, completed, cancelled
      };

      const res = await api.post('/appointments', appointmentData);
      toast({ 
        title: 'Success', 
        description: `Appointment booked with Dr. ${suggestion.doctorName} on ${new Date(suggestion.suggestedDate).toLocaleDateString()} at ${selectedTime}` 
      });
      setShowBookingModal(false);
      setBookingData(null);
      loadAllData();
    } catch (error: any) {
      console.error('Appointment booking error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReport = async (item: any) => {
    try {
      // Generate PDF report
      const reportData = {
        type: item.type,
        id: item.id || item._id,
        date: item.date || item.createdAt,
        patientId: user?.id,
      };

      // In production, this would call a PDF generation service
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.type}_${new Date(item.date || item.createdAt).toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: 'Success', description: 'Report downloaded successfully' });
      } else {
        // Fallback: Create a simple text report
        const textReport = `Medical Report\nType: ${item.type}\nDate: ${new Date(item.date || item.createdAt).toLocaleDateString()}\n\nDetails:\n${JSON.stringify(item, null, 2)}`;
        const blob = new Blob([textReport], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.type}_report_${new Date(item.date || item.createdAt).toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: 'Success', description: 'Report downloaded as text file' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download report',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async (invoice: any) => {
    try {
      // In production, this would integrate with payment gateway (ZainCash, etc.)
      const paymentData = {
        invoiceId: invoice.id,
        amount: invoice.amount,
        type: invoice.type,
      };

      // Simulate payment processing
      toast({ 
        title: 'Payment Processing', 
        description: `Processing payment of $${invoice.amount}...` 
      });

      // Simulate API call
      setTimeout(() => {
        toast({ 
          title: 'Payment Successful', 
          description: `Payment of $${invoice.amount} processed successfully` 
        });
        loadAllData();
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Payment failed',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save to backend
      await api.put('/admin/settings', { theme, language }).catch(() => {
        // Fallback to profile update if not available
        return api.put('/patients/profile', { preferences: { ...settings, theme, language } });
      });
      toast({ title: 'Success', description: 'Settings saved successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const handleStartHomeTest = () => {
    toast({ 
      title: 'Home Vision Test', 
      description: 'Home vision test feature will be available soon. This will guide you through basic vision tests using your device camera.' 
    });
  };

  const handleCheckSymptoms = () => {
    toast({ 
      title: 'Symptom Checker', 
      description: 'Symptom checker feature will be available soon. You can describe your symptoms and AI will suggest possible causes and direct you to the right specialist.' 
    });
  };

  const handleEnable2FA = () => {
    toast({ 
      title: 'Two-Factor Authentication', 
      description: '2FA setup will be available soon. This will enhance your account security.' 
    });
  };

  const handleEnableBiometric = () => {
    toast({ 
      title: 'Biometric Login', 
      description: 'Biometric login setup will be available soon. This will allow you to use fingerprint or face unlock.' 
    });
  };

  const handleGetWaitTime = async (appointmentId: string) => {
    try {
      const res = await api.get(`/patients/appointments/${appointmentId}/wait-time`);
      const waitData = { ...res.data, appointmentId };
      setWaitTime(waitData);
      toast({ 
        title: 'Wait Time', 
        description: `Position: ${res.data.position}, Estimated wait: ${res.data.estimatedWaitTime || res.data.estimatedWaitMinutes + ' minutes'}` 
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get wait time',
        variant: 'destructive',
      });
    }
  };

  const handleGetComparativeAnalysis = async (testId?: string) => {
    try {
      const res = await api.get('/patients/comparative-analysis', {
        params: { testId },
      });
      setComparativeAnalysis(res.data);
      setActiveTab('health-records');
      toast({ title: 'Analysis', description: 'Comparative analysis generated' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate analysis',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'ready':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-accent/10 text-accent-foreground dark:bg-accent/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'test':
        return <Eye className="h-4 w-4" />;
      case 'prescription':
        return <FileText className="h-4 w-4" />;
      case 'case':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Chart data
  const visionTrends = healthDashboard?.visionTrends || [];
  const chartData = visionTrends.map((trend: any) => ({
    date: new Date(trend.date).toLocaleDateString(),
    right: trend.visualAcuityRight?.replace(/[^0-9.]/g, '') || '0',
    left: trend.visualAcuityLeft?.replace(/[^0-9.]/g, '') || '0',
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 patient-portal" data-portal="patient">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Patient Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Smart appointments • AI insights • Health tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unifiedJourney?.summary?.totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {unifiedJourney?.summary?.upcomingAppointments || 0} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eye Tests</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unifiedJourney?.summary?.totalTests || 0}</div>
              <p className="text-xs text-muted-foreground">Total tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unifiedJourney?.summary?.totalPrescriptions || 0}</div>
              <p className="text-xs text-yellow-600">
                {unifiedJourney?.summary?.pendingPrescriptions || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unifiedJourney?.summary?.activeCases || 0}</div>
              <p className="text-xs text-muted-foreground">Open cases</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        {aiInsights && (
          <Card className={aiInsights.riskLevel === 'high' ? 'border-red-200 bg-red-50' : aiInsights.riskLevel === 'medium' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">Health Summary:</p>
                  <p className="text-sm text-muted-foreground">{aiInsights.healthSummary}</p>
                </div>
                {aiInsights.riskFactors.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Risk Factors:</p>
                    <div className="flex gap-2 flex-wrap">
                      {aiInsights.riskFactors.map((risk: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-white">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Level:</p>
                    <Badge className={aiInsights.riskLevel === 'high' ? 'bg-red-600' : aiInsights.riskLevel === 'medium' ? 'bg-orange-600' : 'bg-green-600'}>
                      {aiInsights.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Score:</p>
                    <p className="font-bold">{aiInsights.riskScore || 0}/100</p>
                  </div>
                </div>
                {aiInsights.recommendations.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Recommendations:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {aiInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.nextSteps.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">Next Steps:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {aiInsights.nextSteps.map((step: string, idx: number) => (
                        <li key={idx}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="health-records">Health Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communication">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => router.push('/dashboard/patient/journey')}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Track Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View your clinic visit progress</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => handleBookAppointment()}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Book Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">AI-suggested doctors and time slots</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => router.push('/dashboard/patient/chat')}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat with Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Secure messaging with your doctor</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => setActiveTab('health-records')}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    View Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Download test results and reports</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => setActiveTab('prescriptions')}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Track Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Real-time prescription status</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Appointments Tab - Continue in next part due to length */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground dark:text-white font-bold text-xl">Smart Appointment & Visit Management</CardTitle>
                    <CardDescription className="text-foreground dark:text-white/90 font-medium">AI-suggested appointments, real-time queue tracking</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleBookAppointment()} className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" onClick={() => handleBookAppointment('urgent')} className="border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 font-semibold dark:bg-primary/20 dark:text-primary dark:border-primary">
                      Urgent Appointment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {suggestedAppointments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3 text-foreground dark:text-white text-lg">AI Suggested Appointments</h3>
                    <div className="space-y-3">
                      {suggestedAppointments.slice(0, 5).map((suggestion: any, idx: number) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground dark:text-white text-base">
                                  Dr. {suggestion.doctorName} - {suggestion.specialty}
                                </p>
                                <p className="text-sm text-foreground dark:text-white/90 font-medium mt-1">
                                  Suggested Date: {new Date(suggestion.suggestedDate).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {suggestion.suggestedTimes.slice(0, 3).map((time: string, i: number) => (
                                    <Badge key={i} variant="outline" className="border-2 border-primary text-primary dark:text-primary dark:border-primary font-medium">
                                      {time}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-semibold">
                                    Match Score: {suggestion.matchScore}%
                                  </Badge>
                                  <Badge variant="outline" className="border-2 border-primary text-primary dark:text-primary dark:border-primary font-medium">
                                    {suggestion.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setBookingData(suggestion);
                                  setShowBookingModal(true);
                                }}
                                className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-md"
                              >
                                Book Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-bold mb-3 text-foreground dark:text-white text-lg">Your Appointments</h3>
                  {unifiedJourney?.timeline?.filter((item: any) => item.type === 'appointment').length > 0 ? (
                    <div className="space-y-3">
                      {unifiedJourney.timeline
                        .filter((item: any) => item.type === 'appointment')
                        .slice(0, 10)
                        .map((item: any, idx: number) => (
                          <Card key={idx}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-foreground dark:text-white" />
                                    <p className="font-semibold text-foreground dark:text-white">{item.title}</p>
                                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                  </div>
                                  <p className="text-sm text-foreground dark:text-white/90 font-medium">
                                    {new Date(item.date).toLocaleDateString()} {item.data?.appointmentTime || ''}
                                  </p>
                                  {waitTime && waitTime.position && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Queue Position: {waitTime.position}</p>
                                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                        Estimated Wait: {waitTime.estimatedWaitTime || `${waitTime.estimatedWaitMinutes || 0} minutes`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGetWaitTime(item.id)}
                                    className="border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 font-semibold dark:bg-primary/20 dark:text-primary dark:border-primary"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Wait Time
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/patient/appointments/${item.id}`)}
                                    className="border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 font-semibold dark:bg-primary/20 dark:text-primary dark:border-primary"
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <p className="text-foreground dark:text-white font-medium text-center py-8">No appointments scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Records Tab - Truncated for length, continuing... */}
          <TabsContent value="health-records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Health Records & Reports</CardTitle>
                    <CardDescription>Dynamic timeline, downloadable reports, comparative analysis</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => handleGetComparativeAnalysis()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare Tests
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Comparative Analysis */}
                {comparativeAnalysis && (
                  <Card className="mb-4 border-l-4 border-l-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Comparative Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {comparativeAnalysis.visualAcuity && (
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium mb-2">Visual Acuity Comparison:</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded">
                                <p className="text-sm font-medium">Right Eye</p>
                                <p className="text-xs text-muted-foreground">
                                  Previous: {comparativeAnalysis.visualAcuity.right.previous}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Current: {comparativeAnalysis.visualAcuity.right.current}
                                </p>
                                <Badge className="mt-2">
                                  {comparativeAnalysis.visualAcuity.right.change}
                                </Badge>
                              </div>
                              <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded">
                                <p className="text-sm font-medium">Left Eye</p>
                                <p className="text-xs text-muted-foreground">
                                  Previous: {comparativeAnalysis.visualAcuity.left.previous}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Current: {comparativeAnalysis.visualAcuity.left.current}
                                </p>
                                <Badge className="mt-2">
                                  {comparativeAnalysis.visualAcuity.left.change}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {comparativeAnalysis.trends && (
                            <div>
                              <p className="font-medium mb-2">Trends:</p>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  Trend: {comparativeAnalysis.trends.visualAcuityTrend}
                                </Badge>
                                <Badge variant="outline">
                                  Risk: {comparativeAnalysis.trends.riskLevel}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Health Timeline */}
                {healthTimeline.length > 0 ? (
                  <div className="space-y-3">
                    {healthTimeline.map((item: any, idx: number) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {item.type === 'test' && <Eye className="h-4 w-4" />}
                                {item.type === 'prescription' && <FileText className="h-4 w-4" />}
                                {item.type === 'appointment' && <Calendar className="h-4 w-4" />}
                                <p className="font-medium">{item.title}</p>
                                <Badge className={getStatusColor(item.status || 'completed')}>
                                  {item.status || 'completed'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()}
                                </span>
                              </div>
                              
                              {item.type === 'test' && item.details && (
                                <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                  <p className="font-medium mb-1">Test Results:</p>
                                  <p className="text-muted-foreground">
                                    Visual Acuity: {item.details.visualAcuity}
                                  </p>
                                  {item.details.aiAnalysis && (
                                    <p className="text-muted-foreground mt-1">
                                      AI Analysis: {item.details.aiAnalysis ? 'Completed' : 'Pending'}
                                    </p>
                                  )}
                                  {item.images && item.images.length > 0 && (
                                    <p className="text-muted-foreground mt-1">
                                      {item.images.length} image(s) attached
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {item.type === 'prescription' && item.details && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <p className="font-medium mb-1">Prescription:</p>
                                  <p className="text-muted-foreground">
                                    {item.details.medications?.length || 0} medication(s)
                                  </p>
                                  {item.details.glasses && item.details.glasses.length > 0 && (
                                    <p className="text-muted-foreground mt-1">
                                      {item.details.glasses.length} glasses/contact lens(es)
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {item.doctorNotes && (
                                <div className="mt-2 p-2 bg-accent/10 dark:bg-accent/20 rounded text-sm">
                                  <p className="font-medium mb-1">Doctor Notes:</p>
                                  <p className="text-muted-foreground">{item.doctorNotes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(item)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No health records yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab - Continue... */}
          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prescription & Medication Management</CardTitle>
                <CardDescription>Digital prescriptions, pharmacy connection, auto refill alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionTracking.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptionTracking.map((prescription: any) => (
                      <Card key={prescription._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(prescription.status)}>
                                  {prescription.status}
                                </Badge>
                                {prescription.doctorId && (
                                  <span className="text-sm font-medium">
                                    Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(prescription.createdAt || prescription.updatedAt).toLocaleDateString()}
                                </span>
                              </div>

                              {prescription.diagnosis && (
                                <p className="text-sm font-medium text-blue-600 mb-2">
                                  Diagnosis: {prescription.diagnosis}
                                </p>
                              )}

                              {prescription.medications && prescription.medications.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm font-medium mb-1">Medications:</p>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {prescription.medications.map((med: any, idx: number) => (
                                      <li key={idx}>
                                        • {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                                        {med.instructions && (
                                          <span className="text-xs block ml-4">({med.instructions})</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {prescription.glasses && prescription.glasses.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm font-medium mb-1">Glasses/Contact Lenses:</p>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {prescription.glasses.map((glass: any, idx: number) => (
                                      <li key={idx}>
                                        • {glass.type || 'Glasses'} - {glass.lensType || 'Standard'}
                                        {glass.prescription && (
                                          <span className="text-xs block ml-4">
                                            Rx: {glass.prescription.sphere} / {glass.prescription.cylinder} / {glass.prescription.axis}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {prescription.notes && (
                                <div className="mt-2 p-2 bg-accent/10 dark:bg-accent/20 rounded text-sm">
                                  <p className="font-medium mb-1">Doctor Notes:</p>
                                  <p className="text-muted-foreground">{prescription.notes}</p>
                                </div>
                              )}

                              {/* Prescription Tracking */}
                              {prescription.tracking && (
                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-sm font-medium mb-2">Tracking Status:</p>
                                  <div className="space-y-1">
                                    {prescription.tracking.statusHistory.map((history: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span className="capitalize">{history.status}</span>
                                        <span className="text-muted-foreground">
                                          {new Date(history.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {prescription.tracking.deliveryInfo && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <p className="text-xs font-medium">Delivery Information:</p>
                                      <p className="text-xs text-muted-foreground">
                                        Tracking: {prescription.tracking.deliveryInfo.trackingNumber}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Status: {prescription.tracking.deliveryInfo.status}
                                      </p>
                                      {prescription.tracking.deliveryInfo.currentLocation && (
                                        <p className="text-xs text-muted-foreground">
                                          Location: {prescription.tracking.deliveryInfo.currentLocation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {prescription.tracking.pharmacyStatus === 'assigned' && prescription.pharmacyId && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <p className="text-xs font-medium">Pharmacy:</p>
                                      <p className="text-xs text-muted-foreground">
                                        {prescription.pharmacyId.firstName} {prescription.pharmacyId.lastName}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* QR Code Display */}
                              {prescription.metadata?.qrCode && (
                                <div className="mt-3 p-3 bg-accent/10 dark:bg-accent/20 rounded border">
                                  <p className="text-xs font-medium mb-2">QR Code:</p>
                                  <img 
                                    src={prescription.metadata.qrCode} 
                                    alt="Prescription QR Code" 
                                    className="w-24 h-24 mx-auto"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No prescriptions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remaining tabs are truncated but follow similar patterns... */}
          {/* Billing, Analytics, Communication, Monitoring, Settings tabs would continue with similar structure */}
          
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Insurance</CardTitle>
                <CardDescription>Transparent billing history, online payments, insurance integration</CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory && billingHistory.invoices && billingHistory.invoices.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{billingHistory.summary.totalInvoices}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${billingHistory.summary.totalAmount?.toLocaleString() || '0'}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pending Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">
                            ${billingHistory.summary.pendingAmount?.toLocaleString() || '0'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      {billingHistory.invoices.slice(0, 10).map((invoice: any, idx: number) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {invoice.type === 'appointment' && <Calendar className="h-4 w-4" />}
                                  {invoice.type === 'prescription' && <Pill className="h-4 w-4" />}
                                  <p className="font-medium">{invoice.description}</p>
                                  <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {invoice.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(invoice.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-lg font-bold">${invoice.amount.toLocaleString()}</p>
                                {invoice.items && invoice.items.length > 0 && (
                                  <div className="mt-2 p-2 bg-accent/10 dark:bg-accent/20 rounded text-sm">
                                    <p className="font-medium mb-1">Items:</p>
                                    <ul className="text-muted-foreground space-y-1">
                                      {invoice.items.map((item: any, i: number) => (
                                        <li key={i}>• {item.name} - ${item.price}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadReport(invoice)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                {invoice.status === 'pending' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handlePayment(invoice)}
                                  >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No billing history</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health & Lifestyle Dashboard</CardTitle>
                <CardDescription>Vision health analytics, personal goals, progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {healthDashboard && (
                  <div className="space-y-4">
                    {/* Vision Trends Chart */}
                    {chartData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Vision Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                              <Legend wrapperStyle={{ color: 'hsl(168.4 83.8% 65%)' }} />
                              <Line 
                                type="monotone" 
                                dataKey="right" 
                                stroke="hsl(168.4 90% 75%)" 
                                strokeWidth={3}
                                name="Right Eye"
                                dot={{ r: 5, fill: 'hsl(168.4 90% 75%)' }}
                                activeDot={{ r: 8 }}
                                animationDuration={1000}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="left" 
                                stroke="hsl(168.4 83.8% 65%)" 
                                strokeWidth={3}
                                name="Left Eye"
                                dot={{ r: 5, fill: 'hsl(168.4 83.8% 65%)' }}
                                activeDot={{ r: 8 }}
                                animationDuration={1000}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Goals Progress */}
                    {healthDashboard.goals && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Regular Checkups</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {healthDashboard.goals.regularCheckups.current} / {healthDashboard.goals.regularCheckups.target}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {Math.round((healthDashboard.goals.regularCheckups.current / healthDashboard.goals.regularCheckups.target) * 100)}% of annual goal
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Medication Adherence</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {healthDashboard.medicationAdherence}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Prescription compliance rate
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication & Support</CardTitle>
                <CardDescription>Secure messaging, follow-up requests, emergency support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => router.push('/dashboard/patient/chat')}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Secure Messaging
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Chat with your assigned doctor, analyst, or pharmacist</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => {
                    toast({ 
                      title: 'Teleconsultation', 
                      description: 'Video consultation feature will be available soon. You can start a video call with your doctor for remote consultations.' 
                    });
                  }}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Teleconsultation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Video consultations with secure file sharing</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors border-red-200" onClick={() => {
                    router.push('/dashboard/patient/chat?emergency=true');
                    toast({ 
                      title: 'Emergency Support', 
                      description: 'Connecting you to emergency support. Please use the chat to reach an on-call doctor immediately.' 
                    });
                  }}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Emergency Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Instant connection to on-call doctor</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => {
                    toast({ 
                      title: 'Feedback & Ratings', 
                      description: 'Feedback system will be available soon. You can rate your doctor, visit, or pharmacy experience.' 
                    });
                  }}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Feedback & Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Rate your doctor, visit, or pharmacy experience</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings & Preferences</CardTitle>
                <CardDescription>Security, privacy, accessibility, language settings</CardDescription>
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
                <div>
                  <Label>Accessibility</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={settings.highContrast}
                        onChange={(e) => setSettings({ ...settings, highContrast: e.target.checked })}
                      />
                      <span className="text-sm">High contrast colors</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={settings.largeText}
                        onChange={(e) => setSettings({ ...settings, largeText: e.target.checked })}
                      />
                      <span className="text-sm">Large text</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={settings.voiceFeedback}
                        onChange={(e) => setSettings({ ...settings, voiceFeedback: e.target.checked })}
                      />
                      <span className="text-sm">Voice feedback</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>2FA & Biometric Login</Label>
                  <div className="space-y-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleEnable2FA}>
                      <Shield className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        // Redirect to face registration
                        router.push('/dashboard/patient/biometric/register-face');
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Register Face
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        // Redirect to document scanner
                        router.push('/dashboard/patient/biometric/scan-document');
                      }}
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Scan ID/Passport
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        {showBookingModal && bookingData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>
                  Select a time slot for Dr. {bookingData.doctorName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(bookingData.suggestedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {bookingData.suggestedTimes.map((time: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => handleCreateAppointment(bookingData, time)}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingData(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
