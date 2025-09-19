import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Send, Printer, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import paysureLogo from "@/assets/paysure-logo.png";

const CollectorDashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    payerName: "",
    payerPhone: "",
    amount: "",
    paymentType: "",
    description: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payerName || !formData.payerPhone || !formData.amount || !formData.paymentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert transaction into Supabase
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            payer_name: formData.payerName,
            payer_phone: formData.payerPhone,
            amount: parseFloat(formData.amount),
            payment_type: formData.paymentType,
            description: formData.description,
            collector: localStorage.getItem("userEmail") || "collector@example.com",
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Store receipt data for the receipt page (convert to old format for compatibility)
      const receiptData = {
        id: data.id,
        payerName: data.payer_name,
        payerPhone: data.payer_phone,
        amount: data.amount.toString(),
        paymentType: data.payment_type,
        description: data.description,
        timestamp: data.created_at,
        collector: data.collector,
      };
      localStorage.setItem("currentReceipt", JSON.stringify(receiptData));

      toast({
        title: "Payment Recorded Successfully!",
        description: "SMS sent and receipt ready for printing. Redirecting to receipt...",
      });

      // Reset form
      setFormData({
        payerName: "",
        payerPhone: "",
        amount: "",
        paymentType: "",
        description: "",
      });

      // Navigate to receipt page
      setTimeout(() => {
        navigate("/receipt");
      }, 1500);

    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={paysureLogo} alt="PaySure AI" className="h-8 w-8" />
            <div>
              <span className="text-xl font-bold">PaySure AI</span>
              <span className="text-sm text-muted-foreground block">Secure Receipts, Smarter Revenue</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{localStorage.getItem("userEmail")}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Record New Payment</CardTitle>
                <CardDescription>
                  Enter payment details to generate receipt and send SMS confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payerName">Payer Name *</Label>
                      <Input
                        id="payerName"
                        placeholder="Enter full name"
                        value={formData.payerName}
                        onChange={(e) => handleInputChange("payerName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payerPhone">Phone Number *</Label>
                      <Input
                        id="payerPhone"
                        placeholder="e.g. +1234567890"
                        value={formData.payerPhone}
                        onChange={(e) => handleInputChange("payerPhone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentType">Payment Type *</Label>
                      <Select value={formData.paymentType} onValueChange={(value) => handleInputChange("paymentType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school-fees">School Fees</SelectItem>
                          <SelectItem value="community-levy">Community Levy</SelectItem>
                          <SelectItem value="development-fund">Development Fund</SelectItem>
                          <SelectItem value="registration-fee">Registration Fee</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional notes about this payment..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Receipt className="h-5 w-5 mr-2" />
                    Record Payment & Generate Receipt
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send SMS Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Last Receipt
                </Button>
                <Link to="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    View Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments Collected</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-success">₦1,240.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SMS Sent</span>
                    <span className="font-semibold">12/12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;