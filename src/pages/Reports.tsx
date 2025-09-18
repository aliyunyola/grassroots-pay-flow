import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Receipt, Calendar, TrendingUp, Users, DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  payer_name: string;
  payer_phone: string;
  amount: number;
  payment_type: string;
  description: string;
  collector: string;
  created_at: string;
}

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [collectorFilter, setCollectorFilter] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, dateFilter, collectorFilter, paymentTypeFilter]);

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

  const applyFilters = () => {
    let filtered = [...transactions];

    if (dateFilter) {
      filtered = filtered.filter(t => 
        format(new Date(t.created_at), "yyyy-MM-dd") === dateFilter
      );
    }

    if (collectorFilter) {
      filtered = filtered.filter(t => 
        t.collector.toLowerCase().includes(collectorFilter.toLowerCase())
      );
    }

    if (paymentTypeFilter && paymentTypeFilter !== "all") {
      filtered = filtered.filter(t => t.payment_type === paymentTypeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const downloadCSV = () => {
    const headers = ["Date", "Payer Name", "Phone", "Amount", "Payment Type", "Collector", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => [
        format(new Date(t.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${t.payer_name}"`,
        t.payer_phone,
        t.amount,
        `"${t.payment_type.replace('-', ' ')}"`,
        `"${t.collector}"`,
        `"${t.description || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `community-receipts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Simple PDF generation simulation
    alert("PDF download would generate a formatted report here");
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const uniqueCollectors = new Set(filteredTransactions.map(t => t.collector)).size;
  const uniqueTraders = new Set(filteredTransactions.map(t => t.payer_name)).size;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

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
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Revenue Reports</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={downloadPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₦{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {filteredTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              <p className="text-xs text-muted-foreground">Filtered results</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Collectors</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCollectors}</div>
              <p className="text-xs text-muted-foreground">Unique collectors</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Traders</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueTraders}</div>
              <p className="text-xs text-muted-foreground">Different payers</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
            <CardDescription>Filter transactions by date, collector, or payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
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
                  placeholder="Search collector..."
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
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDateFilter("");
                    setCollectorFilter("");
                    setPaymentTypeFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Detailed view of all transactions matching your filters</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
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
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {format(new Date(transaction.created_at), "MMM dd, yyyy HH:mm")}
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
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {transaction.description || "—"}
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

export default Reports;