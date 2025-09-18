import { useEffect, useState, useCallback } from 'react';
import { 
  listProfiles, 
  updateUserRole, 
  type AppRole, 
  type ProfileRow 
} from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Button 
} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Search, Loader2, PlusCircle, Trash2, Mail, User } from 'lucide-react';

type UserStatus = 'active' | 'suspended';

interface User extends ProfileRow {
  email?: string;
  last_sign_in_at?: string | null;
  status: UserStatus;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('staff');
  const [inviting, setInviting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // First, verify the current user is an admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to view users');
      }

      // Check if user has admin/manager role
      const { data: currentUserData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !['admin', 'manager'].includes(currentUserData?.role)) {
        throw new Error('Insufficient permissions to view users');
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Get all auth users
      const { data: authUsers, error: authError } = await supabase
        .from('auth')
        .select('*');
      
      if (authError) throw authError;

      // Combine the data
      const combined = profiles.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email,
          last_sign_in_at: authUser?.last_sign_in_at,
          status: (authUser?.banned_until ? 'suspended' : 'active') as UserStatus
        };
      });

      setUsers(combined);
      setFilteredUsers(combined);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(
      user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setSavingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success('User role updated successfully');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error?.message || 'Failed to update user role');
    } finally {
      setSavingId(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setInviting(true);
    try {
      console.log('Sending invitation to:', inviteEmail, 'with role:', inviteRole);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Call the Supabase Edge Function with auth header
      const { data, error } = await supabase.functions.invoke('invite-user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: { 
          email: inviteEmail, 
          role: inviteRole 
        }
      });
      
      console.log('Invite response:', { data, error });
      
      if (error) {
        console.error('Error from Supabase function:', error);
        // If we have a response with error details, throw that instead
        if (error.context && error.context.body) {
          const errorDetails = JSON.parse(error.context.body);
          throw new Error(errorDetails.error || error.message);
        }
        throw error;
      }
      
      // If we get here, the invitation was successful
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('staff');
      setInviteOpen(false);
      
      // Refresh the user list
      await fetchUsers();
      
    } catch (error: any) {
      console.error('Error in handleInvite:', error);
      
      let errorMessage = 'Failed to send invitation';
      
      try {
        // Try to parse the error message as JSON
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.error || error.message;
      } catch (e) {
        // If not JSON, use the message as is
        if (error.message?.includes('already exists')) {
          errorMessage = 'A user with this email already exists';
        } else if (error.error_description) {
          errorMessage = error.error_description;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      // Verify current user is an admin/manager
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to delete users');
      }

      // Check if user has permission to delete
      const { data: currentUserData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !['admin', 'manager'].includes(currentUserData?.role)) {
        throw new Error('Insufficient permissions to delete users');
      }

      // Prevent self-deletion
      if (user.id === userToDelete.id) {
        throw new Error('You cannot delete your own account');
      }
      
      // Delete from profiles first (due to foreign key constraint)
      const { error: deleteProfileError } = await supabase.rpc('delete_user_profile', {
        user_id: userToDelete.id,
        deleter_id: user.id
      });
      
      if (deleteProfileError) throw deleteProfileError;
      
      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setFilteredUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      toast.success('User deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    try {
      // Verify current user is an admin/manager
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw new Error('You must be logged in to update user status');
      }

      // Check if user has permission
      const { data: currentUserData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !['admin', 'manager'].includes(currentUserData?.role)) {
        throw new Error('Insufficient permissions to update user status');
      }

      // Prevent self-suspension
      if (currentUser.id === user.id) {
        throw new Error('You cannot change your own status');
      }
      
      if (newStatus === 'suspended') {
        // Ban user
        const { error } = await supabase.auth.admin.updateUserById(user.id, {
          ban_duration: 'none', // Permanent ban
        });
        if (error) throw error;
      } else {
        // Unban user
        const { error } = await supabase.auth.admin.updateUserById(user.id, {
          ban_duration: 'none',
          ban_expires_at: null,
        });
        if (error) throw error;
      }
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
      
      // Also update filteredUsers to keep UI in sync
      setFilteredUsers(prev => 
        prev.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex-1">
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setInviteOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="sr-only">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <User className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try a different search term' : 'Get started by inviting a new user'}
                </p>
                <Button className="mt-2" onClick={() => setInviteOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{user.email || 'No email'}</p>
                              <p className="text-xs text-muted-foreground">{user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                            className="cursor-pointer"
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === 'active' ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as AppRole)}
                            disabled={savingId === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy h:mm a')
                            : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteClick(user)}
                            disabled={deleting && userToDelete?.id === user.id}
                          >
                            {deleting && userToDelete?.id === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete user</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite User Dialog */}
      <AlertDialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite New User</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the email address and select a role for the new user. They will receive an email with instructions to set up their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium leading-none">
                Role
              </label>
              <Select 
                value={inviteRole} 
                onValueChange={(value) => setInviteRole(value as AppRole)}
                disabled={inviting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={inviting}>Cancel</AlertDialogCancel>
            <Button 
              onClick={handleInvite} 
              disabled={!inviteEmail || inviting}
            >
              {inviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


