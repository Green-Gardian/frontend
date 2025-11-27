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

const VehicleForm = ({ onClose, onSubmit, vehicleToEdit = null }) => {
  const isEditMode = !!vehicleToEdit;

  const [formData, setFormData] = useState({
    plateNo: "",
    driverId: "unassigned", // "unassigned" or driver.id as string
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setIsLoadingDrivers(true);
    try {
      const response = await getDrivers();
      if (response.error) {
        console.error("Error fetching drivers:", response.error);
        setDrivers([]);
      } else {
        // Transform drivers data for the select component
        const driversList =
          response.drivers?.map((driver) => ({
            value: String(driver.id), // use driver id so backend can receive driverId
            label: `${driver.first_name} ${driver.last_name} (${driver.username})`,
            id: driver.id,
            email: driver.email,
            phone: driver.phone_number,
          })) || [];

        // Add "Unassigned" option
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
        plateNo: vehicleToEdit.plate_no || "",
        driverId: initialDriverId,
        status: vehicleToEdit.status || "",
      });
    }
  }, [vehicleToEdit, drivers]);

  useEffect(() => {
    if (isEditMode) {
      console.log("Current form data:", formData);
    }
  }, [formData, isEditMode]);

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
      newErrors.plateNo =
        "Please enter a valid plate number format (e.g., ABC-123)";
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
          // Update existing vehicle
          res = await updateVehicle(vehicleToEdit.id, {
            plateNo: formData.plateNo,
            status: formData.status,
            driverId:
              formData.driverId === "unassigned"
                ? null
                : Number(formData.driverId),
          });
        } else {
          // Add new vehicle
          const selectedDriver =
            formData.driverId === "unassigned"
              ? null
              : drivers.find((d) => d.value === formData.driverId);

          res = await addVehicle({
            plateNo: formData.plateNo,
            // creation API still expects driverName (username)
            driverName: selectedDriver?.username || "",
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
        // You could add error handling here, like showing an error message
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    if (isEditMode) {
      // Reset to original values
      setFormData({
        plateNo: vehicleToEdit.plate_no || "",
        driverId: vehicleToEdit.user_id
          ? String(vehicleToEdit.user_id)
          : "unassigned",
        status: vehicleToEdit.status || "",
      });
    } else {
      // Clear form for new vehicle
      setFormData({
        plateNo: "",
        driverId: "unassigned",
        status: "",
      });
    }
    setErrors({});
  };

  const handlePlateNumberChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9-]/g, "");

    if (value.length === 3 && !value.includes("-")) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    } else if (
      value.length === 2 &&
      !value.includes("-") &&
      /\d/.test(value.charAt(2))
    ) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    }

    handleInputChange("plateNo", value);
  };

  return (
    <div className="w-full ">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
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
        {/* Vehicle Plate Number Field */}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">  
            {error}
          </div>
        )}

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
            placeholder="ABC-123"
            value={formData.plateNo}
            onChange={handlePlateNumberChange}
            disabled={isEditMode}
            className={`w-full ${
              errors.plateNo ? "border-red-500 focus:border-red-500" : ""
            }`}
            maxLength={8}
          />
          {errors.plateNo && (
            <p className="text-sm text-red-600">{errors.plateNo}</p>
          )}
          <p className="text-xs text-gray-500">Format: ABC-123 or AB-1234</p>
        </div>

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
              ? "Update Vehicle"
              : "Add Vehicle"}
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
