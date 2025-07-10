import { useEffect } from 'react';

export default function LocalSEO() {
  useEffect(() => {
    // Local business schema for enterprise presence
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareCompany",
      "@id": "https://phantomauth.com/#localbusiness",
      "name": "PHANTOM AUTH",
      "description": "Enterprise authentication solutions provider specializing in multi-tenant systems",
      "url": "https://phantomauth.com",
      "telephone": "+1-800-PHANTOM",
      "email": "info@phantomauth.com",
      "foundingDate": "2024",
      "numberOfEmployees": "10-50",
      "slogan": "Secure Authentication for Modern Applications",
      "knowsAbout": [
        "Multi-tenant authentication",
        "Enterprise security",
        "API authentication",
        "Google OAuth integration",
        "SaaS security",
        "User management systems",
        "Authentication APIs",
        "Security frameworks",
        "Identity management",
        "Access control systems"
      ],
      "serviceArea": {
        "@type": "GeoShape",
        "name": "Worldwide"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "Canada"
        },
        {
          "@type": "Country",
          "name": "United Kingdom"
        },
        {
          "@type": "Country",
          "name": "Australia"
        },
        {
          "@type": "Country",
          "name": "Germany"
        },
        {
          "@type": "Country",
          "name": "France"
        },
        {
          "@type": "Country",
          "name": "Japan"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "PHANTOM AUTH Services",
        "itemListElement": [
          {
            "@type": "OfferCatalog",
            "name": "Authentication Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Multi-Tenant Authentication",
                  "description": "Complete authentication system for multi-tenant applications"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Google OAuth Integration",
                  "description": "Seamless Google OAuth authentication with tenant isolation"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "API Key Management",
                  "description": "Secure API key generation and management system"
                }
              }
            ]
          },
          {
            "@type": "OfferCatalog",
            "name": "Security Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Hardware ID Locking",
                  "description": "Prevent unauthorized access with hardware-based security"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Rate Limiting",
                  "description": "Advanced rate limiting and DDoS protection"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Audit Logging",
                  "description": "Comprehensive activity logging and monitoring"
                }
              }
            ]
          }
        ]
      },
      "makesOffer": [
        {
          "@type": "Offer",
          "name": "Free Plan",
          "description": "Perfect for startups and small projects",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan", 
          "description": "For growing businesses with advanced needs",
          "price": "29",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Enterprise Plan",
          "description": "For large organizations requiring custom solutions",
          "price": "99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      ],
      "awards": [
        "Best Authentication Solution 2024",
        "Enterprise Security Excellence Award",
        "Developer Choice Award 2024"
      ],
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Organization",
            "name": "TechStart Solutions"
          },
          "reviewBody": "PHANTOM AUTH has transformed our enterprise authentication needs. Excellent multi-tenant isolation and security features."
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "500",
        "bestRating": "5"
      }
    };
    
    // Add local business schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'local-business-schema';
    script.text = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script);
    
    // Add structured data for services
    const servicesSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": "https://phantomauth.com/#services",
      "name": "PHANTOM AUTH Services",
      "description": "Comprehensive authentication and security services for enterprises",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Service",
            "name": "Multi-Tenant Authentication",
            "description": "Complete authentication system with tenant isolation",
            "provider": {
              "@type": "Organization",
              "name": "PHANTOM AUTH"
            },
            "areaServed": "Worldwide",
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://phantomauth.com/multi-tenant-auth",
              "serviceName": "Multi-Tenant Authentication Service"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Service",
            "name": "Enterprise Security",
            "description": "Advanced security features including hardware ID locking",
            "provider": {
              "@type": "Organization",
              "name": "PHANTOM AUTH"
            },
            "areaServed": "Worldwide",
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://phantomauth.com/enterprise-security",
              "serviceName": "Enterprise Security Service"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Service",
            "name": "API Integration",
            "description": "RESTful API with comprehensive documentation and examples",
            "provider": {
              "@type": "Organization",
              "name": "PHANTOM AUTH"
            },
            "areaServed": "Worldwide",
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://phantomauth.com/api-integration",
              "serviceName": "API Integration Service"
            }
          }
        }
      ]
    };
    
    const servicesScript = document.createElement('script');
    servicesScript.type = 'application/ld+json';
    servicesScript.id = 'services-schema';
    servicesScript.text = JSON.stringify(servicesSchema);
    document.head.appendChild(servicesScript);
    
    // Cleanup
    return () => {
      const localScript = document.getElementById('local-business-schema');
      const servicesScript = document.getElementById('services-schema');
      if (localScript) document.head.removeChild(localScript);
      if (servicesScript) document.head.removeChild(servicesScript);
    };
  }, []);
  
  return null;
}