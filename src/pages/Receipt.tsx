import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Receipt as ReceiptIcon, Download, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Transaction {
  id: string;
  payerName: string;
  payerPhone: string;
  amount: string;
  paymentType: string;
  description: string;
  timestamp: string;
  collector: string;
}

const Receipt = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const receiptData = localStorage.getItem("currentReceipt");
    if (receiptData) {
      setTransaction(JSON.parse(receiptData));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("PDF download would start here");
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p>No receipt data found.</p>
          <Link to="/collector">
            <Button className="mt-4">Back to Collector Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to="/collector">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              Print Receipt
            </Button>
          </div>
        </div>

        {/* Success Notification */}
        <Card className="mb-6 border-success bg-success/5 print:hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <h3 className="font-semibold text-success">Payment Recorded Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  SMS confirmation sent to {transaction.payerPhone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt */}
        <Card className="shadow-lg print:shadow-none print:border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <ReceiptIcon className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Receipt</h1>
              <p className="text-sm text-muted-foreground">Community E-Receipts Platform</p>
            </div>

            <Separator className="mb-6" />

            {/* Receipt Details */}
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Receipt #</p>
                  <p className="font-mono font-semibold">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{formatDate(transaction.timestamp)}</p>
                </div>
              </div>

              <Separator />

              {/* Payer Information */}
              <div>
                <h3 className="font-semibold mb-3">Payer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">{transaction.payerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{transaction.payerPhone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type</span>
                    <span className="font-semibold capitalize">{transaction.paymentType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg text-success">₦{transaction.amount}</span>
                  </div>
                  {transaction.description && (
                    <div>
                      <p className="text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{transaction.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Collector Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Collected By</p>
                  <p className="font-semibold">{transaction.collector}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              <p className="mb-2">This is an official receipt generated by Community E-Receipts Platform</p>
              <p>For inquiries, contact your community administrator</p>
              <div className="mt-4 p-4 border border-dashed border-muted rounded">
                <p className="font-mono text-xs">QR Code for Verification</p>
                <div className="w-16 h-16 bg-muted rounded mx-auto mt-2 flex items-center justify-center">
                  <span className="text-xs">QR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;