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
import { getSocieties } from "@/services/society";

const toDateInput = (iso) => (iso ? iso.split("T")[0] : "");

const mapVehicleToForm = (vehicle) => {
    if (!vehicle) return {
        plateNo: "", status: "", vehicleMake: "", vehicleModel: "",
        vehicleYear: "", color: "", vinNumber: "", engineNumber: "",
        vehicleType: "truck", capacity: "", capacityUnit: "cubic_meters", fuelType: "diesel",
        purchasedDate: "", purchasePrice: "",
        registrationDate: "", registrationExpiryDate: "",
        insuranceExpiryDate: "", fitnessCertificateExpiry: "",
        insuranceProvider: "", insurancePolicyNumber: "",
        odometerReading: "0", lastMaintenanceDate: "", nextMaintenanceDue: "",
        lastServiceOdometer: "", notes: "", societyId: "",
    };
    return {
        plateNo: vehicle.plate_no || "",
        status: vehicle.status || "",
        vehicleMake: vehicle.vehicle_make || "",
        vehicleModel: vehicle.vehicle_model || "",
        vehicleYear: vehicle.vehicle_year || "",
        color: vehicle.color || "",
        vinNumber: vehicle.vin_number || "",
        engineNumber: vehicle.engine_number || "",
        vehicleType: vehicle.vehicle_type || "truck",
        capacity: vehicle.capacity || "",
        capacityUnit: vehicle.capacity_unit || "cubic_meters",
        fuelType: vehicle.fuel_type || "diesel",
        purchasedDate: toDateInput(vehicle.purchased_date),
        purchasePrice: vehicle.purchase_price || "",
        registrationDate: toDateInput(vehicle.registration_date),
        registrationExpiryDate: toDateInput(vehicle.registration_expiry_date),
        insuranceExpiryDate: toDateInput(vehicle.insurance_expiry_date),
        fitnessCertificateExpiry: toDateInput(vehicle.fitness_certificate_expiry),
        insuranceProvider: vehicle.insurance_provider || "",
        insurancePolicyNumber: vehicle.insurance_policy_number || "",
        odometerReading: vehicle.odometer_reading ?? "0",
        lastMaintenanceDate: toDateInput(vehicle.last_maintenance_date),
        nextMaintenanceDue: toDateInput(vehicle.next_maintenance_due),
        lastServiceOdometer: vehicle.last_service_odometer || "",
        notes: vehicle.notes || "",
        societyId: vehicle.society_id ? String(vehicle.society_id) : "",
    };
};

const VehicleInventoryFormEnhanced = ({ onClose, onSubmit, vehicleToEdit = null }) => {
    const isEditMode = !!vehicleToEdit;

    // Lazy init: first render already has correct values — fixes Radix Select not showing pre-filled value
    const [formData, setFormData] = useState(() => mapVehicleToForm(vehicleToEdit));

    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [societies, setSocieties] = useState([]);

    useEffect(() => {
        getSocieties().then((res) => {
            if (!res.error) setSocieties(res.societies || res.data || []);
        });
    }, []);

    // Sync if vehicleToEdit reference changes (different vehicle opened)
    useEffect(() => {
        setFormData(mapVehicleToForm(vehicleToEdit));
    }, [vehicleToEdit]);

    const statuses = [
        { value: "available", label: "Available" },
        { value: "active", label: "Active" },
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

    // Which tab each field lives in — used to auto-navigate on error
    const fieldTabMap = {
        plateNo: "basic",
        status: "basic",
        societyId: "additional",
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.plateNo.trim()) {
            newErrors.plateNo = "Plate number is required";
        } else if (!/^[A-Z]{2,3}-\d{3,4}$/.test(formData.plateNo.toUpperCase())) {
            newErrors.plateNo = "Invalid plate number format (e.g., ABC-123)";
        }

        if (!formData.status) {
            newErrors.status = "Status is required";
        }

        if (!isEditMode && !formData.societyId) {
            newErrors.societyId = "Society is required — vehicle must be assigned to a society";
        }

        setErrors(newErrors);

        // Auto-switch to first tab that has an error
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            const targetTab = fieldTabMap[firstErrorField];
            if (targetTab) setActiveTab(targetTab);
        }

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
                societyId: "",
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
                {/* API error */}
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                {/* Validation error summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg" role="alert">
                        <p className="font-semibold mb-1">Please fix the following before submitting:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {Object.values(errors).map((msg, i) => (
                                <li key={i}>{msg}</li>
                            ))}
                        </ul>
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
                            <Label htmlFor="societyId">
                                Assign to Society {!isEditMode && <span className="text-red-500">*</span>}
                            </Label>
                            <Select
                                value={formData.societyId}
                                onValueChange={(value) => handleInputChange("societyId", value)}
                            >
                                <SelectTrigger className={errors.societyId ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select society" />
                                </SelectTrigger>
                                <SelectContent>
                                    {societies.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.society_name} — {s.city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.societyId && (
                                <p className="text-sm text-red-600">{errors.societyId}</p>
                            )}
                            {!errors.societyId && (
                                <p className="text-xs text-gray-500">
                                    Only this society's admins will see and assign this vehicle
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional notes about this vehicle..."
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                className="min-h-[120px]"
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
