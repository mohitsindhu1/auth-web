import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is multi-tenant authentication and why do I need it?",
    answer: "Multi-tenant authentication allows multiple organizations or customers to use the same application while keeping their data completely isolated. Each tenant gets their own authentication environment with unique API keys, user management, and security settings. This is essential for SaaS platforms, enterprise applications, and any software serving multiple customers.",
    keywords: ["multi-tenant", "SaaS authentication", "enterprise security"]
  },
  {
    question: "How does PHANTOM AUTH integrate with Google OAuth?",
    answer: "PHANTOM AUTH seamlessly integrates with Google OAuth for tenant authentication. Each Google account creates its own isolated tenant environment with complete data separation. This provides enterprise-grade security while maintaining ease of use for administrators and developers.",
    keywords: ["Google OAuth", "Google authentication", "tenant isolation"]
  },
  {
    question: "What programming languages are supported for integration?",
    answer: "PHANTOM AUTH provides comprehensive REST API support for all major programming languages including C#, Python, Node.js, Java, PHP, and more. We provide detailed code examples, SDKs, and documentation for rapid integration across different technology stacks.",
    keywords: ["REST API", "C# integration", "Python SDK", "multi-language support"]
  },
  {
    question: "How secure is the authentication system?",
    answer: "PHANTOM AUTH implements military-grade security including bcrypt password hashing, JWT token management, API key authentication, rate limiting, and OWASP compliance. We also provide advanced features like hardware ID locking, IP whitelisting, and comprehensive audit trails.",
    keywords: ["enterprise security", "OWASP compliance", "JWT tokens", "hardware ID locking"]
  },
  {
    question: "What is hardware ID locking and how does it work?",
    answer: "Hardware ID locking prevents users from sharing accounts across multiple devices. When enabled, each user is tied to a specific hardware fingerprint, ensuring that login sessions are restricted to authorized devices. This is particularly useful for software licensing and preventing unauthorized access.",
    keywords: ["hardware ID locking", "device security", "software licensing"]
  },
  {
    question: "Can I customize the authentication flow for my application?",
    answer: "Yes, PHANTOM AUTH offers extensive customization options including custom branding, configurable security policies, custom error messages, webhook notifications, and flexible API endpoints. Enterprise plans include white-label solutions and custom deployment options.",
    keywords: ["custom authentication", "white-label", "enterprise customization"]
  },
  {
    question: "How does the webhook system work?",
    answer: "Our webhook system provides real-time notifications for authentication events. You can configure webhooks for Discord, Slack, or custom endpoints to receive notifications about login attempts, security events, and user activities. This enables proactive monitoring and automated responses.",
    keywords: ["webhook notifications", "real-time monitoring", "Discord integration"]
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide comprehensive support including community forums, detailed documentation, email support for paid plans, and 24/7 dedicated support for enterprise customers. Our team includes authentication experts and security professionals ready to help with implementation and troubleshooting.",
    keywords: ["24/7 support", "enterprise support", "authentication experts"]
  },
  {
    question: "How does pricing work and can I start for free?",
    answer: "Yes, we offer a free starter plan with up to 1,000 users and 5,000 API requests per month. You can upgrade to Professional ($49/month) or Enterprise ($199/month) plans as your needs grow. All plans include core features with additional capabilities in higher tiers.",
    keywords: ["free plan", "pricing tiers", "scalable pricing"]
  },
  {
    question: "Is PHANTOM AUTH GDPR compliant?",
    answer: "Yes, PHANTOM AUTH is fully GDPR compliant with built-in data protection features, user consent management, data portability, and the right to be forgotten. We also provide compliance tools and audit trails to help you meet regulatory requirements.",
    keywords: ["GDPR compliance", "data protection", "regulatory compliance"]
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 bg-white" itemScope itemType="https://schema.org/FAQPage">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-8 w-8 text-primary mr-3" aria-hidden="true" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xl text-secondary-custom max-w-3xl mx-auto">
            Get answers to common questions about PHANTOM AUTH's multi-tenant authentication system, 
            enterprise security features, and implementation details.
          </p>
        </header>

        <div className="space-y-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg mb-4"
                itemScope 
                itemType="https://schema.org/Question"
              >
                <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50">
                  <h3 className="text-lg font-semibold text-slate-800" itemProp="name">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent 
                  className="px-6 pb-4"
                  itemScope 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    <p className="text-gray-700 mb-4">
                      {faq.answer}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faq.keywords.map((keyword, keyIndex) => (
                        <span 
                          key={keyIndex} 
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional SEO Content */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Still Have Questions About Multi-Tenant Authentication?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Our team of authentication experts is ready to help you implement the perfect 
            multi-tenant authentication solution for your enterprise application or SaaS platform.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-800 mb-2">Technical Support</h4>
                <p className="text-sm text-gray-600">
                  Get help with integration, API implementation, and troubleshooting
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-800 mb-2">Enterprise Consultation</h4>
                <p className="text-sm text-gray-600">
                  Custom solutions for large-scale deployments and enterprise requirements
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-800 mb-2">Security Audit</h4>
                <p className="text-sm text-gray-600">
                  Professional security review and compliance assessment services
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}