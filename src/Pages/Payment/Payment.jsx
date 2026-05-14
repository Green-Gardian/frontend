import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Download, Eye, X, CreditCard, Home, Phone, Mail, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getDuesOverview, getDuesRecords } from "@/services/payments";

const formatCurrency = (amount, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: (currency || "PKR").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
};

const monthKeyNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getStatusBadgeStyle = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (value === "paid") return "bg-[#ecfdf5] text-[#047857] border border-[#d1fae5]";
  if (value === "overdue") return "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]";
  if (value === "failed") return "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]";
  return "bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]";
};

const Payments = () => {
  const [username, setUsername] = useState("");
  const [overview, setOverview] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(monthKeyNow());
  const [viewRecord, setViewRecord] = useState(null);

  useEffect(() => {
    setUsername(Cookies.get("username") || "");
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);

      const status = statusFilter === "all" ? undefined : statusFilter;
      const search = searchTerm.trim() || undefined;

      const [overviewRes, recordsRes] = await Promise.all([
        getDuesOverview({ month: monthFilter }),
        getDuesRecords({ page, limit: pagination.limit, month: monthFilter, status, search }),
      ]);

      setOverview(overviewRes.overview || null);
      setRecords(recordsRes.records || []);
      setPagination((prev) => ({
        ...prev,
        page: recordsRes.pagination?.page || page,
        total: recordsRes.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Failed to load payments:", error);
      setOverview(null);
      setRecords([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.limit));

  const cardsData = useMemo(() => {
    const currency = (overview?.currency || "PKR").toUpperCase();
    return [
      {
        title: "Total Collected",
        number: formatCurrency(overview?.totalCollected || 0, currency),
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Outstanding",
        number: formatCurrency(overview?.totalOutstanding || 0, currency),
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Collection Rate",
        number: `${Number(overview?.collectionRate || 0).toFixed(2)}%`,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Services Delivered",
        number: String(overview?.completedServices || 0),
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Service Fees Due",
        number: formatCurrency(overview?.serviceFeesOutstanding || 0, currency),
        backgroundColor: "bg-[#E6F1FD]",
      },
    ];
  }, [overview]);

  const exportRows = (data, name) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `${name}.xlsx`);
  };

  const exportCurrentPage = () => {
    const rows = records.map((r) => ({
      "Resident Name": r.residentName,
      Email: r.email,
      Phone: r.phone,
      House: r.houseNumber,
      Society: r.societyName || "-",
      "Billing Month": r.billingMonth,
      "Due Date": r.dueDate,
      Status: r.status,
      Amount: r.amount,
      Currency: r.currency,
      "Paid At": r.paidAt || "-",
      "Payment Method": r.paymentMethod || "-",
      "Checkout Session": r.stripeCheckoutSessionId || "-",
      "Payment Intent": r.stripePaymentIntentId || "-",
    }));

    exportRows(rows, `Dues_Records_Page_${pagination.page}_${new Date().toISOString().split("T")[0]}`);
  };

  const openViewModal = (record) => setViewRecord(record);
  const closeViewModal = () => setViewRecord(null);

  const handleSearchSubmit = () => loadData(1);

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello, <span className="font-semibold">{Cookies.get("society")} - {username}</span>
      </h1>

      <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
        {cardsData.map((card, index) => (
          <InfoCards key={index} title={card.title} number={card.number} backgroundColor={card.backgroundColor} />
        ))}
      </div>

      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-2 py-3 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Input
              name="search"
              placeholder="Search by resident name/email/phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="w-full sm:max-w-[280px] h-10 px-4 rounded-md border"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full sm:w-[180px] h-10"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button variant="outline" onClick={handleSearchSubmit} className="w-full sm:w-auto">
              Refresh
            </Button>
            <Button variant="outline" onClick={exportCurrentPage} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Page
            </Button>
          </div>
        </div>

        <div className="rounded-md overflow-hidden border">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="min-w-[170px]">Resident</TableHead>
                  <TableHead className="min-w-[100px]">House</TableHead>
                  <TableHead className="min-w-[120px]">Month</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[110px]">Status</TableHead>
                  <TableHead className="min-w-[130px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No payment records found.
                    </TableCell>
                  </TableRow>
                )}

                {records.map((record, index) => (
                  <TableRow key={record.id} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{record.residentName}</span>
                        <span className="text-xs text-gray-500">{record.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{record.houseNumber || "-"}</TableCell>
                    <TableCell className="text-sm">{record.billingMonth?.slice(0, 7) || "-"}</TableCell>
                    <TableCell className="font-semibold text-sm">{formatCurrency(record.amount, record.currency)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeStyle(record.status)} text-xs capitalize`}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.isServiceFee ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {record.isServiceFee ? "Service Fee" : "Monthly Due"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openViewModal(record)} className="text-xs h-7 px-3">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Pagination className="py-4">
          <PaginationContent className="flex-wrap gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => pagination.page > 1 && loadData(pagination.page - 1)}
                className={`cursor-pointer text-sm ${pagination.page === 1 ? "opacity-50 pointer-events-none" : ""}`}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink className="bg-primary text-white cursor-default">{pagination.page}</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => pagination.page < totalPages && loadData(pagination.page + 1)}
                className={`cursor-pointer text-sm ${pagination.page >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Modal isOpen={!!viewRecord} onClose={closeViewModal} title="Payment Details">
        {viewRecord && (
          <div className="space-y-5">
            {/* Resident info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 text-xs font-bold">{(viewRecord.residentName || "R")[0]}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Resident</p>
                  <p className="font-semibold text-sm">{viewRecord.residentName || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">House</p>
                  <p className="font-medium text-sm">{viewRecord.houseNumber || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm">{viewRecord.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-sm">{viewRecord.phone || "-"}</p>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Payment Info</h4>
              {[
                { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: "Billing Month", value: viewRecord.billingMonth?.slice(0, 7) || "-" },
                { icon: <Clock className="h-4 w-4 text-gray-400" />, label: "Due Date", value: formatDate(viewRecord.dueDate) },
                { icon: <CreditCard className="h-4 w-4 text-gray-400" />, label: "Amount", value: formatCurrency(viewRecord.amount, viewRecord.currency), bold: true },
                { icon: <CheckCircle className="h-4 w-4 text-gray-400" />, label: "Paid On", value: viewRecord.paidAt ? formatDate(viewRecord.paidAt) : "Not paid" },
                { icon: <CreditCard className="h-4 w-4 text-gray-400" />, label: "Payment Method", value: viewRecord.paymentMethod ? viewRecord.paymentMethod.charAt(0).toUpperCase() + viewRecord.paymentMethod.slice(1) : "-" },
                { icon: <AlertCircle className="h-4 w-4 text-gray-400" />, label: "Type", value: viewRecord.isServiceFee ? "Service Fee" : "Monthly Due" },
              ].map(({ icon, label, value, bold }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <span className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}>{value}</span>
                </div>
              ))}
              {/* Status */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={`${getStatusBadgeStyle(viewRecord.status)} text-xs capitalize`}>{viewRecord.status}</Badge>
              </div>
              {/* Receipt link */}
              {viewRecord.receiptUrl && (
                <div className="pt-2">
                  <a href={viewRecord.receiptUrl} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
