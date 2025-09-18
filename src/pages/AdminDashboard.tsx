import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, TrendingUp, Users, DollarSign, Search, LogOut, User, FileText, TestTube, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  payer_name: string;
  payer_phone: string;
  amount: number;
  payment_type: string;
  description: string;
  created_at: string;
  collector: string;
}

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [collectorFilter, setCollectorFilter] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    setupRealtimeSubscription();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('New transaction:', payload);
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          setTransactions(prev => 
            prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.collector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      format(new Date(transaction.created_at), "yyyy-MM-dd") === dateFilter;
    
    const matchesCollector = !collectorFilter || 
      transaction.collector.toLowerCase().includes(collectorFilter.toLowerCase());
    
    const matchesPaymentType = !paymentTypeFilter || paymentTypeFilter === "all" || 
      transaction.payment_type === paymentTypeFilter;

    return matchesSearch && matchesDate && matchesCollector && matchesPaymentType;
  });

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalTransactions = transactions.length;
  const uniqueCollectors = new Set(transactions.map(t => t.collector)).size;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">E-Receipts</span>
            <span className="text-sm text-muted-foreground">Admin Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{localStorage.getItem("userEmail")}</span>
            </div>
            <Link to="/reports">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Link to="/testing">
              <Button variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Test Simulation
              </Button>
            </Link>
            <Link to="/collector">
              <Button variant="outline" size="sm">
                Collector View
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₦{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                All time payments
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Collectors</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCollectors}</div>
              <p className="text-xs text-muted-foreground">
                Registered collectors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
            <CardDescription>Filter by date, collector, payment type, or search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Collector</label>
                <Input
                  placeholder="Filter by collector..."
                  value={collectorFilter}
                  onChange={(e) => setCollectorFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Type</label>
                <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="school-fees">School Fees</SelectItem>
                    <SelectItem value="community-levy">Community Levy</SelectItem>
                    <SelectItem value="development-fund">Development Fund</SelectItem>
                    <SelectItem value="registration-fee">Registration Fee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setCollectorFilter("");
                  setPaymentTypeFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Recent Transactions
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Real-time
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Live updates of payment activities across your community ({filteredTransactions.length} of {totalTransactions} shown)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No transactions match your search." : "Start by recording your first payment."}
                </p>
                <Link to="/collector">
                  <Button>Record Payment</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Collector</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 50).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.payer_name}</p>
                            <p className="text-sm text-muted-foreground">{transaction.payer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentTypeColor(transaction.payment_type)}>
                            {transaction.payment_type.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-success">
                          ₦{Number(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.collector}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(transaction.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;