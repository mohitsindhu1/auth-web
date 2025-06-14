import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Settings, Users, Key, Trash2, Edit, Eye, EyeOff, Copy, Play, Pause, RotateCcw, HardDrive } from "lucide-react";
import Header from "@/components/header";
import AdvancedParticleBackground from "@/components/AdvancedParticleBackground";

interface Application {
  id: number;
  name: string;
  description: string;
  apiKey: string;
  version: string;
  isActive: boolean;
  hwidLockEnabled: boolean;
  loginSuccessMessage: string;
  loginFailedMessage: string;
  accountDisabledMessage: string;
  accountExpiredMessage: string;
  versionMismatchMessage: string;
  hwidMismatchMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface AppUser {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  isPaused: boolean;
  hwid?: string;
  expiresAt?: string;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number;
  lastLoginAttempt?: string;
}

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  registeredUsers: number;
  activeSessions: number;
  loginSuccessRate: number;
  totalApiRequests: number;
  lastActivity: string | null;
  applicationStatus: 'online' | 'offline';
  hwidLockEnabled: boolean;
}

export default function AppManagement() {
  const [, params] = useRoute("/app/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const appId = params?.id ? parseInt(params.id) : null;
  
  // State for dialogs and forms
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditAppDialogOpen, setIsEditAppDialogOpen] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  
  // Form data
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    expiresAt: "",
    hwid: ""
  });
  
  const [editAppData, setEditAppData] = useState<Partial<Application>>({});

  // Fetch all applications and find the specific one (more reliable)
  const { data: applications = [], isLoading: isLoadingApps, error: appsError } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    staleTime: 0,
    refetchOnMount: true,
  });

  // Get the specific application from the list
  const application = applications.find(app => app.id === appId);
  const isLoadingApp = isLoadingApps;

  // Fetch application users with proper error handling
  const { data: appUsers = [], isLoading: isLoadingUsers, refetch: refetchUsers, error: usersError } = useQuery<AppUser[]>({
    queryKey: ["/api/applications", appId, "users"],
    queryFn: async () => {
      if (!appId) throw new Error("No application ID");
      console.log(`Fetching users for app ${appId}`);
      const response = await fetch(`/api/applications/${appId}/users`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      const users = await response.json();
      console.log(`Received users:`, users);
      return users;
    },
    enabled: !!appId && !!application,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Fetch real-time application statistics
  const { data: appStats, isLoading: isLoadingStats, error: statsError } = useQuery<AppStats>({
    queryKey: ["/api/applications", appId, "stats"],
    queryFn: async () => {
      if (!appId) throw new Error("No application ID");
      const response = await fetch(`/api/applications/${appId}/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!appId && !!application,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time data
    staleTime: 0,
  });

  // Debug logging
  useEffect(() => {
    console.log("App management debug:", {
      appId,
      application,
      appStats,
      isLoadingApp,
      isLoadingStats,
      appsError,
      statsError
    });
  }, [appId, application, appStats, isLoadingApp, isLoadingStats, appsError, statsError]);

  // Update edit form when application data loads and reset form when dialog opens
  useEffect(() => {
    if (application) {
      setEditAppData({
        name: application.name,
        description: application.description,
        version: application.version,
        isActive: application.isActive,
        hwidLockEnabled: application.hwidLockEnabled,
        loginSuccessMessage: application.loginSuccessMessage,
        loginFailedMessage: application.loginFailedMessage,
        accountDisabledMessage: application.accountDisabledMessage,
        accountExpiredMessage: application.accountExpiredMessage,
        versionMismatchMessage: application.versionMismatchMessage,
        hwidMismatchMessage: application.hwidMismatchMessage
      });
    }
  }, [application]);

  // Reset form data when dialog opens
  useEffect(() => {
    if (isEditAppDialogOpen && application) {
      setEditAppData({
        name: application.name,
        description: application.description,
        version: application.version,
        isActive: application.isActive,
        hwidLockEnabled: application.hwidLockEnabled,
        loginSuccessMessage: application.loginSuccessMessage,
        loginFailedMessage: application.loginFailedMessage,
        accountDisabledMessage: application.accountDisabledMessage,
        accountExpiredMessage: application.accountExpiredMessage,
        versionMismatchMessage: application.versionMismatchMessage,
        hwidMismatchMessage: application.hwidMismatchMessage
      });
    }
  }, [isEditAppDialogOpen, application]);

  // Debug logging
  useEffect(() => {
    console.log("App ID:", appId);
    console.log("Application:", application);
    console.log("Edit App Data:", editAppData);
    console.log("App Users:", appUsers);
    console.log("Loading Users:", isLoadingUsers);
    console.log("Users Error:", usersError);
  }, [appId, application, editAppData, appUsers, isLoadingUsers, usersError]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData) => {
      if (!appId) throw new Error("No application ID");
      
      const payload = {
        username: data.username,
        email: data.email || null,
        password: data.password,
        ...(data.expiresAt && { expiresAt: new Date(data.expiresAt).toISOString() }),
        ...(data.hwid && { hwid: data.hwid })
      };

      console.log("Creating user with payload:", payload);
      return apiRequest(`/api/applications/${appId}/users`, "POST", payload);
    },
    onSuccess: (newUser) => {
      console.log("User created successfully:", newUser);
      // Force immediate refetch
      refetchUsers();
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["/api/applications", appId, "users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setNewUserData({ username: "", email: "", password: "", expiresAt: "", hwid: "" });
      setIsCreateUserDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      console.log("Updating application with data:", data);
      return apiRequest(`/api/applications/${appId}`, "PUT", data);
    },
    onSuccess: (updatedApp) => {
      console.log("Application updated successfully:", updatedApp);
      queryClient.invalidateQueries({ queryKey: ["/api/applications", appId] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsEditAppDialogOpen(false);
      toast({
        title: "Success", 
        description: "Application updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/applications/${appId}/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", appId, "users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Pause/Unpause user mutation
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: 'pause' | 'unpause' }) => {
      return apiRequest(`/api/applications/${appId}/users/${userId}/${action}`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", appId, "users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Reset HWID mutation
  const resetHwidMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/applications/${appId}/users/${userId}/reset-hwid`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", appId, "users"] });
      toast({
        title: "Success",
        description: "HWID reset successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset HWID",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = async () => {
    if (!newUserData.username.trim() || !newUserData.password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in username and password",
        variant: "destructive"
      });
      return;
    }
    createUserMutation.mutate(newUserData);
  };

  const handleUpdateApp = async () => {
    updateApplicationMutation.mutate(editAppData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (!appId) {
    return <div>Invalid application ID</div>;
  }

  if (isLoadingApp) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application && !isLoadingApp) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
            {appsError && (
              <p className="text-red-500 mb-4">Error: {appsError.message}</p>
            )}
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Advanced Particle Background */}
      <AdvancedParticleBackground />
      <Header />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {application.name}
                <Badge variant={application.isActive ? "default" : "secondary"}>
                  {application.isActive ? "Active" : "Inactive"}
                </Badge>
              </h1>
              <p className="text-muted-foreground">{application.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setLocation(`/app/${appId}/licenses`)}
              variant="outline"
            >
              <Key className="mr-2 h-4 w-4" />
              License Keys
            </Button>
            <Dialog open={isEditAppDialogOpen} onOpenChange={setIsEditAppDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Application Settings</DialogTitle>
                  <DialogDescription>Update your application configuration</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Application Name</Label>
                    <Input
                      id="name"
                      value={editAppData.name || ""}
                      onChange={(e) => setEditAppData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={editAppData.version || ""}
                      onChange={(e) => setEditAppData(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editAppData.description || ""}
                    onChange={(e) => setEditAppData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={editAppData.isActive === true}
                    onCheckedChange={(checked) => {
                      console.log("Setting isActive to:", checked);
                      setEditAppData(prev => ({ ...prev, isActive: checked }));
                    }}
                  />
                  <Label htmlFor="isActive">Application Active</Label>
                  <span className="text-xs text-muted-foreground">
                    (Currently: {application?.isActive ? 'Active' : 'Inactive'})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hwidLock"
                    checked={editAppData.hwidLockEnabled === true}
                    onCheckedChange={(checked) => {
                      console.log("Setting hwidLockEnabled to:", checked);
                      setEditAppData(prev => ({ ...prev, hwidLockEnabled: checked }));
                    }}
                  />
                  <Label htmlFor="hwidLock">Hardware ID Locking</Label>
                  <span className="text-xs text-muted-foreground">
                    (Currently: {application?.hwidLockEnabled ? 'Enabled' : 'Disabled'})
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditAppDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateApp} disabled={updateApplicationMutation.isPending}>
                  {updateApplicationMutation.isPending ? "Updating..." : "Update Application"}
                </Button>
              </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users ({appUsers.length})</TabsTrigger>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{application?.name || "Loading..."}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-sm text-muted-foreground">{application?.version || "Loading..."}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{application?.description || "No description"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {application?.createdAt ? new Date(application.createdAt).toLocaleDateString() + ' ' + new Date(application.createdAt).toLocaleTimeString() : "Loading..."}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {application?.updatedAt ? new Date(application.updatedAt).toLocaleDateString() + ' ' + new Date(application.updatedAt).toLocaleTimeString() : "Loading..."}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {application?.apiKey ? `${application.apiKey.substring(0, 8)}...` : "Loading..."}
                      </span>
                      {application?.apiKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(application.apiKey)}
                          title="Copy API Key"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={application?.isActive ? "default" : "secondary"}>
                      {application?.isActive ? "Online" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">HWID Lock</Label>
                    <Badge variant={application?.hwidLockEnabled ? "default" : "secondary"}>
                      {application?.hwidLockEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">User Count</Label>
                    <span className="text-sm font-medium">{appStats?.totalUsers || appUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Active Users</Label>
                    <span className="text-sm font-medium">{appStats?.activeUsers || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Live Sessions</Label>
                    <p className="text-lg font-bold text-green-600">{appStats?.activeSessions || 0}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">API Requests</Label>
                    <p className="text-lg font-bold">{appStats?.totalApiRequests || 0}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Success Rate</Label>
                    <p className="text-lg font-bold text-blue-600">{appStats?.loginSuccessRate || 0}%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Last Activity</Label>
                    <p className="text-xs text-muted-foreground">
                      {appStats?.lastActivity ? new Date(appStats.lastActivity).toLocaleString() : "No recent activity"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Application Users</h2>
                <p className="text-sm text-muted-foreground">
                  {appUsers.length} user{appUsers.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => refetchUsers()}
                  disabled={isLoadingUsers}
                >
                  {isLoadingUsers ? "Refreshing..." : "Refresh"}
                </Button>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>Add a new user to this application</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="username">Username *</Label>
                        <Input
                          id="username"
                          value={newUserData.username}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                        <Input
                          id="expiresAt"
                          type="datetime-local"
                          value={newUserData.expiresAt}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hwid">Hardware ID (Optional)</Label>
                        <Input
                          id="hwid"
                          value={newUserData.hwid}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, hwid: e.target.value }))}
                          placeholder="Enter HWID"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {usersError ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-destructive mb-4">
                    <h3 className="text-lg font-semibold mb-2">Error loading users</h3>
                    <p className="text-sm">{usersError.message}</p>
                  </div>
                  <Button onClick={() => refetchUsers()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : appUsers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground mb-4">Create your first user to get started</p>
                  <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>HWID</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email || "Not provided"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {user.isPaused && (
                                <Badge variant="outline">Paused</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.hwid ? (
                                <>
                                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {user.hwid.substring(0, 8)}...
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(user.hwid!)}
                                    title="Copy HWID"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  {application?.hwidLockEnabled ? "Will be set on first login" : "Not required"}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.lastLogin)}</TableCell>
                          <TableCell>
                            {user.expiresAt ? (
                              <span className={new Date(user.expiresAt) < new Date() ? "text-destructive" : ""}>
                                {formatDate(user.expiresAt)}
                              </span>
                            ) : (
                              "Never"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserMutation.mutate({
                                  userId: user.id,
                                  action: user.isPaused ? 'unpause' : 'pause'
                                })}
                                disabled={toggleUserMutation.isPending}
                                title={user.isPaused ? "Unpause User" : "Pause User"}
                              >
                                {user.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                              </Button>
                              {user.hwid && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Reset HWID">
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reset Hardware ID</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reset the HWID for user "{user.username}"? 
                                        The user will be able to login from a different device on their next login.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => resetHwidMutation.mutate(user.id)}>
                                        Reset HWID
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Delete User">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteUserMutation.mutate(user.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Configuration Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>API key and integration details for this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type={isApiKeyVisible ? "text" : "password"}
                      value={application.apiKey}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                    >
                      {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(application.apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>API Endpoints</Label>
                  <div className="space-y-2 mt-2">
                    <div className="p-3 bg-muted rounded-md">
                      <code className="text-sm">POST /api/v1/register</code>
                      <p className="text-xs text-muted-foreground mt-1">Register new users</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <code className="text-sm">POST /api/v1/login</code>
                      <p className="text-xs text-muted-foreground mt-1">Authenticate users</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <code className="text-sm">POST /api/v1/verify</code>
                      <p className="text-xs text-muted-foreground mt-1">Verify session tokens</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Messages</CardTitle>
                <CardDescription>Customize messages shown to users during authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Login Success Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when login is successful</p>
                  <Input value={application.loginSuccessMessage} readOnly />
                </div>
                <div>
                  <Label>Login Failed Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when login fails</p>
                  <Input value={application.loginFailedMessage} readOnly />
                </div>
                <div>
                  <Label>Account Disabled Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when account is disabled</p>
                  <Input value={application.accountDisabledMessage} readOnly />
                </div>
                <div>
                  <Label>Account Expired Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when account has expired</p>
                  <Input value={application.accountExpiredMessage} readOnly />
                </div>
                <div>
                  <Label>Version Mismatch Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when client version doesn't match</p>
                  <Input value={application.versionMismatchMessage} readOnly />
                </div>
                <div>
                  <Label>HWID Mismatch Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">Message shown when hardware ID doesn't match</p>
                  <Input value={application.hwidMismatchMessage} readOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}