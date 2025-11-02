'use client';

import { useEffect, useState } from 'react';
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
  User,
  CreditCard,
  TestTube,
  Stethoscope,
  Pill,
  RefreshCw,
  Check
} from 'lucide-react';

interface JourneyStep {
  step: string;
  status: string;
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
}

const stepConfig: Record<string, { title: string; icon: any; roles: string[] }> = {
  payment: { title: 'Payment', icon: CreditCard, roles: ['admin'] },
  analyst: { title: 'Analyst', icon: TestTube, roles: ['admin', 'analyst'] },
  doctor: { title: 'Doctor', icon: Stethoscope, roles: ['admin', 'doctor'] },
  pharmacy: { title: 'Pharmacy', icon: Pill, roles: ['admin', 'pharmacy'] },
};

export default function AdminJourneyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [journeys, setJourneys] = useState<PatientJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !['admin', 'analyst', 'doctor', 'pharmacy'].includes(user?.role || '')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadJourneys();
      const interval = setInterval(loadJourneys, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadJourneys = async () => {
    try {
      const res = await api.get('/patients/journey/active');
      setJourneys(res.data);
    } catch (error) {
      console.error('Error loading journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (patientId: string, step: string) => {
    setMarkingComplete(`${patientId}-${step}`);
    try {
      await api.post(`/patients/journey/${step}/complete`, {
        patientId,
        notes: `${step} completed by ${user?.firstName} ${user?.lastName}`,
      });
      toast({
        title: 'Step Marked Complete',
        description: `${step} has been marked as complete for patient.`,
      });
      loadJourneys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark step as complete.',
        variant: 'destructive',
      });
    } finally {
      setMarkingComplete('');
    }
  };

  const getStepStatus = (journey: PatientJourney, stepKey: string) => {
    const step = journey.steps.find((s) => s.step === stepKey);
    return step?.status || 'pending';
  };

  const canMarkStep = (stepKey: string) => {
    if (!user) return false;
    const config = stepConfig[stepKey];
    if (!config) return false;
    return config.roles.includes(user.role) || user.role === 'admin';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Active Patient Journeys</h1>
            <p className="text-muted-foreground mt-1">
              Mark steps as complete for patients
            </p>
          </div>
          <Button onClick={loadJourneys} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {journeys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active journeys found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {journeys.map((journey) => (
              <Card key={journey._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{journey.patientName}</CardTitle>
                      <CardDescription>
                        Patient ID: {journey.patientId} | Checked in: {new Date(journey.checkInTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={
                      journey.overallStatus === 'completed' 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }>
                      {journey.currentStep || journey.overallStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stepConfig).map(([stepKey, config]) => {
                      const status = getStepStatus(journey, stepKey);
                      const isCompleted = status === 'completed';
                      const Icon = config.icon;
                      const canMark = canMarkStep(stepKey);
                      const isPending = status === 'pending' && journey.currentStep === stepKey;

                      return (
                        <div 
                          key={stepKey}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCompleted 
                              ? 'bg-green-50 border-green-300' 
                              : isPending 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-muted border-border opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : isPending ? 'text-blue-600' : 'text-muted-foreground'}`} />
                            <div>
                              <p className="font-medium">{config.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {isCompleted 
                                  ? `Completed at ${journey.steps.find(s => s.step === stepKey)?.completedAt ? new Date(journey.steps.find(s => s.step === stepKey)!.completedAt!).toLocaleTimeString() : 'N/A'}`
                                  : isPending 
                                  ? 'Ready to process'
                                  : 'Pending'
                                }
                              </p>
                            </div>
                          </div>
                          {canMark && isPending && (
                            <Button
                              size="sm"
                              onClick={() => markStepComplete(journey.patientId, stepKey)}
                              disabled={markingComplete === `${journey.patientId}-${stepKey}`}
                            >
                              {markingComplete === `${journey.patientId}-${stepKey}` ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Done
                                </>
                              )}
                            </Button>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

