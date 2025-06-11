import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
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
            <Link href="/" className="flex items-center">
              <Shield className="h-8 w-8 text-primary-custom mr-2" />
              <span className="text-xl font-bold text-slate-800">AuthAPI</span>
            </Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-secondary-custom hover:text-primary-custom px-3 py-2 text-sm font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('docs')}
                className="text-secondary-custom hover:text-primary-custom px-3 py-2 text-sm font-medium"
              >
                Documentation
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-secondary-custom hover:text-primary-custom px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-secondary-custom hover:text-primary-custom px-3 py-2 text-sm font-medium"
              >
                Pricing
              </button>
            </div>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button size="sm" className="bg-red-600 text-white hover:bg-red-700">
                Sign in with Google
              </Button>
            </Link>
            <Link href="/test-login">
              <Button variant="outline" size="sm">
                Test Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
