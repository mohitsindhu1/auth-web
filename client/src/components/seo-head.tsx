import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

export default function SEOHead({
  title = "PHANTOM AUTH - Enterprise Multi-Tenant Authentication System | Secure API Authentication",
  description = "Professional multi-tenant authentication system with enterprise-grade security. Google OAuth integration, isolated environments, API key management, and real-time user monitoring. Perfect for SaaS platforms and enterprise applications.",
  keywords = "authentication system, multi-tenant auth, enterprise security, API authentication, Google OAuth, SaaS authentication, user management, secure login, REST API, enterprise software, authentication API, tenant isolation, security framework",
  canonical = "https://phantomauth.com/",
  ogImage = "https://phantomauth.com/og-image.jpg",
  structuredData
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', canonical, true);
    
    // Update Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', ogImage, true);
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
    
    // Add structured data if provided
    if (structuredData) {
      const structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.text = JSON.stringify(structuredData);
      document.head.appendChild(structuredDataScript);
      
      return () => {
        if (structuredDataScript.parentNode) {
          structuredDataScript.parentNode.removeChild(structuredDataScript);
        }
      };
    }
  }, [title, description, keywords, canonical, ogImage, structuredData]);
  
  return null;
}