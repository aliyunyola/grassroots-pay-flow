import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Receipt, User, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [role, setRole] = useState("collector");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    if (email && password) {
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      
      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${role} dashboard...`,
      });

      // Redirect based on role
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/collector");
        }
      }, 1000);
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:opacity-80 transition-opacity">
            <Receipt className="h-8 w-8" />
            <span className="text-2xl font-bold">E-Receipts</span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Login as:</Label>
                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="collector" id="collector" />
                    <Label htmlFor="collector" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Collector</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex items-center space-x-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>

              {/* Demo Credentials */}
              <div className="text-sm text-muted-foreground text-center">
                <p className="mb-2">Demo credentials:</p>
                <p>Email: demo@example.com</p>
                <p>Password: demo123</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-white hover:opacity-80 transition-opacity">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;