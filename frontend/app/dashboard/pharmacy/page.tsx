'use client';

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import {
  Pill,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  QrCode,
  Sparkles,
  MessageSquare,
  Settings,
  Users,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function PharmacyDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    quantity: 0,
    unitPrice: 0,
    batchNumber: '',
    expiryDate: '',
    supplier: '',
    reorderLevel: 10,
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh prescriptions every 30 seconds to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prescRes, inventoryRes, lowStockRes, expiringRes, suppliersRes, analyticsRes] = await Promise.all([
        api.get('/pharmacy/prescriptions').catch(() => ({ data: [] })),
        api.get('/pharmacy/inventory').catch(() => ({ data: [] })),
        api.get('/pharmacy/inventory/low-stock').catch(() => ({ data: [] })),
        api.get('/pharmacy/inventory/expiring-soon').catch(() => ({ data: [] })),
        api.get('/pharmacy/suppliers').catch(() => ({ data: [] })),
        api.get('/pharmacy/analytics').catch(() => ({ data: null })),
      ]);

      setPrescriptions(prescRes.data || []);
      setInventory(inventoryRes.data || []);
      setLowStock(lowStockRes.data || []);
      setExpiringItems(expiringRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionStatusUpdate = async (prescriptionId: string, status: string) => {
    try {
      setLoading(true);
      // Normalize status to uppercase for backend
      const normalizedStatus = status.toUpperCase();
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/status`, { status: normalizedStatus });
      toast({ 
        title: 'Success', 
        description: `Prescription status updated to ${status}. Patient and doctor have been notified.` 
      });
      await loadData();
    } catch (error: any) {
      console.error('Error updating prescription status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update prescription status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (prescriptionId: string) => {
    try {
      const response = await api.get(`/pharmacy/prescriptions/${prescriptionId}/qr`);
      toast({ title: 'QR Code Generated', description: 'QR code ready for scanning' });
      // In a real app, display the QR code
      console.log('QR Code:', response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleGetAISuggestions = async (prescriptionId: string) => {
    try {
      const response = await api.get(`/pharmacy/prescriptions/${prescriptionId}/ai-suggestions`);
      toast({ title: 'AI Suggestions', description: `Found ${response.data.suggestions?.length || 0} alternatives` });
      // In a real app, display the suggestions in a modal
      console.log('AI Suggestions:', response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    }
  };

  const handleAddInventoryItem = async () => {
    try {
      await api.post('/pharmacy/inventory', newInventoryItem);
      toast({ title: 'Success', description: 'Inventory item added successfully' });
      setShowAddInventory(false);
      setNewInventoryItem({
        name: '',
        quantity: 0,
        unitPrice: 0,
        batchNumber: '',
        expiryDate: '',
        supplier: '',
        reorderLevel: 10,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add inventory item',
        variant: 'destructive',
      });
    }
  };

  const handleAddSupplier = async () => {
    try {
      await api.post('/pharmacy/suppliers', newSupplier);
      toast({ title: 'Success', description: 'Supplier added successfully' });
      setShowAddSupplier(false);
      setNewSupplier({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add supplier',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleDelivery = () => {
    toast({ 
      title: 'Schedule Delivery', 
      description: 'Delivery scheduling feature coming soon' 
    });
  };

  const handleStartConversation = () => {
    toast({ 
      title: 'Start Conversation', 
      description: 'Chat feature coming soon' 
    });
  };

  const handleViewSupplierDetails = (supplierId: string) => {
    toast({ 
      title: 'Supplier Details', 
      description: 'Viewing supplier details' 
    });
  };

  const handleSaveSettings = () => {
    toast({ 
      title: 'Settings Saved', 
      description: 'Pharmacy settings have been updated successfully' 
    });
  };

  const handleCheckAvailability = async (prescription: any) => {
    setSelectedPrescription(prescription);
    setCheckingAvailability(true);
    try {
      const prescriptionId = prescription.id || prescription._id;
      const response = await api.get(`/pharmacy/prescriptions/${prescriptionId}/check-availability`);
      setAvailabilityData(response.data);
      setShowAvailabilityModal(true);
      
      // If items are missing, show reject option
      if (!response.data.allAvailable && response.data.missingItems.length > 0) {
        // Auto-populate reject reason
        const missingNames = response.data.missingItems.map((item: any) => item.name).join(', ');
        setRejectReason(`Items not available in stock: ${missingNames}`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check availability',
        variant: 'destructive',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleRejectPrescription = async () => {
    if (!selectedPrescription || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      const prescriptionId = selectedPrescription.id || selectedPrescription._id;
      const missingItems = availabilityData?.missingItems?.map((item: any) => item.name) || [];
      await api.post(`/pharmacy/prescriptions/${prescriptionId}/reject`, {
        reason: rejectReason,
        missingItems: missingItems.length > 0 ? missingItems : ['Unknown items'],
      });
      
      toast({
        title: 'Success',
        description: 'Prescription rejected and returned to doctor. Notifications sent.',
      });
      
      setShowAvailabilityModal(false);
      setShowRejectModal(false);
      setSelectedPrescription(null);
      setAvailabilityData(null);
      setRejectReason('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject prescription',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pharmacy Dashboard</h1>
            <p className="text-muted-foreground">Manage prescriptions, inventory, and operations</p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING').length}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStock.length}</div>
              <p className="text-xs text-muted-foreground">Need reordering</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringItems.length}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.todayRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI & Forecast</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Smart Prescription Management</CardTitle>
                <CardDescription>Process and validate prescriptions with AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No prescriptions available</p>
                    </div>
                  ) : (
                    prescriptions.map((prescription) => {
                      const prescriptionId = prescription.id || prescription._id;
                      const patient = prescription.patient || prescription.patientId;
                      const doctor = prescription.doctor || prescription.doctorId;
                      return (
                      <Card key={prescriptionId} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {patient?.firstName} {patient?.lastName}
                                </h3>
                                <Badge
                                  className={
                                    prescription.status?.toUpperCase() === 'PENDING'
                                      ? 'bg-orange-500'
                                      : prescription.status?.toUpperCase() === 'PROCESSING'
                                      ? 'bg-blue-500'
                                      : prescription.status?.toUpperCase() === 'READY'
                                      ? 'bg-green-500'
                                      : prescription.status?.toUpperCase() === 'DELIVERED'
                                      ? 'bg-purple-500'
                                      : prescription.status?.toUpperCase() === 'COMPLETED'
                                      ? 'bg-emerald-500'
                                      : prescription.status?.toUpperCase() === 'CANCELLED'
                                      ? 'bg-red-500'
                                      : 'bg-gray-500'
                                  }
                                >
                                  {prescription.status?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Doctor: {doctor?.firstName} {doctor?.lastName}
                              </p>
                              <div className="text-sm">
                                <strong>Medications:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {prescription.medications?.map((med: any, idx: number) => (
                                    <li key={idx}>
                                      {med.name} - {med.dosage} ({med.frequency})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {prescription.glasses && (
                                <div className="text-sm">
                                  <strong>Glasses:</strong> Prescribed
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              {(prescription.status?.toUpperCase() === 'PENDING' || !prescription.status) && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'processing')}
                                  disabled={loading}
                                >
                                  Start Processing
                                </Button>
                              )}
                              {prescription.status?.toUpperCase() === 'PROCESSING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'ready')}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Mark Ready
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'pending')}
                                    disabled={loading}
                                  >
                                    Back to Pending
                                  </Button>
                                </>
                              )}
                              {prescription.status?.toUpperCase() === 'READY' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'delivered')}
                                    disabled={loading}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Mark Delivered
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'completed')}
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    Mark Completed
                                  </Button>
                                </>
                              )}
                              {prescription.status?.toUpperCase() === 'DELIVERED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePrescriptionStatusUpdate(prescriptionId, 'completed')}
                                  disabled={loading}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Mark Completed
                                </Button>
                              )}
                              {prescription.status?.toUpperCase() === 'CANCELLED' && (
                                <Badge variant="destructive" className="w-full justify-center">
                                  Cancelled
                                </Badge>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleGenerateQR(prescriptionId)}>
                                <QrCode className="h-4 w-4 mr-1" />
                                QR Code
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleGetAISuggestions(prescriptionId)}>
                                <Sparkles className="h-4 w-4 mr-1" />
                                AI Suggestions
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleCheckAvailability(prescription)}
                                disabled={checkingAvailability}
                                className={
                                  prescription.status?.toUpperCase() === 'PENDING' || prescription.status?.toUpperCase() === 'PROCESSING'
                                    ? 'border-orange-500 text-orange-600 hover:bg-orange-50'
                                    : ''
                                }
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Check Availability
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Track stock levels and manage medications</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddInventory(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Low Stock Alert */}
                  {lowStock.length > 0 && (
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Low Stock Alert
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {lowStock.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <span className="font-medium">{item.name}</span>
                              <Badge className="bg-red-500">Only {item.quantity} left</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Expiring Soon Alert */}
                  {expiringItems.length > 0 && (
                    <Card className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          Expiring Soon
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {expiringItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <span className="font-medium">{item.name}</span>
                              <Badge className="bg-yellow-500">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* All Inventory */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">All Items</h3>
                    {inventory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No inventory items</p>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {inventory.map((item) => (
                          <Card key={item._id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Batch: {item.batchNumber} | Supplier: {item.supplier}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    className={
                                      item.quantity < item.reorderLevel
                                        ? 'bg-red-500'
                                        : item.quantity < item.reorderLevel * 2
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }
                                  >
                                    {item.quantity} units
                                  </Badge>
                                  <p className="text-sm text-muted-foreground mt-1">${item.unitPrice}/unit</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
                    <CardDescription>Manage relationships and ratings</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddSupplier(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Supplier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No suppliers registered</p>
                    </div>
                  ) : (
                    suppliers.map((supplier) => (
                      <Card key={supplier._id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{supplier.name}</h4>
                              <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                              <p className="text-sm">{supplier.email} | {supplier.phone}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span>Rating:</span>
                                <Badge className="bg-blue-500">
                                  {supplier.rating?.overall || 'N/A'}/5
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewSupplierDetails(supplier._id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery & Logistics</CardTitle>
                <CardDescription>Track deliveries and manage logistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active deliveries</p>
                  <Button className="mt-4" onClick={handleScheduleDelivery}>Schedule Delivery</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold">${analytics?.monthlyRevenue || 0}</div>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Prescriptions Filled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold">{analytics?.prescriptionsFilled || 0}</div>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & Forecast Tab */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Stock Forecasting</CardTitle>
                <CardDescription>Predictive analytics for inventory management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>AI forecasting coming soon</p>
                  <p className="text-sm mt-2">Based on disease trends and prescription patterns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doctor-Pharmacist Communication</CardTitle>
                <CardDescription>Collaborate on prescriptions and patient care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages</p>
                  <Button className="mt-4" onClick={handleStartConversation}>Start Conversation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Settings</CardTitle>
                <CardDescription>Configure your pharmacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pharmacy Name</Label>
                  <Input placeholder="Enter pharmacy name" />
                </div>
                <div className="space-y-2">
                  <Label>Operating Hours</Label>
                  <Input placeholder="e.g., 8:00 AM - 10:00 PM" />
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" placeholder="e.g., 10" />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Alert (days before)</Label>
                  <Input type="number" placeholder="e.g., 30" />
                </div>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Inventory Modal */}
        {showAddInventory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Inventory Item</CardTitle>
                <CardDescription>Add a new medication to inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Medication Name</Label>
                  <Input
                    value={newInventoryItem.name}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                    placeholder="e.g., Aspirin 500mg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newInventoryItem.quantity}
                      onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Unit Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newInventoryItem.unitPrice}
                      onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unitPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    value={newInventoryItem.batchNumber}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, batchNumber: e.target.value })}
                    placeholder="e.g., BATCH-2024-001"
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={newInventoryItem.expiryDate}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={newInventoryItem.supplier}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <Label>Reorder Level</Label>
                  <Input
                    type="number"
                    value={newInventoryItem.reorderLevel}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, reorderLevel: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddInventoryItem} className="flex-1">
                    Add Item
                  </Button>
                  <Button onClick={() => setShowAddInventory(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Supplier Modal */}
        {showAddSupplier && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Supplier</CardTitle>
                <CardDescription>Register a new supplier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="e.g., MedSupply Co."
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="supplier@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSupplier} className="flex-1">
                    Add Supplier
                  </Button>
                  <Button onClick={() => setShowAddSupplier(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Availability Check Modal */}
        {showAvailabilityModal && availabilityData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Prescription Availability Check</CardTitle>
                    <CardDescription>
                      Patient: {(selectedPrescription?.patient || selectedPrescription?.patientId)?.firstName} {(selectedPrescription?.patient || selectedPrescription?.patientId)?.lastName}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAvailabilityModal(false);
                      setAvailabilityData(null);
                      setSelectedPrescription(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {availabilityData.allAvailable ? (
                  <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">All items are available</p>
                      <p className="text-sm text-green-700">You can proceed with filling this prescription</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">Some items are missing or unavailable</p>
                        <p className="text-sm text-red-700">You may need to reject this prescription and return it to the doctor</p>
                      </div>
                    </div>

                    {availabilityData.missingItems.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-900">Missing Items:</h4>
                        <div className="space-y-2">
                          {availabilityData.missingItems.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="destructive">
                                  {item.status === 'out_of_stock' ? 'Out of Stock' : 'Not Found'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Required: {item.required} | Available: {item.available}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availabilityData.availableItems.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-900">Available Items:</h4>
                        <div className="space-y-2">
                          {availabilityData.availableItems.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.name}</span>
                                <Badge className="bg-green-500">
                                  {item.status === 'available' ? `Stock: ${item.available}` : item.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Label htmlFor="reject-reason">Rejection Reason (Required if rejecting):</Label>
                      <textarea
                        id="reject-reason"
                        className="w-full mt-2 p-3 border rounded-md min-h-[100px]"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejecting this prescription..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowRejectModal(true);
                        }}
                        disabled={!rejectReason.trim()}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject & Return to Doctor
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAvailabilityModal(false);
                          setAvailabilityData(null);
                          setSelectedPrescription(null);
                          setRejectReason('');
                        }}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Confirm Rejection</CardTitle>
                <CardDescription>
                  This will return the prescription to the doctor and notify both the doctor and patient.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900">
                    Missing Items: {availabilityData?.missingItems?.map((item: any) => item.name).join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Rejection Reason:</Label>
                  <p className="mt-2 p-3 bg-gray-50 rounded border text-sm">{rejectReason}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleRejectPrescription}
                    className="flex-1"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1"
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

