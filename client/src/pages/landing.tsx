import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Globe, Users, Key, Lock, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/firebase-login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="phantom-nav fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 phantom-text mr-3" />
              <span className="text-2xl font-bold text-foreground">Phantom Auth</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground hover:text-primary"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={handleLogin}
                className="phantom-button px-6 py-2"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Shield className="h-16 w-16 phantom-text mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Phantom Auth
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Secure, scalable authentication API for your applications. 
              Create users, manage API keys, and authenticate with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                className="phantom-button px-8 py-4 text-lg"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-white"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Authentication Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to secure your applications with enterprise-grade authentication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="phantom-card">
              <CardHeader>
                <Zap className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  High-performance authentication with minimal latency and maximum throughput
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="phantom-card">
              <CardHeader>
                <Shield className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-grade security with encryption, hashing, and secure session management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="phantom-card">
              <CardHeader>
                <Key className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>
                  Generate, manage, and secure API keys with granular permissions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="phantom-card">
              <CardHeader>
                <Users className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Complete user lifecycle management with registration, login, and profiles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="phantom-card">
              <CardHeader>
                <Globe className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>Global Scale</CardTitle>
                <CardDescription>
                  Built to scale globally with distributed architecture and CDN support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="phantom-card">
              <CardHeader>
                <Lock className="h-10 w-10 phantom-text mb-4" />
                <CardTitle>Secure by Default</CardTitle>
                <CardDescription>
                  Best security practices built-in with automatic updates and monitoring
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold phantom-text mb-2">99.9%</div>
              <div className="text-lg text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold phantom-text mb-2">&lt;50ms</div>
              <div className="text-lg text-muted-foreground">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold phantom-text mb-2">24/7</div>
              <div className="text-lg text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to secure your applications?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who trust Phantom Auth for their authentication needs
          </p>
          <Button 
            onClick={handleLogin}
            className="phantom-button px-8 py-4 text-lg"
          >
            Start Building Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 phantom-text mr-2" />
              <span className="text-lg font-semibold text-foreground">Phantom Auth</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Phantom Auth. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}