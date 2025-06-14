import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { onAuthStateChange, signOutUser } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data from our backend when Firebase user exists
  const { data: backendUser, isLoading: isBackendLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!firebaseUser,
    retry: 2,
    staleTime: 5000,
  });

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      
      // Clear local storage and session storage first
      localStorage.clear();
      sessionStorage.clear();
      console.log("Storage cleared");
      
      // Sign out from Firebase
      await signOutUser();
      console.log("Firebase signout completed");
      
      // Call backend logout to clear server session with proper headers
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
      
      // Force complete page reload with cache busting
      window.location.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force logout anyway
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
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