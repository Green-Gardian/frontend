import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Download, CreditCard, Home, Phone, Mail } from "lucide-react";
import * as XLSX from "xlsx";

const getStatusBadgeStyle = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (value === "paid") return "bg-[#EBF9F1] text-[#1F9254]";
  if (value === "overdue") return "bg-[#FBE7E8] text-[#A30D11]";
  if (value === "failed") return "bg-[#FEF3E2] text-[#B54708]";
  return "bg-[#E6F1FD] text-[#0369A1]";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB");
};

const formatMoney = (amount, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: String(currency || "PKR").toUpperCase(),
  }).format(Number(amount || 0));

const PaymentHistory = ({ resident, history = [], loading = false, onClose }) => {
  if (!resident) return null;

  const totalPaid = history
    .filter((p) => p.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const paidCount = history.filter((p) => p.status === "paid").length;
  const overdueCount = history.filter((p) => p.status === "overdue").length;

  const exportPaymentHistory = () => {
    const exportData = history.map((payment) => ({
      "Billing Month": payment.billingMonth,
      "Due Date": payment.dueDate,
      "Paid At": payment.paidAt || "-",
      Amount: payment.amount,
      Currency: payment.currency,
      Status: payment.status,
      "Payment Method": payment.paymentMethod || "-",
      "Checkout Session": payment.stripeCheckoutSessionId || "-",
      "Payment Intent": payment.stripePaymentIntentId || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resident Dues History");
    XLSX.writeFile(workbook, `${(resident.residentName || "resident").replace(/\s+/g, "_")}_Dues_History.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resident Dues History</h2>
          <p className="text-sm text-gray-500">{resident.houseNumber || "-"} - {resident.residentName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPaymentHistory} disabled={history.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">House</p>
                <p className="font-medium">{resident.houseNumber || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm">{resident.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{resident.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="font-medium">{formatMoney(totalPaid, history[0]?.currency || "PKR")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Paid Months</h3>
            <p className="text-2xl font-bold text-green-900">{paidCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Overdue Months</h3>
            <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Records</h3>
            <p className="text-2xl font-bold text-blue-900">{history.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Payment History</h3>

          {loading ? (
            <p className="text-sm text-gray-500">Loading payment history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500">No payment history found for this resident.</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid At</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Stripe Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.billingMonth}</TableCell>
                      <TableCell>{formatDate(payment.dueDate)}</TableCell>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{formatMoney(payment.amount, payment.currency)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeStyle(payment.status)}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell>{payment.paymentMethod || "-"}</TableCell>
                      <TableCell className="text-xs text-gray-600">{payment.stripeCheckoutSessionId || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
