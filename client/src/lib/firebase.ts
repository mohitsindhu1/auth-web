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
  // Configure Google provider
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

// Firebase authentication functions
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not properly configured');
  }
  try {
    // Try popup first, fallback to redirect if popup is blocked
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const signInWithGoogleRedirect = () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not properly configured');
  }
  return signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = () => {
  if (!auth) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
};

export const signOutUser = () => {
  if (!auth) {
    return Promise.resolve();
  }
  return signOut(auth);
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