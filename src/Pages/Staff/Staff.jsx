
import React, { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, SquarePen, Trash2, Eye } from "lucide-react"
import InfoCards from "@/components/info-cards"
import Modal from "@/components/modal"
import StaffForm from "@/components/forms/staffForm"
import Cookies from "js-cookie"

const staffRecords = [
  {
    employeeId: 1,
    name: "Muhammad Hassan Amir",
    role: "Driver",
    workSchedule: "Morning",
    contactInfo: "03001234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 2,
    name: "Ayesha Khan",
    role: "Customer Support",
    workSchedule: "Evening",
    contactInfo: "03011234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 3,
    name: "Ali Raza",
    role: "Driver",
    workSchedule: "Night",
    contactInfo: "03021234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Inactive",
    Action: "",
  },
  {
    employeeId: 4,
    name: "Sara Ahmed",
    role: "Customer Support",
    workSchedule: "Morning",
    contactInfo: "03031234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 5,
    name: "Bilal Saeed",
    role: "Driver",
    workSchedule: "Evening",
    contactInfo: "03041234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 6,
    name: "Fatima Noor",
    role: "Customer Support",
    workSchedule: "Night",
    contactInfo: "03051234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Inactive",
    Action: "",
  },
  {
    employeeId: 7,
    name: "Usman Tariq",
    role: "Driver",
    workSchedule: "Morning",
    contactInfo: "03061234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 8,
    name: "Hira Shah",
    role: "Customer Support",
    workSchedule: "Evening",
    contactInfo: "03071234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 9,
    name: "Zain Ali",
    role: "Driver",
    workSchedule: "Night",
    contactInfo: "03081234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Inactive",
    Action: "",
  },
  {
    employeeId: 10,
    name: "Mariam Javed",
    role: "Customer Support",
    workSchedule: "Morning",
    contactInfo: "03091234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 11,
    name: "Imran Qureshi",
    role: "Driver",
    workSchedule: "Evening",
    contactInfo: "03101234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 12,
    name: "Sana Malik",
    role: "Customer Support",
    workSchedule: "Night",
    contactInfo: "03111234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Inactive",
    Action: "",
  },
  {
    employeeId: 13,
    name: "Hamza Yousaf",
    role: "Driver",
    workSchedule: "Morning",
    contactInfo: "03121234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 14,
    name: "Nida Farooq",
    role: "Customer Support",
    workSchedule: "Evening",
    contactInfo: "03131234567",
    paymentMethod: "Bank Transfer",
    EmployeeStatus: "Active",
    Action: "",
  },
  {
    employeeId: 15,
    name: "Ahmed Siddiqui",
    role: "Driver",
    workSchedule: "Night",
    contactInfo: "03141234567",
    paymentMethod: "Cash on Delivery",
    EmployeeStatus: "Inactive",
    Action: "",
  },
]

const cardsData = [
  {
    title: "Total Employees",
    number: "72",
    percentage: 6.08,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "On Duty",
    number: "36",
    percentage: 6.08,
    backgroundColor: "bg-[#E6F1FD]",
  },
  {
    title: "On Leave",
    number: "1",
    percentage: 6.08,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Active Users",
    number: "2,318",
    percentage: 6.08,
    backgroundColor: "bg-[#E6F1FD]",
  },
]

const Staff = () => {
  const [username, setUsername] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setUsername(Cookies.get("username"))
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

<<<<<<< HEAD
  const itemsPerPage = 7; 

  const filteredRecords = staffRecords.filter(
    (record) => {
      const term = (searchTerm || "").toLowerCase();
      return (
        record.name.toLowerCase().includes(term) ||
        record.role.toLowerCase().includes(term) ||
        record.contactInfo.includes(term) ||
        record.EmployeeStatus.toLowerCase().includes(term)
      );
    }
  );
=======
  const itemsPerPage = 7

  const filteredRecords = staffRecords.filter((record) => {
    const term = (searchTerm || "").toLowerCase()
    return (
      record.name.toLowerCase().includes(term) ||
      record.role.toLowerCase().includes(term) ||
      record.contactInfo.includes(term) ||
      record.EmployeeStatus.toLowerCase().includes(term)
    )
  })
>>>>>>> origin/main

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5)
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }

    return pages
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const onClose = () => {
    setIsModalOpen(false)
  }

  const onSubmit = () => {
    console.log("Form submitted successfully!")
  }

  const handleViewPerformance = (employeeId) => {
    window.location.href = `/admin/staff-performance/${employeeId}`;
  }

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

          <Button className="w-full sm:w-auto " onClick={openModal}>
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
                  <TableHead className="w-[100px]">Employee Id</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Role</TableHead>
                  <TableHead className="min-w-[130px] hidden md:table-cell">Contact Info</TableHead>
                  <TableHead className="min-w-[140px] hidden lg:table-cell">Payment Mode</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <TableRow key={index} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                      <TableCell className="font-medium text-center">#{record.employeeId}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.name}</span>
                          <span className="text-xs text-gray-500 sm:hidden">{record.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{record.role}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>{record.contactInfo}</span>
                          <span className="text-xs text-gray-500 lg:hidden">{record.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{record.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            record.EmployeeStatus === "Active"
                              ? "bg-[#EBF9F1] text-[#1F9254]"
                              : "bg-[#FBE7E8] text-[#A30D11]"
                          } text-xs`}
                        >
                          {record.EmployeeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          <Eye
                            className="h-4 w-4 cursor-pointer text-blue-600"
                            onClick={() => handleViewPerformance(record.employeeId)}
                            title="View Performance"
                          />
                          <SquarePen className="h-4 w-4 cursor-pointer text-primary" />
                          <Trash2 className="h-4 w-4 cursor-pointer text-[#A30D11]" />
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

        {totalPages > 1 && (
          <Pagination className="py-4">
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={`cursor-pointer text-sm ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>

              <div className="hidden sm:flex">
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer  ${currentPage === pageNum ? "bg-primary text-white" : "bg-white"}`}
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
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Modal status={isModalOpen}>
        <StaffForm onClose={onClose} onSubmit={onSubmit} />
      </Modal>
    </div>
  )
}

export default Staff
