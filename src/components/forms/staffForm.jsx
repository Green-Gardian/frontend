
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, User, Phone, Briefcase, CheckCircle, Mail, Loader2 } from "lucide-react"
import Cookies from "js-cookie"
import { getAvailableRoles, getSocieties } from "@/services/staff"

const StaffForm = ({ onClose, onSubmit, userRole: propUserRole }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    societyId: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [availableRoles, setAvailableRoles] = useState([])
  const [societies, setSocieties] = useState([])
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const role = propUserRole || Cookies.get("user_role") || ""
    setUserRole(role)
    
    // Get available roles based on current user's role
    const roles = getAvailableRoles(role)
    setAvailableRoles(roles)
    
    // Only super admin needs to fetch societies
    if (role === 'super_admin') {
      fetchSocieties()
    }
  }, [propUserRole])

  const fetchSocieties = async () => {
    try {
      const response = await getSocieties()
      setSocieties(response.societies || [])
    } catch (error) {
      console.error("Error fetching societies:", error)
    }
  }

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    if (userRole === 'super_admin' && formData.role !== "super_admin" && !formData.societyId) {
      newErrors.societyId = "Society is required for this role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateForm()
    if (!isValid) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        ...(userRole === 'super_admin' && formData.societyId && { societyId: formData.societyId }),
      }

      await onSubmit(submitData)
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        societyId: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      societyId: "",
    })
    setErrors({})
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-xl">
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
        {/* First Name Field */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={`w-full ${errors.firstName ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
        </div>

        {/* Last Name Field */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={`w-full ${errors.lastName ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full ${errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
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
              {availableRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
        </div>

        {/* Society Field - Only show for super admin when adding non-super admin roles */}
        {userRole === 'super_admin' && formData.role && formData.role !== "super_admin" && (
          <div className="space-y-2">
            <Label htmlFor="societyId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Society
            </Label>
            <Select 
              value={formData.societyId} 
              onValueChange={(value) => handleInputChange("societyId", value)}
            >
              <SelectTrigger className={`w-full ${errors.societyId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select a society" />
              </SelectTrigger>
              <SelectContent>
                {societies.map((society) => (
                  <SelectItem key={society.id} value={society.id.toString()}>
                    {society.society_name} - {society.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.societyId && <p className="text-sm text-red-600">{errors.societyId}</p>}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Staff...
              </>
            ) : (
              "Add Staff Member"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="flex-1" disabled={loading}>
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StaffForm
