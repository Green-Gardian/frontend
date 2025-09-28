"use client";

import { useState, useEffect } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Trash2, Ban, CheckCheck } from "lucide-react";

import InfoCards from "../../components/info-cards";
import Modal from "../../components/modal";

import CustomerForm from "../../components/forms/customerForm";

import Cookies from "js-cookie";

import { getUsersBySociety, addResident } from "../../services/customer";
import { blockUser } from "../../services/auth";

const Customer = () => {
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerRecords, setCustomerRecords] = useState([]);
  const [cardsData, setCardsData] = useState([]);

  useEffect(() => {
    setUsername(Cookies.get("username"));
  }, []);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  useEffect(() => {
    document.title = "Customers - Admin Dashboard";
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getUsersBySociety();
      console.log("Fetched customers:", data);

      setCustomerRecords(
        data.users.map((user, index) => ({
          customerId: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone_number,
          customerStatus: user.is_blocked ? "Inactive" : "Active",
          is_blocked: user.is_blocked,
          created_at: user.created_at,
        }))
      );
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomerRecords([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const totalCustomers = customerRecords?.length;
    const activeCustomers = customerRecords?.filter(
      (customer) => customer.customerStatus === "Active"
    ).length;
    const newThisMonth = customerRecords?.filter((customer) => {
      const createdAt = new Date(customer.created_at);
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;
    const inactiveCustomers = totalCustomers - activeCustomers;

    setCardsData([
      {
        title: "Total Customers",
        number: totalCustomers.toString(),
        percentage: totalCustomers
          ? ((totalCustomers - (totalCustomers - 10)) / totalCustomers) * 100
          : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Active Customers",
        number: activeCustomers.toString(),
        percentage: activeCustomers
          ? ((activeCustomers - (activeCustomers - 10)) / activeCustomers) * 100
          : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Inactive Customers",
        number: inactiveCustomers.toString(),
        percentage: inactiveCustomers
          ? ((inactiveCustomers - (inactiveCustomers - 8)) /
              inactiveCustomers) *
            100
          : 0,
        backgroundColor: "bg-[#E6F1FD]",
      },

      {
        title: "New to this Month",
        number: newThisMonth.toString(),
        percentage: newThisMonth
          ? ((newThisMonth - (newThisMonth - 5)) / newThisMonth) * 100
          : 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
    ]);
  }, [customerRecords]);

  const itemsPerPage = 7;

  const filteredRecords = customerRecords?.filter((record) => {
    const term = (searchTerm || "").toLowerCase();
    const matchesSearch =
      record.name.toLowerCase().includes(term) ||
      record.email.toLowerCase().includes(term) ||
      record.phone.includes(term) ||
      record.customerStatus.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      record.customerStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

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

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await blockUser(userId, isBlocked);

      if (!response.success) {
        alert(response.error);
      } else {
        fetchCustomers();
      }
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const openModal = () => {
    console.log("Opening customer form modal");
    setIsModalOpen(true);
  };

  const onClose = () => {
    console.log("Closing customer form modal");
    setIsModalOpen(false);
  };

  const onSubmit = async (formData) => {
    try {

      console.log("Submitting customer form data:", formData);

      const response = await addResident(formData);
      if (!response.success) {
        console.log(response.error);
      } else {
        fetchCustomers();
        onClose();
      }
    } catch (error) {
      console.error("Error adding resident:", error);
      // alert("Failed to add customer");
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#EBF9F1] text-[#1F9254]";
      case "Inactive":
        return "bg-[#FBE7E8] text-[#A30D11]";
      case "Suspended":
        return "bg-[#FEF3E2] text-[#B54708]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPlanBadgeStyle = (plan) => {
    switch (plan) {
      case "Premium":
        return "bg-[#F0F9FF] text-[#0369A1]";
      case "Standard":
        return "bg-[#F7FEE7] text-[#365314]";
      case "Basic":
        return "bg-[#FEF3E2] text-[#B54708]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello, <span className="font-semibold">{username}</span>
      </h1>

      {/* Cards Section */}
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

      {/* Table Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center px-2 py-3 gap-3">
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <Input
              name="Search bar"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[300px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full sm:w-auto" onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">Customer ID</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[180px] hidden sm:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="min-w-[130px] hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        #{record.customerId}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.name}</span>
                          <span className="text-xs text-gray-500 sm:hidden">
                            {record.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col">
                          <span>{record.email}</span>
                          <span className="text-xs text-gray-500 md:hidden">
                            {record.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {record.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadgeStyle(
                            record.customerStatus
                          )} text-xs`}
                        >
                          {record.customerStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          {record.customerStatus === "Active" ? (
                            <Ban
                              className="h-4 w-4 cursor-pointer text-[#A30D11]"
                              onClick={() =>
                                handleBlockUser(
                                  record.customerId,
                                  !record.is_blocked
                                )
                              }
                            />
                          ) : (
                            <CheckCheck
                              className="h-4 w-4 cursor-pointer text-[#1F9254]"
                              onClick={() =>
                                handleBlockUser(
                                  record.customerId,
                                  !record.is_blocked
                                )
                              }
                            />
                          )}
                          <Trash2 className="h-4 w-4 cursor-pointer text-[#A30D11]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No customer records found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
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
                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </div>

              {/* Mobile: Show only current page */}
              <div className="sm:hidden flex items-center px-3 py-2 text-sm">
                {currentPage} / {totalPages}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={`cursor-pointer text-sm ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Modal isOpen={isModalOpen}>
        <CustomerForm onClose={onClose} onSubmit={onSubmit} />
      </Modal>
    </div>
  );
};

export default Customer;
