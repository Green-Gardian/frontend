import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { getAllUsers, blockUser, deleteUser, addAdminAndStaff } from "@/services/auth";
import { getSocieties } from "@/services/society";
import Modal from "@/components/modal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: 'all',
    search: '',
    societyId: 'all'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin',
    societyId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchSocieties();
  }, [filters]);

  const fetchSocieties = async () => {
    try {
      const response = await getSocieties();
      if (!response.error) {
        setSocieties(response.societies);
      }
    } catch (err) {
      console.log("Failed to fetch societies");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await blockUser(userId, isBlocked);
      
      if (response.error) {
        alert(response.error);
      } else {
        fetchUsers();
      }
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);
      
      if (response.error) {
        alert(response.error);
      } else {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await addAdminAndStaff(newUser);
      
      if (response.error) {
        alert(response.error);
      } else {
        setShowAddModal(false);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'admin',
          societyId: ''
        });
        fetchUsers();
      }
    } catch (err) {
      alert("Failed to add user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'customer_support':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'driver':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'customer_support':
        return <UserCheck className="h-4 w-4" />;
      case 'driver':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-400 mt-2">Manage all system users</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a1a] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            
            <Select 
              value={filters.role} 
              onValueChange={(value) => setFilters({ ...filters, role: value, page: 1 })}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer_support">Customer Support</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.societyId} 
              onValueChange={(value) => setFilters({ ...filters, societyId: value, page: 1 })}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Filter by society" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">All Societies</SelectItem>
                {societies.map((society) => (
                  <SelectItem key={society.id} value={society.id}>
                    {society.society_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.limit.toString()} 
              onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value), page: 1 })}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1a1a1a] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Users</CardTitle>
          <CardDescription className="text-zinc-400">
            {pagination.totalUsers || 0} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-300">User</TableHead>
                <TableHead className="text-zinc-300">Role</TableHead>
                <TableHead className="text-zinc-300">Society</TableHead>
                <TableHead className="text-zinc-300">Status</TableHead>
                <TableHead className="text-zinc-300">Created</TableHead>
                <TableHead className="text-zinc-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-zinc-800">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-zinc-700 text-zinc-300 border-zinc-700">
                      {societies.find(s => s.id === user.society_id)?.society_name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.is_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={user.is_verified ? "text-green-500" : "text-yellow-500"}>
                        {user.is_verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.role !== 'super_admin' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                            className={user.is_blocked ? "text-green-500" : "text-red-500"}
                          >
                            {user.is_blocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-zinc-400 text-sm">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                {pagination.totalUsers} results
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users by Society View */}
      <Card className="bg-[#1a1a1a] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Users by Society</CardTitle>
          <CardDescription className="text-zinc-400">
            View users organized by their assigned societies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Users without society */}
            {users.filter(user => !user.society_id).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Users without Society</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.filter(user => !user.society_id).map((user) => (
                    <div key={user.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-zinc-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <span className="text-zinc-400 text-sm">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users grouped by society */}
            {Object.entries(
              users.reduce((acc, user) => {
                if (user.society_id) {
                  if (!acc[user.society_id]) {
                    acc[user.society_id] = {
                      society: societies.find(s => s.id === user.society_id),
                      users: []
                    };
                  }
                  acc[user.society_id].users.push(user);
                }
                return acc;
              }, {})
            ).map(([societyId, { society, users: societyUsers }]) => (
              <div key={societyId}>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {society?.society_name} - {society?.city}, {society?.state}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {societyUsers.map((user) => (
                    <div key={user.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-zinc-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <span className="text-zinc-400 text-sm">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">First Name</label>
              <Input
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">Last Name</label>
              <Input
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Phone</label>
            <Input
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Role</label>
            <Select 
              value={newUser.role} 
              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            >
              <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer_support">Customer Support</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {newUser.role !== 'super_admin' && (
            <div>
              <label className="text-sm font-medium text-zinc-300">Society</label>
              <Select 
                value={newUser.societyId} 
                onValueChange={(value) => setNewUser({ ...newUser, societyId: value })}
              >
                <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue placeholder="Select a society" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {societies.map((society) => (
                    <SelectItem key={society.id} value={society.id}>
                      {society.society_name} - {society.city}, {society.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>?
          </p>
          <p className="text-zinc-400 text-sm">
            This action cannot be undone. All user data will be permanently removed.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteUser(selectedUser?.id)}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
