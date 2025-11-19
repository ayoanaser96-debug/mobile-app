'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { BillingPanel } from '@/components/BillingPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { saveAs } from 'file-saver';
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
  MapPin,
  Zap,
  Target,
  Lightbulb,
  Sparkles,
  Cpu,
  Network,
  Gauge,
  Radar,
  Workflow,
  Bot,
  Fingerprint,
  Microscope,
  XCircle
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
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [language, setLanguage] = useState<string>('en');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [unifiedJourney, setUnifiedJourney] = useState<any>(null);
  const [suggestedAppointments, setSuggestedAppointments] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);
  const [comparativeAnalysis, setComparativeAnalysis] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [prescriptionTracking, setPrescriptionTracking] = useState([]);
  const [pharmacyStatuses, setPharmacyStatuses] = useState<any>({});
  const [billingHistory, setBillingHistory] = useState<any>(null);
  const [healthDashboard, setHealthDashboard] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [waitTime, setWaitTime] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    voiceFeedback: false,
  });

  // AI-Powered Intelligence States
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<any>(null);
  const [smartNotifications, setSmartNotifications] = useState<any[]>([]);
  const [adaptiveScheduling, setAdaptiveScheduling] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState<any>(null);
  const [clinicIntelligence, setClinicIntelligence] = useState<any>(null);
  const [autoWorkflows, setAutoWorkflows] = useState<any[]>([]);
  const [personalizedExperience, setPersonalizedExperience] = useState<any>(null);
  const [handledNotifications, setHandledNotifications] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const normalizedRole = user?.role?.toUpperCase() || '';
    if (!loading && normalizedRole !== 'PATIENT') {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadAllData = useCallback(async () => {
    try {
      const [
        journeyRes,
        timelineRes,
        insightsRes,
        prescriptionsRes,
        billingRes,
        dashboardRes,
        finalResultsRes,
      ] = await Promise.all([
        api.get('/patients/unified-journey'),
        api.get('/patients/health-timeline'),
        api.get('/patients/ai-insights'),
        api.get('/patients/prescription-tracking'),
        api.get('/patients/billing-history'),
        api.get('/patients/health-dashboard'),
        api.get('/patients/final-results'),
      ]);

      setUnifiedJourney(journeyRes.data);
      setHealthTimeline(timelineRes.data || []);
      setAiInsights(insightsRes.data);
      setPrescriptionTracking(prescriptionsRes.data || []);
      // derive simple pharmacy status map for quick badges
      const statusMap: any = {};
      (prescriptionsRes.data || []).forEach((p: any) => {
        statusMap[p._id] = p.status;
      });
      setPharmacyStatuses(statusMap);
      setBillingHistory(billingRes.data);
      setHealthDashboard(dashboardRes.data);
      setFinalResults(finalResultsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient data',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // AI-Powered Intelligent Functions
  const loadIntelligentFeatures = async () => {
    try {
      const [
        aiRecommendationsRes,
        predictiveRes,
        adaptiveRes,
        behaviorRes,
        clinicRes,
        personalizedRes
      ] = await Promise.all([
        api.get('/patients/ai-recommendations'),
        api.get('/patients/predictive-insights'),
        api.get('/patients/adaptive-scheduling'),
        api.get('/patients/behavior-analytics'),
        api.get('/clinic/intelligence-metrics'),
        api.get('/patients/personalized-experience')
      ]);

      setAiRecommendations(aiRecommendationsRes.data);
      setPredictiveInsights(predictiveRes.data);
      setAdaptiveScheduling(adaptiveRes.data);
      setBehaviorAnalytics(behaviorRes.data);
      setClinicIntelligence(clinicRes.data);
      setPersonalizedExperience(personalizedRes.data);
    } catch (error) {
      // Fallback to mock data for demo
      setAiRecommendations({
        healthScore: 85,
        riskFactors: ['Age-related changes', 'Screen time exposure'],
        recommendations: [
          { type: 'preventive', action: 'Schedule annual eye exam', priority: 'high', confidence: 92 },
          { type: 'lifestyle', action: 'Reduce screen time', priority: 'medium', confidence: 78 },
          { type: 'nutrition', action: 'Increase omega-3 intake', priority: 'low', confidence: 65 }
        ],
        treatmentProgress: 72,
        sessionsCompleted: 5,
        totalSessions: 8,
        treatmentStatus: 'In Progress',
        progressNote: 'Vision therapy and lifestyle changes are improving your health score.'
      });
      setPredictiveInsights({
        nextVisitPrediction: '2024-03-15',
        riskAssessment: 'Low',
        treatmentSuccess: 94,
        complications: 'Unlikely'
      });
      setAdaptiveScheduling({
        optimalTime: '10:30 AM',
        waitTimeReduction: '40%',
        preferredDoctor: 'Dr. Sarah Johnson',
        efficiency: 'High'
      });
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const res = await api.get('/clinic/real-time-metrics');
      setRealTimeMetrics(res.data);
    } catch (error) {
      // Mock real-time data
      setRealTimeMetrics({
        currentWaitTime: Math.floor(Math.random() * 30) + 5,
        clinicCapacity: Math.floor(Math.random() * 20) + 70,
        doctorAvailability: Math.floor(Math.random() * 5) + 3,
        emergencyAlerts: Math.floor(Math.random() * 3),
        systemHealth: 98.5,
        openingTime: '08:00 AM',
        closingTime: '08:00 PM',
        nextAppointmentTime: '10:30 AM',
        expectedVisitDuration: '45 minutes'
      });
    }
  };

  const loadSmartNotifications = async () => {
    try {
      const res = await api.get('/patients/smart-notifications');
      setSmartNotifications(res.data || []);
    } catch (error) {
      // Mock smart notifications
      setSmartNotifications([
        {
          id: 1,
          type: 'ai-insight',
          title: 'AI Health Insight',
          message: 'Your eye health has improved by 12% since last visit',
          priority: 'info',
          timestamp: new Date(),
          actionable: true
        },
        {
          id: 2,
          type: 'predictive',
          title: 'Preventive Care Reminder',
          message: 'AI suggests scheduling your next checkup in 2 weeks',
          priority: 'medium',
          timestamp: new Date(),
          actionable: true
        }
      ]);
    }
  };

  const startRealTimeUpdates = () => {
    // Initialize WebSocket or Server-Sent Events for real-time updates
    console.log('Starting real-time intelligence updates...');
  };

  // Auto-refresh prescriptions every 30 seconds to show real-time updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        loadAllData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, loadAllData]);

  useEffect(() => {
    if (user) {
      loadAllData();
      loadIntelligentFeatures();
      startRealTimeUpdates();
    }
  }, [user, loadAllData]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        loadRealTimeMetrics();
        loadSmartNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
      // Process payment through backend
      toast({ 
        title: 'Payment Processing', 
        description: `Processing payment of $${invoice.amount}...` 
      });

      const paymentData = {
        patientId: user?.id,
        amount: invoice.amount,
        invoiceId: invoice.id || invoice.transactionId,
        description: invoice.description || `Payment for ${invoice.type}`,
      };

      const response = await api.post('/billing/payment', paymentData);

      toast({ 
        title: 'Payment Successful', 
        description: `Payment of $${invoice.amount} processed successfully` 
      });

      // Show receipt immediately - fetch full receipt data from backend
      if (response.data.transactionId) {
        try {
          // Fetch complete receipt data from backend
          const receiptResponse = await api.get(`/billing/receipt/${response.data.transactionId}`);
          if (receiptResponse.data) {
            setCurrentReceipt(receiptResponse.data);
            setShowReceiptModal(true);
          } else {
            // Fallback to response data
            const receiptData = {
              transactionId: response.data.transactionId,
              amount: response.data.amount || invoice.amount,
              description: paymentData.description,
              paidAt: response.data.paidAt || new Date(),
              clinicName: 'Vision Clinic',
              patientName: user?.firstName + ' ' + user?.lastName,
            };
            setCurrentReceipt(receiptData);
            setShowReceiptModal(true);
          }
        } catch (error) {
          // Fallback if receipt fetch fails
          const receiptData = {
            transactionId: response.data.transactionId,
            amount: response.data.amount || invoice.amount,
            description: paymentData.description,
            paidAt: response.data.paidAt || new Date(),
            clinicName: 'Vision Clinic',
            patientName: user?.firstName + ' ' + user?.lastName,
          };
          setCurrentReceipt(receiptData);
          setShowReceiptModal(true);
        }
      }

      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Payment failed',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      // Get the API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      // Open download URL with authentication token
      const downloadUrl = `${apiBaseUrl}/billing/receipt/${transactionId}/download`;
      
      // Create a temporary link with token in header
      // Since window.open doesn't support custom headers, we'll use fetch then download
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${transactionId}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Receipt Downloaded',
          description: 'Receipt has been downloaded successfully',
        });
      } else {
        throw new Error('Failed to download receipt');
      }
    } catch (error: any) {
      console.error('Download receipt error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const handleViewReceipt = async (invoice: any) => {
    try {
      const transactionId = invoice.transactionId || invoice.id;
      
      // Try to fetch receipt from backend if transactionId exists
      if (transactionId && invoice.status === 'paid') {
        try {
          const response = await api.get(`/billing/receipt/${transactionId}`);
          if (response.data) {
            // Use backend receipt data
            setCurrentReceipt(response.data);
            setShowReceiptModal(true);
            return;
          }
        } catch (error) {
          // If backend receipt not found, fall back to invoice data
          console.log('Receipt not found in backend, using invoice data');
        }
      }
      
      // Fallback: Create receipt from invoice data
      const receiptData = {
        transactionId: transactionId,
        amount: invoice.amount,
        description: invoice.description || `Payment for ${invoice.type}`,
        paidAt: invoice.paidAt || invoice.date || new Date(),
        clinicName: 'Vision Clinic',
        patientName: user?.firstName + ' ' + user?.lastName,
      };
      setCurrentReceipt(receiptData);
      setShowReceiptModal(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load receipt',
        variant: 'destructive',
      });
    }
  };

  const downloadReceipt = (invoice: any) => {
    try {
      const patientName = user?.firstName + ' ' + user?.lastName || 'Patient';
      const transactionId = invoice.transactionId || invoice.id;
      const invoiceDate = new Date(invoice.date || invoice.paidAt || new Date()).toLocaleDateString();
      
      // Create receipt text
      const receipt = `
Receipt
------------------------
Date: ${invoiceDate}
Transaction ID: ${transactionId}
Customer: ${patientName}
Invoice Type: ${invoice.type || 'N/A'}
Description: ${invoice.description || 'N/A'}

Items:
${invoice.items && invoice.items.length > 0 
  ? invoice.items.map((item: any) => `  ${item.name} x${item.quantity || 1} - $${item.price || 0}`).join('\n')
  : `  ${invoice.description || 'Service'} - $${invoice.amount}`
}

Total: $${invoice.amount}
Status: ${invoice.status || 'paid'}
------------------------
Thank you for your payment!
Vision Clinic - Smart Eye Care Solutions
      `.trim();

      // Convert receipt to blob and download
      const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `Receipt-${transactionId}.txt`);
      
      toast({
        title: 'Receipt Downloaded',
        description: 'Receipt has been downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
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
    const normalizedStatus = status?.toUpperCase() || '';
    switch (normalizedStatus) {
      case 'COMPLETED':
      case 'FILLED':
        return 'bg-emerald-500 text-white';
      case 'READY':
        return 'bg-green-500 text-white';
      case 'DELIVERED':
        return 'bg-purple-500 text-white';
      case 'PENDING':
      case 'SCHEDULED':
        return 'bg-orange-500 text-white';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-blue-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  const appointmentTimeline =
    unifiedJourney?.timeline?.filter((item: any) => item.type === 'appointment') || [];

  const now = new Date();
  const normalizedAppointments = appointmentTimeline.map((item: any) => {
    const appointmentDate =
      item.date ||
      item.data?.appointmentDate ||
      item.data?.scheduledDate ||
      item.data?.nextAppointment ||
      item.data?.startDate;
    const parsedDate = appointmentDate ? new Date(appointmentDate) : null;
    return {
      ...item,
      parsedDate,
    };
  });

  const futureAppointments = normalizedAppointments
    .filter((item: any) => item.parsedDate && item.parsedDate >= now)
    .sort(
      (a: any, b: any) =>
        (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime(),
    );

  const pastAppointments = normalizedAppointments
    .filter((item: any) => item.parsedDate && item.parsedDate < now)
    .sort(
      (a: any, b: any) =>
        (b.parsedDate as Date).getTime() - (a.parsedDate as Date).getTime(),
    );

  const upcomingAppointment = futureAppointments[0] || null;
  const lastAppointment = pastAppointments[0] || null;
  const nextAppointmentDate = upcomingAppointment?.parsedDate || null;
  const appointmentDoctor =
    upcomingAppointment?.data?.doctorName ||
    upcomingAppointment?.data?.doctor ||
    upcomingAppointment?.title ||
    'your specialist';
  const appointmentTimeLabel =
    upcomingAppointment?.data?.appointmentTime ||
    (nextAppointmentDate
      ? nextAppointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null);
  const expectedVisitDuration =
    upcomingAppointment?.data?.expectedDuration ||
    realTimeMetrics?.expectedVisitDuration ||
    '45 minutes';

  const clinicOpeningTime = realTimeMetrics?.openingTime || '08:00 AM';
  const clinicClosingTime = realTimeMetrics?.closingTime || '08:00 PM';
  const suggestedArrivalTime =
    nextAppointmentDate
      ? new Date(nextAppointmentDate.getTime() - 15 * 60000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  const derivedAlerts: any[] = [];

  if (nextAppointmentDate) {
    derivedAlerts.push({
      id: 'appointment-reminder-24h',
      title: 'Appointment Reminder • 1 Day Before',
      message: `You have an appointment tomorrow at ${appointmentTimeLabel} with ${appointmentDoctor}.`,
      priority: 'info',
      actionable: true,
    });
    derivedAlerts.push({
      id: 'appointment-reminder-2h',
      title: 'Appointment Reminder • 2 Hours',
      message: `Get ready! Your appointment starts in 2 hours (${appointmentTimeLabel}).`,
      priority: 'urgent',
      actionable: true,
    });
  }

  const needsMonthlyCheckup = (() => {
    if (!lastAppointment?.parsedDate) return true;
    const daysSinceLast =
      (now.getTime() - lastAppointment.parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= 28;
  })();

  if (needsMonthlyCheckup) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (nextAppointmentDate ? 0 : 7));
    derivedAlerts.push({
      id: 'monthly-checkup-reminder',
      title: 'Monthly Checkup Reminder',
      message: `Your monthly eye health checkup is due around ${dueDate.toLocaleDateString()}. Schedule a visit to stay on track.`,
      priority: 'medium',
      actionable: true,
    });
  }

  const combinedSmartNotifications = [...derivedAlerts, ...(smartNotifications || [])];

  const handleNotificationAction = (notification: any) => {
    if (!notification?.id) return;
    setHandledNotifications((prev) => ({
      ...prev,
      [notification.id]: true,
    }));
    toast({
      title: 'Action completed',
      description: notification.title || 'Reminder acknowledged',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 patient-portal" data-portal="patient">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Patient Portal
              </h1>
            </div>
            <p className="text-muted-foreground">
              Smart appointments • AI insights • Health tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData} className="btn-modern">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* AI Intelligence Hub - Real-time Clinic Intelligence */}
        {(aiRecommendations || realTimeMetrics || smartNotifications.length > 0) && (
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* AI Health Score & Recommendations */}
            {aiRecommendations && (
              <Card className="card-modern border-l-4 border-l-purple-500 hover:border-purple-500/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">AI Health Intelligence</CardTitle>
                      <CardDescription className="text-sm">Personalized insights & predictions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Health Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                          style={{ width: `${aiRecommendations.healthScore}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-green-600">{aiRecommendations.healthScore}%</span>
                    </div>
                  </div>
                  {typeof aiRecommendations.treatmentProgress === 'number' && (
                    <div className="p-3 rounded-lg bg-white/70 border border-purple-100 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
                        <span>Treatment Progress</span>
                        <span>{aiRecommendations.treatmentProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                          style={{ width: `${aiRecommendations.treatmentProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Sessions {aiRecommendations.sessionsCompleted || 0} / {aiRecommendations.totalSessions || 0}
                        </span>
                        <Badge className="bg-purple-100 text-purple-700">
                          {aiRecommendations.treatmentStatus || 'In progress'}
                        </Badge>
                      </div>
                      {aiRecommendations.progressNote && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {aiRecommendations.progressNote}
                        </p>
                      )}
                    </div>
                  )}
                  {aiRecommendations.recommendations?.slice(0, 2).map((rec: any, idx: number) => (
                    <div key={idx} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{rec.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${
                              rec.priority === 'high' ? 'border-red-500 text-red-600' :
                              rec.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                              'border-green-500 text-green-600'
                            }`}>
                              {rec.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rec.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Real-time Clinic Metrics */}
            {realTimeMetrics && (
              <Card className="card-modern border-l-4 border-l-blue-500 hover:border-blue-500/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Gauge className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Live Clinic Status</CardTitle>
                      <CardDescription className="text-sm">Real-time operations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{realTimeMetrics.currentWaitTime}m</div>
                      <div className="text-xs text-muted-foreground">Wait Time</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <Activity className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">{realTimeMetrics.clinicCapacity}%</div>
                      <div className="text-xs text-muted-foreground">Capacity</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-semibold text-blue-900">Clinic Hours</p>
                      <p className="text-muted-foreground">{clinicOpeningTime} - {clinicClosingTime}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-sm">
                      <p className="font-semibold text-indigo-900">Your Appointment</p>
                      <p className="text-muted-foreground">
                        {nextAppointmentDate
                          ? `${nextAppointmentDate.toLocaleDateString()} • ${appointmentTimeLabel}`
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-foreground">System Health</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{realTimeMetrics.systemHealth}%</span>
                  </div>
                  {nextAppointmentDate && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 text-sm space-y-1">
                      <p className="font-semibold text-blue-900">Visit Plan</p>
                      {suggestedArrivalTime && (
                        <p className="text-muted-foreground">
                          Arrive by <span className="font-semibold">{suggestedArrivalTime}</span> for check-in.
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        Expected time in clinic: <span className="font-semibold">{expectedVisitDuration}</span>.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Smart Notifications */}
            {combinedSmartNotifications.length > 0 && (
              <Card className="card-modern border-l-4 border-l-orange-500 hover:border-orange-500/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Bot className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Smart Alerts</CardTitle>
                      <CardDescription className="text-sm">AI-powered notifications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {combinedSmartNotifications.slice(0, 3).map((notification: any) => (
                    <div key={notification.id} className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          {notification.actionable && (
                            <Button
                              size="sm"
                              variant={handledNotifications[notification.id] ? 'secondary' : 'outline'}
                              className="mt-2 text-xs h-6"
                              disabled={handledNotifications[notification.id]}
                              onClick={() => handleNotificationAction(notification)}
                            >
                              {handledNotifications[notification.id] ? 'Action Done' : 'Take Action'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Predictive Insights Banner */}
        {predictiveInsights && (
          <Card className="card-modern bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Predictive Health Insights</h3>
                    <p className="text-sm text-muted-foreground">AI-powered health predictions based on your data</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">Next Visit</div>
                    <div className="text-lg font-bold text-indigo-600">{new Date(predictiveInsights.nextVisitPrediction).toLocaleDateString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">Risk Level</div>
                    <Badge className={`${predictiveInsights.riskAssessment === 'Low' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {predictiveInsights.riskAssessment}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">Success Rate</div>
                    <div className="text-lg font-bold text-green-600">{predictiveInsights.treatmentSuccess}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Results Summary - Doctor Diagnosis, Analyst Result, Pharmacy Prescription */}
        {finalResults && (
          <Card className="card-modern animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Final Results Summary
              </CardTitle>
              <CardDescription className="text-sm">Doctor diagnosis, analyst findings, and latest prescription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Doctor Diagnosis */}
                <div className="p-3 rounded-lg border bg-accent/10 dark:bg-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-semibold text-foreground">Doctor Diagnosis</span>
                  </div>
                  {finalResults.diagnosisSummary ? (
                    <div className="space-y-1 text-sm">
                      <div className="font-medium text-foreground">{finalResults.diagnosisSummary.diagnosis || '—'}</div>
                      <div className="text-muted-foreground">Status: {finalResults.diagnosisSummary.status || '—'}</div>
                      {finalResults.diagnosisSummary.doctors?.length > 0 && (
                        <div className="text-muted-foreground">By: {finalResults.diagnosisSummary.doctors.join(', ')}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{finalResults.diagnosisSummary.notes || ''}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No diagnosis yet</div>
                  )}
                </div>

                {/* Analyst Result */}
                <div className="p-3 rounded-lg border bg-accent/10 dark:bg-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="h-4 w-4" />
                    <span className="text-sm font-semibold text-foreground">Analyst Result</span>
                  </div>
                  {finalResults.analystSummary ? (
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">Status: {finalResults.analystSummary.status || '—'}</div>
                      {finalResults.analystSummary.aiAnalysis && (
                        <div className="text-xs text-muted-foreground">AI: available</div>
                      )}
                      <div className="text-xs text-muted-foreground">{finalResults.analystSummary.notes || ''}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No analyst result yet</div>
                  )}
                </div>

                {/* Pharmacy Prescription */}
                <div className="p-3 rounded-lg border bg-accent/10 dark:bg-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4" />
                    <span className="text-sm font-semibold text-foreground">Latest Prescription</span>
                  </div>
                  {finalResults.prescriptionSummary ? (
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">Status: {finalResults.prescriptionSummary.status || '—'}</div>
                      {finalResults.prescriptionSummary.doctor && (
                        <div className="text-muted-foreground">Doctor: {finalResults.prescriptionSummary.doctor}</div>
                      )}
                      {finalResults.prescriptionSummary.pharmacy && (
                        <div className="text-muted-foreground">Pharmacy: {finalResults.prescriptionSummary.pharmacy}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Medications: {finalResults.prescriptionSummary.medications?.length || 0} • Glasses: {finalResults.prescriptionSummary.glasses?.length || 0}
                      </div>
                      {finalResults.prescriptionSummary.notes && (
                        <div className="text-xs text-muted-foreground">{finalResults.prescriptionSummary.notes}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No prescriptions yet</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{unifiedJourney?.summary?.totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {unifiedJourney?.summary?.upcomingAppointments || 0} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eye Tests</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Eye className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{unifiedJourney?.summary?.totalTests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total tests</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{unifiedJourney?.summary?.totalPrescriptions || 0}</div>
              <p className="text-xs text-yellow-600 font-semibold">
                {unifiedJourney?.summary?.pendingPrescriptions || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{unifiedJourney?.summary?.activeCases || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Open cases</p>
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
                    <CardTitle className="font-bold text-xl text-foreground flex items-center gap-2">
                      <Cpu className="h-6 w-6 text-primary" />
                      Intelligent Appointment System
                    </CardTitle>
                    <CardDescription className="font-medium text-foreground">AI-optimized scheduling • Predictive wait times • Smart doctor matching</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleBookAppointment()} className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Smart Booking
                    </Button>
                    <Button variant="outline" onClick={() => handleBookAppointment('urgent')} className="border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-100 font-semibold">
                      <Zap className="h-4 w-4 mr-2" />
                      Urgent Care
                    </Button>
                    {adaptiveScheduling && (
                      <Button variant="outline" className="border-2 border-green-500 text-green-600 bg-green-50 hover:bg-green-100 font-semibold">
                        <Target className="h-4 w-4 mr-2" />
                        Optimal: {adaptiveScheduling.optimalTime}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {suggestedAppointments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3 text-lg text-foreground">AI Suggested Appointments</h3>
                    <div className="space-y-3">
                      {suggestedAppointments.slice(0, 5).map((suggestion: any, idx: number) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground text-base">
                                  Dr. {suggestion.doctorName} - {suggestion.specialty}
                                </p>
                                <p className="text-sm font-medium mt-1 text-foreground">
                                  Suggested Date: {new Date(suggestion.suggestedDate).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {suggestion.suggestedTimes.slice(0, 3).map((time: string, i: number) => (
                                    <Badge key={i} variant="outline" className="border-2 border-primary text-primary font-medium">
                                      {time}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-blue-100 text-blue-900 font-semibold">
                                    Match Score: {suggestion.matchScore}%
                                  </Badge>
                                  <Badge variant="outline" className="border-2 border-primary text-primary font-medium">
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
                  <h3 className="font-bold mb-3 text-lg text-foreground">Your Appointments</h3>
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
                                  <Calendar className="h-4 w-4 text-foreground" />
                                  <p className="font-bold text-base text-foreground">{item.title}</p>
                                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                </div>
                                {item.data?.doctorName && (
                                  <p className="text-sm font-bold text-primary mb-1">
                                    Dr. {item.data.doctorName}
                                  </p>
                                )}
                                <p className="text-sm font-semibold text-foreground">
                                  {new Date(item.date).toLocaleDateString()} {item.data?.appointmentTime || ''}
                                </p>
                                  {waitTime && waitTime.position && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                      <p className="text-sm font-semibold text-blue-900">Queue Position: {waitTime.position}</p>
                                      <p className="text-sm text-blue-800 font-medium">
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
                                    className="border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 font-semibold"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Wait Time
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Show appointment details in a toast or modal
                                      toast({
                                        title: 'Appointment Details',
                                        description: `${item.title} - ${new Date(item.date).toLocaleDateString()} ${item.data?.appointmentTime || ''}`,
                                      });
                                    }}
                                    className="border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 font-semibold"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <p className="font-medium text-center py-8 text-foreground">No appointments scheduled</p>
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
                <CardDescription>Digital prescriptions and medication management</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionTracking.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptionTracking.map((prescription: any) => (
                      <Card key={prescription._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={getStatusColor(prescription.status)}>
                                  {prescription.status?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                {(prescription.doctor || prescription.doctorId) && (
                                  <span className="text-sm font-bold text-primary">
                                    Dr. {(prescription.doctor || prescription.doctorId)?.firstName} {(prescription.doctor || prescription.doctorId)?.lastName}
                                  </span>
                                )}
                                {(prescription.pharmacy || prescription.pharmacyId) && (
                                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1">
                                      <Pill className="h-3 w-3" />
                                      Pharmacy: {(prescription.pharmacy || prescription.pharmacyId)?.firstName || 'Assigned'}
                                    </span>
                                    <Badge className={
                                      prescription.status?.toUpperCase() === 'READY'
                                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                        : prescription.status?.toUpperCase() === 'PROCESSING'
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        : prescription.status?.toUpperCase() === 'DELIVERED'
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        : prescription.status?.toUpperCase() === 'COMPLETED'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                    }>
                                      {prescription.status?.toUpperCase() || 'PENDING'}
                                    </Badge>
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(prescription.createdAt || prescription.updatedAt).toLocaleDateString()}
                                  {prescription.readyAt && (
                                    <span className="ml-2 text-green-600">
                                      Ready: {new Date(prescription.readyAt).toLocaleDateString()}
                                    </span>
                                  )}
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

                              {prescription.pharmacyNotes && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm border border-blue-200">
                                  <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Pharmacy Notes:</p>
                                  <p className="text-blue-800 dark:text-blue-200">{prescription.pharmacyNotes}</p>
                                </div>
                              )}

                              {/* Status Update Messages */}
                              {prescription.status?.toUpperCase() === 'READY' && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                      <p className="font-semibold text-green-900 dark:text-green-100">Prescription Ready!</p>
                                      <p className="text-sm text-green-800 dark:text-green-200">
                                        Your prescription is ready for pickup at the pharmacy.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {prescription.status?.toUpperCase() === 'PROCESSING' && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <p className="font-semibold text-blue-900 dark:text-blue-100">Being Processed</p>
                                      <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Your prescription is currently being prepared at the pharmacy.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {prescription.status?.toUpperCase() === 'DELIVERED' && (
                                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-purple-600" />
                                    <div>
                                      <p className="font-semibold text-purple-900 dark:text-purple-100">Delivered</p>
                                      <p className="text-sm text-purple-800 dark:text-purple-200">
                                        Your prescription has been delivered.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {prescription.status?.toUpperCase() === 'CANCELLED' && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <div>
                                      <p className="font-semibold text-red-900 dark:text-red-100">Prescription Cancelled</p>
                                      <p className="text-sm text-red-800 dark:text-red-200">
                                        This prescription was cancelled. Please contact your doctor for alternatives.
                                      </p>
                                    </div>
                                  </div>
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
            <BillingPanel
              billingHistory={billingHistory}
              onRefresh={loadAllData}
              onPayment={handlePayment}
              patientName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Patient'}
            />
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

                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => router.push('/dashboard/patient/chat?video=true')}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Teleconsultation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Start a video consultation request</p>
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

                  <Card className="cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors" onClick={() => router.push('/dashboard/patient/chat')}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Feedback & Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Send feedback via secure messaging</p>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm font-semibold mt-2"
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
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm font-semibold mt-2"
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
                <CardTitle className="text-foreground font-bold text-xl">Book Appointment</CardTitle>
                <CardDescription className="text-foreground font-semibold text-base">
                  Select a time slot for Dr. {bookingData.doctorName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground font-bold">Date</Label>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {new Date(bookingData.suggestedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-foreground font-bold">Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {bookingData.suggestedTimes.map((time: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => handleCreateAppointment(bookingData, time)}
                          className="h-10 font-bold text-foreground border-2 border-primary hover:bg-primary hover:text-white"
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

        {/* Receipt Modal */}
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>
                Receipt for your payment transaction
              </DialogDescription>
            </DialogHeader>
            
            {currentReceipt && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-primary">Vision Clinic</h3>
                    <p className="text-sm text-muted-foreground">Smart Eye Care Solutions</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Patient Name</p>
                      <p className="font-semibold">{currentReceipt.patientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{currentReceipt.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(currentReceipt.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold">
                        {new Date(currentReceipt.paidAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{currentReceipt.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-4 pt-4 border-t">
                    <p>Total Amount</p>
                    <p className="text-primary">${currentReceipt.amount}</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800 dark:text-green-200">Payment Successful</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Thank you for your payment
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentReceipt?.transactionId) {
                    handleDownloadReceipt(currentReceipt.transactionId);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => setShowReceiptModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}