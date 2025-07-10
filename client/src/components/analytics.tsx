import { useEffect } from 'react';
import { useLocation } from 'wouter';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default function Analytics() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };
      
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
      
      // Configure GA
      window.gtag('js', new Date());
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Authentication',
        content_group2: 'Enterprise',
        send_page_view: false
      });
    }
  }, []);
  
  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location
      });
      
      // Track custom events
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location,
        content_group1: 'Authentication',
        content_group2: 'Enterprise'
      });
    }
  }, [location]);
  
  return null;
}

// Custom event tracking functions
export const trackEvent = (eventName: string, parameters: { [key: string]: any } = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackUserInteraction = (action: string, element: string, value?: string) => {
  trackEvent('user_interaction', {
    action,
    element,
    value,
    page_path: window.location.pathname
  });
};

export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
    currency: 'USD',
    timestamp: new Date().toISOString()
  });
};

export const trackAuthentication = (method: string, success: boolean) => {
  trackEvent('authentication', {
    method,
    success,
    timestamp: new Date().toISOString()
  });
};

export const trackAPIUsage = (endpoint: string, method: string, responseTime: number) => {
  trackEvent('api_usage', {
    endpoint,
    method,
    response_time: responseTime,
    timestamp: new Date().toISOString()
  });
};