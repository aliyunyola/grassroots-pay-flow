import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, Users, Calendar, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  payer_name: string;
  payer_phone: string;
  payment_type: string;
  collector: string;
  created_at: string;
}

interface UnpaidTrader {
  name: string;
  phone: string;
  lastPayment?: string;
  totalOwed: number;
  paymentTypes: string[];
  daysSinceLastPayment: number;
}

const ComplianceReminder = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unpaidTraders, setUnpaidTraders] = useState<UnpaidTrader[]>([]);
  const [selectedTraders, setSelectedTraders] = useState<string[]>([]);
  const [reminderMessage, setReminderMessage] = useState(
    "Dear {name}, this is a friendly reminder about your pending community payments. Please contact your collector or visit our office to settle your dues. Total amount: ₦{amount}. Thank you for your cooperation."
  );
  const [reminderType, setReminderType] = useState("sms");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Mock SMS costs for different types
  const smsCosts = {
    sms: 5, // ₦5 per SMS
    whatsapp: 3, // ₦3 per WhatsApp
    voice: 15 // ₦15 per voice call
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  };

  const analyzeUnpaidTraders = () => {
    // Mock analysis - in reality this would involve business rules
    // For demo, we'll consider traders who haven't paid in the last 30 days as "unpaid"
    
    const traderGroups = new Map<string, Transaction[]>();
    const now = new Date();
    
    // Group transactions by trader
    transactions.forEach(transaction => {
      const key = `${transaction.payer_name}_${transaction.payer_phone}`;
      if (!traderGroups.has(key)) {
        traderGroups.set(key, []);
      }
      traderGroups.get(key)!.push(transaction);
    });

    // Generate mock unpaid traders
    const mockUnpaidTraders: UnpaidTrader[] = [
      {
        name: "Adebayo Okonkwo",
        phone: "+234 801 234 5671",
        totalOwed: 45000,
        paymentTypes: ["School Fees", "Community Levy"],
        daysSinceLastPayment: 45,
        lastPayment: "2024-11-15"
      },
      {
        name: "Fatima Ibrahim",
        phone: "+234 802 345 6782",
        totalOwed: 32000,
        paymentTypes: ["Development Fund"],
        daysSinceLastPayment: 62,
        lastPayment: "2024-10-29"
      },
      {
        name: "Chinedu Okafor",
        phone: "+234 803 456 7893",
        totalOwed: 28000,
        paymentTypes: ["Community Levy", "Development Fund"],
        daysSinceLastPayment: 38,
        lastPayment: "2024-11-23"
      },
      {
        name: "Kemi Adebayo",
        phone: "+234 804 567 8904",
        totalOwed: 55000,
        paymentTypes: ["School Fees"],
        daysSinceLastPayment: 71,
        lastPayment: "2024-10-20"
      },
      {
        name: "Musa Tanko",
        phone: "+234 805 678 9015",
        totalOwed: 19000,
        paymentTypes: ["Community Levy"],
        daysSinceLastPayment: 29,
        lastPayment: "2024-12-02"
      },
      {
        name: "Grace Emenike",
        phone: "+234 806 789 0126",
        totalOwed: 41000,
        paymentTypes: ["School Fees", "Development Fund"],
        daysSinceLastPayment: 54,
        lastPayment: "2024-11-07"
      }
    ];

    // Add real unpaid traders based on actual transaction data
    const realUnpaidTraders: UnpaidTrader[] = [];
    traderGroups.forEach((traderTransactions, key) => {
      const [name, phone] = key.split('_');
      const lastTransaction = traderTransactions[0]; // Most recent
      const daysSince = Math.floor((now.getTime() - new Date(lastTransaction.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Consider unpaid if no payment in last 30 days
      if (daysSince > 30) {
        const paymentTypes = [...new Set(traderTransactions.map(t => t.payment_type))];
        realUnpaidTraders.push({
          name,
          phone,
          totalOwed: Math.floor(Math.random() * 50000) + 10000, // Mock amount owed
          paymentTypes,
          daysSinceLastPayment: daysSince,
          lastPayment: lastTransaction.created_at.split('T')[0]
        });
      }
    });

    // Combine mock and real data
    const allUnpaidTraders = [...mockUnpaidTraders, ...realUnpaidTraders];
    
    // Sort by days since last payment (most overdue first)
    allUnpaidTraders.sort((a, b) => b.daysSinceLastPayment - a.daysSinceLastPayment);
    
    setUnpaidTraders(allUnpaidTraders);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      analyzeUnpaidTraders();
    }
  }, [transactions]);

  const handleTraderSelection = (phone: string, checked: boolean) => {
    if (checked) {
      setSelectedTraders([...selectedTraders, phone]);
    } else {
      setSelectedTraders(selectedTraders.filter(p => p !== phone));
    }
  };

  const selectAllTraders = () => {
    if (selectedTraders.length === unpaidTraders.length) {
      setSelectedTraders([]);
    } else {
      setSelectedTraders(unpaidTraders.map(t => t.phone));
    }
  };

  const sendReminders = async () => {
    setSending(true);
    
    // Mock sending process
    const selectedTradersData = unpaidTraders.filter(t => selectedTraders.includes(t.phone));
    const totalCost = selectedTradersData.length * smsCosts[reminderType as keyof typeof smsCosts];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSending(false);
    setSelectedTraders([]);
    
    toast({
      title: "Reminders Sent Successfully",
      description: `Sent ${selectedTradersData.length} ${reminderType.toUpperCase()} reminders. Total cost: ₦${totalCost}`,
    });
  };

  const getDaysColor = (days: number) => {
    if (days > 60) return "text-red-600";
    if (days > 30) return "text-orange-600";
    return "text-yellow-600";
  };

  const getUrgencyBadge = (days: number) => {
    if (days > 60) return <Badge variant="destructive">Critical</Badge>;
    if (days > 30) return <Badge variant="secondary">Urgent</Badge>;
    return <Badge variant="outline">Reminder</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Reminders</h1>
          <p className="text-muted-foreground">
            Automated SMS and WhatsApp reminders for unpaid traders
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              disabled={selectedTraders.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Reminders ({selectedTraders.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Compliance Reminders</DialogTitle>
              <DialogDescription>
                Configure and send reminders to {selectedTraders.length} selected traders
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder-type">Reminder Type</Label>
                  <Select value={reminderType} onValueChange={setReminderType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS (₦5 each)</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp (₦3 each)</SelectItem>
                      <SelectItem value="voice">Voice Call (₦15 each)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                    ₦{(selectedTraders.length * smsCosts[reminderType as keyof typeof smsCosts]).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Message Template</Label>
                <Textarea
                  id="message"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {"{name}"} and {"{amount}"} as placeholders
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={sendReminders}
                disabled={sending}
                className="flex items-center gap-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? 'Sending...' : 'Send Reminders'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidTraders.length}</div>
            <p className="text-xs text-muted-foreground">Traders with overdue payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical (60+ days)</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {unpaidTraders.filter(t => t.daysSinceLastPayment > 60).length}
            </div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Owed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{unpaidTraders.reduce((sum, t) => sum + t.totalOwed, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedTraders.length}</div>
            <p className="text-xs text-muted-foreground">For reminder</p>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Traders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unpaid Traders</CardTitle>
              <CardDescription>
                Select traders to send compliance reminders
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={selectAllTraders}
              className="flex items-center gap-2"
            >
              <Checkbox 
                checked={selectedTraders.length === unpaidTraders.length && unpaidTraders.length > 0}
                onChange={selectAllTraders}
              />
              Select All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unpaidTraders.map((trader) => (
              <div 
                key={trader.phone}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={selectedTraders.includes(trader.phone)}
                  onCheckedChange={(checked) => handleTraderSelection(trader.phone, !!checked)}
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{trader.name}</h3>
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(trader.daysSinceLastPayment)}
                      <Badge variant="outline">₦{trader.totalOwed.toLocaleString()}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {trader.phone}
                    </span>
                    <span className={getDaysColor(trader.daysSinceLastPayment)}>
                      {trader.daysSinceLastPayment} days overdue
                    </span>
                    {trader.lastPayment && (
                      <span>Last payment: {new Date(trader.lastPayment).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {trader.paymentTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {unpaidTraders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No unpaid traders found. All payments are up to date!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceReminder;