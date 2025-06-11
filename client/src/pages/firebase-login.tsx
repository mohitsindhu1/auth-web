import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn, CheckCircle, AlertCircle, Gamepad2, Zap, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { auth, signInWithGoogle, handleRedirectResult } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ParticleBackground from "@/components/ParticleBackground";

const firebaseLoginSchema = z.object({});

export default function FirebaseLogin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof firebaseLoginSchema>>({
    resolver: zodResolver(firebaseLoginSchema),
    defaultValues: {},
  });

  useEffect(() => {
    // Handle redirect result
    handleRedirectResult().then((result) => {
      if (result) {
        setUser(result.user);
        authenticateWithBackend(result.user);
      }
    }).catch((error) => {
      console.error("Redirect error:", error);
      toast({
        title: "Error",
        description: "Authentication failed",
        variant: "destructive"
      });
    });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const authenticateWithBackend = async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_token: token,
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Account created/logged in successfully!",
          variant: "default"
        });
        
        // Store account info
        localStorage.setItem('account_id', result.account_id);
        localStorage.setItem('account_email', firebaseUser.email);
        localStorage.setItem('firebase_uid', firebaseUser.uid);
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate with backend",
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google login",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Welcome to AuthAPI!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{user.displayName || 'User'}</p>
                    <p className="text-sm text-blue-700">{user.email}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-800">
                  You are now logged in with Firebase authentication.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    Go to Your Dashboard
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ParticleBackground />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Gamepad2 className="h-12 w-12 text-neon-purple mr-3 neon-glow" />
            <span className="text-3xl font-bold neon-text gaming-gradient bg-clip-text text-transparent">
              GameAuth
            </span>
          </Link>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Join the <span className="neon-text">Arena</span>
          </h2>
          <p className="text-muted-foreground flex items-center justify-center">
            <Zap className="h-4 w-4 mr-2 text-neon-blue" />
            Power up with Google authentication
          </p>
        </div>

        <Card className="gaming-card shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl font-bold">
              <Users className="h-6 w-6 mr-3 text-neon-blue" />
              <span className="neon-text">Multi-User Arena</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="gaming-card bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-neon-purple/30 rounded-lg p-4">
                <div className="flex items-start">
                  <Gamepad2 className="h-6 w-6 text-neon-purple mr-3 mt-1 neon-glow" />
                  <div>
                    <p className="text-sm font-bold text-neon-purple mb-1">
                      🎮 Gaming-Style Authentication
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Each Google account creates its own isolated gaming server with unique API keys and user management.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full gaming-button py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 border-0"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="text-white">CONNECTING TO SERVER...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-white">ENTER WITH GOOGLE</span>
                  </>
                )}
              </Button>

              <div className="text-center mt-6">
                <div className="gaming-card bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-neon-blue/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-neon-blue font-semibold mb-1">
                    🔥 Local Testing Available
                  </p>
                  <Link href="/test-login" className="text-neon-green hover:text-neon-blue transition-colors duration-300 font-medium">
                    Access Test Arena →
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}