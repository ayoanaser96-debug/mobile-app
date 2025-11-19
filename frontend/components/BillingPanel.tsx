'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  Pill, 
  Download, 
  RefreshCw,
  FileText,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, InvoiceItem, BillingHistory } from '@/types/billing';

interface BillingPanelProps {
  billingHistory: BillingHistory | null;
  onRefresh?: () => void;
  onPayment?: (invoice: Invoice) => void;
  patientName?: string;
}

export function BillingPanel({ 
  billingHistory, 
  onRefresh, 
  onPayment,
  patientName = 'Patient'
}: BillingPanelProps) {
  const { toast } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  /**
   * Generates a PDF receipt for a given invoice
   * @param invoice - The invoice object containing all billing details
   */
  const generateReceiptPDF = (invoice: Invoice): void => {
    try {
      // Validate invoice data
      if (!invoice || !invoice.id) {
        throw new Error('Invalid invoice data');
      }

      const transactionId = invoice.transactionId || invoice.id;
      const invoiceDate = new Date(invoice.date || new Date());
      const formattedDate = invoiceDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = invoiceDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Create new PDF document (A4 size: 210mm x 297mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Company colors
      const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
      const secondaryColor: [number, number, number] = [16, 185, 129]; // Green
      const textColor: [number, number, number] = [31, 41, 55]; // Dark gray

      // Header Section with Logo Placeholder
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Vision Clinic', 105, 18, { align: 'center' });
      
      // Tagline
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Smart Eye Care Solutions', 105, 26, { align: 'center' });
      
      // Address and Contact Info
      doc.setFontSize(8);
      doc.text('123 Medical Plaza, Healthcare District', 105, 32, { align: 'center' });
      doc.text('Phone: (555) 123-4567 | Email: info@visionclinic.com', 105, 37, { align: 'center' });

      // Reset text color
      doc.setTextColor(...textColor);

      // Receipt Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT RECEIPT', 105, 55, { align: 'center' });

      // Receipt Details Section
      let yPosition = 65;

      // Customer Information
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Information:', 20, yPosition);
      
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${patientName}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Transaction ID: ${transactionId}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Invoice ID: ${invoice.id.substring(0, 8).toUpperCase()}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Date: ${formattedDate}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Time: ${formattedTime}`, 20, yPosition);

      // Invoice Details
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details:', 20, yPosition);
      
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${invoice.type ? invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1) : 'Service'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Description: ${invoice.description || 'N/A'}`, 20, yPosition);

      // Items Table
      if (invoice.items && invoice.items.length > 0) {
        yPosition += 10;
        
        const tableData = invoice.items.map((item) => [
          item.name || 'Item',
          (item.quantity || 1).toString(),
          `$${item.price.toFixed(2)}`,
          `$${((item.quantity || 1) * item.price).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Item', 'Quantity', 'Unit Price', 'Total']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            textColor: textColor,
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 20, right: 20 },
          styles: {
            cellPadding: 3,
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      // Total Amount Section
      yPosition += 5;
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Total Amount:', 150, yPosition);
      doc.setFontSize(16);
      doc.setTextColor(...secondaryColor);
      doc.text(`$${invoice.amount.toFixed(2)}`, 190, yPosition, { align: 'right' });

      // Paid Stamp
      doc.setTextColor(...textColor);
      yPosition += 15;
      doc.setFillColor(...secondaryColor);
      doc.setDrawColor(...secondaryColor);
      doc.roundedRect(150, yPosition - 8, 50, 15, 3, 3, 'FD');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PAID', 175, yPosition, { align: 'center' });

      // Footer Section
      const pageHeight = doc.internal.pageSize.height;
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      doc.line(20, pageHeight - 30, 190, pageHeight - 30);
      
      doc.text('Thank you for your payment!', 105, pageHeight - 25, { align: 'center' });
      doc.text('This is an official receipt for your records.', 105, pageHeight - 20, { align: 'center' });
      doc.text('For inquiries, please contact us at info@visionclinic.com', 105, pageHeight - 15, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });

      // Generate filename
      const filename = `receipt-${transactionId.substring(0, 8).toUpperCase()}.pdf`;

      // Save the PDF
      doc.save(filename);

      toast({
        title: 'Receipt Downloaded',
        description: `Receipt ${transactionId.substring(0, 8)} has been downloaded successfully.`,
      });
    } catch (error: any) {
      console.error('Error generating PDF receipt:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate receipt PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handles the download receipt button click
   * @param invoice - The invoice to generate a receipt for
   */
  const handleDownloadReceipt = async (invoice: Invoice): Promise<void> => {
    const invoiceId = invoice.transactionId || invoice.id;
    
    // Prevent multiple simultaneous downloads
    if (downloadingIds.has(invoiceId)) {
      return;
    }

    setDownloadingIds((prev) => new Set(prev).add(invoiceId));

    try {
      // Validate invoice status
      if (invoice.status !== 'paid') {
        toast({
          title: 'Cannot Download Receipt',
          description: 'Receipts can only be downloaded for paid invoices.',
          variant: 'destructive',
        });
        return;
      }

      // Generate and download PDF
      generateReceiptPDF(invoice);
    } catch (error: any) {
      console.error('Download receipt error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Remove from downloading set after a short delay
      setTimeout(() => {
        setDownloadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(invoiceId);
          return newSet;
        });
      }, 1000);
    }
  };

  const loadingState = !billingHistory;
  const invoices = billingHistory?.invoices || [];
  const hasRealInvoices = invoices.length > 0;

  const demoInvoices: Invoice[] = [
    {
      id: 'demo-apt-001',
      transactionId: 'TXN-APT-DEMO1',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      amount: 150,
      status: 'paid',
      description: 'Comprehensive Eye Exam with Dr. Carter',
      type: 'appointment',
      items: [
        { name: 'Consultation', price: 100, quantity: 1 },
        { name: 'Retinal Imaging', price: 50, quantity: 1 },
      ],
    },
    {
      id: 'demo-rx-002',
      transactionId: 'TXN-RX-DEMO2',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      amount: 225,
      status: 'paid',
      description: 'Prescription fulfillment with smart lenses',
      type: 'prescription',
      items: [
        { name: 'Progressive Lenses', price: 150, quantity: 1 },
        { name: 'Anti-glare Coating', price: 25, quantity: 1 },
        { name: 'Blue-light Filter', price: 50, quantity: 1 },
      ],
    },
    {
      id: 'demo-apt-003',
      transactionId: 'TXN-APT-DEMO3',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      amount: 100,
      status: 'pending',
      description: 'Follow-up consultation with Dr. Lee',
      type: 'appointment',
      items: [{ name: 'Follow-up Consultation', price: 100, quantity: 1 }],
    },
  ];

  const displayInvoices = hasRealInvoices ? invoices : demoInvoices;
  const isDemoMode = !hasRealInvoices;

  const summary = hasRealInvoices
    ? billingHistory?.summary
    : {
        totalInvoices: demoInvoices.length,
        totalAmount: demoInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        pendingAmount: demoInvoices
          .filter((inv) => inv.status !== 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
      };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing & Insurance
            </CardTitle>
            <CardDescription>Transparent billing history, online payments, insurance integration</CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loadingState && (
          <div className="p-8 text-center text-muted-foreground">
            Loading billing history...
          </div>
        )}

        {!loadingState && (
          <div className="space-y-4">
            {/* Summary Cards */}
            {summary && (
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalInvoices}</div>
                    {isDemoMode && <p className="text-xs text-muted-foreground mt-1">Demo data</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${summary.totalAmount?.toLocaleString() || '0'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ${summary.pendingAmount?.toLocaleString() || '0'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Invoice List */}
            <div className="space-y-3">
              {displayInvoices.slice(0, 10).map((invoice: Invoice, idx: number) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {invoice.type === 'appointment' && <Calendar className="h-4 w-4 flex-shrink-0" />}
                          {invoice.type === 'prescription' && <Pill className="h-4 w-4 flex-shrink-0" />}
                          <p className="font-medium">{invoice.description}</p>
                          <Badge 
                            className={
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }
                          >
                            {invoice.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-lg font-bold mb-2">${invoice.amount.toLocaleString()}</p>
                        {invoice.items && invoice.items.length > 0 && (
                          <div className="mt-2 p-2 bg-accent/10 dark:bg-accent/20 rounded text-sm">
                            <p className="font-medium mb-1">Items:</p>
                            <ul className="text-muted-foreground space-y-1">
                              {invoice.items.map((item: InvoiceItem, i: number) => (
                                <li key={i}>• {item.name} - ${item.price}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-2 md:ml-4">
                        <div className="flex flex-wrap gap-2">
                          {/* Download Receipt Button - Always visible */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(invoice)}
                            disabled={invoice.status !== 'paid' || downloadingIds.has(invoice.transactionId || invoice.id)}
                            className="whitespace-nowrap bg-primary/5 hover:bg-primary/10 border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {invoice.status !== 'paid'
                              ? 'Receipt Locked'
                              : downloadingIds.has(invoice.transactionId || invoice.id)
                                ? 'Downloading...'
                                : 'Download Receipt'}
                          </Button>

                          {/* Pay Now button for unpaid invoices */}
                          {invoice.status !== 'paid' && onPayment && (
                            <Button
                              size="sm"
                              onClick={() => onPayment(invoice)}
                              className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                        {invoice.status !== 'paid' && (
                          <p className="text-xs text-muted-foreground">
                            Receipt becomes available once this invoice is marked as paid.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

