import { useEffect } from 'react';

export default function SchemaMarkup() {
  useEffect(() => {
    // Advanced Schema.org markup for enterprise software
    const schemas = [
      // Main SoftwareApplication schema
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": "https://phantomauth.com/#software",
        "name": "PHANTOM AUTH",
        "alternateName": ["Phantom Auth", "PhantomAuth"],
        "description": "Professional multi-tenant authentication system with enterprise-grade security features including Google OAuth integration, API key management, and real-time monitoring.",
        "url": "https://phantomauth.com",
        "applicationCategory": ["SecurityApplication", "BusinessApplication", "DeveloperApplication"],
        "applicationSubCategory": "Authentication System",
        "operatingSystem": ["Web", "Cross-platform"],
        "softwareVersion": "2.0",
        "releaseDate": "2024-01-01",
        "datePublished": "2024-01-01",
        "dateModified": "2025-01-10",
        "author": {
          "@type": "Organization",
          "name": "PHANTOM AUTH",
          "url": "https://phantomauth.com"
        },
        "creator": {
          "@type": "Organization",
          "name": "PHANTOM AUTH",
          "url": "https://phantomauth.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "PHANTOM AUTH",
          "url": "https://phantomauth.com"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Plan",
            "description": "Perfect for startups and small projects",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01"
          },
          {
            "@type": "Offer",
            "name": "Professional Plan",
            "description": "For growing businesses with advanced needs",
            "price": "29",
            "priceCurrency": "USD",
            "billingIncrement": "P1M",
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01"
          },
          {
            "@type": "Offer",
            "name": "Enterprise Plan",
            "description": "For large organizations requiring custom solutions",
            "price": "99",
            "priceCurrency": "USD",
            "billingIncrement": "P1M",
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01"
          }
        ],
        "featureList": [
          "Multi-tenant authentication system",
          "Google OAuth integration",
          "API key management and security",
          "Enterprise-grade security features",
          "Real-time user monitoring and analytics",
          "Hardware ID (HWID) locking",
          "Application version control",
          "User management and administration",
          "Webhook notifications and integrations",
          "Rate limiting and DDoS protection",
          "GDPR compliance and data protection",
          "Comprehensive audit logging",
          "RESTful API with JSON responses",
          "C# and Python integration examples",
          "Multi-language support",
          "24/7 technical support"
        ],
        "screenshot": "https://phantomauth.com/screenshots/dashboard.jpg",
        "softwareHelp": {
          "@type": "CreativeWork",
          "url": "https://phantomauth.com/documentation"
        },
        "downloadUrl": "https://phantomauth.com/download",
        "installUrl": "https://phantomauth.com/get-started",
        "memoryRequirements": "512MB RAM",
        "processorRequirements": "Any modern processor",
        "storageRequirements": "100MB storage",
        "permissions": "Internet access for API calls",
        "countriesSupported": "Worldwide",
        "inLanguage": "en-US"
      },
      
      // Organization schema
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://phantomauth.com/#organization",
        "name": "PHANTOM AUTH",
        "legalName": "PHANTOM AUTH LLC",
        "url": "https://phantomauth.com",
        "logo": "https://phantomauth.com/logo.png",
        "description": "Leading provider of enterprise multi-tenant authentication solutions for modern applications",
        "foundingDate": "2024",
        "foundingLocation": {
          "@type": "Place",
          "addressCountry": "US"
        },
        "numberOfEmployees": "10-50",
        "industry": "Software Development",
        "naics": "541511",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": "support@phantomauth.com",
            "url": "https://phantomauth.com/support",
            "availableLanguage": "en-US",
            "hoursAvailable": "24/7"
          },
          {
            "@type": "ContactPoint",
            "contactType": "Sales",
            "email": "sales@phantomauth.com",
            "url": "https://phantomauth.com/contact",
            "availableLanguage": "en-US"
          },
          {
            "@type": "ContactPoint",
            "contactType": "Technical Support",
            "email": "tech@phantomauth.com",
            "url": "https://phantomauth.com/technical-support",
            "availableLanguage": "en-US"
          }
        ],
        "sameAs": [
          "https://twitter.com/phantomauth",
          "https://linkedin.com/company/phantomauth",
          "https://github.com/phantomauth",
          "https://facebook.com/phantomauth"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US",
          "addressRegion": "United States"
        }
      },
      
      // Product schema
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": "https://phantomauth.com/#product",
        "name": "PHANTOM AUTH Enterprise Authentication System",
        "description": "Complete multi-tenant authentication solution with advanced security features",
        "brand": {
          "@type": "Brand",
          "name": "PHANTOM AUTH"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "PHANTOM AUTH",
          "url": "https://phantomauth.com"
        },
        "category": "Authentication Software",
        "productID": "PHANTOM-AUTH-ENTERPRISE",
        "sku": "PA-ENT-001",
        "gtin": "1234567890123",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2024-01-01",
          "priceValidUntil": "2025-12-31",
          "offerCount": "3"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "500",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Sarah Johnson"
            },
            "reviewBody": "PHANTOM AUTH transformed our multi-tenant architecture. The Google OAuth integration and tenant isolation features are exactly what we needed.",
            "datePublished": "2024-12-15"
          }
        ]
      },
      
      // FAQ schema
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://phantomauth.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is multi-tenant authentication?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Multi-tenant authentication allows multiple organizations to use the same application while keeping their data completely isolated. Each tenant gets their own authentication environment with unique API keys, user management, and security settings."
            }
          },
          {
            "@type": "Question",
            "name": "How secure is PHANTOM AUTH?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PHANTOM AUTH implements military-grade security including bcrypt password hashing, JWT tokens, API key authentication, rate limiting, and OWASP compliance. Additional features include hardware ID locking, IP blacklisting, and comprehensive audit logging."
            }
          },
          {
            "@type": "Question",
            "name": "Does PHANTOM AUTH support Google OAuth?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, PHANTOM AUTH has full Google OAuth integration built-in. Users can authenticate using their Google accounts while maintaining complete tenant isolation and security."
            }
          },
          {
            "@type": "Question",
            "name": "What programming languages are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PHANTOM AUTH provides REST API endpoints that work with any programming language. We include specific integration examples and SDKs for C#, Python, JavaScript, and more."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free plan available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we offer a comprehensive free plan perfect for startups and small projects. It includes essential authentication features with generous usage limits."
            }
          }
        ]
      },
      
      // BreadcrumbList schema
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": "https://phantomauth.com/#breadcrumbs",
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
            "item": "https://phantomauth.com/features"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Enterprise Security",
            "item": "https://phantomauth.com/security"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "API Documentation",
            "item": "https://phantomauth.com/docs"
          }
        ]
      }
    ];
    
    // Add all schemas to the page
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    
    // Cleanup function
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`schema-${index}`);
        if (script) {
          document.head.removeChild(script);
        }
      });
    };
  }, []);
  
  return null;
}