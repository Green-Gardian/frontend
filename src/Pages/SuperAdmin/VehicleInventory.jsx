import { useState, useEffect, useMemo, useCallback } from "react";
import Cookies from "js-cookie";

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

import { Plus, SquarePen, Lock, Unlock } from "lucide-react";

import InfoCards from "@/components/info-cards";
import Modal from "@/components/modal";

import VehicleInventoryForm from "@/components/forms/vehicleInventoryForm";
import BlockVehicleModal from "@/components/modals/blockVehicleModal";

import {
    getVehicleInventory,
    blockVehicle as blockVehicleAPI,
    unblockVehicle as unblockVehicleAPI
} from "@/services/superAdminVehicle";

const VehicleInventory = () => {
    const [username, setUsername] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState(null);
    const [vehicleToBlock, setVehicleToBlock] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);

    const vehicleRecords = useMemo(() => vehicles || [], [vehicles]);

    const cardValues = useMemo(() => {
        const total = vehicleRecords.length;
        const assigned = vehicleRecords.filter(v => v.user_id !== null).length;
        const available = vehicleRecords.filter(
            v => v.user_id === null && !v.is_blocked
        ).length;
        const blocked = vehicleRecords.filter(v => v.is_blocked === true).length;

        return { total, assigned, available, blocked };
    }, [vehicleRecords]);

    const cardsData = [
        {
            title: "Total Vehicles",
            number: cardValues.total,
            backgroundColor: "bg-[#EDEEFC]",
        },
        {
            title: "Assigned",
            number: cardValues.assigned,
            backgroundColor: "bg-[#E6F1FD]",
        },
        {
            title: "Available",
            number: cardValues.available,
            backgroundColor: "bg-[#EBF9F1]",
        },
        {
            title: "Blocked",
            number: cardValues.blocked,
            backgroundColor: "bg-[#FBE7E8]",
        },
    ];

    useEffect(() => {
        setUsername(Cookies.get("username"));
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (!Cookies.get("access_token")) {
            window.location.href = "/signin";
        }
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await getVehicleInventory();
            if (response && response.vehicles) {
                setVehicles(response.vehicles);
            }
        } catch (error) {
            console.error("Error fetching vehicle inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshVehicles = useCallback(() => {
        fetchVehicles();
    }, []);

    const handleBlockVehicle = (vehicle) => {
        setVehicleToBlock(vehicle);
        setIsBlockModalOpen(true);
    };

    const handleUnblockVehicle = async (vehicleId) => {
        if (!window.confirm("Are you sure you want to unblock this vehicle?")) {
            return;
        }

        try {
            await unblockVehicleAPI(vehicleId, { status: "available" });
            handleRefreshVehicles();
        } catch (error) {
            console.error("Error unblocking vehicle:", error);
            alert(error.message || "Failed to unblock vehicle");
        }
    };

    const confirmBlockVehicle = async (vehicleId, reason) => {
        try {
            await blockVehicleAPI(vehicleId, { reason });
            setIsBlockModalOpen(false);
            setVehicleToBlock(null);
            handleRefreshVehicles();
        } catch (error) {
            console.error("Error blocking vehicle:", error);
            throw error;
        }
    };

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
        setVehicleToEdit(vehicle);
        setIsModalOpen(true);
    };

    const onClose = () => {
        setIsModalOpen(false);
        setVehicleToEdit(null);
    };

    const onCloseBlockModal = () => {
        setIsBlockModalOpen(false);
        setVehicleToBlock(null);
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
            case "blocked":
                return "bg-[#FBE7E8] text-[#A30D11]";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
            <h1 className="text-[#121212] text-[24px] leading-[32px]">
                Vehicle Inventory Management
            </h1>

            {/*Cards Section */}
            <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
                {cardsData.map((card, index) => (
                    <InfoCards
                        key={index}
                        title={card.title}
                        number={card.number}
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
                        <Button className="w-full sm:w-auto " onClick={() => openModal()}>
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Add Vehicle</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                <div className="rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader className="bg-white border-none font-montserrat">
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="min-w-[150px]">
                                        Plate Number
                                    </TableHead>
                                    <TableHead className="min-w-[150px] hidden sm:table-cell">
                                        Assigned To
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">Status</TableHead>
                                    <TableHead className="min-w-[120px] hidden md:table-cell">
                                        Blocked Info
                                    </TableHead>
                                    <TableHead className="min-w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading vehicle inventory...
                                        </TableCell>
                                    </TableRow>
                                ) : currentRecords.length > 0 ? (
                                    currentRecords.map((record, index) => (
                                        <TableRow
                                            key={index}
                                            className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"
                                                }`}
                                        >
                                            <TableCell className="font-medium text-center">
                                                #{record.id || "N/A"}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{record.plate_no || "N/A"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {record.user_id ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {record.first_name && record.last_name
                                                                ? `${record.first_name} ${record.last_name}`
                                                                : record.driver_name || "Unknown"}
                                                        </span>
                                                        {record.username && (
                                                            <span className="text-xs text-gray-500">
                                                                @{record.username}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Unassigned</span>
                                                )}
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
                                            <TableCell className="hidden md:table-cell">
                                                {record.is_blocked ? (
                                                    <div className="flex flex-col text-xs">
                                                        <span className="text-red-600 font-medium">
                                                            Blocked
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {record.blocked_reason || "No reason provided"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 text-xs">Active</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-x-2 justify-start">
                                                    <SquarePen
                                                        className="h-4 w-4 cursor-pointer text-primary"
                                                        onClick={() => openModal(record)}
                                                        title="Edit vehicle"
                                                    />
                                                    {record.is_blocked ? (
                                                        <Unlock
                                                            className="h-4 w-4 cursor-pointer text-green-600"
                                                            onClick={() => handleUnblockVehicle(record.id)}
                                                            title="Unblock vehicle"
                                                        />
                                                    ) : (
                                                        <Lock
                                                            className="h-4 w-4 cursor-pointer text-orange-600"
                                                            onClick={() => handleBlockVehicle(record)}
                                                            title="Block vehicle"
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
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

                {!loading && totalPages > 1 && (
                    <Pagination className="py-4">
                        <PaginationContent className="flex-wrap gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={handlePrevious}
                                    className={`cursor-pointer text-sm ${currentPage === 1
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
                                            className={`cursor-pointer  ${currentPage === pageNum
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
                                    className={`cursor-pointer text-sm ${currentPage === totalPages
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
                <VehicleInventoryForm
                    onClose={onClose}
                    onSubmit={handleRefreshVehicles}
                    vehicleToEdit={vehicleToEdit}
                />
            </Modal>

            <Modal isOpen={isBlockModalOpen} onClose={onCloseBlockModal}>
                <BlockVehicleModal
                    vehicle={vehicleToBlock}
                    onClose={onCloseBlockModal}
                    onConfirm={confirmBlockVehicle}
                />
            </Modal>
        </div>
    );
};

export default VehicleInventory;
