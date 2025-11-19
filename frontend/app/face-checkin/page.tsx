'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaceCapture } from '@/components/face-capture';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { User, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function FaceCheckInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState<any>(null);
  const [captured, setCaptured] = useState(false);
  const [faceImage, setFaceImage] = useState<string>('');

  const handleFaceCapture = async (imageData: string) => {
    setFaceImage(imageData);
    setCaptured(true);
    
    // Automatically recognize after capture
    await recognizeFace(imageData);
  };

  const recognizeFace = async (imageData: string) => {
    setRecognizing(true);
    try {
      const response = await api.post('/biometric/face/check-in', {
        faceImage: imageData,
      });

      if (response.data.success) {
        setRecognizedUser(response.data.user);
        toast({
          title: 'Face Recognized',
          description: `Welcome back, ${response.data.user.firstName} ${response.data.user.lastName}!`,
        });

        // Auto-login after recognition
        setTimeout(() => {
          // Store user data and token from backend
          localStorage.setItem('token', response.data.token || '');
          localStorage.setItem('user', JSON.stringify(response.data.user));
          router.push(`/dashboard/${response.data.user.role}`);
        }, 2000);
      } else {
        toast({
          title: 'Face Not Recognized',
          description: 'Please register or use alternative login method',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Recognition Error',
        description: error.response?.data?.message || 'Failed to recognize face',
        variant: 'destructive',
      });
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Camera className="h-8 w-8 text-primary" />
            Face Recognition Check-In
          </h1>
          <p className="text-muted-foreground mt-2">
            Look at the camera to check in automatically
          </p>
        </div>

        {!captured ? (
          <FaceCapture
            mode="recognize"
            onCapture={handleFaceCapture}
            onCancel={() => router.push('/login')}
          />
        ) : recognizedUser ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Face Recognized Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {recognizedUser.firstName} {recognizedUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{recognizedUser.email}</p>
                  <Badge className="mt-1 bg-green-600">
                    {recognizedUser.role}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-green-700">
                Redirecting to your dashboard...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-6 w-6" />
                Face Not Recognized
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700">
                We couldn&rsquo;t recognize your face. Please try again or use an alternative login method.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCaptured(false);
                    setFaceImage('');
                    setRecognizedUser(null);
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Use Login Instead
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/register')}
                >
                  Register New Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

