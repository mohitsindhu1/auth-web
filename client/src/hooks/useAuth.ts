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
    enabled: !!firebaseUser && !isLoggingOut,
    retry: 1,
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 0, // Don't cache
  });

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    console.log("🚪 Starting complete logout process...");
    setIsLoggingOut(true);
    
    try {
      // Step 1: Immediately set Firebase user to null to trigger UI changes
      setFirebaseUser(null);
      console.log("✅ Local Firebase user state cleared");
      
      // Step 2: Clear all client-side caches and storage
      queryClient.clear();
      queryClient.invalidateQueries();
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ All client storage cleared");
      
      // Step 3: Clear cookies manually
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.replit.app";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.replit.dev";
      });
      console.log("✅ Cookies cleared");
      
      // Step 4: Sign out from Firebase (with aggressive cleanup)
      try {
        await signOutUser();
        console.log("✅ Firebase signout completed");
      } catch (firebaseError) {
        console.warn("⚠️ Firebase signout error:", firebaseError);
      }
      
      // Step 5: Call backend logout (both POST and GET for safety)
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
      
      // Step 6: Final cleanup and redirect
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
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
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