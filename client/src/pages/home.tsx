import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import ApiDocs from "@/components/api-docs";
import Dashboard from "@/components/dashboard";
import Pricing from "@/components/pricing";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <ApiDocs />
      <Dashboard />
      <Pricing />
      <Footer />
    </div>
  );
}
