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
    console.log("Starting Firebase signout");
    
    // Set logout flag immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_logged_out', 'true');
      sessionStorage.setItem('user_logged_out', 'true');
    }
    
    // Sign out from Firebase
    await signOut(auth);
    console.log("Firebase signout completed");
    
    // Clear Firebase storage after signout
    if (typeof window !== 'undefined') {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('firebase:') || 
            key.includes('authUser') || 
            key.includes('firebase') ||
            key.includes('Firebase') ||
            key.includes('Auth')) {
          localStorage.removeItem(key);
        }
      });
      
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('firebase:') || 
            key.includes('authUser') || 
            key.includes('firebase') ||
            key.includes('Firebase') ||
            key.includes('Auth')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Keep the logout flag
      localStorage.setItem('user_logged_out', 'true');
      sessionStorage.setItem('user_logged_out', 'true');
    }
    
    console.log("Firebase cleanup completed");
  } catch (error) {
    console.error("Error during Firebase signout:", error);
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