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
  Package, 
  CheckCircle, 
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Truck,
  BarChart3,
  Settings,
  QrCode,
  Brain,
  Box,
  PackageCheck,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Bell,
  Download,
  Eye,
  Truck as TruckIcon,
  User,
  Activity,
  FileText
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

export default function PharmacyDashboard() {
  const { user, loading } = useAuth();
  const { theme, language, currency, setTheme, setLanguage, setCurrency } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [drugDemand, setDrugDemand] = useState([]);
  const [stockForecast, setStockForecast] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !['pharmacy', 'admin'].includes(user?.role || '')) {
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
        prescriptionsRes,
        inventoryRes,
        lowStockRes,
        expiringRes,
        suppliersRes,
        analyticsRes,
        drugDemandRes,
        stockForecastRes,
      ] = await Promise.all([
        api.get('/pharmacy/prescriptions'),
        api.get('/pharmacy/inventory'),
        api.get('/pharmacy/inventory/low-stock'),
        api.get('/pharmacy/inventory/expiring-soon'),
        api.get('/pharmacy/suppliers'),
        api.get('/pharmacy/analytics'),
        api.get('/pharmacy/analytics/drug-demand'),
        api.get('/pharmacy/stock-forecast'),
      ]);
      
      setPrescriptions(prescriptionsRes.data || []);
      setInventory(inventoryRes.data || []);
      setLowStockItems(lowStockRes.data || []);
      setExpiringSoon(expiringRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setAnalytics(analyticsRes.data);
      setDrugDemand(drugDemandRes.data || []);
      setStockForecast(stockForecastRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pharmacy data',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (prescriptionId: string, status: string, notes?: string) => {
    try {
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/status`, { status, notes });
      toast({ title: 'Success', description: `Prescription status updated to ${status}` });
      loadAllData();
      if (selectedPrescription?._id === prescriptionId) {
        setSelectedPrescription({ ...selectedPrescription, status });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateQR = async (prescriptionId: string) => {
    try {
      const res = await api.get(`/pharmacy/prescriptions/${prescriptionId}/qr`);
      setQrCode(res.data.qrCode);
      toast({ title: 'Success', description: 'QR code generated' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleValidatePrescription = async (prescriptionId: string) => {
    try {
      const res = await api.post(`/pharmacy/prescriptions/${prescriptionId}/validate`, {});
      setValidationResults(res.data);
      if (res.data.isValid) {
        toast({ title: 'Valid', description: 'Prescription is valid' });
      } else {
        toast({
          title: 'Validation Issues',
          description: `Found ${res.data.errors.length} errors`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to validate',
        variant: 'destructive',
      });
    }
  };

  const handleGetAISuggestions = async (prescriptionId: string) => {
    try {
      const res = await api.get(`/pharmacy/prescriptions/${prescriptionId}/ai-suggestions`);
      setAiSuggestions(res.data || []);
      toast({ title: 'AI Suggestions', description: `Found ${res.data.length} alternatives` });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDelivery = async (prescriptionId: string, deliveryData: any) => {
    try {
      await api.post(`/pharmacy/prescriptions/${prescriptionId}/delivery`, deliveryData);
      toast({ title: 'Success', description: 'Delivery order created' });
      loadAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create delivery',
        variant: 'destructive',
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter((pres: any) => {
    const matchesSearch = !searchTerm || 
      pres.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pres.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'filled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Chart data
  const topMedications = analytics?.topMedications || [];
  const forecastData = stockForecast.slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pharmacy Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Smart prescription management, inventory, and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData} className="btn-modern">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{analytics?.totalPrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Box className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalInventoryItems || 0}</div>
              <p className="text-xs text-red-600 font-semibold">
                {analytics?.lowStockItems || 0} low stock
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${analytics?.revenue?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This period</p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:border-primary/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expiringSoon.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI & Forecast</TabsTrigger>
            <TabsTrigger value="communication">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Smart Prescription Management</CardTitle>
                    <CardDescription>Automatic sync, validation, and QR codes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPrescriptions.map((prescription: any) => (
                      <Card key={prescription._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(prescription.status)}>
                                  {prescription.status}
                                </Badge>
                                {prescription.metadata?.digitalSignature && (
                                  <Badge variant="outline" className="bg-green-50">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Signed
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(prescription.createdAt || prescription.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <p className="font-medium mb-1">
                                Patient: {prescription.patientId?.firstName} {prescription.patientId?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                Doctor: {prescription.doctorId?.firstName} {prescription.doctorId?.lastName}
                              </p>
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
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <p className="font-medium mb-1">Doctor Notes:</p>
                                  <p className="text-muted-foreground">{prescription.notes}</p>
                                </div>
                              )}

                              {validationResults && validationResults.prescription?._id === prescription._id && (
                                <div className={`mt-2 p-2 rounded text-sm ${validationResults.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                  <p className="font-medium mb-1">Validation:</p>
                                  {validationResults.errors.length > 0 && (
                                    <ul className="text-red-600 text-xs space-y-1">
                                      {validationResults.errors.map((err: string, i: number) => (
                                        <li key={i}>⚠ {err}</li>
                                      ))}
                                    </ul>
                                  )}
                                  {validationResults.warnings.length > 0 && (
                                    <ul className="text-yellow-600 text-xs space-y-1">
                                      {validationResults.warnings.map((warn: string, i: number) => (
                                        <li key={i}>ℹ {warn}</li>
                                      ))}
                                    </ul>
                                  )}
                                  {validationResults.isValid && validationResults.errors.length === 0 && (
                                    <p className="text-green-600">✓ Prescription is valid</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrescription(prescription);
                                  handleValidatePrescription(prescription._id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Validate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateQR(prescription._id)}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                QR Code
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrescription(prescription);
                                  handleGetAISuggestions(prescription._id);
                                }}
                              >
                                <Brain className="h-4 w-4 mr-2" />
                                AI Suggestions
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const doctorId = prescription.doctorId?._id || prescription.doctorId;
                                  if (doctorId) {
                                    router.push(`/dashboard/pharmacy/chat?doctorId=${doctorId}&prescriptionId=${prescription._id}`);
                                  } else {
                                    toast({
                                      title: 'Error',
                                      description: 'Doctor not found for this prescription',
                                      variant: 'destructive',
                                    });
                                  }
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat with Doctor
                              </Button>
                              
                              {prescription.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(prescription._id, 'processing')}
                                  >
                                    Start Processing
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      await api.put(`/prescriptions/${prescription._id}/assign-pharmacy`, {
                                        pharmacyId: user?.id,
                                      });
                                      toast({ title: 'Success', description: 'Prescription assigned' });
                                      loadAllData();
                                    }}
                                  >
                                    Assign to Me
                                  </Button>
                                </>
                              )}
                              
                              {prescription.status === 'processing' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(prescription._id, 'ready')}
                                >
                                  Mark Ready
                                </Button>
                              )}
                              
                              {prescription.status === 'ready' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(prescription._id, 'completed')}
                                >
                                  Mark Completed
                                </Button>
                              )}
                              
                              {prescription.deliveryInfo && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <TruckIcon className="h-3 w-3 mr-1" />
                                  Tracking: {prescription.deliveryInfo.trackingNumber}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* QR Code Display */}
                          {qrCode && selectedPrescription?._id === prescription._id && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                              <p className="text-sm font-medium mb-2">QR Code:</p>
                              {qrCode.startsWith('data:image') ? (
                                <img src={qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                              ) : (
                                <div className="text-xs bg-white p-2 rounded break-all">{qrCode}</div>
                              )}
                            </div>
                          )}

                          {/* AI Suggestions */}
                          {aiSuggestions.length > 0 && selectedPrescription?._id === prescription._id && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                AI Drug Suggestions:
                              </p>
                              <div className="space-y-2">
                                {aiSuggestions.map((suggestion: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-white rounded text-sm">
                                    <p className="font-medium">For: {suggestion.originalMedication}</p>
                                    <p className="text-muted-foreground">
                                      Alternative: {suggestion.alternative.name} ({suggestion.alternative.genericName})
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline">${suggestion.alternative.price}</Badge>
                                      <Badge variant="outline">Stock: {suggestion.alternative.stock}</Badge>
                                      {suggestion.alternative.savings > 0 && (
                                        <Badge className="bg-green-100 text-green-800">
                                          Save ${suggestion.alternative.savings}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {suggestion.reason}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No prescriptions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory & Stock Management</CardTitle>
                    <CardDescription>Real-time stock levels, expiry tracking, and batch management</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/dashboard/pharmacy/inventory/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Expiring Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{inventory.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Low Stock Alerts */}
                {lowStockItems.length > 0 && (
                  <Card className="mb-4 border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Low Stock Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lowStockItems.slice(0, 5).map((item: any) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Stock: {item.stock} {item.unit}</p>
                            </div>
                            <Badge className="bg-red-600">Reorder Now</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Expiring Soon */}
                {expiringSoon.length > 0 && (
                  <Card className="mb-4 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Clock className="h-5 w-5" />
                        Expiring Soon (Next 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {expiringSoon.slice(0, 5).map((item: any) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Batch: {item.batchNumber} • Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className="bg-orange-600">
                              {Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Inventory List */}
                <div>
                  <h3 className="font-medium mb-3">All Inventory Items</h3>
                  <div className="space-y-2">
                    {inventory.slice(0, 10).map((item: any) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.genericName} • Batch: {item.batchNumber} • Stock: {item.stock} {item.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()} • 
                            Price: ${item.sellingPrice}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={item.stock <= (item.reorderLevel || 10) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {item.stock <= (item.reorderLevel || 10) ? 'Low Stock' : 'In Stock'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Supplier Management</CardTitle>
                    <CardDescription>Manage suppliers and track ratings</CardDescription>
                  </div>
                  <Button onClick={() => {/* Add supplier modal */}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {suppliers.length > 0 ? (
                  <div className="space-y-3">
                    {suppliers.map((supplier: any) => (
                      <Card key={supplier._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{supplier.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {supplier.contactEmail} • {supplier.contactPhone}
                              </p>
                              {supplier.address && (
                                <p className="text-sm text-muted-foreground">{supplier.address}</p>
                              )}
                              {supplier.rating && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs">Rating:</span>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {supplier.rating.overall?.toFixed(1)}/5.0
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Delivery: {supplier.rating.deliveryTime}/5 • 
                                    Reliability: {supplier.rating.reliability}/5 • 
                                    Quality: {supplier.rating.quality}/5
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm">
                              View Orders
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No suppliers added</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Smart Delivery & Logistics</CardTitle>
                <CardDescription>Track deliveries and manage logistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.filter((p: any) => p.deliveryInfo).length > 0 ? (
                    prescriptions
                      .filter((p: any) => p.deliveryInfo)
                      .map((prescription: any) => (
                        <Card key={prescription._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getStatusColor(prescription.deliveryInfo.status)}>
                                    {prescription.deliveryInfo.status}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    Tracking: {prescription.deliveryInfo.trackingNumber}
                                  </span>
                                </div>
                                <p className="font-medium">
                                  {prescription.patientId?.firstName} {prescription.patientId?.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {prescription.deliveryInfo.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Phone: {prescription.deliveryInfo.phone}
                                </p>
                                {prescription.deliveryInfo.estimatedDelivery && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ETA: {new Date(prescription.deliveryInfo.estimatedDelivery).toLocaleString()}
                                  </p>
                                )}
                                {prescription.deliveryInfo.currentLocation && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Current Location: {prescription.deliveryInfo.currentLocation}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const status = prescription.deliveryInfo.status === 'dispatched' 
                                      ? 'in_transit' 
                                      : prescription.deliveryInfo.status === 'in_transit'
                                      ? 'delivered'
                                      : 'delivered';
                                    api.put(`/pharmacy/prescriptions/${prescription._id}/delivery-status`, { status });
                                    loadAllData();
                                  }}
                                >
                                  Update Status
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active deliveries</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create delivery orders from prescriptions
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Prescribed Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  {topMedications.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topMedications.slice(0, 10)} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(168.4 83.8% 65% / 30%)" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100} 
                          stroke="hsl(168.4 83.8% 65%)"
                          tick={{ fill: 'hsl(168.4 83.8% 65%)' }}
                        />
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
                        <Bar 
                          dataKey="count" 
                          fill="hsl(168.4 90% 75%)" 
                          name="Prescriptions"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pharmacy Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Prescriptions</span>
                      <span className="font-bold">{analytics?.totalPrescriptions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{analytics?.pending || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing</span>
                      <Badge className="bg-blue-100 text-blue-800">{analytics?.processing || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready</span>
                      <Badge className="bg-green-100 text-green-800">{analytics?.ready || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered</span>
                      <Badge className="bg-purple-100 text-purple-800">{analytics?.delivered || 0}</Badge>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Revenue</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${analytics?.revenue?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Drug Demand Analytics */}
            {drugDemand.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Drug Demand Analytics</CardTitle>
                  <CardDescription>Most prescribed medications by condition and doctor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drugDemand.slice(0, 10).map((drug: any) => (
                      <div key={drug.drug} className="p-3 border rounded-lg">
                        <p className="font-medium">{drug.drug}</p>
                        <p className="text-sm text-muted-foreground">Prescribed {drug.count} times</p>
                        {Object.keys(drug.byCondition).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">By Condition:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(drug.byCondition).map(([condition, count]: [string, any]) => (
                                <Badge key={condition} variant="outline">
                                  {condition}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI & Forecast Tab */}
          <TabsContent value="ai" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Stock Forecasting
                  </CardTitle>
                  <CardDescription>Predicts which medicines will run low soon</CardDescription>
                </CardHeader>
                <CardContent>
                  {stockForecast.length > 0 ? (
                    <div className="space-y-3">
                      {forecastData.map((forecast: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{forecast.medication}</p>
                            <Badge 
                              className={
                                forecast.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                forecast.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {forecast.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Stock:</span>
                              <span className="ml-2 font-medium">{forecast.currentStock}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Predicted Demand:</span>
                              <span className="ml-2 font-medium">{forecast.predictedDemand}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Days Until Low:</span>
                              <span className="ml-2 font-medium text-red-600">{forecast.daysUntilLowStock}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Needs Reorder:</span>
                              <span className="ml-2 font-medium">{forecast.needsReorder ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No forecast data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Auto Refill Alerts</CardTitle>
                  <CardDescription>Automatic reminders for chronic prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Auto refill alerts will appear here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      System monitors chronic prescriptions and sends reminders
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Doctor-Pharmacist Chat Panel
                </CardTitle>
                <CardDescription>Real-time communication for prescription clarifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chat panel will open here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use this to communicate with doctors about prescriptions
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/dashboard/pharmacy/chat')}>
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Settings</CardTitle>
                <CardDescription>Configure pharmacy preferences and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Currency</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm mt-2"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (ع.د)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
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
                      await api.put('/admin/settings', { currency, language, theme });
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
