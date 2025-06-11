import { Button } from "@/components/ui/button";
import { Gamepad2, Star, Trophy, Zap, Shield, Users } from "lucide-react";
import { Link } from "wouter";
import ParticleBackground from "./ParticleBackground";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen py-20 bg-background overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Gaming Logo */}
          <div className="flex items-center justify-center mb-8">
            <Gamepad2 className="h-16 w-16 text-neon-purple neon-glow mr-4" />
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold neon-text gaming-gradient bg-clip-text text-transparent">
                GameAuth
              </h1>
              <p className="text-neon-blue font-semibold">Multi-User Arena</p>
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Multi-User Gaming
            <br />
            <span className="neon-text">Authentication Arena</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-4xl mx-auto">
            Each Google account creates its own isolated gaming server with unique API keys, 
            user management, and authentication endpoints. Perfect for game developers and multi-tenant applications.
          </p>

          {/* Gaming Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="gaming-card p-4 text-center">
              <Users className="h-8 w-8 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-green">∞</div>
              <div className="text-sm text-muted-foreground">Users Per Server</div>
            </div>
            <div className="gaming-card p-4 text-center">
              <Shield className="h-8 w-8 text-neon-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-blue">100%</div>
              <div className="text-sm text-muted-foreground">Isolated Servers</div>
            </div>
            <div className="gaming-card p-4 text-center">
              <Star className="h-8 w-8 text-neon-purple mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-purple">API</div>
              <div className="text-sm text-muted-foreground">Ready to Use</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/firebase-login">
              <Button className="gaming-button text-lg px-8 py-4">
                <Trophy className="h-6 w-6 mr-3" />
                <span className="text-white">ENTER ARENA</span>
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="border-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10 text-lg px-8 py-4"
              onClick={() => scrollToSection('docs')}
            >
              <Zap className="h-6 w-6 mr-3" />
              View Battle Guide
            </Button>
          </div>

          {/* Gaming Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="gaming-card p-6 text-center hover:scale-105 transition-transform">
              <Gamepad2 className="h-12 w-12 text-neon-purple mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-bold text-neon-purple mb-2">Gaming-Style UI</h3>
              <p className="text-muted-foreground">
                Immersive interface with particle effects and neon animations
              </p>
            </div>
            <div className="gaming-card p-6 text-center hover:scale-105 transition-transform">
              <Users className="h-12 w-12 text-neon-green mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-bold text-neon-green mb-2">Multi-User Servers</h3>
              <p className="text-muted-foreground">
                Each Google account gets its own isolated authentication server
              </p>
            </div>
            <div className="gaming-card p-6 text-center hover:scale-105 transition-transform">
              <Shield className="h-12 w-12 text-neon-blue mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-bold text-neon-blue mb-2">Secure APIs</h3>
              <p className="text-muted-foreground">
                Battle-tested authentication with unique API keys per server
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
