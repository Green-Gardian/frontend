import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  SquarePen,
  Trash2,
  Eye,
  Loader2,
  Shield,
  ShieldCheck,
} from "lucide-react";
import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";
import StaffForm from "@/components/forms/staffForm";
import EditStaffForm from "@/components/forms/editStaffForm";
import Cookies from "js-cookie";
import {
  getStaff,
  addStaff,
  updateUser,
  toggleUserBlock,
  deleteUser,
  getSystemStats,
  getAvailableRoles,
} from "@/services/staff";

// Helper function to format role names
const formatRoleName = (role) => {
  const roleMap = {
    admin: "Admin",
    customer_support: "Customer Support",
    driver: "Driver",
    super_admin: "Super Admin",
  };
  return roleMap[role] || role;
};

// Helper function to get status badge styling
const getStatusBadgeStyle = (isBlocked, isVerified) => {
  if (isBlocked) {
    return "bg-[#FBE7E8] text-[#A30D11]";
  }
  if (!isVerified) {
    return "bg-[#FFF3CD] text-[#856404]";
  }
  return "bg-[#EBF9F1] text-[#1F9254]";
};

// Helper function to get status text
const getStatusText = (isBlocked, isVerified) => {
  if (isBlocked) return "Blocked";
  if (!isVerified) return "Pending";
  return "Active";
};

const Staff = () => {
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [userRole, setUserRole] = useState("");
  const [societyId, setSocietyId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(Cookies.get("username"));
    setUserRole(Cookies.get("user_role") || "");
    setSocietyId(Cookies.get("society_id") || null);
  }, []);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  // Fetch staff data
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 7,
        search: searchTerm || undefined,
        societyId: userRole === "admin" ? societyId : undefined,
        role: userRole === "admin" ? "customer_support,driver" : undefined,
      };

      const response = await getStaff(params);
      setStaffData(response.users || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system stats (only for super admin)
  const fetchSystemStats = async () => {
    try {
      // Only fetch system stats for super admin
      if (userRole !== "super_admin") {
        // For admin users, show basic stats from staff data
        setCardsData([
          {
            title: "Total Staff",
            number: staffData.length.toString(),
            percentage: 0,
            backgroundColor: "bg-[#EDEEFC]",
          },
          {
            title: "Active Staff",
            number: staffData
              .filter((user) => !user.is_blocked && user.is_verified)
              .length.toString(),
            percentage: 0,
            backgroundColor: "bg-[#E6F1FD]",
          },
          {
            title: "Blocked Staff",
            number: staffData
              .filter((user) => user.is_blocked)
              .length.toString(),
            percentage: 0,
            backgroundColor: "bg-[#FBE7E8]",
          },
          {
            title: "Pending Verification",
            number: staffData
              .filter((user) => !user.is_verified)
              .length.toString(),
            percentage: 0,
            backgroundColor: "bg-[#FFF3CD]",
          },
        ]);
        return;
      }

      const stats = await getSystemStats();

      // Transform stats to match card format
      const transformedStats = [
        {
          title: "Total Employees",
          number:
            stats.userStats?.reduce((sum, role) => sum + role.count, 0) || "0",
          percentage: 0,
          backgroundColor: "bg-[#EDEEFC]",
        },
        {
          title: "Active Users",
          number:
            stats.userStats?.reduce(
              (sum, role) => sum + role.verified_count,
              0
            ) || "0",
          percentage: 0,
          backgroundColor: "bg-[#E6F1FD]",
        },
        {
          title: "Blocked Users",
          number:
            stats.userStats?.reduce(
              (sum, role) => sum + role.blocked_count,
              0
            ) || "0",
          percentage: 0,
          backgroundColor: "bg-[#FBE7E8]",
        },
        {
          title: "Recent Activity",
          number: stats.recentActivity?.new_users || "0",
          percentage: 0,
          backgroundColor: "bg-[#E6F1FD]",
        },
      ];

      setCardsData(transformedStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default cards
      setCardsData([
        {
          title: "Total Staff",
          number: "0",
          percentage: 0,
          backgroundColor: "bg-[#EDEEFC]",
        },
        {
          title: "Active Staff",
          number: "0",
          percentage: 0,
          backgroundColor: "bg-[#E6F1FD]",
        },
        {
          title: "Blocked Staff",
          number: "0",
          percentage: 0,
          backgroundColor: "bg-[#FBE7E8]",
        },
        {
          title: "Pending Verification",
          number: "0",
          percentage: 0,
          backgroundColor: "bg-[#FFF3CD]",
        },
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStaffData();
      fetchSystemStats(); // This will use the staffData for admin users
    };
    loadData();
  }, [currentPage, searchTerm, userRole, societyId]);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages || 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const onEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const onSubmit = async (formData) => {
    try {
      const result = await addStaff(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError("");
      setIsModalOpen(false);
      await fetchStaffData();
      fetchSystemStats();
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const onEditSubmit = async (formData) => {
    try {
      const result = await updateUser(selectedUser.id, formData);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await fetchStaffData();
      fetchSystemStats();
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await toggleUserBlock(userId, !isBlocked);
      fetchStaffData(); // Refresh data
      fetchSystemStats(); // Refresh stats
    } catch (error) {
      console.error("Error toggling user block:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        await deleteUser(userId);
        fetchStaffData(); // Refresh data
        fetchSystemStats(); // Refresh stats
      } catch (error) {
        console.error("Error deleting user:", error);
      } finally {
        setActionLoading((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  const handleViewPerformance = (userId) => {
    window.location.href = `/admin/staff-performance/${userId}`;
  };

  const handleEditUser = (userId) => {
    const user = staffData.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello, <span className="font-semibold">{username}</span>
      </h1>

      {/*Cards Section */}
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

      {/*Table Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center px-2 py-3 gap-3">
          <div className="w-full ">
            <Input
              name="Search bar"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[300px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              console.log("Add Staff button clicked");
              openModal();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Staff</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">User Id</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">
                    Role
                  </TableHead>
                  <TableHead className="min-w-[130px] hidden md:table-cell">
                    Contact Info
                  </TableHead>
                  <TableHead className="min-w-[140px] hidden lg:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading staff data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : staffData.length > 0 ? (
                  staffData.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={`${
                        index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        #{user.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-gray-500 sm:hidden">
                            {formatRoleName(user.role)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatRoleName(user.role)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>{user.phone_number}</span>
                          <span className="text-xs text-gray-500 lg:hidden">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadgeStyle(
                            user.is_blocked,
                            user.is_verified
                          )} text-xs`}
                        >
                          {getStatusText(user.is_blocked, user.is_verified)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          <Eye
                            className="h-4 w-4 cursor-pointer text-blue-600"
                            onClick={() => handleViewPerformance(user.id)}
                            title="View Performance"
                          />
                          <SquarePen
                            className="h-4 w-4 cursor-pointer text-primary"
                            onClick={() => handleEditUser(user.id)}
                            title="Edit User"
                          />
                          {user.is_blocked ? (
                            <ShieldCheck
                              className="h-4 w-4 cursor-pointer text-green-600"
                              onClick={() =>
                                handleToggleBlock(user.id, user.is_blocked)
                              }
                              title="Unblock User"
                            />
                          ) : (
                            <Shield
                              className="h-4 w-4 cursor-pointer text-orange-600"
                              onClick={() =>
                                handleToggleBlock(user.id, user.is_blocked)
                              }
                              title="Block User"
                            />
                          )}
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-[#A30D11]"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          />
                          {actionLoading[user.id] && (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No staff records found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination.totalPages > 1 && (
          <Pagination className="py-4">
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={`cursor-pointer text-sm ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>

              <div className="hidden sm:flex">
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer  ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {pagination.totalPages > 5 &&
                  currentPage < pagination.totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
              </div>

              {/* Mobile: Show only current page */}
              <div className="sm:hidden flex items-center px-3 py-2 text-sm">
                {currentPage} / {pagination.totalPages}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={`cursor-pointer text-sm ${
                    currentPage === pagination.totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={onClose}>
        <StaffForm
          onClose={onClose}
          onSubmit={onSubmit}
          userRole={userRole}
          error={error}
          setError={setError}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={onEditClose}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Staff Member</h2>
          <EditStaffForm
            user={selectedUser}
            onSubmit={onEditSubmit}
            onCancel={onEditClose}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Staff;
