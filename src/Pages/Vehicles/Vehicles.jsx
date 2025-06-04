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

import { Car, Plus, SquarePen, Trash2 } from "lucide-react";

import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";

import VehicleForm from "@/components/forms/vehicleForm";

import Cookies from "js-cookie";

const vehicleRecords = [
  {
    vehicleId: 1,
    plateNumber: "ABC-123",
    assignedTo: "Muhammad Hassan Amir",
    vehicleStatus: "Active",
    Action: "",
  },
  {
    vehicleId: 2,
    plateNumber: "XYZ-456",
    assignedTo: "Ali Raza",
    vehicleStatus: "Active",
    Action: "",
  },
  {
    vehicleId: 3,
    plateNumber: "DEF-789",
    assignedTo: "Bilal Saeed",
    vehicleStatus: "Maintenance",
    Action: "",
  },
  {
    vehicleId: 4,
    plateNumber: "GHI-012",
    assignedTo: "Usman Tariq",
    vehicleStatus: "Active",
    Action: "",
  },
  {
    vehicleId: 5,
    plateNumber: "JKL-345",
    assignedTo: "Zain Ali",
    vehicleStatus: "Inactive",
    Action: "",
  },
  {
    vehicleId: 6,
    plateNumber: "MNO-678",
    assignedTo: "Imran Qureshi",
    vehicleStatus: "Active",
    Action: "",
  },
  {
    vehicleId: 7,
    plateNumber: "PQR-901",
    assignedTo: "Hamza Yousaf",
    vehicleStatus: "Active",
    Action: "",
  },
  {
    vehicleId: 8,
    plateNumber: "STU-234",
    assignedTo: "Ahmed Siddiqui",
    vehicleStatus: "Maintenance",
    Action: "",
  },
  {
    vehicleId: 9,
    plateNumber: "VWX-567",
    assignedTo: "Unassigned",
    vehicleStatus: "Available",
    Action: "",
  },
  {
    vehicleId: 10,
    plateNumber: "YZA-890",
    assignedTo: "Unassigned",
    vehicleStatus: "Available",
    Action: "",
  },
];

const cardsData = [
  {
    title: "Total Vehicles",
    number: "10",
    percentage: 2.5,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Active Vehicles",
    number: "5",
    percentage: 4.2,
    backgroundColor: "bg-[#E6F1FD]",
  },
  {
    title: "In Maintenance",
    number: "2",
    percentage: -1.8,
    backgroundColor: "bg-[#FFF2E6]",
  },
  {
    title: "Available",
    number: "2",
    percentage: 3.1,
    backgroundColor: "bg-[#E6F1FD]",
  },
];

const Vehicle = () => {
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setUsername(Cookies.get("username"));
  }, []);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  const itemsPerPage = 7;

  const filteredRecords = vehicleRecords.filter(
    (record) =>
      record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const onSubmit = () => {
    console.log("Vehicle form submitted successfully!");
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#EBF9F1] text-[#1F9254]";
      case "Inactive":
        return "bg-[#FBE7E8] text-[#A30D11]";
      case "Maintenance":
        return "bg-[#FFF2E6] text-[#B45309]";
      case "Available":
        return "bg-[#E0F2FE] text-[#0369A1]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello,<span className="font-semibold">{username}</span>
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
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[300px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
          </div>

          <Button className="w-full sm:w-auto " onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">Vehicle Id</TableHead>
                  <TableHead className="min-w-[150px]">Vehicle Plate Number</TableHead>
                  <TableHead className="min-w-[180px] hidden sm:table-cell">
                    Assigned To
                  </TableHead>
                  <TableHead className="min-w-[120px]">Vehicle Status</TableHead>
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
                        #{record.vehicleId}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.plateNumber}</span>
                          <span className="text-xs text-gray-500 sm:hidden">
                            {record.assignedTo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {record.assignedTo}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadgeStyle(record.vehicleStatus)} text-xs`}
                        >
                          {record.vehicleStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          <SquarePen className="h-4 w-4 cursor-pointer text-primary" />
                          <Trash2 className="h-4 w-4 cursor-pointer text-[#A30D11]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No vehicle records found matching your search.
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

      <Modal status={isModalOpen}>
        <VehicleForm onClose={onClose} onSubmit={onSubmit} />
      </Modal>
    </div>
  );
};

export default Vehicle;