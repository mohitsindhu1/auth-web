import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Key, 
  Users, 
  Server, 
  FileText, 
  Shield, 
  Plus, 
  Eye,
  Trash2,
  Copy,
  Activity,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalApiKeys: number;
  activeApiKeys: number;
  accountType: string;
}

export default function Dashboard() {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const accountId = localStorage.getItem('account_id');
    const email = localStorage.getItem('account_email');
    const firebaseUid = localStorage.getItem('firebase_uid');
    
    if (!accountId) {
      setLocation('/firebase-login');
      return;
    }
    
    setAccountInfo({ accountId, email, firebaseUid });
  }, [setLocation]);

  // Fetch dashboard stats
  const { data: stats = { totalUsers: 0, totalApiKeys: 0, activeApiKeys: 0, accountType: 'Basic' }, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!accountInfo?.accountId,
  });

  // Fetch API keys
  const { data: apiKeys = [], isLoading: apiKeysLoading, refetch: refetchApiKeys } = useQuery<ApiKey[]>({
    queryKey: ['/api/api-keys'],
    enabled: !!accountInfo?.accountId,
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!accountInfo?.accountId,
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: (data: { name: string }) => apiRequest('/api/api-keys', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API key created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive"
      });
    }
  });

  const handleCreateApiKey = () => {
    const name = prompt("Enter API key name:");
    if (name) {
      createApiKeyMutation.mutate({ name });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('account_id');
    localStorage.removeItem('account_email');
    localStorage.removeItem('firebase_uid');
    setLocation('/firebase-login');
  };

  if (!accountInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <Shield className="h-8 w-8 primary-color" />
                <span className="text-2xl font-bold text-gray-900">AuthAPI</span>
              </Link>
              <Badge className="bg-primary text-white">
                <Building className="h-3 w-3 mr-1" />
                Enterprise
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold primary-color">{accountInfo.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to your <span className="neon-text">Gaming Server</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your authentication arena, users, and API keys
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-neon-green">
                    {statsLoading ? "..." : stats.totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">API Keys</p>
                  <p className="text-3xl font-bold text-neon-blue">
                    {statsLoading ? "..." : stats.totalApiKeys}
                  </p>
                </div>
                <Key className="h-8 w-8 text-neon-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Keys</p>
                  <p className="text-3xl font-bold text-neon-purple">
                    {statsLoading ? "..." : stats.activeApiKeys}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Server Status</p>
                  <p className="text-3xl font-bold text-neon-green">Online</p>
                </div>
                <Server className="h-8 w-8 text-neon-green pulse-animation" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="gaming-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-neon-blue" />
                  API Keys
                </CardTitle>
                <Button
                  onClick={handleCreateApiKey}
                  className="gaming-button"
                  disabled={createApiKeyMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeysLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No API keys created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.slice(0, 3).map((key: ApiKey) => (
                    <div key={key.id} className="gaming-card bg-gradient-to-r from-purple-900/10 to-blue-900/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-neon-blue">{key.name}</h4>
                          <p className="text-sm text-muted-foreground font-mono">
                            {key.key.substring(0, 20)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={key.isActive ? "default" : "secondary"}>
                            {key.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-neon-green" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.slice(0, 5).map((user: User) => (
                    <div key={user.id} className="gaming-card bg-gradient-to-r from-green-900/10 to-blue-900/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-neon-green">{user.username}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-neon-purple" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/api-docs">
                  <Button className="w-full gaming-button">
                    <Eye className="h-4 w-4 mr-2" />
                    View API Docs
                  </Button>
                </Link>
                <Link href="/test-login">
                  <Button className="w-full gaming-button">
                    <Shield className="h-4 w-4 mr-2" />
                    Test Authentication
                  </Button>
                </Link>
                <Button 
                  className="w-full gaming-button"
                  onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Firebase Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}