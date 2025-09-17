import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Receipt, TrendingUp, Users, DollarSign, Search, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.collector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalTransactions = transactions.length;
  const uniqueCollectors = new Set(transactions.map(t => t.collector)).size;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        {/* Transactions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl">Recent Transactions</CardTitle>
                <CardDescription>
                  Monitor all payment activities across your community
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                          {formatDate(transaction.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.payerName}</p>
                            <p className="text-sm text-muted-foreground">{transaction.payerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentTypeColor(transaction.paymentType)}>
                            {transaction.paymentType.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-success">
                          ₦{transaction.amount}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.collector}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(transaction.timestamp)}
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