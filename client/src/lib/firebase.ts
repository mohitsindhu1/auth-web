import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebasestorage.app`,
  messagingSenderId: "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Only initialize if we have proper config
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.projectId && 
                      firebaseConfig.appId &&
                      firebaseConfig.apiKey !== "" &&
                      firebaseConfig.projectId !== "demo-project";

let app: any = null;
let auth: any = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

let googleProvider: GoogleAuthProvider | null = null;

if (hasValidConfig && auth) {
  googleProvider = new GoogleAuthProvider();
  // Configure Google provider to always show account selection
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: '' // Force account picker for all domains
  });
}

// Firebase authentication functions
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not properly configured');
  }
  
  // Always ensure fresh provider with account selection to prevent auto-login
  const freshProvider = new GoogleAuthProvider();
  freshProvider.addScope('email');
  freshProvider.addScope('profile');
  freshProvider.setCustomParameters({
    prompt: 'select_account consent', // Force both account selection AND consent
    hd: '', // Force account picker for all domains
    include_granted_scopes: 'false' // Don't include previously granted scopes
  });
  
  try {
    // Try popup first, fallback to redirect if popup is blocked
    return await signInWithPopup(auth, freshProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, freshProvider);
    }
    throw error;
  }
};

export const signInWithGoogleRedirect = () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not properly configured');
  }
  
  // Create fresh provider for redirect with forced account selection
  const freshProvider = new GoogleAuthProvider();
  freshProvider.addScope('email');
  freshProvider.addScope('profile');
  freshProvider.setCustomParameters({
    prompt: 'select_account consent', // Force both account selection AND consent
    hd: '', // Force account picker for all domains
    include_granted_scopes: 'false' // Don't include previously granted scopes
  });
  
  return signInWithRedirect(auth, freshProvider);
};

export const handleRedirectResult = () => {
  if (!auth) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
};

export const signOutUser = async () => {
  if (!auth) {
    return Promise.resolve();
  }
  
  try {
    // Force clear Firebase auth state BEFORE signout
    if (typeof window !== 'undefined') {
      // Clear all Firebase storage FIRST
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('firebase:') || 
            key.includes('authUser') || 
            key.includes('firebase') ||
            key.includes('Firebase') ||
            key.includes('Auth')) {
          try {
            localStorage.removeItem(key);
            console.log('Cleared localStorage key:', key);
          } catch (e) {
            console.warn('Failed to clear Firebase storage key:', key);
          }
        }
      });
      
      // Clear sessionStorage Firebase keys
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('firebase:') || 
            key.includes('authUser') || 
            key.includes('firebase') ||
            key.includes('Firebase') ||
            key.includes('Auth')) {
          try {
            sessionStorage.removeItem(key);
            console.log('Cleared sessionStorage key:', key);
          } catch (e) {
            console.warn('Failed to clear Firebase session key:', key);
          }
        }
      });

      // Clear IndexedDB Firebase data
      try {
        if ('indexedDB' in window) {
          const deleteDB = indexedDB.deleteDatabase('firebase-heartbeat-database');
          deleteDB.onsuccess = () => console.log('Firebase IndexedDB cleared');
        }
      } catch (e) {
        console.warn('Could not clear Firebase IndexedDB:', e);
      }
    }
    
    // Sign out from Firebase
    await signOut(auth);
    console.log("Firebase signout completed");
    
    // Additional cleanup after signout
    if (typeof window !== 'undefined') {
      // Clear any remaining auth tokens
      const tokensToRemove = [
        'firebase-auth-token',
        'firebase-user',
        'authTokens',
        'firebaseUser'
      ];
      
      tokensToRemove.forEach(token => {
        localStorage.removeItem(token);
        sessionStorage.removeItem(token);
      });
    }
    
    console.log("Complete Firebase cleanup finished");
  } catch (error) {
    console.error("Error during Firebase signout:", error);
    
    // Emergency cleanup even if signout failed
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      console.log("Emergency storage clear completed");
    }
    
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Export auth and googleProvider for use in other components
export { auth, googleProvider };
export default app;