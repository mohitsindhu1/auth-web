import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Crown, Users, Shield, Edit, Trash2, Lock, Unlock, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AdvancedParticleBackground from "@/components/AdvancedParticleBackground";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface EditUserData {
  role: string;
  permissions: string[];
  isActive: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'edit_code', label: 'Edit Code', description: 'Access to code editor and system files' },
  { id: 'manage_users', label: 'Manage Users', description: 'Create, edit, and manage user accounts' },
  { id: 'manage_applications', label: 'Manage Applications', description: 'Create and configure applications' },
  { id: 'view_all_data', label: 'View All Data', description: 'Access to all system data and analytics' },
  { id: 'delete_applications', label: 'Delete Applications', description: 'Permission to delete applications' },
  { id: 'manage_permissions', label: 'Manage Permissions', description: 'Modify user roles and permissions' },
  { id: 'access_admin_panel', label: 'Access Admin Panel', description: 'Access to administrative interface' }
];

const AVAILABLE_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full system access and control' },
  { value: 'admin', label: 'Admin', description: 'Administrative privileges' },
  { value: 'moderator', label: 'Moderator', description: 'Limited administrative access' },
  { value: 'user', label: 'User', description: 'Standard user access' }
];

export default function UserManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<EditUserData>({
    role: 'user',
    permissions: [],
    isActive: true
  });

  // Check if user has permission to manage users
  const canManageUsers = user?.userPermissions?.role === 'owner' || 
                        user?.userPermissions?.permissions?.includes('manage_users');

  // Fetch all users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: canManageUsers,
    retry: false
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: EditUserData }) => {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser(null);
      toast({
        title: "User Updated",
        description: "User permissions and role have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user permissions.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter((u: User) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditData({
      role: userToEdit.role,
      permissions: userToEdit.permissions || [],
      isActive: userToEdit.isActive
    });
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    
    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: editData
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }
    
    deleteUserMutation.mutate(userId);
  };

  const togglePermission = (permission: string) => {
    setEditData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage users. This feature is restricted to administrators and site owners.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Advanced Particle Background */}
      <AdvancedParticleBackground />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles, permissions, and access control
          </p>
        </div>
        {user?.userPermissions?.role === 'owner' && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Site Owner
          </Badge>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert>
            <AlertDescription>
              Failed to load users. Please try again later.
            </AlertDescription>
          </Alert>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((userItem: User) => (
            <Card key={userItem.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {userItem.firstName && userItem.lastName 
                            ? `${userItem.firstName} ${userItem.lastName}`
                            : userItem.email
                          }
                        </h3>
                        {userItem.id === user?.id && (
                          <Badge variant="outline">You</Badge>
                        )}
                        {userItem.role === 'owner' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{userItem.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={userItem.role === 'owner' ? 'default' : 'secondary'}>
                          {userItem.role}
                        </Badge>
                        <Badge variant={userItem.isActive ? 'default' : 'destructive'}>
                          {userItem.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {userItem.permissions?.length || 0} permissions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(userItem)}
                          disabled={userItem.role === 'owner' && user?.userPermissions?.role !== 'owner'}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit User Permissions</DialogTitle>
                          <DialogDescription>
                            Modify {selectedUser?.email}'s role and permissions
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Role</Label>
                            <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_ROLES.map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Status</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id="active"
                                checked={editData.isActive}
                                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: !!checked }))}
                              />
                              <Label htmlFor="active">Active User</Label>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Permissions</Label>
                            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                              {AVAILABLE_PERMISSIONS.map(permission => (
                                <div key={permission.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={editData.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor={permission.id} className="text-sm font-medium">
                                      {permission.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            onClick={handleSaveUser}
                            disabled={updateUserMutation.isPending}
                          >
                            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {userItem.id !== user?.id && userItem.role !== 'owner' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(userItem.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {userItem.permissions && userItem.permissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium">Permissions:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userItem.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}