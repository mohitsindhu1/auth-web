import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChange } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [authDisabled, setAuthDisabled] = useState(false);
  const queryClient = useQueryClient();

  // Check if authentication should be disabled
  useEffect(() => {
    const checkAuthStatus = () => {
      const shouldDisableAuth = 
        window.location.pathname === '/' &&
        !window.location.search.includes('login=true');
      
      if (shouldDisableAuth) {
        setAuthDisabled(true);
        setFirebaseUser(null);
        setIsFirebaseLoading(false);
        queryClient.clear();
        return true;
      }
      return false;
    };

    if (checkAuthStatus()) return;

    const unsubscribe = onAuthStateChange((user: User | null) => {
      if (authDisabled || checkAuthStatus()) {
        setFirebaseUser(null);
        setIsFirebaseLoading(false);
        return;
      }
      
      console.log("Firebase auth state changed:", user ? "logged in" : "logged out");
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
      
      if (!user) {
        queryClient.clear();
      }
    });

    return () => unsubscribe();
  }, [queryClient, authDisabled]);

  // Fetch user data from our backend when Firebase user exists
  const { data: backendUser, isLoading: isBackendLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!firebaseUser && !authDisabled,
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  const isAuthenticated = !!firebaseUser && !!backendUser && !error && !authDisabled;
  const isLoading = isFirebaseLoading || (firebaseUser && isBackendLoading);

  return {
    firebaseUser,
    user: backendUser,
    isAuthenticated,
    isLoading,
    error,
  };
}