"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const employees = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    position: "Senior Developer",
    salary: "$95,000",
    startDate: "2022-01-15",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    salary: "$75,000",
    startDate: "2021-03-20",
    status: "Active",
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Sales",
    position: "Sales Representative",
    salary: "$55,000",
    startDate: "2023-06-10",
    status: "Active",
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "HR",
    position: "HR Specialist",
    salary: "$65,000",
    startDate: "2022-09-05",
    status: "Active",
  },
  {
    id: "EMP005",
    name: "David Brown",
    email: "david.brown@company.com",
    department: "Engineering",
    position: "Frontend Developer",
    salary: "$80,000",
    startDate: "2023-02-14",
    status: "Active",
  },
  {
    id: "EMP006",
    name: "Lisa Garcia",
    email: "lisa.garcia@company.com",
    department: "Design",
    position: "UX Designer",
    salary: "$70,000",
    startDate: "2022-11-30",
    status: "Active",
  },
  {
    id: "EMP007",
    name: "Tom Anderson",
    email: "tom.anderson@company.com",
    department: "Finance",
    position: "Financial Analyst",
    salary: "$68,000",
    startDate: "2021-08-12",
    status: "Active",
  },
  {
    id: "EMP008",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    department: "Marketing",
    position: "Content Creator",
    salary: "$52,000",
    startDate: "2023-04-18",
    status: "Active",
  },
  {
    id: "EMP009",
    name: "Chris Martinez",
    email: "chris.martinez@company.com",
    department: "Engineering",
    position: "Backend Developer",
    salary: "$88,000",
    startDate: "2022-07-22",
    status: "Active",
  },
  {
    id: "EMP010",
    name: "Amanda Taylor",
    email: "amanda.taylor@company.com",
    department: "Sales",
    position: "Sales Manager",
    salary: "$85,000",
    startDate: "2021-12-03",
    status: "Active",
  },
  {
    id: "EMP011",
    name: "Kevin Lee",
    email: "kevin.lee@company.com",
    department: "IT",
    position: "System Administrator",
    salary: "$72,000",
    startDate: "2022-05-16",
    status: "Active",
  },
  {
    id: "EMP012",
    name: "Rachel White",
    email: "rachel.white@company.com",
    department: "Design",
    position: "Graphic Designer",
    salary: "$58,000",
    startDate: "2023-01-09",
    status: "Active",
  },
  {
    id: "EMP013",
    name: "Mark Thompson",
    email: "mark.thompson@company.com",
    department: "Operations",
    position: "Operations Manager",
    salary: "$78,000",
    startDate: "2021-10-25",
    status: "Active",
  },
  {
    id: "EMP014",
    name: "Nicole Rodriguez",
    email: "nicole.rodriguez@company.com",
    department: "HR",
    position: "Recruiter",
    salary: "$60,000",
    startDate: "2022-12-14",
    status: "Active",
  },
  {
    id: "EMP015",
    name: "James Wilson",
    email: "james.wilson@company.com",
    department: "Finance",
    position: "Accountant",
    salary: "$62,000",
    startDate: "2023-03-07",
    status: "Active",
  },
]

export function TableDemo() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = employees.slice(startIndex, endIndex)

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Employee directory with pagination</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px] hidden sm:table-cell">Email</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Department</TableHead>
                <TableHead className="min-w-[150px] hidden lg:table-cell">Position</TableHead>
                <TableHead className="min-w-[100px] hidden xl:table-cell">Salary</TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell">Start Date</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{employee.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.position}</TableCell>
                  <TableCell className="hidden xl:table-cell">{employee.salary}</TableCell>
                  <TableCell className="hidden xl:table-cell">{employee.startDate}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {employee.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, employees.length)} of {employees.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}