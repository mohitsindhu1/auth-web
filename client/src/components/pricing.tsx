import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for developers and small projects testing multi-tenant authentication",
    features: [
      "Up to 1,000 authenticated users",
      "5,000 API requests/month", 
      "Basic multi-tenant isolation",
      "Google OAuth integration",
      "Community support",
      "REST API access",
      "C# and Python examples"
    ],
    buttonText: "Start Free Today",
    buttonVariant: "outline" as const,
    popular: false,
    keywords: ["free authentication", "developer trial", "multi-tenant starter"]
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For growing SaaS platforms and enterprise applications",
    features: [
      "Up to 25,000 authenticated users",
      "100,000 API requests/month",
      "Advanced tenant isolation",
      "Hardware ID locking",
      "Webhook notifications",
      "Priority email support",
      "Real-time monitoring dashboard",
      "Custom branding options",
      "API key management"
    ],
    buttonText: "Start Professional Trial",
    buttonVariant: "default" as const,
    popular: true,
    keywords: ["saas authentication", "enterprise security", "professional plan"]
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large-scale multi-tenant applications and enterprise deployments",
    features: [
      "Unlimited authenticated users",
      "Unlimited API requests",
      "Advanced security features",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee (99.9% uptime)",
      "GDPR compliance tools",
      "Advanced audit logging",
      "Custom deployment options",
      "White-label solutions"
    ],
    buttonText: "Contact Enterprise Sales",
    buttonVariant: "secondary" as const,
    popular: false,
    keywords: ["enterprise authentication", "unlimited users", "enterprise security"]
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/PriceSpecification">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Enterprise Authentication Pricing Plans
          </h2>
          <p className="text-xl text-secondary-custom max-w-3xl mx-auto">
            Choose the perfect multi-tenant authentication plan for your business. 
            Start with our free tier and scale seamlessly as your application grows. 
            No hidden fees, transparent pricing, and enterprise-grade security at every level.
          </p>
          
          {/* SEO Benefits Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">Enterprise Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">GDPR</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <article 
              key={index} 
              className={`shadow-sm relative ${
                plan.popular ? 'border-2 border-primary shadow-lg' : 'border border-gray-200'
              } rounded-lg`}
              itemScope 
              itemType="https://schema.org/Product"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Most Popular for SaaS</Badge>
                </div>
              )}
              <div className="text-center pb-8 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2" itemProp="name">
                  {plan.name} Plan
                </h3>
                <div className="text-4xl font-bold text-slate-800 mb-4" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price">{plan.price}</span>
                  <span className="text-lg text-secondary-custom" itemProp="priceCurrency">{plan.period}</span>
                </div>
                <p className="text-secondary-custom" itemProp="description">{plan.description}</p>
                
                {/* Plan Keywords */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {plan.keywords.map((keyword, keyIndex) => (
                    <span key={keyIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8 p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-accent-custom mr-3 flex-shrink-0" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.buttonVariant === 'default' 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : plan.buttonVariant === 'outline'
                      ? 'bg-gray-100 text-slate-800 hover:bg-gray-200'
                      : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </article>
          ))}
        </div>
        
        {/* Additional SEO Content */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Why Businesses Choose PHANTOM AUTH for Multi-Tenant Authentication
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-gray-600">Enterprise Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10M+</div>
              <div className="text-sm text-gray-600">API Requests Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">Expert Support</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers and enterprise teams who trust PHANTOM AUTH 
              for their multi-tenant authentication needs. Start free and scale with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
