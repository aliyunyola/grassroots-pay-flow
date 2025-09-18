import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  payer_name: string;
  payer_phone: string;
  payment_type: string;
  collector: string;
  created_at: string;
  description?: string;
}

interface FraudAlert {
  id: string;
  transaction: Transaction;
  riskLevel: 'high' | 'medium' | 'low';
  reasons: string[];
  confidence: number;
}

const FraudDetection = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

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

  const detectFraud = () => {
    setScanning(true);
    
    // Mock AI fraud detection logic
    const alerts: FraudAlert[] = [];
    const payerGroups = new Map<string, Transaction[]>();
    
    // Group transactions by payer
    transactions.forEach(transaction => {
      const key = `${transaction.payer_name}_${transaction.payer_phone}`;
      if (!payerGroups.has(key)) {
        payerGroups.set(key, []);
      }
      payerGroups.get(key)!.push(transaction);
    });

    // Detect suspicious patterns
    transactions.forEach(transaction => {
      const reasons: string[] = [];
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      let confidence = 0;

      // Check for duplicate amounts from same payer
      const payerKey = `${transaction.payer_name}_${transaction.payer_phone}`;
      const payerTransactions = payerGroups.get(payerKey) || [];
      const duplicateAmounts = payerTransactions.filter(t => 
        t.amount === transaction.amount && t.id !== transaction.id
      );

      if (duplicateAmounts.length > 0) {
        reasons.push(`Duplicate amount (₦${transaction.amount.toLocaleString()}) from same payer`);
        confidence += 30;
      }

      // Check for unusually high amounts
      const avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
      if (transaction.amount > avgAmount * 3) {
        reasons.push(`Amount significantly above average (₦${transaction.amount.toLocaleString()} vs ₦${avgAmount.toLocaleString()})`);
        confidence += 25;
      }

      // Check for rapid transactions from same payer
      const recentTransactions = payerTransactions.filter(t => {
        const timeDiff = new Date(transaction.created_at).getTime() - new Date(t.created_at).getTime();
        return Math.abs(timeDiff) < 60000 && t.id !== transaction.id; // Within 1 minute
      });

      if (recentTransactions.length > 0) {
        reasons.push(`Multiple transactions within 1 minute`);
        confidence += 35;
      }

      // Check for round numbers (potential fake amounts)
      if (transaction.amount % 1000 === 0 && transaction.amount >= 10000) {
        reasons.push(`Suspiciously round amount (₦${transaction.amount.toLocaleString()})`);
        confidence += 15;
      }

      // Check for missing description on large amounts
      if (transaction.amount > 50000 && !transaction.description) {
        reasons.push(`Large amount without description`);
        confidence += 20;
      }

      // Determine risk level
      if (confidence >= 60) riskLevel = 'high';
      else if (confidence >= 30) riskLevel = 'medium';

      if (reasons.length > 0) {
        alerts.push({
          id: `alert_${transaction.id}`,
          transaction,
          riskLevel,
          reasons,
          confidence: Math.min(confidence, 95)
        });
      }
    });

    // Sort by risk level and confidence
    alerts.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      }
      return b.confidence - a.confidence;
    });

    setFraudAlerts(alerts);
    setScanning(false);

    toast({
      title: "Fraud Scan Complete",
      description: `Found ${alerts.length} potential anomalies`,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions();
      setLoading(false);
    };
    loadData();
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Fraud Detection</h1>
          <p className="text-muted-foreground">
            Advanced AI analysis to detect suspicious transaction patterns
          </p>
        </div>
        <Button 
          onClick={detectFraud}
          disabled={scanning}
          className="flex items-center gap-2"
        >
          {scanning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {scanning ? 'Scanning...' : 'Run Fraud Scan'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {fraudAlerts.filter(a => a.riskLevel === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {fraudAlerts.filter(a => a.riskLevel === 'medium').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clean Transactions</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.length - fraudAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">No issues detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Fraud Alerts</h2>
          {fraudAlerts.map((alert) => (
            <Alert key={alert.id} className="border-l-4 border-l-destructive">
              <div className="flex items-start space-x-4">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(alert.riskLevel)}
                  <Badge variant={getRiskColor(alert.riskLevel)}>
                    {alert.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline">
                    {alert.confidence}% confidence
                  </Badge>
                </div>
                <div className="flex-1 space-y-2">
                  <AlertTitle>
                    Transaction from {alert.transaction.payer_name} - ₦{alert.transaction.amount.toLocaleString()}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {alert.transaction.payment_type} • {alert.transaction.collector} • {new Date(alert.transaction.created_at).toLocaleDateString()}
                      </p>
                      <div className="space-y-1">
                        {alert.reasons.map((reason, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <AlertTriangle className="h-3 w-3 mr-2 text-destructive" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              No Fraud Detected
            </CardTitle>
            <CardDescription>
              All transactions appear legitimate. Run a fraud scan to analyze current data.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default FraudDetection;