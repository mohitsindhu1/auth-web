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
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOutUser();
      
      // Call backend logout to clear server session
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Force a complete page reload to clear all cached data
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Force logout by clearing everything and redirecting
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
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