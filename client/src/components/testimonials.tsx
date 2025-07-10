import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechStart Solutions",
    industry: "SaaS Platform",
    content: "PHANTOM AUTH transformed our multi-tenant architecture. The Google OAuth integration and tenant isolation features are exactly what we needed for our enterprise customers. Implementation was seamless and the security features are top-notch.",
    rating: 5,
    keywords: ["multi-tenant", "enterprise", "Google OAuth", "SaaS"]
  },
  {
    name: "Michael Chen",
    role: "Lead Developer",
    company: "SecureApp Inc",
    industry: "Financial Services",
    content: "As a financial services company, security is our top priority. PHANTOM AUTH's hardware ID locking and advanced security features exceed our compliance requirements. The API is well-documented and easy to integrate.",
    rating: 5,
    keywords: ["financial services", "security", "compliance", "hardware ID locking"]
  },
  {
    name: "Emily Rodriguez",
    role: "Software Architect",
    company: "CloudTech Enterprise",
    industry: "Enterprise Software",
    content: "The scalability of PHANTOM AUTH is impressive. We handle over 100,000 users across multiple tenants without any performance issues. The webhook system keeps us informed of all authentication events in real-time.",
    rating: 5,
    keywords: ["scalability", "enterprise", "webhooks", "performance"]
  },
  {
    name: "David Thompson",
    role: "DevOps Engineer",
    company: "StartupFlow",
    industry: "Startup Platform",
    content: "Started with the free plan and scaled to Professional as our user base grew. The pricing is transparent and the support team is incredibly responsive. Perfect for startups looking to scale quickly.",
    rating: 5,
    keywords: ["startup", "scalable pricing", "support", "growth"]
  },
  {
    name: "Lisa Wang",
    role: "Security Manager",
    company: "HealthTech Solutions",
    industry: "Healthcare Technology",
    content: "GDPR compliance and data protection features are excellent. The audit trails and comprehensive logging help us meet regulatory requirements. Essential for healthcare applications handling sensitive data.",
    rating: 5,
    keywords: ["GDPR", "healthcare", "compliance", "data protection"]
  },
  {
    name: "Robert Martinez",
    role: "Full Stack Developer",
    company: "AgileCode",
    industry: "Software Development",
    content: "The C# and Python integration examples saved us weeks of development time. The REST API is intuitive and the error handling is clear. Best authentication solution we've implemented.",
    rating: 5,
    keywords: ["C# integration", "Python", "REST API", "development time"]
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/ItemList">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Trusted by Enterprise Customers Worldwide
          </h2>
          <p className="text-xl text-secondary-custom max-w-3xl mx-auto">
            See what industry leaders say about PHANTOM AUTH's multi-tenant authentication system. 
            From startups to Fortune 500 companies, discover how our enterprise-grade security 
            solutions are transforming authentication across industries.
          </p>
          
          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-gray-600">Enterprise Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-600">Support Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10M+</div>
              <div className="text-sm text-gray-600">Monthly API Calls</div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="shadow-sm hover:shadow-md transition-shadow relative"
              itemScope 
              itemType="https://schema.org/Review"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-6 w-6 text-primary mr-2" aria-hidden="true" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-4 italic" itemProp="reviewBody">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div itemProp="author" itemScope itemType="https://schema.org/Person">
                      <div className="font-semibold text-slate-800" itemProp="name">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600" itemProp="jobTitle">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-primary font-medium" itemProp="worksFor">
                        {testimonial.company}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{testimonial.industry}</div>
                      <div className="flex" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                        <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                        <meta itemProp="bestRating" content="5" />
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Keywords */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {testimonial.keywords.map((keyword, keyIndex) => (
                      <span 
                        key={keyIndex} 
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Coverage */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Serving Industries Worldwide
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Financial Services</div>
              <div className="text-sm text-gray-600">Banking, Insurance, Fintech</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Healthcare</div>
              <div className="text-sm text-gray-600">Medical, Pharma, Telemedicine</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Technology</div>
              <div className="text-sm text-gray-600">SaaS, Enterprise Software, AI</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Government</div>
              <div className="text-sm text-gray-600">Federal, State, Municipal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Education</div>
              <div className="text-sm text-gray-600">Universities, K-12, EdTech</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">E-commerce</div>
              <div className="text-sm text-gray-600">Retail, Marketplace, B2B</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Manufacturing</div>
              <div className="text-sm text-gray-600">Industrial, Automotive, Supply Chain</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Startups</div>
              <div className="text-sm text-gray-600">Seed to Series C, Scale-ups</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Join Thousands of Satisfied Customers
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Experience the power of enterprise-grade multi-tenant authentication. 
            Start your free trial today and see why industry leaders choose PHANTOM AUTH.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              No Credit Card Required
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Free Forever Plan
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Enterprise Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}