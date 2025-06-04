import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

const CustomerForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subscriptionPlan: "",
    customerStatus: "Active",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = () => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^03\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be in format 03XXXXXXXXX";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.subscriptionPlan) {
      newErrors.subscriptionPlan = "Subscription plan is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Customer Form Data:", formData);
      onSubmit();
      onClose();

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        subscriptionPlan: "",
        customerStatus: "Active",
        notes: "",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Customer
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="03XXXXXXXXX"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Subscription Plan */}
          <div className="space-y-2">
            <Label htmlFor="subscriptionPlan">
              Subscription Plan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.subscriptionPlan}
              onValueChange={(value) =>
                handleSelectChange("subscriptionPlan", value)
              }
            >
              <SelectTrigger
                className={errors.subscriptionPlan ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select subscription plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            {errors.subscriptionPlan && (
              <p className="text-sm text-red-500">{errors.subscriptionPlan}</p>
            )}
          </div>

          {/* Customer Status */}
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="customerStatus">Customer Status</Label>
            <Select
              value={formData.customerStatus}
              onValueChange={(value) =>
                handleSelectChange("customerStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Enter customer address"
            value={formData.address}
            onChange={handleInputChange}
            className={`min-h-[80px] ${errors.address ? "border-red-500" : ""}`}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Enter any additional notes about the customer"
            value={formData.notes}
            onChange={handleInputChange}
            className="min-h-[80px]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Add Customer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
