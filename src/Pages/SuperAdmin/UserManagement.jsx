"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Users,
  Search,
  Plus,
  Shield,
  UserCheck,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  CheckCheck,
} from "lucide-react"
import { getSocieties } from "@/services/society"
import Modal from "@/components/modal"
import InfoCards from "@/components/info-cards"

// Redux
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAllUsers,
  toggleBlockUser as toggleBlockUserThunk,
  deleteUserAccount,
  addAdminStaff,
} from "@/redux/slices/authSlice"
import { selectUserList } from "@/redux/slices/userManagementSelectors"

const UserManagement = () => {
  const dispatch = useDispatch()

  // Source of truth for users now comes from Redux (authSlice)
  const users = useSelector(selectUserList)

  const [societies, setSocieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addUserError, setAddUserError] = useState(null)
  const [deleteUserError, setDeleteUserError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  const [apiFilters, setApiFilters] = useState({
    page: 1,
    limit: 10,
    role: "all",
    societyId: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "admin",
    societyId: "",
  })
  const cardsData = useMemo(() => {
    const totalUsers = users.length
    const verifiedUsers = users.filter((user) => user.is_verified).length
    const pendingUsers = totalUsers - verifiedUsers
    const newThisMonth =
      users.filter((user) => {
        const createdAt = new Date(user.created_at)
        const now = new Date()
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      }).length || 0

    return [
      {
        title: "Total Users",
        number: totalUsers.toString(),
        percentage: totalUsers ? ((totalUsers - (totalUsers - 10)) / totalUsers) * 100 : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Verified Users",
        number: verifiedUsers.toString(),
        percentage: verifiedUsers ? ((verifiedUsers - (verifiedUsers - 8)) / verifiedUsers) * 100 : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Pending Users",
        number: pendingUsers.toString(),
        percentage: pendingUsers ? ((pendingUsers - (pendingUsers - 5)) / pendingUsers) * 100 : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "New This Month",
        number: newThisMonth.toString(),
        percentage: newThisMonth ? ((newThisMonth - (newThisMonth - 3)) / newThisMonth) * 100 : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
    ]
  }, [users])

  useEffect(() => {
    const fetchSocietiesData = async () => {
      try {
        const response = await getSocieties()
        if (!response.error) {
          setSocieties(response.societies || [])
        }
      } catch (err) {
        console.log("Failed to fetch societies")
      }
    }
    fetchSocietiesData()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const action = await dispatch(fetchAllUsers(apiFilters))
        if (fetchAllUsers.rejected.match(action)) {
          setError(action.payload || "Failed to fetch users")
          setPagination({})
        } else if (fetchAllUsers.fulfilled.match(action)) {
          const payload = action.payload || {}
          setPagination(payload.pagination || {})
          setError(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [dispatch, apiFilters])

  const handleBlockUser = async (userId, shouldBlock) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }))
      const action = await dispatch(toggleBlockUserThunk({ userId, isBlocked: shouldBlock }))
      if (toggleBlockUserThunk.rejected.match(action)) {
        // Show error in a simple way since there's no modal for block/unblock
        alert(action.payload || "Failed to update user status")
      }
    } catch (err) {
      console.error("Error blocking user:", err)
      alert("Failed to update user status")
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      setDeleteUserError(null)
      setActionLoading((prev) => ({ ...prev, [userId]: true }))
      const action = await dispatch(deleteUserAccount(userId))
      if (deleteUserAccount.rejected.match(action)) {
        setDeleteUserError(action.payload || "Failed to delete user")
        setShowDeleteModal(true) // Keep modal open to show error
        return
      }
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error("Error deleting user:", err)
      setDeleteUserError("Failed to delete user")
      setShowDeleteModal(true) // Keep modal open to show error
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleAddUser = async () => {
    try {
      setAddUserError(null)
      const action = await dispatch(addAdminStaff(newUser))
      if (addAdminStaff.rejected.match(action)) {
        setAddUserError(action.payload || "Failed to add user")
        return
      }
      setShowAddModal(false)
      setAddUserError(null)
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "admin",
        societyId: "",
      })
      // Refetch users to include the newly added user with correct pagination
      dispatch(fetchAllUsers(apiFilters))
    } catch (err) {
      console.error("Error adding user:", err)
      setAddUserError("Failed to add user")
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-[#F0F9FF] text-[#0369A1] border-[#0369A1]/20"
      case "admin":
        return "bg-[#F0F9FF] text-[#0369A1] border-[#0369A1]/20"
      case "customer_support":
        return "bg-[#EBF9F1] text-[#1F9254] border-[#1F9254]/20"
      case "driver":
        return "bg-[#FEF3E2] text-[#B54708] border-[#B54708]/20"
      default:
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      case "customer_support":
        return <UserCheck className="h-4 w-4" />
      case "driver":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFilteredUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower),
      )
    }

    if (apiFilters.role !== "all") {
      filtered = filtered.filter((user) => user.role === apiFilters.role)
    }

    if (apiFilters.societyId !== "all") {
      filtered = filtered.filter((user) => user.society_id === apiFilters.societyId)
    }

    return filtered
  }

  const getStatusBadgeStyle = (isBlocked) => {
    return isBlocked ? "bg-[#FBE7E8] text-[#A30D11]" : "bg-[#EBF9F1] text-[#1F9254]"
  }

  const filteredUsers = getFilteredUsers()

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#121212] text-[24px] leading-[32px] font-semibold">User Management</h1>
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

      {/* Error Message for Fetch Errors */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                onValueChange={(value) => setApiFilters({ ...apiFilters, role: value, page: 1 })}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={apiFilters.societyId}
                onValueChange={(value) => setApiFilters({ ...apiFilters, societyId: value, page: 1 })}
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
                    <TableHead className="text-gray-700">Verification</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-[#EDEEFC] flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="text-[#121212] font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                          {societies.find((s) => s.id === user.society_id)?.society_name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.is_verified ? (
                            <CheckCircle className="h-4 w-4 text-[#1F9254]" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-[#B54708]" />
                          )}
                          <span className={user.is_verified ? "text-[#1F9254]" : "text-[#B54708]"}>
                            {user.is_verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        <Badge className={`${getStatusBadgeStyle(user.is_blocked)} text-xs`}>
                          {user.is_blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.is_blocked ? (
                            <Ban
                              className="h-4 w-4 cursor-pointer text-red-400"
                              onClick={() => handleBlockUser(user.id, false)}
                            />
                          ) : (
                            <CheckCheck
                              className="h-4 w-4 cursor-pointer text-green-400"
                              onClick={() => handleBlockUser(user.id, true)}
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
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers}{" "}
                results
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

      <Modal isOpen={showAddModal} onClose={() => {
        setShowAddModal(false)
        setAddUserError(null)
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "admin",
          societyId: "",
        })
      }} title="Add New User">
        <div className="space-y-4">
          {addUserError && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {addUserError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                className="mt-1 bg-white border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                className="mt-1 bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 bg-white border-gray-200 text-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="mt-1 bg-white border-gray-200 text-gray-900"
            />
          </div>

          <div className="w-full">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sub_admin">Sub Admin</SelectItem>
                <SelectItem value="customer_support">Customer Support</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newUser.role !== "super_admin" && (
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">Society</label>
              <Select value={newUser.societyId} onValueChange={(value) => setNewUser({ ...newUser, societyId: value })}>
                <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Select society" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {societies.map((society) => (
                    <SelectItem key={society.id} value={society.id}>
                      {society.society_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => {
        setShowDeleteModal(false)
        setDeleteUserError(null)
        setSelectedUser(null)
      }} title="Delete User">
        <div className="space-y-4">
          {deleteUserError && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {deleteUserError}
            </div>
          )}
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <strong>
              {selectedUser?.first_name} {selectedUser?.last_name}
            </strong>
            ?
          </p>
          <p className="text-gray-500 text-sm">This action cannot be undone.</p>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(selectedUser?.id)}
              disabled={actionLoading[selectedUser?.id]}
            >
              {actionLoading[selectedUser?.id] ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement
