import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Receipt, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">E-Receipts</span>
          </div>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transparent Community
            <br />
            Revenue Collection
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Modern platform for grassroots revenue and school fee collection with instant receipts, SMS notifications, and complete transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline-white" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Modern Revenue Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your community's financial processes with our comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Digital Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant digital receipts with QR codes for verification and transparency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatic SMS confirmations sent to payers for every transaction.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live dashboard tracking all payments and collection performance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Role Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure access controls for administrators and collectors.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Modernize Your Revenue Collection?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join communities already using our platform for transparent, efficient fee collection.
          </p>
          <Link to="/login">
            <Button variant="hero" size="lg">
              Start Collecting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">E-Receipts</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 E-Receipts. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;