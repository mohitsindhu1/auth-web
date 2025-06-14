import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChange } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const queryClient = useQueryClient();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
      console.log("Firebase auth state changed:", user ? "logged in" : "logged out");
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
      
      if (!user) {
        queryClient.clear();
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Fetch user data from our backend when Firebase user exists
  const { data: backendUser, isLoading: isBackendLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!firebaseUser,
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  const isAuthenticated = !!firebaseUser && !!backendUser && !error;
  const isLoading = isFirebaseLoading || (firebaseUser && isBackendLoading);

  return {
    firebaseUser,
    user: backendUser,
    isAuthenticated,
    isLoading,
    error,
  };
}