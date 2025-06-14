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
    
    try {
      console.log("Starting logout process...");
      setIsLoggingOut(true);
      
      // Clear React Query cache first
      queryClient.clear();
      console.log("Query cache cleared");
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      console.log("Storage cleared");
      
      // Call backend logout to clear server session
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log("Backend logout successful");
        } else {
          console.warn("Backend logout failed:", response.status);
        }
      } catch (backendError) {
        console.warn("Backend logout request failed:", backendError);
      }
      
      // Sign out from Firebase
      await signOutUser();
      console.log("Firebase signout completed");
      
      // Reset local state
      setFirebaseUser(null);
      setIsLoggingOut(false);
      
      // Force complete page reload with cache busting and timestamp
      const timestamp = Date.now();
      window.location.replace(`/?t=${timestamp}`);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
      
      // Force logout anyway
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      setFirebaseUser(null);
      
      const timestamp = Date.now();
      window.location.replace(`/?t=${timestamp}`);
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