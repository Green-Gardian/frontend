import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Download, Eye } from "lucide-react";
import * as XLSX from "xlsx";

import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";
import PaymentHistory from "@/components/payment-history";

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

import { getDuesOverview, getDuesRecords, getResidentDuesHistory } from "@/services/payments";

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
  if (value === "paid") return "bg-[#EBF9F1] text-[#1F9254]";
  if (value === "overdue") return "bg-[#FBE7E8] text-[#A30D11]";
  if (value === "failed") return "bg-[#FEF3E2] text-[#B54708]";
  return "bg-[#E6F1FD] text-[#0369A1]";
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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);

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
        title: "Total Due",
        number: formatCurrency(overview?.totalDue || 0, currency),
        backgroundColor: "bg-[#EDEEFC]",
      },
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

  const openHistoryModal = async (residentRecord) => {
    try {
      setHistoryLoading(true);
      setHistoryModalOpen(true);
      const result = await getResidentDuesHistory(residentRecord.userId);
      setSelectedResident({
        ...residentRecord,
        residentName: result.resident?.name || residentRecord.residentName,
        email: result.resident?.email || residentRecord.email,
        phone: result.resident?.phone || residentRecord.phone,
      });
      setSelectedHistory(result.history || []);
    } catch (error) {
      console.error("Failed to load resident history:", error);
      setSelectedResident(residentRecord);
      setSelectedHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedResident(null);
    setSelectedHistory([]);
  };

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
                  <TableHead className="min-w-[120px]">Due Date</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[110px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Paid At</TableHead>
                  <TableHead className="min-w-[140px]">Payment Method</TableHead>
                  <TableHead className="min-w-[220px]">Stripe Session</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No payment records found.
                    </TableCell>
                  </TableRow>
                )}

                {records.map((record, index) => (
                  <TableRow key={record.id} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{record.residentName}</span>
                        <span className="text-xs text-gray-500">{record.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.houseNumber || "-"}</TableCell>
                    <TableCell>{record.billingMonth}</TableCell>
                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.amount, record.currency)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeStyle(record.status)} text-xs`}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>{record.paidAt ? formatDate(record.paidAt) : "-"}</TableCell>
                    <TableCell>{record.paymentMethod || "-"}</TableCell>
                    <TableCell className="text-xs text-slate-600">{record.stripeCheckoutSessionId || "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openHistoryModal(record)}>
                        <Eye className="h-4 w-4 mr-1" />
                        History
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

      <Modal status={historyModalOpen}>
        <PaymentHistory
          resident={selectedResident}
          history={selectedHistory}
          loading={historyLoading}
          onClose={closeHistoryModal}
        />
      </Modal>
    </div>
  );
};

export default Payments;
