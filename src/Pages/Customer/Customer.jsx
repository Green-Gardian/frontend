<<<<<<< HEAD
"use client"
=======
>>>>>>> origin/main

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

import { Plus, SquarePen, Trash2 } from "lucide-react"

import InfoCards from "@/components/info-cards"
import Modal from "@/components/modal"

import CustomerForm from "@/components/forms/customerForm"

import Cookies from "js-cookie"

const customerRecords = [
  {
    customerId: 1,
    name: "Ahmed Ali Khan",
    email: "ahmed.ali@email.com",
    phone: "03001234567",
    subscriptionPlan: "Premium",
    joinDate: "2024-01-15",
    customerStatus: "Active",
    totalOrders: 12,
  },
  {
    customerId: 2,
    name: "Fatima Sheikh",
    email: "fatima.sheikh@email.com",
    phone: "03011234567",
    subscriptionPlan: "Basic",
    joinDate: "2024-02-20",
    customerStatus: "Active",
    totalOrders: 8,
  },
  {
    customerId: 3,
    name: "Muhammad Usman",
    email: "m.usman@email.com",
    phone: "03021234567",
    subscriptionPlan: "Standard",
    joinDate: "2024-01-10",
    customerStatus: "Inactive",
    totalOrders: 5,
  },
  {
    customerId: 4,
    name: "Ayesha Malik",
    email: "ayesha.malik@email.com",
    phone: "03031234567",
    subscriptionPlan: "Premium",
    joinDate: "2024-03-05",
    customerStatus: "Active",
    totalOrders: 15,
  },
  {
    customerId: 5,
    name: "Hassan Raza",
    email: "hassan.raza@email.com",
    phone: "03041234567",
    subscriptionPlan: "Basic",
    joinDate: "2024-02-28",
    customerStatus: "Active",
    totalOrders: 3,
  },
  {
    customerId: 6,
    name: "Zainab Ahmed",
    email: "zainab.ahmed@email.com",
    phone: "03051234567",
    subscriptionPlan: "Standard",
    joinDate: "2024-01-25",
    customerStatus: "Suspended",
    totalOrders: 7,
  },
  {
    customerId: 7,
    name: "Ali Haider",
    email: "ali.haider@email.com",
    phone: "03061234567",
    subscriptionPlan: "Premium",
    joinDate: "2024-03-12",
    customerStatus: "Active",
    totalOrders: 20,
  },
  {
    customerId: 8,
    name: "Sana Tariq",
    email: "sana.tariq@email.com",
    phone: "03071234567",
    subscriptionPlan: "Basic",
    joinDate: "2024-02-14",
    customerStatus: "Active",
    totalOrders: 6,
  },
  {
    customerId: 9,
    name: "Bilal Shah",
    email: "bilal.shah@email.com",
    phone: "03081234567",
    subscriptionPlan: "Standard",
    joinDate: "2024-01-30",
    customerStatus: "Inactive",
    totalOrders: 2,
  },
  {
    customerId: 10,
    name: "Mariam Javed",
    email: "mariam.javed@email.com",
    phone: "03091234567",
    subscriptionPlan: "Premium",
    joinDate: "2024-03-08",
    customerStatus: "Active",
    totalOrders: 18,
  },
  {
    customerId: 11,
    name: "Imran Qureshi",
    email: "imran.qureshi@email.com",
    phone: "03101234567",
    subscriptionPlan: "Basic",
    joinDate: "2024-02-05",
    customerStatus: "Active",
    totalOrders: 4,
  },
  {
    customerId: 12,
    name: "Hira Malik",
    email: "hira.malik@email.com",
    phone: "03111234567",
    subscriptionPlan: "Standard",
    joinDate: "2024-01-18",
    customerStatus: "Suspended",
    totalOrders: 9,
  },
  {
    customerId: 13,
    name: "Hamza Yousaf",
    email: "hamza.yousaf@email.com",
    phone: "03121234567",
    subscriptionPlan: "Premium",
    joinDate: "2024-03-15",
    customerStatus: "Active",
    totalOrders: 25,
  },
  {
    customerId: 14,
    name: "Nida Farooq",
    email: "nida.farooq@email.com",
    phone: "03131234567",
    subscriptionPlan: "Basic",
    joinDate: "2024-02-22",
    customerStatus: "Active",
    totalOrders: 7,
  },
  {
    customerId: 15,
    name: "Ahmed Siddiqui",
    email: "ahmed.siddiqui@email.com",
    phone: "03141234567",
    subscriptionPlan: "Standard",
    joinDate: "2024-01-12",
    customerStatus: "Inactive",
    totalOrders: 1,
  },
]

const cardsData = [
  {
    title: "Total Customers",
    number: "1,247",
    percentage: 8.2,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Active Customers",
    number: "1,089",
    percentage: 12.5,
    backgroundColor: "bg-[#E6F1FD]",
  },
  {
    title: "New This Month",
    number: "156",
    percentage: 15.3,
    backgroundColor: "bg-[#EDEEFC]",
  },
  {
    title: "Premium Users",
    number: "423",
    percentage: 6.8,
    backgroundColor: "bg-[#E6F1FD]",
  },
]

const Customer = () => {
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

  const itemsPerPage = 7

  const filteredRecords = customerRecords.filter((record) => {
    const term = (searchTerm || "").toLowerCase()
    return (
      record.name.toLowerCase().includes(term) ||
      record.email.toLowerCase().includes(term) ||
      record.phone.includes(term) ||
      record.subscriptionPlan.toLowerCase().includes(term) ||
      record.customerStatus.toLowerCase().includes(term)
    )
  })

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
    console.log("Customer form submitted successfully!")
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#EBF9F1] text-[#1F9254]"
      case "Inactive":
        return "bg-[#FBE7E8] text-[#A30D11]"
      case "Suspended":
        return "bg-[#FEF3E2] text-[#B54708]"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getPlanBadgeStyle = (plan) => {
    switch (plan) {
      case "Premium":
        return "bg-[#F0F9FF] text-[#0369A1]"
      case "Standard":
        return "bg-[#F7FEE7] text-[#365314]"
      case "Basic":
        return "bg-[#FEF3E2] text-[#B54708]"
      default:
        return "bg-gray-100 text-gray-600"
    }
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
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center px-2 py-3 gap-3">
          <div className="w-full">
            <Input
              name="Search bar"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[300px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
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
                  <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                  <TableHead className="min-w-[130px] hidden md:table-cell">Phone</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Plan</TableHead>
                  <TableHead className="min-w-[100px] hidden xl:table-cell">Orders</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <TableRow key={index} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                      <TableCell className="font-medium text-center">#{record.customerId}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.name}</span>
                          <span className="text-xs text-gray-500 sm:hidden">{record.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col">
                          <span>{record.email}</span>
                          <span className="text-xs text-gray-500 md:hidden">{record.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>{record.phone}</span>
                          <span className="text-xs text-gray-500 lg:hidden">
                            <Badge className={`${getPlanBadgeStyle(record.subscriptionPlan)} text-xs mt-1`}>
                              {record.subscriptionPlan}
                            </Badge>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={`${getPlanBadgeStyle(record.subscriptionPlan)} text-xs`}>
                          {record.subscriptionPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-center">{record.totalOrders}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(record.customerStatus)} text-xs`}>
                          {record.customerStatus}
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
        <CustomerForm onClose={onClose} onSubmit={onSubmit} />
      </Modal>
    </div>
  )
}

export default Customer;
