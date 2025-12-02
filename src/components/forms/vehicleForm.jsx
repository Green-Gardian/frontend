import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Car, Hash, User, CheckCircle } from "lucide-react";

import { addVehicle, updateVehicle } from "../../services/vehicle";
import { getDrivers } from "../../services/driver";
import { getAvailableVehicles } from "../../services/superAdminVehicle";

const VehicleForm = ({ onClose, onSubmit, vehicleToEdit = null }) => {
  const isEditMode = !!vehicleToEdit;

  const [formData, setFormData] = useState({
    vehicleId: "", // For assignment from inventory
    plateNo: "",   // For display or legacy
    driverId: "unassigned",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Fetch drivers and available vehicles on component mount
  useEffect(() => {
    fetchDrivers();
    if (!isEditMode) {
      fetchAvailableVehicles();
    }
  }, [isEditMode]);

  const fetchDrivers = async () => {
    setIsLoadingDrivers(true);
    try {
      const response = await getDrivers();
      if (response.error) {
        console.error("Error fetching drivers:", response.error);
        setDrivers([]);
      } else {
        const driversList =
          response.drivers?.map((driver) => ({
            value: String(driver.id),
            label: `${driver.first_name} ${driver.last_name} (${driver.username})`,
            id: driver.id,
            email: driver.email,
            phone: driver.phone_number,
          })) || [];

        driversList.unshift({ value: "unassigned", label: "Unassigned", id: null });
        setDrivers(driversList);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([{ value: "unassigned", label: "Unassigned" }]);
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await getAvailableVehicles();
      if (response && response.vehicles) {
        const vehiclesList = response.vehicles.map((vehicle) => ({
          value: String(vehicle.id),
          label: vehicle.plate_no,
          id: vehicle.id,
          plateNo: vehicle.plate_no,
          status: vehicle.status,
        }));
        setAvailableVehicles(vehiclesList);
      }
    } catch (error) {
      console.error("Error fetching available vehicles:", error);
      setAvailableVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (vehicleToEdit && drivers.length > 0) {
      let initialDriverId = "unassigned";

      if (vehicleToEdit.user_id) {
        const driverIdStr = String(vehicleToEdit.user_id);
        const driverExists = drivers.some(
          (driver) => driver.value === driverIdStr
        );
        initialDriverId = driverExists ? driverIdStr : "unassigned";
      }

      setFormData({
        vehicleId: String(vehicleToEdit.id) || "",
        plateNo: vehicleToEdit.plate_no || "",
        driverId: initialDriverId,
        status: vehicleToEdit.status || "",
      });
    }
  }, [vehicleToEdit, drivers]);

  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
    { value: "available", label: "Available" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If vehicle is selected, auto-populate plate number
    if (field === "vehicleId" && value !== "") {
      const selectedVehicle = availableVehicles.find((v) => v.value === value);
      if (selectedVehicle) {
        setFormData((prev) => ({
          ...prev,
          plateNo: selectedVehicle.plateNo,
          status: selectedVehicle.status,
        }));
      }
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isEditMode) {
      // For new assignment, vehicle selection is required
      if (!formData.vehicleId || formData.vehicleId === "") {
        newErrors.vehicleId = "Please select a vehicle from inventory";
      }
    }

    // Driver assignment is optional - can be unassigned
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
          // Update existing vehicle assignment
          res = await updateVehicle(vehicleToEdit.id, {
            plateNo: formData.plateNo,
            status: formData.status,
            driverId:
              formData.driverId === "unassigned"
                ? null
                : Number(formData.driverId),
          });
        } else {
          // Assign vehicle from inventory to driver
          res = await addVehicle({
            vehicleId: Number(formData.vehicleId),
            driverId:
              formData.driverId === "unassigned"
                ? null
                : Number(formData.driverId),
            status: formData.status,
          });
        }

        // Handle error responses from service layer
        if (res && typeof res === "object" && res.error) {
          setError(res.error);
          return;
        }

        // Optional string error from service
        if (typeof res === "string") {
          setError(res);
          return;
        }

        // Call the onSubmit callback to refresh the vehicle list
        if (onSubmit) {
          setError("");
          onSubmit();
        }

        // Close the modal
        if (onClose) {
          setError("");
          onClose();
        }
      } catch (error) {
        console.error("Error saving vehicle:", error);
        setError(error.message || "Failed to save vehicle assignment");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    if (isEditMode) {
      // Reset to original values
      setFormData({
        vehicleId: String(vehicleToEdit.id) || "",
        plateNo: vehicleToEdit.plate_no || "",
        driverId: vehicleToEdit.user_id
          ? String(vehicleToEdit.user_id)
          : "unassigned",
        status: vehicleToEdit.status || "",
      });
    } else {
      // Clear form for new vehicle
      setFormData({
        vehicleId: "",
        plateNo: "",
        driverId: "unassigned",
        status: "",
      });
    }
    setErrors({});
    setError("");
  };

  return (
    <div className="w-full ">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Vehicle Assignment" : "Assign Vehicle"}
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
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {/* Vehicle Selection Field (Only for new assignment) */}
        {!isEditMode && (
          <div className="space-y-2">
            <Label
              htmlFor="vehicleId"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Hash className="h-4 w-4" />
              Select Vehicle from Inventory
            </Label>
            <Select
              value={formData.vehicleId}
              onValueChange={(value) => handleInputChange("vehicleId", value)}
              disabled={isLoadingVehicles}
            >
              <SelectTrigger
                className={`w-full ${errors.vehicleId ? "border-red-500" : ""}`}
              >
                <SelectValue
                  placeholder={
                    isLoadingVehicles
                      ? "Loading vehicles..."
                      : "Select a vehicle"
                  }
                >
                  {isLoadingVehicles
                    ? "Loading vehicles..."
                    : formData.vehicleId
                      ? availableVehicles.find((v) => v.value === formData.vehicleId)?.label ||
                      "Select a vehicle"
                      : "Select a vehicle"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {isLoadingVehicles ? (
                  <SelectItem value="loading" disabled>
                    Loading vehicles...
                  </SelectItem>
                ) : availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.value} value={vehicle.value}>
                      {vehicle.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-vehicles" disabled>
                    No available vehicles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.vehicleId && (
              <p className="text-sm text-red-600">{errors.vehicleId}</p>
            )}
            <p className="text-xs text-gray-500">
              Select a vehicle from the inventory to assign to a driver
            </p>
          </div>
        )}

        {/* Vehicle Plate Number Display (For edit mode or after selection) */}
        {(isEditMode || formData.plateNo) && (
          <div className="space-y-2">
            <Label
              htmlFor="plateNo"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Hash className="h-4 w-4" />
              Vehicle Plate Number
            </Label>
            <Input
              id="plateNo"
              type="text"
              value={formData.plateNo}
              disabled
              className="w-full bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              {isEditMode
                ? "Plate number cannot be changed"
                : "Auto-filled from selected vehicle"}
            </p>
          </div>
        )}

        {/* Assigned To Field */}
        <div className="space-y-2">
          <Label
            htmlFor="driverId"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Assigned To Driver
          </Label>
          <Select
            value={isLoadingDrivers ? undefined : formData.driverId}
            onValueChange={(value) => handleInputChange("driverId", value)}
            disabled={isLoadingDrivers}
          >
            <SelectTrigger
              className={`w-full ${errors.driverId ? "border-red-500" : ""}`}
            >
              <SelectValue
                placeholder={
                  isLoadingDrivers
                    ? "Loading drivers..."
                    : "Select driver or leave unassigned"
                }
              >
                {isLoadingDrivers
                  ? "Loading drivers..."
                  : formData.driverId
                    ? drivers.find((d) => d.value === formData.driverId)?.label ||
                    "Select driver or leave unassigned"
                    : "Select driver or leave unassigned"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {isLoadingDrivers ? (
                <SelectItem value="loading" disabled>
                  Loading drivers...
                </SelectItem>
              ) : (
                drivers.map((driver) => (
                  <SelectItem key={driver.value} value={driver.value}>
                    {driver.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.driverName && (
            <p className="text-sm text-red-600">{errors.driverName}</p>
          )}
          <p className="text-xs text-gray-500">
            Leave unassigned if no driver is assigned to this vehicle
          </p>
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <Label
            htmlFor="status"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger
              className={`w-full ${errors.status ? "border-red-500" : ""}`}
            >
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
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Assignment"
                : "Assign Vehicle"}
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

export default VehicleForm;
