// Complete logout handler - nuclear approach
import { signOutUser } from '@/lib/firebase';
import { queryClient } from '@/lib/queryClient';

export const executeCompleteLogout = async (): Promise<void> => {
  console.log("🔥 EXECUTING COMPLETE LOGOUT - DESTROYING ALL AUTH");
  
  // Step 1: Immediate state destruction
  try {
    // Clear Firebase auth first
    await signOutUser();
    console.log("Firebase auth cleared");
  } catch (e) {
    console.warn("Firebase signout failed, continuing...", e);
  }

  // Step 2: Destroy all query cache
  try {
    queryClient.clear();
    queryClient.invalidateQueries();
    queryClient.removeQueries();
    console.log("Query cache destroyed");
  } catch (e) {
    console.warn("Query cache clear failed", e);
  }

  // Step 3: Nuclear storage clearing
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("All storage cleared");
  } catch (e) {
    console.warn("Storage clear failed", e);
  }

  // Step 4: Aggressive cookie destruction
  try {
    const allCookies = document.cookie.split(';');
    const domains = ['', '.replit.app', '.replit.dev', '.replit.co', 'localhost'];
    const paths = ['/', '/api'];
    
    allCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        domains.forEach(domain => {
          paths.forEach(path => {
            const domainStr = domain ? `domain=${domain};` : '';
            const commands = [
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; ${domainStr}`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; ${domainStr} secure;`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; ${domainStr} httponly;`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; ${domainStr} samesite=strict;`
            ];
            commands.forEach(cmd => {
              try {
                document.cookie = cmd;
              } catch (e) {
                // Ignore cookie setting errors
              }
            });
          });
        });
      }
    });
    console.log("All cookies destroyed");
  } catch (e) {
    console.warn("Cookie destruction failed", e);
  }

  // Step 5: Backend session destruction
  try {
    const destroyRequests = [
      fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }),
      fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    ];

    await Promise.allSettled(destroyRequests);
    console.log("Backend sessions destroyed");
  } catch (e) {
    console.warn("Backend logout failed", e);
  }

  // Step 6: Final cleanup
  localStorage.clear();
  sessionStorage.clear();
  
  console.log("🚨 LOGOUT COMPLETE - FORCING PAGE REDIRECT");
  
  // Force immediate redirect with cache busting
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  window.location.replace(`/firebase-login?logout_complete=true&t=${timestamp}&id=${randomId}`);
};