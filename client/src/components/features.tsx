import { Card, CardContent } from "@/components/ui/card";
import { Plug, Shield, Gauge, Key, Clock, Database } from "lucide-react";

const features = [
  {
    icon: Plug,
    title: "Multi-Language Integration",
    description: "Simple REST API integration for C#, Python, Node.js, and more. Complete with code examples, SDKs, and comprehensive documentation for rapid development.",
    color: "bg-blue-100 text-primary-custom",
    keywords: ["REST API", "C# integration", "Python SDK", "Node.js authentication"]
  },
  {
    icon: Shield,
    title: "Enterprise Security Framework",
    description: "Military-grade security with bcrypt password hashing, JWT token management, API key authentication, rate limiting, and OWASP compliance built-in.",
    color: "bg-green-100 text-accent-custom",
    keywords: ["enterprise security", "bcrypt hashing", "JWT tokens", "OWASP compliance"]
  },
  {
    icon: Gauge,
    title: "Real-time Admin Dashboard",
    description: "Comprehensive admin panel with user analytics, authentication monitoring, session tracking, and real-time notifications for complete system oversight.",
    color: "bg-orange-100 text-orange-500",
    keywords: ["admin dashboard", "user analytics", "real-time monitoring", "session tracking"]
  },
  {
    icon: Key,
    title: "Advanced API Key Management",
    description: "Sophisticated API key system with role-based permissions, expiration dates, usage quotas, and instant revocation. Perfect for enterprise deployments.",
    color: "bg-purple-100 text-purple-500",
    keywords: ["API key management", "role-based access", "usage quotas", "enterprise deployment"]
  },
  {
    icon: Clock,
    title: "Smart Rate Limiting & DDoS Protection",
    description: "Intelligent rate limiting with configurable thresholds, IP whitelisting, geographic restrictions, and automatic threat detection to prevent abuse.",
    color: "bg-green-100 text-green-500",
    keywords: ["rate limiting", "DDoS protection", "IP whitelisting", "threat detection"]
  },
  {
    icon: Database,
    title: "Structured API Responses",
    description: "Consistent, well-documented JSON responses with detailed error codes, validation messages, and comprehensive logging for easy debugging and integration.",
    color: "bg-blue-100 text-blue-500",
    keywords: ["JSON API", "structured responses", "error handling", "API documentation"]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-white" itemScope itemType="https://schema.org/ItemList">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Complete Enterprise Authentication Features
          </h2>
          <p className="text-xl text-secondary-custom max-w-3xl mx-auto">
            Professional-grade authentication system built for developers who demand security, scalability, and reliability. 
            Everything you need for multi-tenant applications, SaaS platforms, and enterprise software solutions.
          </p>
          
          {/* SEO Keywords Section */}
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2"><strong>Perfect for:</strong></p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded-full">Enterprise Applications</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">SaaS Platforms</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">Multi-Tenant Systems</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">API Security</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">User Management</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">Authentication Services</span>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <article key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg" itemScope itemType="https://schema.org/SoftwareApplication">
                <div className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" itemProp="name">{feature.title}</h3>
                  <p className="text-secondary-custom mb-4" itemProp="description">{feature.description}</p>
                  
                  {/* SEO Keywords */}
                  <div className="flex flex-wrap gap-1">
                    {feature.keywords.map((keyword, keyIndex) => (
                      <span key={keyIndex} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        
        {/* Additional SEO Content */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Why Choose PHANTOM AUTH for Your Authentication Needs?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Enterprise-Ready Security</h4>
              <p className="text-gray-600">
                Built with enterprise security standards including OWASP compliance, advanced encryption, 
                and comprehensive audit trails for regulated industries.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Developer-Friendly API</h4>
              <p className="text-gray-600">
                RESTful API design with clear documentation, SDK support, and code examples for 
                rapid integration across multiple programming languages.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Scalable Architecture</h4>
              <p className="text-gray-600">
                Multi-tenant architecture that scales from startup to enterprise, with isolated 
                environments and unlimited user capacity per tenant.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">24/7 Monitoring</h4>
              <p className="text-gray-600">
                Real-time monitoring, alerting, and comprehensive logging ensure your authentication 
                system is always running smoothly and securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
