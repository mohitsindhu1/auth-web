import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.value),
          non_interaction: true,
          custom_map: {
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
            metric_entries: metric.entries
          }
        });
      }
    };
    
    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          reportWebVitals({
            name: 'LCP',
            id: 'largest-contentful-paint',
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            entries: entries.length
          });
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    };
    
    // First Input Delay (FID)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FID',
              id: 'first-input-delay',
              value: entry.processingStart - entry.startTime,
              delta: entry.processingStart - entry.startTime,
              entries: 1
            });
          });
        });
        
        observer.observe({ type: 'first-input', buffered: true });
      }
    };
    
    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          reportWebVitals({
            name: 'CLS',
            id: 'cumulative-layout-shift',
            value: clsValue,
            delta: clsValue,
            entries: list.getEntries().length
          });
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
      }
    };
    
    // Time to First Byte (TTFB)
    const observeTTFB = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === window.location.origin) {
              reportWebVitals({
                name: 'TTFB',
                id: 'time-to-first-byte',
                value: entry.responseStart - entry.requestStart,
                delta: entry.responseStart - entry.requestStart,
                entries: 1
              });
            }
          });
        });
        
        observer.observe({ type: 'navigation', buffered: true });
      }
    };
    
    // First Contentful Paint (FCP)
    const observeFCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FCP',
              id: 'first-contentful-paint',
              value: entry.startTime,
              delta: entry.startTime,
              entries: 1
            });
          });
        });
        
        observer.observe({ type: 'paint', buffered: true });
      }
    };
    
    // Initialize all observers
    observeLCP();
    observeFID();
    observeCLS();
    observeTTFB();
    observeFCP();
    
    // Resource timing monitoring
    const monitorResourceTiming = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            // Track slow resources
            if (entry.duration > 1000) { // Resources taking more than 1 second
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'slow_resource', {
                  event_category: 'Performance',
                  event_label: entry.name,
                  value: Math.round(entry.duration),
                  resource_type: entry.initiatorType,
                  resource_size: entry.transferSize || 0
                });
              }
            }
          });
        });
        
        observer.observe({ type: 'resource', buffered: true });
      }
    };
    
    monitorResourceTiming();
    
    // Memory usage monitoring (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'memory_usage', {
            event_category: 'Performance',
            used_js_heap_size: memoryInfo.usedJSHeapSize,
            total_js_heap_size: memoryInfo.totalJSHeapSize,
            js_heap_size_limit: memoryInfo.jsHeapSizeLimit
          });
        }
      }
    };
    
    // Monitor memory usage every 30 seconds
    const memoryInterval = setInterval(monitorMemory, 30000);
    
    // Cleanup
    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
  
  return null;
}