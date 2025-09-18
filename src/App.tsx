import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CollectorDashboard from "./pages/CollectorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Receipt from "./pages/Receipt";
import Reports from "./pages/Reports";
import TestingSimulation from "./pages/TestingSimulation";
import FraudDetection from "./pages/FraudDetection";
import ComplianceReminder from "./pages/ComplianceReminder";
import PilotSimulation from "./pages/PilotSimulation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/collector" element={<CollectorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/testing" element={<TestingSimulation />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/compliance" element={<ComplianceReminder />} />
          <Route path="/pilot" element={<PilotSimulation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
