"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
  Shield,
  UserCheck,
  Trash2,
  CheckCircle,
  AlertTriangle,
  CheckCheck,
  Ban,
} from "lucide-react";
import {
  getAllUsers,
  blockUser,
  deleteUser,
  addAdminAndStaff,
} from "@/services/auth";
import Modal from "@/components/modal";
import InfoCards from "@/components/info-cards";
import { fetchSocieties } from "@/redux/slices/societySlice";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [apiFilters, setApiFilters] = useState({
    page: 1,
    limit: 10,
    role: "all",
    societyId: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "admin",
    societyId: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const dispatch = useDispatch();
  const societies = useSelector((state) => state.societies.list) || [];

  useEffect(() => {
    fetchUsers();
  }, [apiFilters]);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
  }, []);

  useEffect(() => {
    dispatch(fetchSocieties());
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(apiFilters);

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
      console.error("Error blocking user:", err);
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
      console.error("Error deleting user:", err);
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
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "admin",
          societyId: "",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-[#F0F9FF] text-[#0369A1] border-[#0369A1]/20";
      case "admin":
        return "bg-[#F0F9FF] text-[#0369A1] border-[#0369A1]/20";
      case "customer_support":
        return "bg-[#EBF9F1] text-[#1F9254] border-[#1F9254]/20";
      case "driver":
        return "bg-[#FEF3E2] text-[#B54708] border-[#B54708]/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "customer_support":
        return <UserCheck className="h-4 w-4" />;
      case "driver":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredUsers = () => {
    let filtered = [...users];

    // Apply search filter locally
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (apiFilters.role !== "all") {
      filtered = filtered.filter((user) => user.role === apiFilters.role);
    }

    // Apply society filter
    if (apiFilters.societyId !== "all") {
      filtered = filtered.filter(
        (user) => user.society_id === apiFilters.societyId
      );
    }

    return filtered;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case false:
        return "bg-[#EBF9F1] text-[#1F9254]";
      case true:
        return "bg-[#FBE7E8] text-[#A30D11]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredUsers = getFilteredUsers();

  useEffect(() => {
    const totalUsers = users.length;
    const verifiedUsers = users.filter((user) => user.is_verified).length;
    const pendingUsers = totalUsers - verifiedUsers;
    const newThisMonth = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;

    setCardsData([
      {
        title: "Total Users",
        number: totalUsers.toString(),
        percentage: totalUsers
          ? ((totalUsers - (totalUsers - 10)) / totalUsers) * 100
          : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Verified Users",
        number: verifiedUsers.toString(),
        percentage: verifiedUsers
          ? ((verifiedUsers - (verifiedUsers - 8)) / verifiedUsers) * 100
          : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Pending Users",
        number: pendingUsers.toString(),
        percentage: pendingUsers
          ? ((pendingUsers - (pendingUsers - 5)) / pendingUsers) * 100
          : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "New This Month",
        number: newThisMonth.toString(),
        percentage: newThisMonth
          ? ((newThisMonth - (newThisMonth - 3)) / newThisMonth) * 100
          : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
    ]);
  }, [users]);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#121212] text-[24px] leading-[32px] font-semibold">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all system users</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
        {cardsData.map((card, index) => (
          <InfoCards
            key={index}
            title={card.title}
            number={card.number}
            percentage={card.percentage}
            backgroundColor={card.backgroundColor}
          />
        ))}
      </div>

      <Card className="bg-white border-none shadow-none">
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={apiFilters.role}
                onValueChange={(value) =>
                  setApiFilters({ ...apiFilters, role: value, page: 1 })
                }
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer_support">
                    Customer Support
                  </SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={apiFilters.societyId}
                onValueChange={(value) =>
                  setApiFilters({ ...apiFilters, societyId: value, page: 1 })
                }
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 w-[200px]">
                  <SelectValue placeholder="Filter by society" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Societies</SelectItem>
                  {societies.map((society) => (
                    <SelectItem key={society.id} value={society.id}>
                      {society.society_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={apiFilters.limit.toString()}
                onValueChange={(value) =>
                  setApiFilters({
                    ...apiFilters,
                    limit: Number.parseInt(value),
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 w-[140px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-white border-none font-montserrat">
                  <TableRow>
                    <TableHead className="text-gray-700">User</TableHead>
                    <TableHead className="text-gray-700">Role</TableHead>
                    <TableHead className="text-gray-700">Society</TableHead>
                    <TableHead className="text-gray-700">
                      Verification
                    </TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={`${
                        index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-[#EDEEFC] flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="text-[#121212] font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                          {societies.find((s) => s.id === user.society_id)
                            ?.society_name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.is_verified ? (
                            <CheckCircle className="h-4 w-4 text-[#1F9254]" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-[#B54708]" />
                          )}
                          <span
                            className={
                              user.is_verified
                                ? "text-[#1F9254]"
                                : "text-[#B54708]"
                            }
                          >
                            {user.is_verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        <Badge
                          className={`${getStatusBadgeStyle(
                            user.is_blocked
                          )} text-xs`}
                        >
                          {user.is_blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.is_blocked ? (
                            <Ban
                              className="h-4 w-4 cursor-pointer text-red-400"
                              onClick={() =>
                                handleBlockUser(user.id, !user.is_blocked)
                              }
                            />
                          ) : (
                            <CheckCheck
                              className="h-4 w-4 cursor-pointer text-green-400"
                              onClick={() =>
                                handleBlockUser(user.id, !user.is_blocked)
                              }
                            />
                          )}
                          {/* <Trash2
                            className="h-4 w-4 cursor-pointer text-[#A30D11]"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteModal(true)
                            }}
                          /> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-500 text-sm">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalUsers
                )}{" "}
                of {pagination.totalUsers} results
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    setApiFilters({
                      ...apiFilters,
                      page: pagination.currentPage - 1,
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    setApiFilters({
                      ...apiFilters,
                      page: pagination.currentPage + 1,
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className="mt-1 bg-white border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className="mt-1 bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="mt-1 bg-white border-gray-200 text-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              className="mt-1 bg-white border-gray-200 text-gray-900"
            />
          </div>

          <div className="w-full">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            >
              <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sub_admin">Sub_Admin</SelectItem>
                <SelectItem value="customer_support">
                  Customer Support
                </SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newUser.role !== "super_admin" && (
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">
                Society
              </label>
              <Select
                value={newUser.societyId}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, societyId: value })
                }
              >
                <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Select a society" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
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
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#121212]">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>
            ?
          </p>
          <p className="text-gray-500 text-sm">
            This action cannot be undone. All user data will be permanently
            removed.
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
