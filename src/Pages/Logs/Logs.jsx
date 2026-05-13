import React, { useState, useEffect } from "react";
import { apiFetch } from "@/utils/apiClient";
import Cookies from "js-cookie";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Truck, Trash2, Calendar, MapPin, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";

const Logs = () => {
  const [activeTab, setActiveTab] = useState("bins");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = () => {
    if (activeTab === 'analytics') {
      fetchStats();
    } else {
      fetchLogs();
    }
  };

  const fetchStats = async () => {
    try {
      const BACKEND_URL = API_BASE_URL;
      const societyId = Cookies.get("society_id");

      const response = await apiFetch(`${BACKEND_URL}/logs/bins/stats?societyId=${societyId || ''}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const BACKEND_URL = API_BASE_URL;
      const endpoint = activeTab === "bins" ? `${BACKEND_URL}/logs/bins` : `${BACKEND_URL}/logs/tasks`;

      const response = await apiFetch(endpoint, { method: 'GET' });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-[#121212] text-[24px] leading-[32px] flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span>System Operations Logs</span>
        </h1>
        <button 
          onClick={() => { setLoading(true); fetchData(); }} 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("bins")}
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "bins"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Bin Updates
          </div>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "tasks"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Task Assignments
          </div>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "analytics"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Usage Analytics
          </div>
        </button>
      </div>

      <div className="rounded-md overflow-hidden bg-white shadow-sm border border-gray-100">
        {activeTab === 'analytics' ? (
           <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Bin Usage Statistics (Empty Cycles)</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin mr-2"/> Loading stats...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.map(stat => (
                    <div key={stat.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold text-gray-700">{stat.name}</span>
                         <Badge variant="outline">#{stat.id}</Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-primary">{stat.emptied_count}</span>
                        <span className="text-sm text-gray-500">Times Emptied</span>
                      </div>
                    </div>
                  ))}
                  {stats.length === 0 && <p className="text-gray-500">No stats available yet.</p>}
                </div>
              )}
           </div>
        ) : (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Time</TableHead>
                {activeTab === "bins" ? (
                  <>
                    <TableHead>Bin Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Description</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Details</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.recorded_at || log.created_at).toLocaleString()}
                    </TableCell>
                    
                    {activeTab === "bins" ? (
                      <>
                        <TableCell className="font-medium text-gray-900">{log.bin_name || `Bin #${log.bin_id}`}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${log.level === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                              ${log.level === 'Good' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              ${log.level === 'Info' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                            `}
                          >
                             {log.type || 'Update'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {log.description || 'No details'}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                           <Badge variant="outline" className="uppercase text-xs font-bold tracking-wider">
                              {log.event_type}
                           </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {log.driver_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {log.created_by_name || "System"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-gray-500" title={JSON.stringify(log.payload)}>
                          {JSON.stringify(log.payload)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No logs found.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
