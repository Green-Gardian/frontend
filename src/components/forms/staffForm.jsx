"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, User, Phone, Briefcase, CheckCircle } from "lucide-react"

const StaffForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contactInfo: "",
    status: "",
  })

  const [errors, setErrors] = useState({})

  const roles = [
    { value: "driver", label: "Driver" },
    { value: "customer-support", label: "Customer Support" },
    
  ]

  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on-leave", label: "On Leave" },
    { value: "restricted", label: "Restricted" },
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = "Contact info is required"
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
        name: "",
        role: "",
        contactInfo: "",
        status: "",
      })
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      role: "",
      contactInfo: "",
      status: "",
    })
    setErrors({})
  }

  return (
    <div className="w-full max-w-md  bg-white rounded-lg shadow-xl mx-2">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Add Staff Member</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Role Field */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Role
          </Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
            <SelectTrigger className={`w-full ${errors.role ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
        </div>

        {/* Contact Info Field */}
        <div className="space-y-2">
          <Label htmlFor="contactInfo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Info
          </Label>
          <Input
            id="contactInfo"
            type="text"
            placeholder="Phone number or email"
            value={formData.contactInfo}
            onChange={(e) => handleInputChange("contactInfo", e.target.value)}
            className={`w-full ${errors.contactInfo ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.contactInfo && <p className="text-sm text-red-600">{errors.contactInfo}</p>}
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
            Add Staff Member
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StaffForm
