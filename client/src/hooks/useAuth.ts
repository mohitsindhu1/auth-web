import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChange, signOutUser } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
      console.log("Firebase auth state changed:", user ? "logged in" : "logged out");
      
      // Check if user was deliberately logged out
      const wasLoggedOut = 
        localStorage.getItem('logout_in_progress') === 'true' ||
        sessionStorage.getItem('logout_in_progress') === 'true' ||
        window.location.search.includes('logged_out=true') ||
        window.location.search.includes('force_logout=true');

      if (wasLoggedOut && user) {
        console.log("Ignoring Firebase auth state - user was deliberately logged out");
        setFirebaseUser(null);
        setIsFirebaseLoading(false);
        queryClient.clear();
        return;
      }
      
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
      
      // If user is null (logged out), clear all queries
      if (!user) {
        queryClient.clear();
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Fetch user data from our backend when Firebase user exists
  const { data: backendUser, isLoading: isBackendLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!firebaseUser && !isLoggingOut && 
             localStorage.getItem('logout_in_progress') !== 'true' &&
             sessionStorage.getItem('logout_in_progress') !== 'true',
    retry: 1,
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 0, // Don't cache
  });

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    console.log("🚪 Starting complete logout process...");
    setIsLoggingOut(true);
    
    try {
      // Step 0: Set logout flag BEFORE anything else
      localStorage.setItem('logout_in_progress', 'true');
      sessionStorage.setItem('logout_in_progress', 'true');
      console.log("✅ Logout flags set");
      
      // Step 1: Immediately set Firebase user to null to trigger UI changes
      setFirebaseUser(null);
      console.log("✅ Local Firebase user state cleared");
      
      // Step 2: Sign out from Firebase FIRST (with aggressive cleanup)
      try {
        await signOutUser();
        console.log("✅ Firebase signout completed");
      } catch (firebaseError) {
        console.warn("⚠️ Firebase signout error:", firebaseError);
      }
      
      // Step 3: Call backend logout (both POST and GET for safety)
      const logoutRequests = [
        fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/logout', {
          method: 'GET',
          credentials: 'include'
        })
      ];
      
      try {
        const responses = await Promise.allSettled(logoutRequests);
        console.log("✅ Backend logout requests completed:", responses);
      } catch (backendError) {
        console.warn("⚠️ Backend logout failed:", backendError);
      }
      
      // Step 4: Clear all client-side caches and storage
      queryClient.clear();
      queryClient.invalidateQueries();
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ All client storage cleared");
      
      // Step 5: Clear cookies manually (more aggressive)
      const cookiesToClear = ['connect.sid', 'session', '.AuthSession', 'firebase-auth-token'];
      const domains = ['', '.replit.app', '.replit.dev', '.replit.co'];
      
      cookiesToClear.forEach(cookieName => {
        domains.forEach(domain => {
          const domainPart = domain ? `domain=${domain};` : '';
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domainPart}`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domainPart} secure;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domainPart} httponly;`;
        });
      });
      
      // Also clear all existing cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        domains.forEach(domain => {
          const domainPart = domain ? `domain=${domain};` : '';
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domainPart}`;
        });
      });
      console.log("✅ Cookies cleared");
      
      // Step 6: Set logout flag again and redirect
      localStorage.setItem('logout_in_progress', 'true');
      sessionStorage.setItem('logout_in_progress', 'true');
      setIsLoggingOut(false);
      
      // Force a hard refresh to completely reset the application state
      console.log("🔄 Forcing complete page reload...");
      const timestamp = Date.now();
      window.location.href = `/?logged_out=true&t=${timestamp}`;
      
    } catch (error) {
      console.error("❌ Critical logout error:", error);
      
      // Emergency logout - force everything
      setFirebaseUser(null);
      setIsLoggingOut(false);
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      // Set emergency logout flag
      localStorage.setItem('logout_in_progress', 'true');
      sessionStorage.setItem('logout_in_progress', 'true');
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      });
      
      const timestamp = Date.now();
      window.location.href = `/?force_logout=true&t=${timestamp}`;
    }
  };

  const isAuthenticated = !!firebaseUser && !!backendUser && !error;
  const isLoading = isFirebaseLoading || (firebaseUser && isBackendLoading);

  return {
    firebaseUser,
    user: backendUser,
    isAuthenticated,
    isLoading,
    error,
    logout,
  };
}