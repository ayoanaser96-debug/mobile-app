'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FaceCapture } from '@/components/face-capture';
import { DocumentScanner } from '@/components/document-scanner';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Scan, User, Fingerprint, Eye, CheckCircle2, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);
  const [capturedFace, setCapturedFace] = useState(false);
  const [scannedDocument, setScannedDocument] = useState<any>(null);
  const [formData, setFormData] = useState({
    identifier: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient',
    specialty: '',
  });
  const { login, register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.identifier, formData.password);
        toast({ title: 'Success', description: 'Logged in successfully' });
        router.push('/');
      } else {
        const registrationData = { ...formData };
        
        // Include scanned document data if available
        if (scannedDocument?.extractedData) {
          // Auto-fill form with extracted data
          if (scannedDocument.extractedData.fullName) {
            const nameParts = scannedDocument.extractedData.fullName.split(/\s+/);
            if (nameParts.length >= 2) {
              registrationData.firstName = nameParts[0];
              registrationData.lastName = nameParts[nameParts.length - 1];
            }
          }
          if (scannedDocument.extractedData.documentNumber && !registrationData.nationalId) {
            registrationData.nationalId = scannedDocument.extractedData.documentNumber;
          }
        }

        await register(registrationData);
        
        // Register face if captured
        if (capturedFace) {
          try {
            await api.post('/biometric/face/register', {
              faceImage: capturedFace,
            });
            toast({ title: 'Success', description: 'Face registered successfully' });
          } catch (error) {
            console.error('Face registration failed:', error);
            // Continue even if face registration fails
          }
        }

        // Save document if scanned
        if (scannedDocument) {
          try {
            await api.post('/biometric/document/scan', {
              documentType: scannedDocument.documentType,
              frontImage: scannedDocument.frontImage,
              backImage: scannedDocument.backImage,
            });
            toast({ title: 'Success', description: 'Document saved successfully' });
          } catch (error) {
            console.error('Document save failed:', error);
            // Continue even if document save fails
          }
        }

        toast({ title: 'Success', description: 'Registered successfully' });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (imageData: string) => {
    setCapturedFace(imageData);
    setShowFaceCapture(false);
    
    if (isLogin) {
      // Try to recognize face for login
      try {
        const response = await api.post('/biometric/face/check-in', {
          faceImage: imageData,
        });

        if (response.data.success) {
          // Auto-login
          const user = response.data.user;
          localStorage.setItem('token', response.data.token || '');
          localStorage.setItem('user', JSON.stringify(user));
          toast({
            title: 'Face Recognized',
            description: `Welcome back, ${user.firstName}!`,
          });
          router.push(`/dashboard/${user.role}`);
        } else {
          toast({
            title: 'Face Not Recognized',
            description: 'Please use email/password login or register',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Recognition Failed',
          description: 'Please use email/password login',
          variant: 'destructive',
        });
      }
    } else {
      // For registration, just store the face image
      toast({
        title: 'Face Captured',
        description: 'Face will be registered after account creation',
      });
    }
  };

  const handleDocumentScan = (data: {
    documentType: string;
    frontImage: string;
    backImage?: string;
    extractedData?: any;
  }) => {
    setScannedDocument(data);
    setShowDocumentScanner(false);
    
    // Auto-fill form with extracted data
    if (data.extractedData) {
      if (data.extractedData.fullName) {
        const nameParts = data.extractedData.fullName.split(/\s+/);
        if (nameParts.length >= 2) {
          setFormData((prev) => ({
            ...prev,
            firstName: nameParts[0],
            lastName: nameParts[nameParts.length - 1],
          }));
        }
      }
      if (data.extractedData.documentNumber) {
        setFormData((prev) => ({
          ...prev,
          nationalId: data.extractedData.documentNumber,
        }));
      }
    }

    toast({
      title: 'Document Scanned',
      description: 'Information extracted and auto-filled',
    });
  };

  if (showFaceCapture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <FaceCapture
            mode={isLogin ? 'recognize' : 'register'}
            onCapture={handleFaceCapture}
            onCancel={() => setShowFaceCapture(false)}
          />
        </div>
      </div>
    );
  }

  if (showDocumentScanner && !isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <DocumentScanner
            onScanComplete={handleDocumentScan}
            onCancel={() => setShowDocumentScanner(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-page bg-background p-4 dashboard-theme" data-page="login" data-dashboard="true">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary tracking-tight">
                Vision Smart Clinic
              </h1>
              <p className="text-lg text-primary/80 font-medium">
                Advanced Eye Care Management
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1 border-primary/50 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="text-xs px-3 py-1 border-primary/50 text-primary">
              <Fingerprint className="h-3 w-3 mr-1" />
              Biometric Secure
            </Badge>
          </div>
        </div>

        <Card className="w-full shadow-xl border-2 border-primary/30" style={{ backgroundColor: 'hsl(178.6, 84.3%, 10%)' }}>
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-3xl font-bold text-center text-white">
                Welcome Back
              </CardTitle>
            </div>
            <CardDescription className="text-base text-center text-white/80">
              Access your account securely with multiple authentication methods
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-base font-semibold py-3">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-base font-semibold py-3">
                  <User className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-6 mt-6">
                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 border-primary/50 hover:bg-primary/10 hover:border-primary"
                    onClick={() => setShowFaceCapture(true)}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Login with Face Recognition
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-11 text-base"
                    onClick={() => router.push('/face-checkin')}
                  >
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Quick Check-In
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="identifier" className="text-base font-semibold">
                      Email, Phone, or National ID
                    </Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter your email, phone, or national ID"
                      value={formData.identifier}
                      onChange={(e) =>
                        setFormData({ ...formData, identifier: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-semibold">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-6 mt-6">
                {/* Quick Actions */}
                <div className="space-y-3">
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-2 border-primary/50 hover:bg-primary/10 hover:border-primary"
                      onClick={() => setShowDocumentScanner(true)}
                    >
                      <Scan className="h-5 w-5 mr-2" />
                      Scan ID/Passport
                    </Button>
                    {scannedDocument && (
                      <div className="p-4 bg-primary/20 border-2 border-primary/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Document Scanned Successfully</p>
                            <p className="text-sm text-muted-foreground">
                              Information has been auto-filled below
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-card px-4 text-muted-foreground font-medium">Or fill manually</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-base font-semibold">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-base font-semibold">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-base font-semibold">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="nationalId" className="text-base font-semibold">
                        National ID
                      </Label>
                      <Input
                        id="nationalId"
                        placeholder="123456789"
                        value={formData.nationalId}
                        onChange={(e) =>
                          setFormData({ ...formData, nationalId: e.target.value })
                        }
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="role" className="text-base font-semibold">
                      Account Type
                    </Label>
                    <select
                      id="role"
                      className="flex h-12 w-full rounded-md border border-input bg-background text-base px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                      <option value="pharmacy">Pharmacy</option>
                    </select>
                  </div>

                  {formData.role === 'doctor' && (
                    <div className="space-y-3">
                      <Label htmlFor="specialty" className="text-base font-semibold">
                        Medical Specialty
                      </Label>
                      <Input
                        id="specialty"
                        placeholder="e.g., General Ophthalmology"
                        value={formData.specialty}
                        onChange={(e) =>
                          setFormData({ ...formData, specialty: e.target.value })
                        }
                        className="h-12 text-base"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-semibold">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>

                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-2 border-primary/50 hover:bg-primary/10 hover:border-primary"
                      onClick={() => setShowFaceCapture(true)}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {capturedFace ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                          Face Captured
                        </>
                      ) : (
                        'Capture Face for Recognition'
                      )}
                    </Button>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Status Indicators */}
            {!isLogin && (capturedFace || scannedDocument) && (
              <div className="mt-6 space-y-3 pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Registration Status:</p>
                {capturedFace && (
                  <div className="flex items-center gap-3 p-3 bg-primary/20 border border-primary/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium text-foreground">
                      Face captured - will be registered after account creation
                    </span>
                  </div>
                )}
                {scannedDocument && (
                  <div className="flex items-center gap-3 p-3 bg-primary/20 border border-primary/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium text-foreground">
                      {scannedDocument.documentType.replace('_', ' ')} scanned successfully
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-base font-semibold underline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setCapturedFace(false);
                  setScannedDocument(null);
                  setShowFaceCapture(false);
                  setShowDocumentScanner(false);
                }}
              >
                {isLogin ? 'Register here' : 'Login here'}
              </Button>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Secure • HIPAA Compliant • Encrypted
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


