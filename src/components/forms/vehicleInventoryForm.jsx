import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { X, Car, Hash, CheckCircle, Calendar, FileText, Wrench } from "lucide-react";

import {
    addVehicleToInventory,
    updateVehicleInventory
} from "@/services/superAdminVehicle";

const VehicleInventoryFormEnhanced = ({ onClose, onSubmit, vehicleToEdit = null }) => {
    const isEditMode = !!vehicleToEdit;

    const [formData, setFormData] = useState({
        // Basic Info
        plateNo: "",
        status: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        color: "",
        vinNumber: "",
        engineNumber: "",

        // Type & Capacity
        vehicleType: "truck",
        capacity: "",
        capacityUnit: "cubic_meters",
        fuelType: "diesel",

        // Purchase Info
        purchasedDate: "",
        purchasePrice: "",

        // Registration & Legal
        registrationDate: "",
        registrationExpiryDate: "",
        insuranceExpiryDate: "",
        fitnessCertificateExpiry: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",

        // Operational
        odometerReading: "0",
        lastMaintenanceDate: "",
        nextMaintenanceDue: "",
        lastServiceOdometer: "",

        // Additional
        notes: "",
    });

    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    useEffect(() => {
        if (vehicleToEdit) {
            setFormData({
                plateNo: vehicleToEdit.plate_no || "",
                status: vehicleToEdit.status || "",
                vehicleMake: vehicleToEdit.vehicle_make || "",
                vehicleModel: vehicleToEdit.vehicle_model || "",
                vehicleYear: vehicleToEdit.vehicle_year || "",
                color: vehicleToEdit.color || "",
                vinNumber: vehicleToEdit.vin_number || "",
                engineNumber: vehicleToEdit.engine_number || "",
                vehicleType: vehicleToEdit.vehicle_type || "truck",
                capacity: vehicleToEdit.capacity || "",
                capacityUnit: vehicleToEdit.capacity_unit || "cubic_meters",
                fuelType: vehicleToEdit.fuel_type || "diesel",
                purchasedDate: vehicleToEdit.purchased_date || "",
                purchasePrice: vehicleToEdit.purchase_price || "",
                registrationDate: vehicleToEdit.registration_date || "",
                registrationExpiryDate: vehicleToEdit.registration_expiry_date || "",
                insuranceExpiryDate: vehicleToEdit.insurance_expiry_date || "",
                fitnessCertificateExpiry: vehicleToEdit.fitness_certificate_expiry || "",
                insuranceProvider: vehicleToEdit.insurance_provider || "",
                insurancePolicyNumber: vehicleToEdit.insurance_policy_number || "",
                odometerReading: vehicleToEdit.odometer_reading || "0",
                lastMaintenanceDate: vehicleToEdit.last_maintenance_date || "",
                nextMaintenanceDue: vehicleToEdit.next_maintenance_due || "",
                lastServiceOdometer: vehicleToEdit.last_service_odometer || "",
                notes: vehicleToEdit.notes || "",
            });
        }
    }, [vehicleToEdit]);

    const statuses = [
        { value: "available", label: "Available" },
        { value: "maintenance", label: "Maintenance" },
        { value: "inactive", label: "Inactive" },
    ];

    const vehicleTypes = [
        { value: "truck", label: "Truck" },
        { value: "compactor", label: "Compactor Truck" },
        { value: "tipper", label: "Tipper Truck" },
        { value: "mini_truck", label: "Mini Truck" },
        { value: "garbage_truck", label: "Garbage Truck" },
    ];

    const fuelTypes = [
        { value: "diesel", label: "Diesel" },
        { value: "petrol", label: "Petrol" },
        { value: "electric", label: "Electric" },
        { value: "cng", label: "CNG" },
        { value: "hybrid", label: "Hybrid" },
    ];

    const capacityUnits = [
        { value: "cubic_meters", label: "Cubic Meters (m³)" },
        { value: "tons", label: "Tons" },
        { value: "gallons", label: "Gallons" },
    ];

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.plateNo.trim()) {
            newErrors.plateNo = "Vehicle plate number is required";
        } else if (!/^[A-Z]{2,3}-\d{3,4}$/.test(formData.plateNo.toUpperCase())) {
            newErrors.plateNo = "Please enter a valid plate number format (e.g., ABC-123)";
        }

        if (!formData.status) {
            newErrors.status = "Status is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setError("");
            setIsSubmitting(true);

            try {
                let res;
                if (isEditMode) {
                    res = await updateVehicleInventory(vehicleToEdit.id, formData);
                } else {
                    res = await addVehicleToInventory(formData);
                }

                if (res && typeof res === "object" && res.error) {
                    setError(res.error);
                    return;
                }

                if (typeof res === "string") {
                    setError(res);
                    return;
                }

                if (onSubmit) {
                    setError("");
                    onSubmit();
                }

                if (onClose) {
                    setError("");
                    onClose();
                }
            } catch (error) {
                console.error("Error saving vehicle:", error);
                setError(error.message || "Failed to save vehicle");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleReset = () => {
        if (isEditMode) {
            // Reset to original values - would need to re-populate from vehicleToEdit
        } else {
            setFormData({
                plateNo: "",
                status: "",
                vehicleMake: "",
                vehicleModel: "",
                vehicleYear: "",
                color: "",
                vinNumber: "",
                engineNumber: "",
                vehicleType: "truck",
                capacity: "",
                capacityUnit: "cubic_meters",
                fuelType: "diesel",
                purchasedDate: "",
                purchasePrice: "",
                registrationDate: "",
                registrationExpiryDate: "",
                insuranceExpiryDate: "",
                fitnessCertificateExpiry: "",
                insuranceProvider: "",
                insurancePolicyNumber: "",
                odometerReading: "0",
                lastMaintenanceDate: "",
                nextMaintenanceDue: "",
                lastServiceOdometer: "",
                notes: "",
            });
        }
        setErrors({});
        setError("");
    };

    const handlePlateNumberChange = (e) => {
        let value = e.target.value.toUpperCase();
        value = value.replace(/[^A-Z0-9-]/g, "");

        if (value.length === 3 && !value.includes("-")) {
            value = value.slice(0, 3) + "-" + value.slice(3);
        } else if (value.length === 2 && !value.includes("-") && /\d/.test(value.charAt(2))) {
            value = value.slice(0, 2) + "-" + value.slice(2);
        }

        handleInputChange("plateNo", value);
    };

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Edit Vehicle Details" : "Add Vehicle to Inventory"}
                    </h2>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="registration">Registration</TabsTrigger>
                        <TabsTrigger value="operational">Operational</TabsTrigger>
                        <TabsTrigger value="additional">Additional</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4 mt-4 min-h-[420px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plateNo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Plate Number *
                                </Label>
                                <Input
                                    id="plateNo"
                                    type="text"
                                    placeholder="ABC-123"
                                    value={formData.plateNo}
                                    onChange={handlePlateNumberChange}
                                    disabled={isEditMode}
                                    className={`w-full ${errors.plateNo ? "border-red-500" : ""}`}
                                    maxLength={8}
                                />
                                {errors.plateNo && <p className="text-sm text-red-600">{errors.plateNo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                    Status *
                                </Label>
                                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                    <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleMake">Make/Manufacturer</Label>
                                <Input
                                    id="vehicleMake"
                                    type="text"
                                    placeholder="e.g., Tata, Ashok Leyland"
                                    value={formData.vehicleMake}
                                    onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleModel">Model</Label>
                                <Input
                                    id="vehicleModel"
                                    type="text"
                                    placeholder="e.g., LPT 1613"
                                    value={formData.vehicleModel}
                                    onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleYear">Year</Label>
                                <Input
                                    id="vehicleYear"
                                    type="number"
                                    placeholder="e.g., 2023"
                                    value={formData.vehicleYear}
                                    onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input
                                    id="color"
                                    type="text"
                                    placeholder="e.g., White, Green"
                                    value={formData.color}
                                    onChange={(e) => handleInputChange("color", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vinNumber">VIN Number</Label>
                                <Input
                                    id="vinNumber"
                                    type="text"
                                    placeholder="17-character VIN"
                                    value={formData.vinNumber}
                                    onChange={(e) => handleInputChange("vinNumber", e.target.value.toUpperCase())}
                                    maxLength={17}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="engineNumber">Engine Number</Label>
                                <Input
                                    id="engineNumber"
                                    type="text"
                                    placeholder="Engine number"
                                    value={formData.engineNumber}
                                    onChange={(e) => handleInputChange("engineNumber", e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleType">Vehicle Type</Label>
                                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fuelType">Fuel Type</Label>
                                <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fuelTypes.map((fuel) => (
                                            <SelectItem key={fuel.value} value={fuel.value}>
                                                {fuel.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 5.5"
                                    value={formData.capacity}
                                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacityUnit">Capacity Unit</Label>
                                <Select value={formData.capacityUnit} onValueChange={(value) => handleInputChange("capacityUnit", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {capacityUnits.map((unit) => (
                                            <SelectItem key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Registration Tab */}
                    <TabsContent value="registration" className="space-y-4 mt-4 min-h-[420px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purchasedDate">Purchased Date</Label>
                                <Input
                                    id="purchasedDate"
                                    type="date"
                                    value={formData.purchasedDate}
                                    onChange={(e) => handleInputChange("purchasedDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purchasePrice">Purchase Price</Label>
                                <Input
                                    id="purchasePrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 2500000"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registrationDate">Registration Date</Label>
                                <Input
                                    id="registrationDate"
                                    type="date"
                                    value={formData.registrationDate}
                                    onChange={(e) => handleInputChange("registrationDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registrationExpiryDate">Registration Expiry</Label>
                                <Input
                                    id="registrationExpiryDate"
                                    type="date"
                                    value={formData.registrationExpiryDate}
                                    onChange={(e) => handleInputChange("registrationExpiryDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                                <Input
                                    id="insuranceProvider"
                                    type="text"
                                    placeholder="e.g., ICICI Lombard"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                                <Input
                                    id="insurancePolicyNumber"
                                    type="text"
                                    placeholder="Insurance policy number"
                                    value={formData.insurancePolicyNumber}
                                    onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="insuranceExpiryDate">Insurance Expiry</Label>
                                <Input
                                    id="insuranceExpiryDate"
                                    type="date"
                                    value={formData.insuranceExpiryDate}
                                    onChange={(e) => handleInputChange("insuranceExpiryDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fitnessCertificateExpiry">Fitness Expiry</Label>
                                <Input
                                    id="fitnessCertificateExpiry"
                                    type="date"
                                    value={formData.fitnessCertificateExpiry}
                                    onChange={(e) => handleInputChange("fitnessCertificateExpiry", e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Operational Tab */}
                    <TabsContent value="operational" className="space-y-4 mt-4 min-h-[420px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="odometerReading">Current Odometer (km)</Label>
                                <Input
                                    id="odometerReading"
                                    type="number"
                                    placeholder="e.g., 25000"
                                    value={formData.odometerReading}
                                    onChange={(e) => handleInputChange("odometerReading", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastServiceOdometer">Last Service Odometer (km)</Label>
                                <Input
                                    id="lastServiceOdometer"
                                    type="number"
                                    placeholder="e.g., 20000"
                                    value={formData.lastServiceOdometer}
                                    onChange={(e) => handleInputChange("lastServiceOdometer", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
                                <Input
                                    id="lastMaintenanceDate"
                                    type="date"
                                    value={formData.lastMaintenanceDate}
                                    onChange={(e) => handleInputChange("lastMaintenanceDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nextMaintenanceDue">Next Maintenance Due</Label>
                                <Input
                                    id="nextMaintenanceDue"
                                    type="date"
                                    value={formData.nextMaintenanceDue}
                                    onChange={(e) => handleInputChange("nextMaintenanceDue", e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Additional Tab */}
                    <TabsContent value="additional" className="space-y-4 mt-4 min-h-[420px]">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional notes about this vehicle..."
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                className="min-h-[150px]"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t">
                    <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : isEditMode ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isEditMode ? "Reset Changes" : "Reset Form"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default VehicleInventoryFormEnhanced;
