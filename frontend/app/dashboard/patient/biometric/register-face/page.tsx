'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaceCapture } from '@/components/face-capture';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Camera, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterFacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [faceImage, setFaceImage] = useState<string>('');

  const handleFaceCapture = async (imageData: string) => {
    setFaceImage(imageData);
    setRegistering(true);

    try {
      await api.post('/biometric/face/register', {
        faceImage: imageData,
      });

      setRegistered(true);
      toast({
        title: 'Success',
        description: 'Face registered successfully. You can now use face recognition for check-in.',
      });

      setTimeout(() => {
        router.push('/dashboard/patient');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to register face',
        variant: 'destructive',
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/patient')}
            className="btn-modern"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Register Face Recognition
            </h1>
          </div>
        </div>

        {registered ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Face Registered Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Your face has been registered. You can now use face recognition for:
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Quick check-in at the clinic</li>
                <li>• Automatic login to your account</li>
                <li>• Secure access to your medical records</li>
              </ul>
              <Button
                className="mt-4"
                onClick={() => router.push('/dashboard/patient')}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <FaceCapture
            mode="register"
            onCapture={handleFaceCapture}
            onCancel={() => router.push('/dashboard/patient')}
            userId={user?.id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

