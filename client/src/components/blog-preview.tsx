import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

const blogPosts = [
  {
    title: "Complete Guide to Multi-Tenant Authentication in 2025",
    excerpt: "Learn how to implement secure multi-tenant authentication systems with isolation, scalability, and enterprise-grade security features.",
    category: "Authentication",
    readTime: "8 min read",
    publishDate: "2025-01-08",
    author: "Sarah Johnson",
    keywords: ["multi-tenant", "authentication", "enterprise security", "SaaS"],
    slug: "multi-tenant-authentication-guide-2025"
  },
  {
    title: "Hardware ID Locking: Preventing Account Sharing in Enterprise Applications",
    excerpt: "Discover how hardware ID locking enhances security by preventing unauthorized account sharing and maintaining licensing compliance.",
    category: "Security",
    readTime: "6 min read",
    publishDate: "2025-01-05",
    author: "Michael Chen",
    keywords: ["hardware ID locking", "account security", "enterprise", "licensing"],
    slug: "hardware-id-locking-enterprise-security"
  },
  {
    title: "Google OAuth Integration for Multi-Tenant SaaS Platforms",
    excerpt: "Step-by-step guide to implementing Google OAuth authentication with tenant isolation for SaaS applications and enterprise software.",
    category: "Integration",
    readTime: "10 min read",
    publishDate: "2025-01-02",
    author: "Emily Rodriguez",
    keywords: ["Google OAuth", "SaaS", "tenant isolation", "integration"],
    slug: "google-oauth-multi-tenant-saas"
  },
  {
    title: "REST API Best Practices for Authentication Systems",
    excerpt: "Essential REST API design patterns, security considerations, and implementation strategies for modern authentication systems.",
    category: "Development",
    readTime: "7 min read",
    publishDate: "2024-12-28",
    author: "David Thompson",
    keywords: ["REST API", "API design", "authentication", "security"],
    slug: "rest-api-authentication-best-practices"
  },
  {
    title: "GDPR Compliance in Multi-Tenant Authentication Systems",
    excerpt: "Comprehensive guide to ensuring GDPR compliance, data protection, and privacy requirements in multi-tenant authentication platforms.",
    category: "Compliance",
    readTime: "12 min read",
    publishDate: "2024-12-25",
    author: "Lisa Wang",
    keywords: ["GDPR", "compliance", "data protection", "privacy"],
    slug: "gdpr-compliance-multi-tenant-authentication"
  },
  {
    title: "Scaling Authentication: From Startup to Enterprise",
    excerpt: "Learn how to scale authentication systems from small startups to enterprise deployments with millions of users and complex requirements.",
    category: "Scaling",
    readTime: "9 min read",
    publishDate: "2024-12-20",
    author: "Robert Martinez",
    keywords: ["scaling", "enterprise", "performance", "architecture"],
    slug: "scaling-authentication-startup-to-enterprise"
  }
];

export default function BlogPreview() {
  return (
    <section id="blog" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Latest Insights on Enterprise Authentication
          </h2>
          <p className="text-xl text-secondary-custom max-w-3xl mx-auto">
            Stay updated with the latest trends, best practices, and technical insights in 
            multi-tenant authentication, enterprise security, and SaaS platform development.
          </p>
          
          {/* Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Authentication
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Security
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Integration
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Development
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Compliance
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Scaling
            </Badge>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article 
              key={index} 
              className="group cursor-pointer"
              itemScope 
              itemType="https://schema.org/BlogPosting"
            >
              <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300 group-hover:transform group-hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${post.category === 'Authentication' ? 'bg-blue-100 text-blue-700' : ''}
                        ${post.category === 'Security' ? 'bg-green-100 text-green-700' : ''}
                        ${post.category === 'Integration' ? 'bg-purple-100 text-purple-700' : ''}
                        ${post.category === 'Development' ? 'bg-orange-100 text-orange-700' : ''}
                        ${post.category === 'Compliance' ? 'bg-red-100 text-red-700' : ''}
                        ${post.category === 'Scaling' ? 'bg-indigo-100 text-indigo-700' : ''}
                      `}
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 line-clamp-2" itemProp="headline">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4 line-clamp-3" itemProp="description">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.keywords.map((keyword, keyIndex) => (
                      <span 
                        key={keyIndex} 
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center" itemProp="author" itemScope itemType="https://schema.org/Person">
                      <User className="h-4 w-4 mr-1" />
                      <span itemProp="name">{post.author}</span>
                    </div>
                    <div className="flex items-center" itemProp="datePublished" content={post.publishDate}>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-primary group-hover:text-primary/80 transition-colors">
                    <span className="text-sm font-medium">Read More</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>

        {/* Additional SEO Content */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Expert Resources for Authentication Professionals
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-gray-600">Technical Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-gray-600">Code Examples</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <div className="text-sm text-gray-600">Integration Guides</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">Expert Support</div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Popular Topics
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                Multi-Tenant Architecture
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                Enterprise Security
              </span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                API Authentication
              </span>
              <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                SaaS Development
              </span>
              <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                Compliance & Privacy
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                Performance Optimization
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}