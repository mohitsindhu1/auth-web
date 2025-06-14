import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChange, signOutUser } from "@/lib/firebase";
import { User } from "firebase/auth";
import { executeCompleteLogout } from "@/utils/logoutHandler";

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
        localStorage.getItem('user_logged_out') === 'true' ||
        sessionStorage.getItem('user_logged_out') === 'true' ||
        window.location.search.includes('logged_out=true') ||
        window.location.search.includes('logout_complete=true');

      if (wasLoggedOut) {
        console.log("User logged out - clearing auth state");
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
             localStorage.getItem('user_logged_out') !== 'true' &&
             sessionStorage.getItem('user_logged_out') !== 'true',
    retry: 1,
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 0, // Don't cache
  });

  const logout = async () => {
    if (isLoggingOut) return;
    
    console.log("🚨 STARTING COMPLETE LOGOUT SEQUENCE");
    setIsLoggingOut(true);
    
    try {
      await executeCompleteLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Emergency fallback
      setFirebaseUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/firebase-login?emergency_logout=true&t=' + Date.now());
    } finally {
      setIsLoggingOut(false);
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