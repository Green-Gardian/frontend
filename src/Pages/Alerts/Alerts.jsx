import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Bell, AlertTriangle, Clock, CheckCircle, XCircle, Edit, Trash2, Eye } from "lucide-react";
import Cookies from "js-cookie";
import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";
import AlertForm from "@/components/forms/alertForm";
import AlertNotificationContainer from "@/components/AlertNotification";
import { useAlertWebSocket } from "@/hooks/useWebSocket";
import { getAlerts, createAlert, updateAlert, cancelAlert, getAlertStats, getAlertTypes } from "@/services/alerts";

const Alerts = () => {
  const [username, setUsername] = useState("");
  const [alertRecords, setAlertRecords] = useState([]);
  const [alertTypes, setAlertTypes] = useState(null); // null means loading, [] means loaded but empty
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertToEdit, setAlertToEdit] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [cardValues, setCardValues] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });

  // Real-time WebSocket connection for alerts
  const { alerts: realTimeAlerts, removeAlert } = useAlertWebSocket();

  const cardsData = [
    {
      title: "Total Alerts",
      number: cardValues.total,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Pending",
      number: cardValues.pending,
      backgroundColor: "bg-[#FFF2E6]",
    },
    {
      title: "Sent",
      number: cardValues.sent,
      backgroundColor: "bg-[#E6F1FD]",
    },
    {
      title: "Failed",
      number: cardValues.failed,
      backgroundColor: "bg-[#FFE6E6]",
    },
  ];

  useEffect(() => {
    setUsername(Cookies.get("username"));
    fetchData();
    fetchAlertTypes();
  }, []);



  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getAlerts();
      console.log("Alerts API response:", res);
      const alerts = res?.data?.alerts || [];
      console.log("Extracted alerts:", alerts);
      setAlertRecords(alerts);
      await updateCardsData();
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlertRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

    const fetchAlertTypes = async () => {
    try {
      const res = await getAlertTypes();
      if (res?.success && res?.data) {
        setAlertTypes(res.data);
      } else {
        setAlertTypes([]);
      }
    } catch (error) {
      console.error("Error fetching alert types:", error);
      setAlertTypes([]);
    }
  };

  const updateCardsData = async () => {
    try {
      const stats = await getAlertStats();
      console.log("Stats API response:", stats);
      if (stats?.data?.overall) {
        const overall = stats.data.overall;
        console.log("Overall stats:", overall);
        setCardValues({
          total: parseInt(overall.total_alerts) || 0,
          pending: parseInt(overall.pending_alerts) || 0,
          sent: parseInt(overall.sent_alerts) || 0,
          failed: parseInt(overall.failed_alerts) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      await createAlert(alertData);
      setIsModalOpen(false);
      setAlertToEdit(null);
      fetchData();
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  };

  const handleUpdateAlert = async (alertData) => {
    try {
      await updateAlert(alertToEdit.id, alertData);
      setIsModalOpen(false);
      setAlertToEdit(null);
      fetchData();
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  };

  const handleCancelAlert = async (alertId) => {
    if (window.confirm("Are you sure you want to cancel this alert?")) {
      try {
        await cancelAlert(alertId);
        fetchData();
      } catch (error) {
        console.error("Error cancelling alert:", error);
      }
    }
  };

  const handleEdit = (alert) => {
    setAlertToEdit(alert);
    setIsModalOpen(true);
  };

  const handleView = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAlertToEdit(null);
    setSelectedAlert(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sent":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "sent":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alertRecords.filter((alert) =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Alert records state:", alertRecords);
  console.log("Filtered alerts:", filteredAlerts);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = filteredAlerts.slice(startIndex, endIndex);

  console.log("Pagination calculation:", {
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentAlertsLength: currentAlerts.length
  });

  console.log("Component render state:", { isLoading, alertRecordsLength: alertRecords.length });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
             {/* Real-time Alert Notifications */}
      {realTimeAlerts && realTimeAlerts.length > 0 && (
        <AlertNotificationContainer
          alerts={realTimeAlerts}
          onClose={removeAlert}
          onView={(alert) => {
            setSelectedAlert(alert);
            setIsModalOpen(true);
          }}
        />
      )}

      <div className="p-6 space-y-6 bg-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
            <p className="text-gray-600">Manage and monitor system alerts</p>
          </div>
                               <Button
            onClick={() => setIsModalOpen(true)}
            disabled={alertTypes === null || alertTypes.length === 0}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Alert
            {alertTypes === null && <span className="ml-2 text-xs">(Loading...)</span>}
            {alertTypes && alertTypes.length === 0 && <span className="ml-2 text-xs">(No Types)</span>}
          </Button>
        </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsData.map((card, index) => (
          <InfoCards
            key={index}
            title={card.title}
            number={card.number}
            backgroundColor={card.backgroundColor}
          />
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Title</TableHead>
              <TableHead className="font-semibold text-gray-900">Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Priority</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Scheduled For</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              currentAlerts.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {alert.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {alert.alert_type_name || "System"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(alert.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        {alert.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {alert.scheduled_for ? (
                      <div className="text-sm text-gray-600">
                        {new Date(alert.scheduled_for).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Immediate</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(alert)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(alert)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelAlert(alert.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-primary text-white" : "cursor-pointer"}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAlert ? "View Alert" : alertToEdit ? "Edit Alert" : "Create Alert"}
      >
        {selectedAlert ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900">{selectedAlert.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <p className="text-gray-900">{selectedAlert.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Badge className={getPriorityColor(selectedAlert.priority)}>
                  {selectedAlert.priority}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge className={getStatusColor(selectedAlert.status)}>
                  {selectedAlert.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
              <p className="text-gray-900">
                {selectedAlert.scheduled_for 
                  ? new Date(selectedAlert.scheduled_for).toLocaleString()
                  : "Immediate"
                }
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCloseModal} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : alertTypes === null ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading alert types...</p>
            </div>
          </div>
        ) : alertTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">No alert types are configured.</p>
            <p className="text-gray-600 text-sm">Please contact an administrator to set up alert types before creating alerts.</p>
          </div>
        ) : (
          <AlertForm
            alertToEdit={alertToEdit}
            alertTypes={alertTypes}
            onSubmit={alertToEdit ? handleUpdateAlert : handleCreateAlert}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
      </div>
    </>
  );
};

export default Alerts;
