import Hero from "@/components/hero";
import Features from "@/components/features";
import Pricing from "@/components/pricing";
import FAQ from "@/components/faq";
import Testimonials from "@/components/testimonials";
import BlogPreview from "@/components/blog-preview";
import Footer from "@/components/footer";
import Header from "@/components/header";
import SEOHead from "@/components/seo-head";
import Analytics from "@/components/analytics";
import PerformanceMonitor from "@/components/performance-monitor";
import SchemaMarkup from "@/components/schema-markup";
import LocalSEO from "@/components/local-seo";
import { useEffect } from "react";

export default function SEOLanding() {
  useEffect(() => {
    // Update page title for SEO
    document.title = "PHANTOM AUTH - Enterprise Multi-Tenant Authentication System | Secure API Authentication";
    
    // Add structured data for breadcrumbs
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://phantomauth.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Authentication Solutions",
          "item": "https://phantomauth.com/#features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Enterprise Pricing",
          "item": "https://phantomauth.com/#pricing"
        }
      ]
    };
    
    // Add FAQ structured data
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is multi-tenant authentication?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Multi-tenant authentication allows multiple organizations to use the same application while keeping their data completely isolated. Each tenant gets their own authentication environment with unique API keys and security settings."
          }
        },
        {
          "@type": "Question",
          "name": "How secure is PHANTOM AUTH?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PHANTOM AUTH implements military-grade security including bcrypt password hashing, JWT tokens, API key authentication, rate limiting, and OWASP compliance with advanced features like hardware ID locking."
          }
        }
      ]
    };
    
    // Add structured data to page
    const structuredDataScript = document.createElement('script');
    structuredDataScript.type = 'application/ld+json';
    structuredDataScript.text = JSON.stringify([breadcrumbData, faqData]);
    document.head.appendChild(structuredDataScript);
    
    // Cleanup
    return () => {
      if (structuredDataScript) {
        document.head.removeChild(structuredDataScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Components */}
      <SEOHead />
      <Analytics />
      <PerformanceMonitor />
      <SchemaMarkup />
      <LocalSEO />
      
      {/* Header Navigation */}
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* Pricing Section */}
      <Pricing />
      
      {/* Blog Preview Section */}
      <BlogPreview />
      
      {/* FAQ Section */}
      <FAQ />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}