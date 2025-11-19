'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeTestForm } from '@/components/eye-test-form';
import api from '@/lib/api';
import { Eye, CheckCircle, XCircle, Brain, Activity, Upload, TestTube, Camera, FileText, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';

export default function OptometristDashboard() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [savingSettings, setSavingSettings] = useState(false);
  const [language, setLanguage] = useState<string>('en');
  const [pendingTests, setPendingTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const normalizedRole = user?.role?.toUpperCase() || '';
    if (!loading && !['OPTOMETRIST', 'ADMIN'].includes(normalizedRole)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadPendingTests();
    }
  }, [user]);

  const loadPendingTests = async () => {
    try {
      const res = await api.get('/eye-tests/pending-analysis');
      setPendingTests(res.data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const handleTestSubmit = async (testData: any) => {
    try {
      await api.post('/eye-tests', testData);
      toast({ title: 'Success', description: 'Eye test data submitted successfully' });
      setShowTestForm(false);
      loadPendingTests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit test',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleAnalyze = async (testId: string) => {
    try {
      const res = await api.post(`/eye-tests/${testId}/analyze`);
      toast({ title: 'Success', description: 'AI analysis completed' });
      loadPendingTests();
      if (selectedTest?._id === testId) {
        setSelectedTest(res.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to analyze',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitNotes = async () => {
    if (!selectedTest || !notes.trim()) return;

    try {
      await api.put(`/eye-tests/${selectedTest._id}/optometrist-notes`, { notes });
      toast({ title: 'Success', description: 'Notes added successfully' });
      setSelectedTest(null);
      setNotes('');
      loadPendingTests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add notes',
        variant: 'destructive',
      });
    }
  };

  const filteredTests = pendingTests.filter((test: any) => {
    if (!searchTerm) return true;
    const patientName = `${test.patientId?.firstName || ''} ${test.patientId?.lastName || ''}`.toLowerCase();
    const testId = test._id?.toLowerCase() || '';
    return patientName.includes(searchTerm.toLowerCase()) || testId.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Optometrist Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Eye Test & Analyzer Module - AI-assisted vision analysis
            </p>
          </div>
          <Button onClick={() => setShowTestForm(!showTestForm)} className="btn-modern glow-primary">
            <Upload className="h-4 w-4 mr-2" />
            {showTestForm ? 'View Pending Tests' : 'Enter Test Data'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{pendingTests.length}</div>
              <p className="text-sm font-bold text-foreground mt-1">Awaiting analysis</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzed Today</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {pendingTests.filter((t: any) => t.status === 'analyzed').length}
              </div>
              <p className="text-sm font-bold text-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTests.filter((t: any) => t.aiAnalysis).length}</div>
              <p className="text-sm font-bold text-foreground mt-1">AI processed</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready for Doctor</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTests.filter((t: any) => t.status === 'doctor_review').length}</div>
              <p className="text-sm font-bold text-foreground mt-1">Sent for review</p>
            </CardContent>
          </Card>
        </div>

        {/* Eye Test Form - Landing Page Feature */}
        {showTestForm && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Enter patient ID to link test data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="patient-id">Patient ID (Optional)</Label>
                    <Input
                      id="patient-id"
                      placeholder="Enter patient ID or leave empty"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <EyeTestForm onTestSubmit={handleTestSubmit} patientId={patientId || undefined} />
          </div>
        )}

        {/* Pending Tests Section */}
        {!showTestForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Tests for Analysis</CardTitle>
                  <CardDescription>Tests awaiting AI analysis and review</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTests.length > 0 ? (
                <div className="space-y-4">
                  {filteredTests.map((test: any) => (
                    <div
                      key={test._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          test.status === 'analyzed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Eye className={`h-6 w-6 ${
                            test.status === 'analyzed' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            Patient: {test.patientId?.firstName} {test.patientId?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Test ID: {test._id?.substring(0, 8)}... • {new Date(test.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              test.status === 'analyzed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {test.status}
                            </span>
                            {test.aiAnalysis && (
                              <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                AI Analyzed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedTest(test);
                            setNotes(test.optometristNotes || '');
                          }}
                        >
                          View Details
                        </Button>
                        {test.status === 'pending' && (
                          <Button onClick={() => handleAnalyze(test._id)} className="bg-primary">
                            <Brain className="h-4 w-4 mr-2" />
                            Run AI Analysis
                          </Button>
                        )}
                        {test.status === 'analyzed' && (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No tests found matching your search' : 'No pending tests'}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowTestForm(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Enter New Test Data
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Details Modal */}
        {selectedTest && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Details & Analysis</CardTitle>
                  <CardDescription>Review test data, AI analysis, and add notes</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTest(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Data */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Data
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">Visual Acuity Right:</span>
                    <p className="font-medium">{selectedTest.visualAcuityRight || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Visual Acuity Left:</span>
                    <p className="font-medium">{selectedTest.visualAcuityLeft || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Color Vision:</span>
                    <p className="font-medium">{selectedTest.colorVisionResult || 'N/A'}</p>
                  </div>
                  {selectedTest.refractionRight && (
                    <div>
                      <span className="text-sm text-muted-foreground">Refraction Right:</span>
                      <p className="font-medium text-xs">
                        Sphere: {selectedTest.refractionRight.sphere || 'N/A'}, 
                        Cylinder: {selectedTest.refractionRight.cylinder || 'N/A'}, 
                        Axis: {selectedTest.refractionRight.axis || 'N/A'}
                      </p>
                    </div>
                  )}
                  {selectedTest.refractionLeft && (
                    <div>
                      <span className="text-sm text-muted-foreground">Refraction Left:</span>
                      <p className="font-medium text-xs">
                        Sphere: {selectedTest.refractionLeft.sphere || 'N/A'}, 
                        Cylinder: {selectedTest.refractionLeft.cylinder || 'N/A'}, 
                        Axis: {selectedTest.refractionLeft.axis || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Retina Images */}
              {selectedTest.retinaImages && selectedTest.retinaImages.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Retina Images ({selectedTest.retinaImages.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedTest.retinaImages.map((image: string, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => window.open(image, '_blank')}
                        className="rounded-lg border overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="relative h-40 w-full">
                          <Image
                            src={image}
                            alt={`Retina image ${index + 1}`}
                            fill
                            className="object-cover transition-opacity hover:opacity-80"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 200px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Results */}
              {selectedTest.aiAnalysis && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Analysis Results
                  </h3>
                  <div className="space-y-3 p-4 bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-lg border border-accent/30">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded">
                        <p className="text-xs text-muted-foreground mb-1">Cataract</p>
                        <p className="font-semibold">
                          {selectedTest.aiAnalysis.cataract?.detected ? 'Detected' : 'Not Detected'}
                        </p>
                        {selectedTest.aiAnalysis.cataract?.detected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Severity: {selectedTest.aiAnalysis.cataract.severity} • 
                            Confidence: {(selectedTest.aiAnalysis.cataract.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      <div className="p-3 bg-white rounded">
                        <p className="text-xs text-muted-foreground mb-1">Glaucoma</p>
                        <p className="font-semibold">
                          {selectedTest.aiAnalysis.glaucoma?.detected ? 'Detected' : 'Not Detected'}
                        </p>
                        {selectedTest.aiAnalysis.glaucoma?.detected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Severity: {selectedTest.aiAnalysis.glaucoma.severity} • 
                            Confidence: {(selectedTest.aiAnalysis.glaucoma.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      <div className="p-3 bg-white rounded">
                        <p className="text-xs text-muted-foreground mb-1">Diabetic Retinopathy</p>
                        <p className="font-semibold">
                          {selectedTest.aiAnalysis.diabeticRetinopathy?.detected ? 'Detected' : 'Not Detected'}
                        </p>
                        {selectedTest.aiAnalysis.diabeticRetinopathy?.detected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Severity: {selectedTest.aiAnalysis.diabeticRetinopathy.severity} • 
                            Confidence: {(selectedTest.aiAnalysis.diabeticRetinopathy.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded">
                      <p className="text-xs text-muted-foreground mb-1">Overall Assessment</p>
                      <p className="text-sm">{selectedTest.aiAnalysis.overallAssessment}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optometrist Notes */}
              <div>
                <h3 className="font-medium mb-3">Optometrist Notes</h3>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes and observations for the doctor..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedTest.status === 'pending' && (
                  <Button onClick={() => handleAnalyze(selectedTest._id)} className="bg-primary">
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </Button>
                )}
                <Button onClick={handleSubmitNotes} disabled={!notes.trim()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Notes & Send to Doctor
                </Button>
                <Button variant="outline" onClick={() => setSelectedTest(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Optometrist Settings</CardTitle>
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
              Changes apply immediately. Use &quot;Save Settings&quot; to persist to backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
