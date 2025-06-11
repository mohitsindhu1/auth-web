import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, DollarSign, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Shield className="h-8 w-8 primary-color" />
              <div>
                <span className="text-xl font-bold text-gray-900">AuthAPI</span>
                <Badge className="ml-2 bg-primary text-white text-xs">
                  Enterprise
                </Badge>
              </div>
            </Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('docs')}
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Documentation
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                <Users className="h-4 w-4 inline mr-1" />
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                <DollarSign className="h-4 w-4 inline mr-1" />
                Pricing
              </button>
            </div>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/firebase-login">
              <Button className="professional-button">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/test-login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
