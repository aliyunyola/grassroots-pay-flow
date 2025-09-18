import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Users, UserCheck, TrendingUp, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trader {
  id: string;
  name: string;
  phone: string;
  location: string;
  businessType: string;
  totalTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  lastPayment: string;
  status: 'active' | 'inactive' | 'overdue';
  riskScore: number;
}

interface Collector {
  id: string;
  name: string;
  zone: string;
  tradersAssigned: number;
  collectionsToday: number;
  totalCollected: number;
  efficiency: number;
  status: 'active' | 'break' | 'offline';
}

const PilotSimulation = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  // Generate mock pilot data
  const generatePilotData = () => {
    // Generate 200 traders
    const traderData: Trader[] = [];
    const nigerianNames = [
      "Adebayo Okonkwo", "Fatima Ibrahim", "Chinedu Okafor", "Kemi Adebayo", "Musa Tanko",
      "Grace Emenike", "Yusuf Ahmed", "Ngozi Okafor", "Sani Garba", "Folake Adebayo",
      "Ibrahim Musa", "Chioma Igwe", "Abdullahi Hassan", "Funmi Ogundimu", "Emeka Nwosu",
      "Amina Yusuf", "Tunde Oyebode", "Nkechi Okoro", "Aliyu Bello", "Blessing Eze"
    ];
    
    const businessTypes = [
      "Retail Shop", "Restaurant", "Tailoring", "Electronics", "Pharmacy", "Grocery Store",
      "Hair Salon", "Auto Repair", "Phone Repair", "Clothing Store", "Food Vendor",
      "Internet Cafe", "Hardware Store", "Shoe Store", "Jewelry Shop"
    ];
    
    const locations = [
      "Ikeja Market", "Victoria Island", "Lagos Island", "Surulere", "Yaba",
      "Alaba Market", "Computer Village", "Balogun Market", "Oshodi", "Mushin"
    ];

    for (let i = 0; i < 200; i++) {
      const name = `${nigerianNames[Math.floor(Math.random() * nigerianNames.length)]} ${Math.floor(Math.random() * 1000)}`;
      const totalTransactions = Math.floor(Math.random() * 50) + 5;
      const totalAmount = Math.floor(Math.random() * 500000) + 50000;
      
      traderData.push({
        id: `trader_${i + 1}`,
        name,
        phone: `+234 ${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
        totalTransactions,
        totalAmount,
        averageTransaction: Math.floor(totalAmount / totalTransactions),
        lastPayment: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: Math.random() > 0.8 ? 'overdue' : Math.random() > 0.6 ? 'inactive' : 'active',
        riskScore: Math.floor(Math.random() * 100)
      });
    }

    // Generate 20 collectors
    const collectorData: Collector[] = [];
    const collectorNames = [
      "Adeola Bankole", "Usman Kargbo", "Chidinma Eze", "Bello Adamu", "Ronke Falade",
      "Yakubu Tanko", "Ifeoma Okafor", "Hassan Yusuf", "Bukky Adebayo", "Garba Musa",
      "Temi Ogundimu", "Salisu Ibrahim", "Chika Nwosu", "Amina Hassan", "Biodun Oyebode",
      "Shehu Aliyu", "Nneka Okoro", "Ahmad Bello", "Folake Eze", "Mustapha Ahmed"
    ];

    const zones = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];

    for (let i = 0; i < 20; i++) {
      const tradersAssigned = Math.floor(Math.random() * 15) + 5;
      const collectionsToday = Math.floor(Math.random() * tradersAssigned);
      
      collectorData.push({
        id: `collector_${i + 1}`,
        name: collectorNames[i],
        zone: zones[Math.floor(Math.random() * zones.length)],
        tradersAssigned,
        collectionsToday,
        totalCollected: Math.floor(Math.random() * 2000000) + 500000,
        efficiency: Math.floor((collectionsToday / tradersAssigned) * 100),
        status: Math.random() > 0.8 ? 'offline' : Math.random() > 0.9 ? 'break' : 'active'
      });
    }

    setTraders(traderData);
    setCollectors(collectorData);
  };

  const startSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          toast({
            title: "Simulation Complete",
            description: "Pilot simulation has finished running",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setProgress(0);
    generatePilotData();
    toast({
      title: "Simulation Reset",
      description: "Generated new pilot data for 200 traders and 20 collectors",
    });
  };

  useEffect(() => {
    generatePilotData();
  }, []);

  const filteredTraders = traders.filter(trader => {
    const zoneMatch = selectedZone === "all" || trader.location.includes(selectedZone);
    const statusMatch = selectedStatus === "all" || trader.status === selectedStatus;
    return zoneMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'overdue': return 'destructive';
      case 'break': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pilot Simulation</h1>
          <p className="text-muted-foreground">
            Live simulation of 200 traders and 20 collectors in Lagos markets
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={isRunning ? pauseSimulation : startSimulation}
            variant={isRunning ? "secondary" : "default"}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'} Simulation
          </Button>
          <Button 
            onClick={resetSimulation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Simulation Progress */}
      {(isRunning || progress > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Simulation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {isRunning ? 'Simulation running...' : progress === 100 ? 'Simulation complete' : 'Simulation paused'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">200</div>
            <p className="text-xs text-muted-foreground">Across 10 market locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collectors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collectors.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Out of 20 total collectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{collectors.reduce((sum, c) => sum + c.totalCollected, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total amount collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(collectors.reduce((sum, c) => sum + c.efficiency, 0) / collectors.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Collection efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="traders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traders">Traders (200)</TabsTrigger>
          <TabsTrigger value="collectors">Collectors (20)</TabsTrigger>
        </TabsList>

        <TabsContent value="traders" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Ikeja">Ikeja Market</SelectItem>
                <SelectItem value="Victoria">Victoria Island</SelectItem>
                <SelectItem value="Lagos">Lagos Island</SelectItem>
                <SelectItem value="Surulere">Surulere</SelectItem>
                <SelectItem value="Yaba">Yaba</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Traders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTraders.slice(0, 12).map((trader) => (
              <Card key={trader.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm">{trader.name}</CardTitle>
                        <CardDescription className="text-xs">{trader.businessType}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(trader.status)}>
                      {trader.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {trader.location}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">₦{trader.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                    </div>
                    <div>
                      <p className="font-medium">{trader.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last payment: {new Date(trader.lastPayment).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTraders.length > 12 && (
            <div className="text-center text-muted-foreground">
              Showing 12 of {filteredTraders.length} traders
            </div>
          )}
        </TabsContent>

        <TabsContent value="collectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {collectors.map((collector) => (
              <Card key={collector.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{collector.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm">{collector.name}</CardTitle>
                        <CardDescription className="text-xs">{collector.zone}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(collector.status)}>
                      {collector.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">{collector.tradersAssigned}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div>
                      <p className="font-medium">{collector.collectionsToday}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">₦{collector.totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Collected</p>
                  </div>
                  <div>
                    <p className={`font-medium ${getEfficiencyColor(collector.efficiency)}`}>
                      {collector.efficiency}% Efficiency
                    </p>
                    <Progress value={collector.efficiency} className="h-2 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PilotSimulation;