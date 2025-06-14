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
    
    console.log("NUCLEAR LOGOUT - Destroying all authentication");
    setIsLoggingOut(true);
    
    // STEP 1: IMMEDIATE STATE DESTRUCTION
    setFirebaseUser(null);
    
    // STEP 2: TOTAL STORAGE ANNIHILATION  
    localStorage.clear();
    sessionStorage.clear();
    
    // STEP 3: QUERY CACHE DESTRUCTION
    queryClient.clear();
    queryClient.invalidateQueries();
    queryClient.removeQueries();
    
    // STEP 4: AGGRESSIVE COOKIE CLEARING
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        // Clear for multiple domains and paths
        const clearCommands = [
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`,
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.replit.app;`,
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.replit.dev;`,
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.replit.co;`,
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`,
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; httponly;`
        ];
        clearCommands.forEach(cmd => {
          document.cookie = cmd;
        });
      }
    });
    
    // STEP 5: FIREBASE DESTRUCTION
    try {
      await signOutUser();
      console.log("Firebase destroyed");
    } catch (e) {
      console.log("Firebase destruction failed, forcing storage clear");
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // STEP 6: BACKEND SESSION DESTRUCTION
    try {
      await Promise.allSettled([
        fetch('/api/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/logout', { method: 'GET', credentials: 'include' })
      ]);
      console.log("Backend sessions destroyed");
    } catch (e) {
      console.log("Backend destruction failed, proceeding anyway");
    }
    
    // STEP 7: FINAL CLEANUP AND FORCED REDIRECT
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggingOut(false);
    
    // NUCLEAR OPTION: Force immediate redirect to login with no cache
    console.log("FORCING IMMEDIATE REDIRECT TO LOGIN");
    window.location.replace('/firebase-login?force_logout=true&no_cache=' + Date.now());
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