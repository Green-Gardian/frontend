

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Car, Hash, User, CheckCircle } from "lucide-react"

import { addVehicle, updateVehicle } from "../../services/vehicle"

const VehicleForm = ({ onClose, onSubmit, vehicleToEdit = null }) => {
  const isEditMode = !!vehicleToEdit

  const [formData, setFormData] = useState({
    plateNo: "",
    driverName: "",
    status: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (vehicleToEdit) {
      const driverExists = drivers.some((driver) => driver.value === vehicleToEdit.driver_name)

      setFormData({
        plateNo: vehicleToEdit.plate_no || "",
        driverName: driverExists ? vehicleToEdit.driver_name : "",
        status: vehicleToEdit.status || "",
      })

    }
  }, [vehicleToEdit])

  useEffect(() => {
    if (isEditMode) {
      console.log("Current form data:", formData)
    }
  }, [formData, isEditMode])

  const drivers = [{ value: "driver_1", label: "Driver 1" }]

  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
  ]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.plateNo.trim()) {
      newErrors.plateNo = "Vehicle plate number is required"
    } else if (!/^[A-Z]{2,3}-\d{3,4}$/.test(formData.plateNo.toUpperCase())) {
      newErrors.plateNo = "Please enter a valid plate number format (e.g., ABC-123)"
    }

    if (!formData.driverName) {
      newErrors.driverName = "Assignment is required"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        if (isEditMode) {
          // Update existing vehicle
          await updateVehicle(vehicleToEdit.id, {
            plate_no: formData.plateNo,
            driver_name: formData.driverName,
            status: formData.status,
          })
        } else {
          // Add new vehicle
          await addVehicle({
            plateNo: formData.plateNo,
            driverName: formData.driverName,
            status: formData.status,
          })
        }

        // Call the onSubmit callback to refresh the vehicle list
        if (onSubmit) {
          onSubmit()
        }

        // Close the modal
        if (onClose) {
          onClose()
        }
      } catch (error) {
        console.error("Error saving vehicle:", error)
        // You could add error handling here, like showing an error message
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleReset = () => {
    if (isEditMode) {
      // Reset to original values
      setFormData({
        plateNo: vehicleToEdit.plate_no || "",
        driverName: vehicleToEdit.driver_name || "",
        status: vehicleToEdit.status || "",
      })
    } else {
      // Clear form for new vehicle
      setFormData({
        plateNo: "",
        driverName: "",
        status: "",
      })
    }
    setErrors({})
  }

  const handlePlateNumberChange = (e) => {
    let value = e.target.value.toUpperCase()
    value = value.replace(/[^A-Z0-9-]/g, "")

    if (value.length === 3 && !value.includes("-")) {
      value = value.slice(0, 3) + "-" + value.slice(3)
    } else if (value.length === 2 && !value.includes("-") && /\d/.test(value.charAt(2))) {
      value = value.slice(0, 2) + "-" + value.slice(2)
    }

    handleInputChange("plateNo", value)
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl mx-2">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? "Edit Vehicle" : "Add Vehicle"}</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Vehicle Plate Number Field */}
        <div className="space-y-2">
          <Label htmlFor="plateNo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
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
            className={`w-full ${errors.plateNo ? "border-red-500 focus:border-red-500" : ""}`}
            maxLength={8}
          />
          {errors.plateNo && <p className="text-sm text-red-600">{errors.plateNo}</p>}
          <p className="text-xs text-gray-500">Format: ABC-123 or AB-1234</p>
        </div>

        {/* Assigned To Field */}
        <div className="space-y-2">
          <Label htmlFor="driverName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Assigned To
          </Label>
          <Select
            value={formData.driverName}
            onValueChange={(value) => handleInputChange("driverName", value)}
            defaultValue={isEditMode ? vehicleToEdit.driver_name : ""}
          >
            <SelectTrigger className={`w-full ${errors.driverName ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select driver or unassigned">
                {formData.driverName
                  ? drivers.find((d) => d.value === formData.driverName)?.label || formData.driverName
                  : "Select driver or unassigned"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.value} value={driver.value}>
                  {driver.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.driverName && <p className="text-sm text-red-600">{errors.driverName}</p>}
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status
          </Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
            <SelectTrigger className={`w-full ${errors.status ? "border-red-500" : ""}`}>
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

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update Vehicle" : "Add Vehicle"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="flex-1" disabled={isSubmitting}>
            {isEditMode ? "Reset Changes" : "Reset Form"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VehicleForm
