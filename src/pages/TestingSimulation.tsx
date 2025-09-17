import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw, Users, Receipt, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DemoTrader {
  id: number;
  name: string;
  phone: string;
  amount: number;
  paymentType: string;
  description: string;
}

const demoTraders: DemoTrader[] = [
  { id: 1, name: "Adunni Ogundimu", phone: "+234 801 234 5678", amount: 5000, paymentType: "school-fees", description: "JSS2 fees for Taiwo" },
  { id: 2, name: "Chike Okoro", phone: "+234 802 345 6789", amount: 2500, paymentType: "community-levy", description: "Monthly development contribution" },
  { id: 3, name: "Fatima Abdullahi", phone: "+234 803 456 7890", amount: 1500, paymentType: "registration-fee", description: "New resident registration" },
  { id: 4, name: "Emeka Nwosu", phone: "+234 804 567 8901", amount: 3000, paymentType: "development-fund", description: "Road maintenance contribution" },
  { id: 5, name: "Aisha Bello", phone: "+234 805 678 9012", amount: 4500, paymentType: "school-fees", description: "SS1 fees and books" },
  { id: 6, name: "Olumide Adebayo", phone: "+234 806 789 0123", amount: 2000, paymentType: "community-levy", description: "Security dues" },
  { id: 7, name: "Khadija Mohammed", phone: "+234 807 890 1234", amount: 3500, paymentType: "development-fund", description: "Clinic equipment fund" },
  { id: 8, name: "Tunde Fashola", phone: "+234 808 901 2345", amount: 1800, paymentType: "other", description: "Event hall booking" },
  { id: 9, name: "Ngozi Okafor", phone: "+234 809 012 3456", amount: 6000, paymentType: "school-fees", description: "Final year fees" },
  { id: 10, name: "Ibrahim Yusuf", phone: "+234 810 123 4567", amount: 2200, paymentType: "registration-fee", description: "Business permit renewal" }
];

const collectors = ["Sarah Johnson", "Michael Adebayo", "Grace Nkomo"];

const TestingSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedTransactions, setCompletedTransactions] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentIndex < demoTraders.length) {
      interval = setInterval(async () => {
        await processNextTransaction();
      }, 2000); // Process one transaction every 2 seconds
    } else if (currentIndex >= demoTraders.length) {
      setIsRunning(false);
      toast({
        title: "Simulation Complete!",
        description: "All 10 demo transactions have been processed successfully.",
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, currentIndex]);

  useEffect(() => {
    setProgress((currentIndex / demoTraders.length) * 100);
  }, [currentIndex]);

  const processNextTransaction = async () => {
    if (currentIndex >= demoTraders.length) return;

    const trader = demoTraders[currentIndex];
    const randomCollector = collectors[Math.floor(Math.random() * collectors.length)];

    try {
      const { error } = await supabase
        .from("transactions")
        .insert([
          {
            payer_name: trader.name,
            payer_phone: trader.phone,
            amount: trader.amount,
            payment_type: trader.paymentType,
            description: trader.description,
            collector: randomCollector,
          }
        ]);

      if (error) throw error;

      setCompletedTransactions(prev => [...prev, trader.id]);
      setCurrentIndex(prev => prev + 1);

      toast({
        title: "Transaction Processed",
        description: `Payment from ${trader.name} recorded successfully!`,
      });

    } catch (error) {
      console.error("Error processing transaction:", error);
      toast({
        title: "Error",
        description: "Failed to process transaction. Simulation paused.",
        variant: "destructive",
      });
      setIsRunning(false);
    }
  };

  const startSimulation = () => {
    setIsRunning(true);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentIndex(0);
    setCompletedTransactions([]);
    setProgress(0);
  };

  const getPaymentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "school-fees": "bg-primary/10 text-primary",
      "community-levy": "bg-success/10 text-success",
      "development-fund": "bg-warning/10 text-warning",
      "registration-fee": "bg-secondary/10 text-secondary-foreground",
      "other": "bg-muted text-muted-foreground",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">User Testing Simulation</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isRunning ? (
              <Button onClick={startSimulation} disabled={currentIndex >= demoTraders.length}>
                <Play className="h-4 w-4 mr-2" />
                {currentIndex === 0 ? "Start" : "Resume"}
              </Button>
            ) : (
              <Button variant="outline" onClick={pauseSimulation}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Simulation Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Simulation Progress
            </CardTitle>
            <CardDescription>
              Simulating 10 traders making payments to test real-time dashboard updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {currentIndex} of {demoTraders.length} transactions processed
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}% complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>Completed ({completedTransactions.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span>Processing ({isRunning ? 1 : 0})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span>Pending ({demoTraders.length - currentIndex})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Traders List */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Traders Queue</CardTitle>
            <CardDescription>
              These 10 demo traders will make payments during the simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoTraders.map((trader, index) => (
                <div
                  key={trader.id}
                  className={`p-4 rounded-lg border transition-all ${
                    completedTransactions.includes(trader.id)
                      ? "bg-success/5 border-success"
                      : index === currentIndex && isRunning
                      ? "bg-primary/5 border-primary animate-pulse"
                      : "bg-background border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          #{trader.id.toString().padStart(2, '0')}
                        </span>
                        <span className="font-semibold">{trader.name}</span>
                        <Badge className={getPaymentTypeColor(trader.paymentType)}>
                          {trader.paymentType.replace('-', ' ')}
                        </Badge>
                        {completedTransactions.includes(trader.id) && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success">
                            ✓ Completed
                          </Badge>
                        )}
                        {index === currentIndex && isRunning && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            Processing...
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span>📱 {trader.phone}</span>
                        <span>💰 ₦{trader.amount.toFixed(2)}</span>
                        <span>📝 {trader.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              How to Use This Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p>Click "Start" to begin the simulation. Transactions will be processed automatically every 2 seconds.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p>Open the Admin Dashboard in a new tab to see real-time updates as transactions are processed.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p>Use "Pause" to stop the simulation temporarily, and "Reset" to start over from the beginning.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <p>Each transaction includes realistic Nigerian names, phone numbers, and payment types for authentic testing.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingSimulation;