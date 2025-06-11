import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Zap, Shield, Users } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Gamepad2 className="h-8 w-8 text-neon-purple neon-glow" />
              <div>
                <span className="text-xl font-bold neon-text">GameAuth</span>
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                  v2.0
                </Badge>
              </div>
            </Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-muted-foreground hover:text-neon-blue px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
              >
                <Zap className="h-4 w-4 mr-1" />
                Features
              </button>
              <button 
                onClick={() => scrollToSection('docs')}
                className="text-muted-foreground hover:text-neon-green px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
              >
                <Shield className="h-4 w-4 mr-1" />
                Battle Guide
              </button>
              <button 
                onClick={() => scrollToSection('dashboard')}
                className="text-muted-foreground hover:text-neon-purple px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                Arena
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-muted-foreground hover:text-neon-pink px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Pricing
              </button>
            </div>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/firebase-login">
              <Button className="gaming-button">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="text-white">ENTER ARENA</span>
              </Button>
            </Link>
            <Link href="/test-login">
              <Button variant="outline" className="border-neon-green text-neon-green hover:bg-neon-green/10">
                Test Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
