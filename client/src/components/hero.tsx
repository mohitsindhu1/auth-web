import { Button } from "@/components/ui/button";
import { Rocket, Code } from "lucide-react";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 gradient-hero text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure Authentication<br />
            <span className="text-blue-200">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            KeyAuth-inspired authentication service with REST API endpoints, perfect for C# WinForms integration. 
            Get your app authenticated in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => scrollToSection('docs')}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => scrollToSection('docs')}
            >
              <Code className="h-5 w-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
