import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Download, Eye, CreditCard, Home, Phone, Mail, Calendar, CheckCheck, Clock, AlertCircle, Plus, FileText, Banknote, User, ChevronDown, ChevronRight, Wrench } from "lucide-react";
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

import { getDuesOverview, getDuesRecords, adminAdjustBalance, adminMarkDuePaid, getOutstandingBreakdown } from "@/services/payments";

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

const monthKeyNowVal = monthKeyNow();

const Payments = () => {
  const [username, setUsername] = useState("");
  const [overview, setOverview] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(monthKeyNowVal);
  const [viewRecord, setViewRecord] = useState(null);

  // Outstanding breakdown
  const [outstandingResidents, setOutstandingResidents] = useState([]);
  const [expandedResidents, setExpandedResidents] = useState({});

  // Admin action states
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);
  const [markPaidNotes, setMarkPaidNotes] = useState("");
  const [markPaidMethod, setMarkPaidMethod] = useState("manual");

  // Adjust balance modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustResidentId, setAdjustResidentId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustMonth, setAdjustMonth] = useState(monthKeyNowVal);
  const [adjustStatus, setAdjustStatus] = useState("pending");
  const [adjusting, setAdjusting] = useState(false);

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

      const [overviewRes, recordsRes, outstandingRes] = await Promise.all([
        getDuesOverview({ month: monthFilter }),
        getDuesRecords({ page, limit: pagination.limit, month: monthFilter, status, search }),
        getOutstandingBreakdown(),
      ]);

      setOverview(overviewRes.overview || null);
      setRecords(recordsRes.records || []);
      setOutstandingResidents(outstandingRes.residents || []);
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

  const openViewModal = (record) => {
    setViewRecord(record);
    setActionError("");
    setActionSuccess("");
    setMarkPaidNotes("");
    setMarkPaidMethod("manual");
  };
  const closeViewModal = () => setViewRecord(null);

  const handleSearchSubmit = () => loadData(1);

  const handleMarkPaid = async () => {
    if (!viewRecord) return;
    setMarkingPaid(true);
    setActionError("");
    setActionSuccess("");
    try {
      await adminMarkDuePaid(viewRecord.id, { paymentMethod: markPaidMethod, notes: markPaidNotes || undefined });
      setActionSuccess("Marked as paid.");
      setViewRecord((r) => ({ ...r, status: "paid" }));
      loadData(pagination.page);
    } catch (err) {
      setActionError(err.message || "Failed to mark as paid.");
    } finally {
      setMarkingPaid(false);
    }
  };

  const openAdjustModal = (record) => {
    setAdjustResidentId(record ? String(record.userId) : "");
    setAdjustAmount("");
    setAdjustNotes("");
    setAdjustMonth(monthKeyNowVal);
    setAdjustStatus("pending");
    setActionError("");
    setActionSuccess("");
    setShowAdjustModal(true);
  };
  const closeAdjustModal = () => setShowAdjustModal(false);

  const handleAdjustSubmit = async () => {
    if (!adjustResidentId || !adjustAmount || !adjustNotes) {
      setActionError("Resident ID, amount, and notes are required.");
      return;
    }
    setAdjusting(true);
    setActionError("");
    setActionSuccess("");
    try {
      await adminAdjustBalance({
        residentId: Number(adjustResidentId),
        amountPKR: Number(adjustAmount),
        notes: adjustNotes,
        billingMonth: adjustMonth,
        status: adjustStatus,
      });
      setActionSuccess("Adjustment recorded.");
      setShowAdjustModal(false);
      loadData(pagination.page);
    } catch (err) {
      setActionError(err.message || "Failed to create adjustment.");
    } finally {
      setAdjusting(false);
    }
  };

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

      {/* Outstanding dues breakdown */}
      {outstandingResidents.length > 0 && (
        <div className="w-full">
          <h2 className="text-[16px] font-semibold text-[#121212] mb-3">
            Outstanding Dues — {outstandingResidents.length} resident{outstandingResidents.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex flex-col gap-2">
            {outstandingResidents.map((resident) => {
              const expanded = !!expandedResidents[resident.userId];
              return (
                <div key={resident.userId} className="border rounded-lg overflow-hidden">
                  {/* Resident header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedResidents((prev) => ({ ...prev, [resident.userId]: !prev[resident.userId] }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F6FE] hover:bg-[#EDEEFC] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="font-semibold text-sm text-[#121212]">{resident.name}</span>
                        {resident.houseNumber !== "-" && (
                          <span className="ml-2 text-xs text-gray-500">· {resident.houseNumber}</span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">{resident.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#121212]">{formatCurrency(resident.total, resident.currency)}</span>
                        <span className="ml-2 text-xs text-gray-500">({resident.dues.length} item{resident.dues.length !== 1 ? "s" : ""})</span>
                      </div>
                      {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded due items */}
                  {expanded && (
                    <div className="divide-y divide-gray-100 bg-white">
                      {resident.dues.map((due) => (
                        <div key={due.id} className="flex items-center justify-between px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            {due.isServiceFee ? (
                              <Wrench className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            ) : due.isAdjustment ? (
                              <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            )}
                            <div>
                              <span className="text-sm text-gray-700">
                                {due.isServiceFee ? "Service Fee" : due.isAdjustment ? "Adjustment" : "Monthly Due"}
                              </span>
                              <span className="ml-2 text-xs text-gray-400">{due.billingMonth?.slice(0, 7)}</span>
                              {due.notes && <span className="ml-2 text-xs text-amber-600 italic">— {due.notes}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">{formatCurrency(due.amount, resident.currency)}</span>
                            <Badge className={`${getStatusBadgeStyle(due.status)} text-xs capitalize`}>{due.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {outstandingResidents.length === 0 && !loading && (
        <div className="w-full text-center py-4 text-sm text-gray-400">No outstanding dues across all residents.</div>
      )}

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

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                // outstanding and paid cross all months — clear month filter
                if (val === "outstanding" || val === "paid") setMonthFilter("");
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="outstanding">Due (Outstanding)</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full sm:w-[160px] h-10"
                disabled={statusFilter === "outstanding" || statusFilter === "paid"}
                title={statusFilter === "outstanding" ? "Month filter disabled for outstanding view" : statusFilter === "paid" ? "Month filter disabled for paid view — shows all paid records" : ""}
              />
              {monthFilter && statusFilter !== "outstanding" && (
                <button
                  type="button"
                  onClick={() => setMonthFilter("")}
                  className="text-xs text-gray-400 hover:text-gray-700 px-1"
                  title="Clear month filter (show all months)"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button variant="outline" onClick={handleSearchSubmit} className="w-full sm:w-auto">
              Refresh
            </Button>
            <Button variant="outline" onClick={exportCurrentPage} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Page
            </Button>
            <Button onClick={() => openAdjustModal(null)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Adjustment
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        record.isServiceFee ? "bg-blue-50 text-blue-700" :
                        record.isAdjustment ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {record.isServiceFee ? "Service Fee" : record.isAdjustment ? "Adjustment" : "Monthly Due"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Eye
                        className="h-4 w-4 cursor-pointer text-primary"
                        onClick={() => openViewModal(record)}
                        title="View details"
                      />
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
                { icon: <Banknote className="h-4 w-4 text-gray-400" />, label: "Amount", value: formatCurrency(viewRecord.amount, viewRecord.currency), bold: true },
                { icon: <CheckCheck className="h-4 w-4 text-gray-400" />, label: "Paid On", value: viewRecord.paidAt ? formatDate(viewRecord.paidAt) : "Not paid" },
                { icon: <CreditCard className="h-4 w-4 text-gray-400" />, label: "Payment Method", value: viewRecord.paymentMethod ? viewRecord.paymentMethod.charAt(0).toUpperCase() + viewRecord.paymentMethod.slice(1) : "-" },
                { icon: <FileText className="h-4 w-4 text-gray-400" />, label: "Type", value: viewRecord.isServiceFee ? "Service Fee" : viewRecord.isAdjustment ? "Manual Adjustment" : "Monthly Due" },
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
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </a>
                </div>
              )}

              {/* Notes */}
              {viewRecord.notes && (
                <div className="pt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 font-semibold uppercase mb-1">Notes</p>
                  <p className="text-sm text-amber-900">{viewRecord.notes}</p>
                </div>
              )}
            </div>

            {/* Admin actions */}
            {actionError && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{actionError}</p>}
            {actionSuccess && <p className="text-sm text-green-700 bg-green-50 rounded p-2">{actionSuccess}</p>}

            {viewRecord.status !== "paid" && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Admin Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Select value={markPaidMethod} onValueChange={setMarkPaidMethod}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Notes (optional)"
                    value={markPaidNotes}
                    onChange={(e) => setMarkPaidNotes(e.target.value)}
                    className="flex-1 h-9 min-w-[120px]"
                  />
                  <Button
                    size="sm"
                    disabled={markingPaid}
                    onClick={handleMarkPaid}
                    className="h-9"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    {markingPaid ? "Saving…" : "Mark as Paid"}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { closeViewModal(); openAdjustModal(viewRecord); }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Adjustment for this Resident
                </Button>
              </div>
            )}

            {viewRecord.status === "paid" && (
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { closeViewModal(); openAdjustModal(viewRecord); }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Adjustment for this Resident
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal isOpen={showAdjustModal} onClose={closeAdjustModal} title="Add Manual Adjustment">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Creates a new payment record (e.g. outstanding charge or correction) for a resident with a description.
          </p>

          {actionError && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{actionError}</p>}
          {actionSuccess && <p className="text-sm text-green-700 bg-green-50 rounded p-2">{actionSuccess}</p>}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Resident ID *</label>
              <Input
                placeholder="Enter resident user ID"
                value={adjustResidentId}
                onChange={(e) => setAdjustResidentId(e.target.value)}
                type="number"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Amount (PKR) *</label>
              <Input
                placeholder="e.g. 500"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                type="number"
                min="1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Billing Month</label>
              <Input
                type="month"
                value={adjustMonth}
                onChange={(e) => setAdjustMonth(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Status</label>
              <Select value={adjustStatus} onValueChange={setAdjustStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending (still owed)</SelectItem>
                  <SelectItem value="paid">Paid (already collected)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Description / Reason *</label>
              <Input
                placeholder="e.g. Late fee correction, damage charge..."
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={closeAdjustModal} className="flex-1">Cancel</Button>
            <Button
              disabled={adjusting}
              onClick={handleAdjustSubmit}
              className="flex-1"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {adjusting ? "Saving…" : "Save Adjustment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
