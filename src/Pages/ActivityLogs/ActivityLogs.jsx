import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InfoCards from "@/components/info-cards";

import { Loader2, Filter, Clock, Activity } from "lucide-react";

import { fetchActivityLogs, fetchActivityLogStats } from "@/redux/slices/activityLogsSlice";

const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { list, stats, loading, pagination } = useSelector((state) => state.activityLogs || {});

  const [username] = useState(() => Cookies.get("username") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("");

  const logs = useMemo(() => list || [], [list]);

  const cardsData = useMemo(() => {
    const source =
      stats?.data ||
      stats ||
      {};

    const total = source.total || 0;
    const past24h = source.past24h || source.last24Hours || 0;
    const uniqueTypes = Array.isArray(source.byType) ? source.byType.length : 0;
    const mostCommonType =
      Array.isArray(source.byType) && source.byType.length > 0
        ? source.byType.reduce((max, item) => (item.count > max.count ? item : max), source.byType[0]).activityType
        : "N/A";

    return [
      {
        title: "Total Activities",
        number: total.toString(),
        percentage: 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
      {
        title: "Last 24 Hours",
        number: past24h.toString(),
        percentage: 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Activity Types",
        number: uniqueTypes.toString(),
        percentage: 0,
        backgroundColor: "bg-[#E6F1FD]",
      },
      {
        title: "Most Common Type",
        number: mostCommonType,
        percentage: 0,
        backgroundColor: "bg-[#EDEEFC]",
      },
    ];
  }, [stats]);

  const fetchLogs = useCallback(
    async (pageOverride) => {
      const pageToUse = pageOverride || currentPage;
      const params = {
        page: pageToUse,
        limit: pagination?.limit || 10,
        search: searchTerm || undefined,
        activityType: activityTypeFilter || undefined,
      };
      await dispatch(fetchActivityLogs(params));
    },
    [dispatch, currentPage, pagination?.limit, searchTerm, activityTypeFilter]
  );

  const fetchStats = useCallback(async () => {
    await dispatch(fetchActivityLogStats({}));
  }, [dispatch]);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
      return;
    }
    fetchLogs(1);
    fetchStats();
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
    fetchLogs(1);
  }, [searchTerm, activityTypeFilter, fetchLogs]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLogs(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < (pagination?.totalPages || 1)) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination?.totalPages || 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const getActivityBadgeColor = (activityType) => {
    if (!activityType) return "bg-gray-100 text-gray-700";
    if (activityType.toLowerCase().includes("create")) return "bg-[#EBF9F1] text-[#1F9254]";
    if (activityType.toLowerCase().includes("update")) return "bg-[#FFF2E6] text-[#B54708]";
    if (activityType.toLowerCase().includes("delete")) return "bg-[#FBE7E8] text-[#A30D11]";
    return "bg-[#E6F1FD] text-[#1D4ED8]";
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px] flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <span>
          Activity Logs{" "}
          {username && (
            <span className="text-sm text-gray-500 font-normal">for {username}</span>
          )}
        </span>
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 py-3 gap-3">
        <div className="flex-1 w-full">
          <Input
            name="Search logs"
            placeholder="Search by description, user, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-[360px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border text-sm text-gray-700 bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
            >
              <option value="">All Activity Types</option>
              <option value="CREATED_STAFF">Created Staff</option>
              <option value="CREATED_RESIDENT">Created Resident</option>
              <option value="LOGIN">Login</option>
              <option value="SIGNED_OUT">Signed Out</option>
              <option value="UPDATED_PROFILE">Updated Profile</option>
              <option value="UPDATE_USER">Update User</option>
              <option value="BLOCK_USER">Block User</option>
              <option value="UPDATE_VEHICLE">Update Vehicle</option>
              <option value="UPDATE_DRIVER">Update Driver</option>
              <option value="UPDATE_TASK_STATUS">Update Task Status</option>
              <option value="UPDATE_DRIVER_LOCATION">Update Driver Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="min-w-[160px]">Sub-Admin</TableHead>
                  <TableHead className="min-w-[140px]">Activity Type</TableHead>
                  <TableHead className="min-w-[260px]">Description</TableHead>
                  <TableHead className="min-w-[140px] hidden md:table-cell">IP Address</TableHead>
                  <TableHead className="min-w-[160px] hidden lg:table-cell">User Agent</TableHead>
                  <TableHead className="min-w-[160px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading activity logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => (
                    <TableRow key={log.id || index} className={index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}>
                      <TableCell className="font-medium text-center">
                        #{log.id || index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {log.first_name || log.last_name
                              ? `${log.first_name || ""} ${log.last_name || ""}`.trim()
                              : log.username || "Unknown"}
                          </span>
                          {log.email && (
                            <span className="text-xs text-gray-500">{log.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActivityBadgeColor(log.activity_type)} text-xs`}>
                          {log.activity_type || "UNKNOWN"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-800 line-clamp-2">
                          {log.activity_description || log.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-gray-700">
                          {log.ip_address || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-gray-600 line-clamp-2">
                          {log.user_agent || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString()
                              : "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No activity logs found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination?.totalPages > 1 && (
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
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer  ${
                        currentPage === pageNum ? "bg-primary text-white" : "bg-white"
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </div>

              {/* Mobile: Show only current page */}
              <div className="sm:hidden flex items-center px-3 py-2 text-sm">
                {currentPage} / {pagination.totalPages}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={`cursor-pointer text-sm ${
                    currentPage === pagination.totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;


