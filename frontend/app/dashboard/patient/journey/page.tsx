'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  User,
  CreditCard,
  TestTube,
  Stethoscope,
  Pill,
  Bell,
  RefreshCw,
  MapPin,
  QrCode,
  FileText,
  Download
} from 'lucide-react';

interface JourneyStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
  staffId?: string;
}

interface PatientJourney {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  checkInTime: string;
  checkOutTime?: string;
  steps: JourneyStep[];
  overallStatus: string;
  currentStep?: string;
  appointmentId?: string;
  prescriptionId?: string;
  costs?: {
    registration?: number;
    payment?: number;
    analyst?: number;
    doctor?: number;
    pharmacy?: number;
    total?: number;
  };
  receiptGenerated?: boolean;
}

const stepConfig = [
  {
    key: 'registration',
    title: 'Registration',
    icon: User,
    description: 'Check-in and registration',
    color: 'bg-blue-500',
  },
  {
    key: 'payment',
    title: 'Finance/Payment',
    icon: CreditCard,
    description: 'Payment processing',
    color: 'bg-green-500',
  },
  {
    key: 'analyst',
    title: 'Eye Test & Analysis',
    icon: TestTube,
    description: 'Vision testing and analysis',
    color: 'bg-purple-500',
  },
  {
    key: 'doctor',
    title: 'Doctor Consultation',
    icon: Stethoscope,
    description: 'Medical consultation',
    color: 'bg-orange-500',
  },
  {
    key: 'pharmacy',
    title: 'Pharmacy',
    icon: Pill,
    description: 'Prescription pickup',
    color: 'bg-red-500',
  },
];

export default function PatientJourneyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [journey, setJourney] = useState<PatientJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== 'patient') {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadJourney = useCallback(async () => {
    try {
      const res = await api.get('/patients/journey');
      setJourney(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No active journey
        setJourney(null);
      } else {
        console.error('Error loading journey:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadJourney();
      // Refresh every 5 seconds
      const interval = setInterval(() => {
        loadJourney();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, loadJourney]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await api.post('/patients/journey/check-in');
      setJourney(res.data);
      toast({
        title: 'Check-in Successful',
        description: 'Welcome to Vision Smart Clinic! Your journey has started.',
      });
      // Start polling for updates
      const interval = setInterval(loadJourney, 5000);
      setTimeout(() => clearInterval(interval), 60000); // Poll for 1 minute
    } catch (error: any) {
      toast({
        title: 'Check-in Failed',
        description: error.response?.data?.message || 'Failed to check in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const getStepStatus = (stepKey: string) => {
    if (!journey) return 'pending';
    const step = journey.steps.find((s) => s.step === stepKey);
    return step?.status || 'pending';
  };

  const getStepIcon = (stepKey: string, Icon: any) => {
    const status = getStepStatus(stepKey);
    
    if (status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-white" />;
    } else if (status === 'in_progress') {
      return <Clock className="h-6 w-6 text-white animate-pulse" />;
    }
    return <Icon className="h-6 w-6 text-white opacity-50" />;
  };

  const getStepBadge = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    
    if (status === 'completed') {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    } else if (status === 'in_progress') {
      return <Badge className="bg-blue-500 text-white animate-pulse">In Progress</Badge>;
    } else if (journey?.currentStep === stepKey) {
      return <Badge className="bg-yellow-500 text-white">Next</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 patient-portal" data-portal="patient">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              Patient Journey Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your visit progress through the clinic
            </p>
          </div>
          <Button onClick={loadJourney} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Patient Info Card */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold text-lg">{user._id || user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge className="bg-primary text-white capitalize">{user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Check-in Section */}
        {!journey && (
          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Check In
              </CardTitle>
              <CardDescription>
                Start your journey by checking in at the clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCheckIn} 
                disabled={checkingIn}
                className="w-full h-12 text-lg"
              >
                {checkingIn ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Check In Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Journey Progress */}
        {journey && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Journey Progress</CardTitle>
                    <CardDescription>
                      Checked in at {new Date(journey.checkInTime).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge className={
                    journey.overallStatus === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }>
                    {journey.overallStatus === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Line */}
                <div className="relative mb-8">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted"></div>
                  {(() => {
                    const completedSteps = journey.steps.filter((s: JourneyStep) => s.status === 'completed').length;
                    const progressPercentage = (completedSteps / stepConfig.length) * 100;
                    return (
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    );
                  })()}
                  
                  <div className="relative flex justify-between">
                    {stepConfig.map((step, index) => {
                      const stepData = journey.steps.find((s) => s.step === step.key);
                      const status = stepData?.status || 'pending';
                      const isCompleted = status === 'completed';
                      const isInProgress = status === 'in_progress' || journey.currentStep === step.key;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center z-10">
                          <div className={`
                            flex items-center justify-center w-12 h-12 rounded-full ${step.color}
                            border-4 ${isCompleted 
                              ? 'border-green-500 bg-green-500' 
                              : isInProgress 
                              ? 'border-blue-500 bg-blue-500 animate-pulse ring-4 ring-blue-300' 
                              : 'border-gray-300 bg-gray-200 opacity-50'}
                            transition-all duration-300
                          `}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            ) : isInProgress ? (
                              <Clock className="h-6 w-6 text-white animate-pulse" />
                            ) : (
                              <Icon className="h-6 w-6 text-white opacity-70" />
                            )}
                          </div>
                          <p className={`text-xs mt-2 font-medium text-center max-w-[80px] ${
                            isCompleted ? 'text-green-600' : isInProgress ? 'text-blue-600' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </p>
                          {isCompleted && stepData?.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(stepData.completedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Journey Steps Details */}
                <div className="space-y-4 mt-8">
                  {stepConfig.map((step, index) => {
                    const stepData = journey.steps.find((s) => s.step === step.key);
                    const status = stepData?.status || 'pending';
                    const isCompleted = status === 'completed';
                    const isInProgress = status === 'in_progress' || journey.currentStep === step.key;
                    const Icon = step.icon;
                    const cost = journey.costs?.[step.key as keyof typeof journey.costs] || 0;

                    return (
                      <div key={step.key}>
                        {/* Step Card */}
                        <div className={`
                          relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                          ${isCompleted 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-lg shadow-green-200' 
                            : isInProgress
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 ring-4 ring-blue-300 animate-pulse'
                            : 'bg-card border-border opacity-60'
                          }
                        `}>
                          {/* Step Number/Icon */}
                          <div className={`
                            flex items-center justify-center w-12 h-12 rounded-full ${step.color}
                            ${!isCompleted && !isInProgress ? 'opacity-50' : 'shadow-lg'}
                          `}>
                            {getStepIcon(step.key, Icon)}
                          </div>

                          {/* Step Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className={`font-semibold text-lg ${
                                  isCompleted || isInProgress 
                                    ? 'text-[hsl(178.6,84.3%,10%)] dark:text-foreground' 
                                    : ''
                                }`}>{step.title}</h3>
                                <p className={`text-sm ${
                                  isCompleted || isInProgress 
                                    ? 'text-[hsl(178.6,84.3%,10%)]/70 dark:text-muted-foreground' 
                                    : 'text-muted-foreground'
                                }`}>{step.description}</p>
                                {cost > 0 && (
                                  <p className="text-sm font-medium text-primary mt-1">
                                    Cost: ${cost}
                                  </p>
                                )}
                                {stepData?.completedAt && (
                                  <p className={`text-xs mt-1 ${
                                    isCompleted || isInProgress 
                                      ? 'text-[hsl(178.6,84.3%,10%)]/60 dark:text-muted-foreground' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    ✓ Completed at {new Date(stepData.completedAt).toLocaleTimeString()}
                                  </p>
                                )}
                                {stepData?.notes && (
                                  <p className={`text-sm mt-1 italic ${
                                    isCompleted || isInProgress 
                                      ? 'text-[hsl(178.6,84.3%,10%)]/80 dark:text-muted-foreground' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    {stepData.notes}
                                  </p>
                                )}
                              </div>
                              {getStepBadge(step.key)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Completion Message */}
                {journey.overallStatus === 'completed' && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-[hsl(178.6,84.3%,10%)] dark:text-green-200">
                            Journey Completed!
                          </p>
                          <p className="text-sm text-[hsl(178.6,84.3%,10%)]/70 dark:text-green-300">
                            {journey.checkOutTime 
                              ? `Checked out at ${new Date(journey.checkOutTime).toLocaleTimeString()}`
                              : 'All steps completed successfully'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Receipt */}
                    {journey.receiptGenerated && journey.costs && (
                      <Card className="border-2 border-primary">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Receipt
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium">Patient:</span>
                              <span>{journey.patientName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Registration:</span>
                              <span>${journey.costs.registration || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Payment/Finance:</span>
                              <span>${journey.costs.payment || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Eye Test & Analysis:</span>
                              <span>${journey.costs.analyst || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Doctor Consultation:</span>
                              <span>${journey.costs.doctor || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pharmacy:</span>
                              <span>${journey.costs.pharmacy || 0}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t-2 font-bold text-lg">
                              <span>Total:</span>
                              <span className="text-primary">${journey.costs.total || 0}</span>
                            </div>
                            <Button 
                              onClick={async () => {
                                try {
                                  const res = await api.get('/patients/journey/receipt');
                                  // Create a download link for receipt
                                  const receiptText = `
RECEIPT - Vision Smart Clinic
${new Date().toLocaleDateString()}

Patient: ${res.data.patientName}
Patient ID: ${res.data.patientId}

Check-in: ${new Date(res.data.checkInTime).toLocaleString()}
Check-out: ${res.data.checkOutTime ? new Date(res.data.checkOutTime).toLocaleString() : 'N/A'}

Services:
- Registration: $${res.data.costs?.registration || 0}
- Payment/Finance: $${res.data.costs?.payment || 0}
- Eye Test & Analysis: $${res.data.costs?.analyst || 0}
- Doctor Consultation: $${res.data.costs?.doctor || 0}
- Pharmacy: $${res.data.costs?.pharmacy || 0}

TOTAL: $${res.data.totalCost}

Thank you for visiting Vision Smart Clinic!
                                  `;
                                  const blob = new Blob([receiptText], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `receipt-${res.data.patientId}-${Date.now()}.txt`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  toast({
                                    title: 'Receipt Downloaded',
                                    description: 'Your receipt has been downloaded.',
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to download receipt.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              className="w-full"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Current Step Notification */}
                {journey.currentStep && journey.overallStatus !== 'completed' && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                      <div>
                        <p className="font-semibold text-[hsl(178.6,84.3%,10%)] dark:text-blue-200">
                          Next Step: {
                            stepConfig.find(s => s.key === journey.currentStep)?.title || 'Unknown'
                          }
                        </p>
                        <p className="text-sm text-[hsl(178.6,84.3%,10%)]/70 dark:text-blue-300">
                          Please proceed to the {stepConfig.find(s => s.key === journey.currentStep)?.title.toLowerCase() || 'next'} station
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Check in at the registration desk when you arrive</li>
              <li>Complete payment at the finance counter</li>
              <li>Proceed to the analyst station for eye testing</li>
              <li>Meet with the doctor for consultation</li>
              <li>Collect your prescription from the pharmacy</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

