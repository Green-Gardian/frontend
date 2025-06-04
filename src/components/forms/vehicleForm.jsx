import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Car, Hash, User, CheckCircle } from "lucide-react"

const VehicleForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    plateNumber: "",
    assignedTo: "",
    status: "",
  })

  const [errors, setErrors] = useState({})

  const drivers = [
    { value: "muhammad-hassan-amir", label: "Muhammad Hassan Amir" },
    { value: "ali-raza", label: "Ali Raza" },
    { value: "bilal-saeed", label: "Bilal Saeed" },
    { value: "usman-tariq", label: "Usman Tariq" },
    { value: "zain-ali", label: "Zain Ali" },
    { value: "imran-qureshi", label: "Imran Qureshi" },
    { value: "hamza-yousaf", label: "Hamza Yousaf" },
    { value: "ahmed-siddiqui", label: "Ahmed Siddiqui" },
    { value: "unassigned", label: "Unassigned" },
  ]

  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
    { value: "available", label: "Available" },
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

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Vehicle plate number is required"
    } else if (!/^[A-Z]{2,3}-\d{3,4}$/.test(formData.plateNumber.toUpperCase())) {
      newErrors.plateNumber = "Please enter a valid plate number format (e.g., ABC-123)"
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = "Assignment is required"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit && onSubmit(formData)
      // Reset form after successful submission
      setFormData({
        plateNumber: "",
        assignedTo: "",
        status: "",
      })
    }
  }

  const handleReset = () => {
    setFormData({
      plateNumber: "",
      assignedTo: "",
      status: "",
    })
    setErrors({})
  }

  const handlePlateNumberChange = (e) => {
    // Auto-format plate number as user types
    let value = e.target.value.toUpperCase()
    // Remove any characters that aren't letters, numbers, or hyphens
    value = value.replace(/[^A-Z0-9-]/g, '')
    
    // Auto-add hyphen after 2-3 letters
    if (value.length === 3 && !value.includes('-')) {
      value = value.slice(0, 3) + '-' + value.slice(3)
    } else if (value.length === 2 && !value.includes('-') && /\d/.test(value.charAt(2))) {
      value = value.slice(0, 2) + '-' + value.slice(2)
    }
    
    handleInputChange("plateNumber", value)
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl mx-2">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Add Vehicle</h2>
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
          <Label htmlFor="plateNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Vehicle Plate Number
          </Label>
          <Input
            id="plateNumber"
            type="text"
            placeholder="ABC-123"
            value={formData.plateNumber}
            onChange={handlePlateNumberChange}
            className={`w-full ${errors.plateNumber ? "border-red-500 focus:border-red-500" : ""}`}
            maxLength={8}
          />
          {errors.plateNumber && <p className="text-sm text-red-600">{errors.plateNumber}</p>}
          <p className="text-xs text-gray-500">Format: ABC-123 or AB-1234</p>
        </div>

        {/* Assigned To Field */}
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Assigned To
          </Label>
          <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
            <SelectTrigger className={`w-full ${errors.assignedTo ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select driver or unassigned" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.value} value={driver.value}>
                  {driver.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assignedTo && <p className="text-sm text-red-600">{errors.assignedTo}</p>}
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
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
            Add Vehicle
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VehicleForm