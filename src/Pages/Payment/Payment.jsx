
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Plus, SquarePen, Trash2, Download, Eye, FileText } from 'lucide-react'

import InfoCards from "@/components/info-cards"
import Modal from "@/components/modal"
import PaymentForm from "@/components/forms/paymentForm"
import PaymentHistory from "@/components/payment-history"

import Cookies from "js-cookie"
import * as XLSX from "xlsx"

const paymentRecords = [
  {
    paymentId: 1,
    houseNumber: "A-101",
    residentName: "Ahmed Ali Khan",
    email: "ahmed.ali@email.com",
    phone: "03001234567",
    monthlyFee: 2500,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-03",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    serviceType: "Standard",
    lateFee: 0,
    totalAmount: 2500,
    outstandingBalance: 0,
  },
  {
    paymentId: 2,
    houseNumber: "B-205",
    residentName: "Fatima Sheikh",
    email: "fatima.sheikh@email.com",
    phone: "03011234567",
    monthlyFee: 3000,
    dueDate: "2024-06-05",
    paymentDate: null,
    paymentStatus: "Overdue",
    paymentMethod: null,
    serviceType: "Premium",
    lateFee: 300,
    totalAmount: 3300,
    outstandingBalance: 3300,
  },
  {
    paymentId: 3,
    houseNumber: "C-150",
    residentName: "Muhammad Usman",
    email: "m.usman@email.com",
    phone: "03021234567",
    monthlyFee: 2500,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-05",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    serviceType: "Standard",
    lateFee: 0,
    totalAmount: 2500,
    outstandingBalance: 0,
  },
  {
    paymentId: 4,
    houseNumber: "A-205",
    residentName: "Ayesha Malik",
    email: "ayesha.malik@email.com",
    phone: "03031234567",
    monthlyFee: 3500,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-01",
    paymentStatus: "Paid",
    paymentMethod: "Online",
    serviceType: "Premium Plus",
    lateFee: 0,
    totalAmount: 3500,
    outstandingBalance: 0,
  },
  {
    paymentId: 5,
    houseNumber: "B-110",
    residentName: "Hassan Raza",
    email: "hassan.raza@email.com",
    phone: "03041234567",
    monthlyFee: 2000,
    dueDate: "2024-06-05",
    paymentDate: null,
    paymentStatus: "Pending",
    paymentMethod: null,
    serviceType: "Basic",
    lateFee: 0,
    totalAmount: 2000,
    outstandingBalance: 2000,
  },
  {
    paymentId: 6,
    houseNumber: "C-301",
    residentName: "Zainab Ahmed",
    email: "zainab.ahmed@email.com",
    phone: "03051234567",
    monthlyFee: 2500,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-07",
    paymentStatus: "Paid Late",
    paymentMethod: "Bank Transfer",
    serviceType: "Standard",
    lateFee: 100,
    totalAmount: 2600,
    outstandingBalance: 0,
  },
  {
    paymentId: 7,
    houseNumber: "A-305",
    residentName: "Ali Haider",
    email: "ali.haider@email.com",
    phone: "03061234567",
    monthlyFee: 3000,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-04",
    paymentStatus: "Paid",
    paymentMethod: "Online",
    serviceType: "Premium",
    lateFee: 0,
    totalAmount: 3000,
    outstandingBalance: 0,
  },
  {
    paymentId: 8,
    houseNumber: "B-401",
    residentName: "Sana Tariq",
    email: "sana.tariq@email.com",
    phone: "03071234567",
    monthlyFee: 2500,
    dueDate: "2024-06-05",
    paymentDate: null,
    paymentStatus: "Overdue",
    paymentMethod: null,
    serviceType: "Standard",
    lateFee: 250,
    totalAmount: 2750,
    outstandingBalance: 2750,
  },
  {
    paymentId: 9,
    houseNumber: "C-205",
    residentName: "Bilal Shah",
    email: "bilal.shah@email.com",
    phone: "03081234567",
    monthlyFee: 2000,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-06",
    paymentStatus: "Paid Late",
    paymentMethod: "Cash",
    serviceType: "Basic",
    lateFee: 50,
    totalAmount: 2050,
    outstandingBalance: 0,
  },
  {
    paymentId: 10,
    houseNumber: "A-450",
    residentName: "Mariam Javed",
    email: "mariam.javed@email.com",
    phone: "03091234567",
    monthlyFee: 3500,
    dueDate: "2024-06-05",
    paymentDate: "2024-06-02",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    serviceType: "Premium Plus",
    lateFee: 0,
    totalAmount: 3500,
    outstandingBalance: 0,
  },
]

const cardsData = [
  {
    title: "Total Revenue",
    number: "Rs.2,47,500",
    percentage: 12.5,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Paid This Month",
    number: "Rs.1,89,600",
    percentage: 8.3,
    backgroundColor: "bg-[#E6F1FD]",
  },
  {
    title: "Outstanding",
    number: "Rs.57,900",
    percentage: -15.2,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Collection Rate",
    number: "76.6%",
    percentage: 5.1,
    backgroundColor: "bg-[#E6F1FD]",
  },
]

const Payments = () => {
  const [username, setUsername] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState(null)

  useEffect(() => {
    setUsername(Cookies.get("username"))
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  const itemsPerPage = 7

  const filteredRecords = paymentRecords.filter((record) => {
    const term = (searchTerm || "").toLowerCase()
    const matchesSearch = 
      record.residentName.toLowerCase().includes(term) ||
      record.houseNumber.toLowerCase().includes(term) ||
      record.email.toLowerCase().includes(term) ||
      record.phone.includes(term)
    
    const matchesStatus = statusFilter === "all" || record.paymentStatus.toLowerCase().replace(" ", "") === statusFilter
    const matchesService = serviceFilter === "all" || record.serviceType.toLowerCase().replace(" ", "") === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, serviceFilter])

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
    console.log("Payment form submitted successfully!")
  }

  const openHistoryModal = (resident) => {
    setSelectedResident(resident)
    setIsHistoryModalOpen(true)
  }

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false)
    setSelectedResident(null)
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-[#EBF9F1] text-[#1F9254]"
      case "Pending":
        return "bg-[#FEF3E2] text-[#B54708]"
      case "Overdue":
        return "bg-[#FBE7E8] text-[#A30D11]"
      case "Paid Late":
        return "bg-[#F0F9FF] text-[#0369A1]"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getServiceBadgeStyle = (service) => {
    switch (service) {
      case "Premium Plus":
        return "bg-[#F0F9FF] text-[#0369A1]"
      case "Premium":
        return "bg-[#F7FEE7] text-[#365314]"
      case "Standard":
        return "bg-[#FEF3E2] text-[#B54708]"
      case "Basic":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments")
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportAllData = () => {
    const exportData = paymentRecords.map(record => ({
      "House Number": record.houseNumber,
      "Resident Name": record.residentName,
      "Email": record.email,
      "Phone": record.phone,
      "Monthly Fee": record.monthlyFee,
      "Due Date": record.dueDate,
      "Payment Date": record.paymentDate || "Not Paid",
      "Payment Status": record.paymentStatus,
      "Payment Method": record.paymentMethod || "N/A",
      "Service Type": record.serviceType,
      "Late Fee": record.lateFee,
      "Total Amount": record.totalAmount,
      "Outstanding Balance": record.outstandingBalance,
    }))
    
    exportToExcel(exportData, `All_Payments_${new Date().toISOString().split('T')[0]}`)
  }

  const exportResidentData = (resident) => {
    // In a real app, you'd fetch all payment history for this resident
    const residentData = [{
      "House Number": resident.houseNumber,
      "Resident Name": resident.residentName,
      "Email": resident.email,
      "Phone": resident.phone,
      "Monthly Fee": resident.monthlyFee,
      "Due Date": resident.dueDate,
      "Payment Date": resident.paymentDate || "Not Paid",
      "Payment Status": resident.paymentStatus,
      "Payment Method": resident.paymentMethod || "N/A",
      "Service Type": resident.serviceType,
      "Late Fee": resident.lateFee,
      "Total Amount": resident.totalAmount,
      "Outstanding Balance": resident.outstandingBalance,
    }]
    
    exportToExcel(residentData, `${resident.houseNumber}_${resident.residentName.replace(/\s+/g, '_')}_Payment_History`)
  }

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-2 py-3 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Input
              name="Search bar"
              placeholder="Search by name, house number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[250px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="paidlate">Paid Late</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="premiumplus">Premium Plus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button variant="outline" onClick={exportAllData} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button className="w-full sm:w-auto" onClick={openModal}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Payment</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">House No.</TableHead>
                  <TableHead className="min-w-[150px]">Resident</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Service</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Amount</TableHead>
                  <TableHead className="min-w-[110px] hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <TableRow key={index} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                      <TableCell className="font-medium text-center">{record.houseNumber}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.residentName}</span>
                          <span className="text-xs text-gray-500 sm:hidden">
                            <Badge className={`${getServiceBadgeStyle(record.serviceType)} text-xs mt-1`}>
                              {record.serviceType}
                            </Badge>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`${getServiceBadgeStyle(record.serviceType)} text-xs`}>
                          {record.serviceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="font-medium">Rs.{record.totalAmount}</span>
                          {record.lateFee > 0 && (
                            <span className="text-xs text-red-500">+Rs.{record.lateFee} late fee</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{record.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(record.paymentStatus)} text-xs`}>
                          {record.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          <Eye 
                            className="h-4 w-4 cursor-pointer text-blue-600" 
                            onClick={() => openHistoryModal(record)}
                            title="View Payment History"
                          />
                          <FileText 
                            className="h-4 w-4 cursor-pointer text-green-600" 
                            onClick={() => exportResidentData(record)}
                            title="Export Payment Data"
                          />
                          <SquarePen className="h-4 w-4 cursor-pointer text-primary" title="Edit Payment" />
                          <Trash2 className="h-4 w-4 cursor-pointer text-[#A30D11]" title="Delete Payment" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No payment records found matching your search criteria.
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
                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer ${currentPage === pageNum ? "bg-primary text-white" : "bg-white"}`}
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
        <PaymentForm onClose={onClose} onSubmit={onSubmit} />
      </Modal>

      <Modal status={isHistoryModalOpen}>
        <PaymentHistory resident={selectedResident} onClose={closeHistoryModal} />
      </Modal>
    </div>
  )
}

export default Payments
