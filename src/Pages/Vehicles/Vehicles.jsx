import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import { Plus, SquarePen, Users } from "lucide-react";

import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";

import VehicleForm from "@/components/forms/vehicleForm";

import Cookies from "js-cookie";

import { fetchVehicles } from "@/redux/slices/vehicleSlice";
import { fetchDrivers } from "@/redux/slices/driverSlice";

const Vehicle = () => {
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const dispatch = useDispatch();
  const { vehicles: vehicleState, loading: vehiclesLoading } = useSelector(
    (state) => state.vehicles
  );
  const { drivers: driverState } = useSelector((state) => state.driver || {});

  const normalizeVehicles = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.vehicles)) return data.vehicles;
    if (Array.isArray(data?.data?.vehicles)) return data.data.vehicles;
    return [];
  }, []);

  const normalizeDrivers = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.drivers)) return data.drivers;
    if (Array.isArray(data?.data?.drivers)) return data.data.drivers;
    return [];
  }, []);

  const vehicleRecords = useMemo(
    () => normalizeVehicles(vehicleState),
    [normalizeVehicles, vehicleState]
  );

  const drivers = useMemo(
    () => normalizeDrivers(driverState),
    [normalizeDrivers, driverState]
  );

  const cardValues = useMemo(() => {
    const total = vehicleRecords.length;
    const active = vehicleRecords.filter(
      (v) => v.status?.toLowerCase() === "active"
    ).length;
    const maintenance = vehicleRecords.filter(
      (v) => v.status?.toLowerCase() === "maintenance"
    ).length;
    const available = vehicleRecords.filter(
      (v) => v.status?.toLowerCase() === "available"
    ).length;

    return { total, active, maintenance, available };
  }, [vehicleRecords]);

  const cardsData = [
    {
      title: "Total Vehicles",
      number: cardValues.total,
      percentage: 2.5,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Active Vehicles",
      number: cardValues.active,
      percentage: 4.2,
      backgroundColor: "bg-[#E6F1FD]",
    },
    {
      title: "In Maintenance",
      number: cardValues.maintenance,
      percentage: -1.8,
      backgroundColor: "bg-[#E6F1FD]",

    },
    {
      title: "Available",
      number: cardValues.available,
      percentage: 3.1,
      backgroundColor: "bg-[#EDEEFC]",
    },
  ];

  useEffect(() => {
    setUsername(Cookies.get("username"));
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
  }, [dispatch]);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  const handleRefreshVehicles = useCallback(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const itemsPerPage = 7;

  const filteredRecords =
    vehicleRecords && vehicleRecords.length > 0
      ? vehicleRecords.filter(
          (record) =>
            record.plate_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.driver_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            record.status?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

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

  const openModal = (vehicle = null) => {
    console.log("Opening modal with vehicle:", vehicle);
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
    console.log("Modal state set to true");
  };

  const onClose = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
  };

  const getDriverInfo = (driverName) => {
    if (!driverName || driverName === "unassigned")
      return { name: "Unassigned", status: "unassigned" };

    const driver = drivers.find((d) => d.username === driverName);
    if (driver) {
      return {
        name: `${driver.first_name} ${driver.last_name}`,
        username: driver.username,
        email: driver.email,
        status: driver.is_verified ? "verified" : "unverified",
      };
    }
    return { name: driverName, status: "unknown" };
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-[#EBF9F1] text-[#1F9254]";
      case "inactive":
        return "bg-[#FBE7E8] text-[#A30D11]";
      case "maintenance":
        return "bg-[#FFF2E6] text-[#B45309]";
      case "available":
        return "bg-[#E0F2FE] text-[#0369A1]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello,<span className="font-semibold">{username || "User"}</span>
      </h1>

      {/*Cards Section */}
      <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
        {cardsData.map((card, index) => (
          <InfoCards
            key={index}
            title={card.title}
            number={card.number}
            // percentage={card.percentage}
            backgroundColor={card.backgroundColor}
          />
        ))}
      </div>

      {/*Table Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center px-2 py-3 gap-3">
          <div className="w-full ">
            <Input
              name="Search bar"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-[300px] h-10 px-4 rounded-md border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors duration-200"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/admin/staff")}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Manage Drivers</span>
              <span className="sm:hidden">Drivers</span>
            </Button> */}

            <Button className="w-full sm:w-auto " onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Assign Vehicle</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">Vehicle Id</TableHead>
                  <TableHead className="min-w-[150px]">
                    Vehicle Plate Number
                  </TableHead>
                  <TableHead className="min-w-[180px] hidden sm:table-cell">
                    Assigned To
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Vehicle Status
                  </TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading vehicle data...
                    </TableCell>
                  </TableRow>
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        #{record.id || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{record.plate_no || "N/A"}</span>
                          <span className="text-xs text-gray-500 sm:hidden">
                            {getDriverInfo(record.driver_name).name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getDriverInfo(record.driver_name).name}
                          </span>
                          {record.driver_name && (
                            <span className="text-xs text-gray-500">
                              @{getDriverInfo(record.driver_name).username}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadgeStyle(
                            record.status
                          )} text-xs`}
                        >
                          {record.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-x-2 justify-start">
                          <SquarePen
                            className="h-4 w-4 cursor-pointer text-primary"
                            onClick={() => openModal(record)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchTerm
                        ? "No vehicle records found matching your search."
                        : "No vehicle records available. Add a vehicle to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!vehiclesLoading && totalPages > 1 && (
          <Pagination className="py-4">
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={`cursor-pointer text-sm ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>

              <div className="hidden sm:flex">
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer  ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
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
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={onClose}>
        <VehicleForm
          onClose={onClose}
          onSubmit={handleRefreshVehicles}
          vehicleToEdit={vehicleToEdit}
        />
      </Modal>
    </div>
  );
};

export default Vehicle;
