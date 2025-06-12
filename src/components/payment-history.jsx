"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Download, Calendar, CreditCard, Home, Phone, Mail } from "lucide-react"
import * as XLSX from "xlsx"



// Mock payment history data - in real app, this would be fetched from API
const getPaymentHistory = (residentId) => [
  {
    month: "June 2024",
    dueDate: "2024-06-05",
    paymentDate: "2024-06-03",
    amount: 2500,
    lateFee: 0,
    status: "Paid",
    method: "Bank Transfer",
    invoiceId: "INV-2024-06-001",
  },
  {
    month: "May 2024",
    dueDate: "2024-05-05",
    paymentDate: "2024-05-07",
    amount: 2500,
    lateFee: 100,
    status: "Paid Late",
    method: "Cash",
    invoiceId: "INV-2024-05-001",
  },
  {
    month: "April 2024",
    dueDate: "2024-04-05",
    paymentDate: "2024-04-04",
    amount: 2500,
    lateFee: 0,
    status: "Paid",
    method: "Online",
    invoiceId: "INV-2024-04-001",
  },
  {
    month: "March 2024",
    dueDate: "2024-03-05",
    paymentDate: "2024-03-05",
    amount: 2500,
    lateFee: 0,
    status: "Paid",
    method: "Bank Transfer",
    invoiceId: "INV-2024-03-001",
  },
  {
    month: "February 2024",
    dueDate: "2024-02-05",
    paymentDate: "2024-02-15",
    amount: 2500,
    lateFee: 250,
    status: "Paid Late",
    method: "Cash",
    invoiceId: "INV-2024-02-001",
  },
  {
    month: "January 2024",
    dueDate: "2024-01-05",
    paymentDate: "2024-01-03",
    amount: 2500,
    lateFee: 0,
    status: "Paid",
    method: "Online",
    invoiceId: "INV-2024-01-001",
  },
]

const PaymentHistory = ({ resident, onClose }) => {
  if (!resident) return null

  const paymentHistory = getPaymentHistory(resident.paymentId)

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-[#EBF9F1] text-[#1F9254]"
      case "Paid Late":
        return "bg-[#F0F9FF] text-[#0369A1]"
      case "Overdue":
        return "bg-[#FBE7E8] text-[#A30D11]"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const calculateStats = () => {
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount + payment.lateFee, 0)
    const totalLateFees = paymentHistory.reduce((sum, payment) => sum + payment.lateFee, 0)
    const onTimePayments = paymentHistory.filter((payment) => payment.status === "Paid").length
    const latePayments = paymentHistory.filter((payment) => payment.status === "Paid Late").length
    const onTimePercentage = ((onTimePayments / paymentHistory.length) * 100).toFixed(1)

    return { totalPaid, totalLateFees, onTimePayments, latePayments, onTimePercentage }
  }

  const stats = calculateStats()

  const exportPaymentHistory = () => {
    const exportData = paymentHistory.map((payment) => ({
      Month: payment.month,
      "Due Date": payment.dueDate,
      "Payment Date": payment.paymentDate,
      Amount: payment.amount,
      "Late Fee": payment.lateFee,
      Total: payment.amount + payment.lateFee,
      Status: payment.status,
      "Payment Method": payment.method,
      "Invoice ID": payment.invoiceId,
    }))

    // Add summary row
    exportData.push({
      Month: "SUMMARY",
      "Due Date": "",
      "Payment Date": "",
      Amount: paymentHistory.reduce((sum, p) => sum + p.amount, 0),
      "Late Fee": stats.totalLateFees,
      Total: stats.totalPaid,
      Status: `${stats.onTimePercentage}% On Time`,
      "Payment Method": "",
      "Invoice ID": "",
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History")
    XLSX.writeFile(
      workbook,
      `${resident.houseNumber}_${resident.residentName.replace(/\s+/g, "_")}_Complete_History.xlsx`,
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-500">
            {resident.houseNumber} - {resident.residentName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPaymentHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Resident Info Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">House Number</p>
                <p className="font-medium">{resident.houseNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm">{resident.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{resident.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Service Type</p>
                <Badge className="bg-blue-100 text-blue-800 text-xs">{resident.serviceType}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Total Paid</h3>
            <p className="text-2xl font-bold text-green-900">Rs.{stats.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Total Late Fees</h3>
            <p className="text-2xl font-bold text-red-900">Rs.{stats.totalLateFees.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">On-Time Payments</h3>
            <p className="text-2xl font-bold text-blue-900">
              {stats.onTimePayments}/{paymentHistory.length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">On-Time Rate</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.onTimePercentage}%</p>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment History
          </h3>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell className="font-medium">{payment.month}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>{payment.paymentDate}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className={payment.lateFee > 0 ? "text-red-600 font-medium" : ""}>
                        ₹{payment.lateFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{(payment.amount + payment.lateFee).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(payment.status)} text-xs`}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-sm text-gray-500">{payment.invoiceId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistory
