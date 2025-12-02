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
import { X, Calculator } from "lucide-react";

const PaymentForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    houseNumber: "",
    residentName: "",
    email: "",
    phone: "",
    serviceType: "",
    monthlyFee: "",
    dueDate: "",
    paymentDate: "",
    paymentMethod: "",
    paymentStatus: "Pending",
    lateFee: "0",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const serviceRates = {
    Basic: 2000,
    Standard: 2500,
    Premium: 3000,
    "Premium Plus": 3500,
  };

  const handleInputChange = (e) => {
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

    // Calculate total when monthly fee or late fee changes
    if (name === "monthlyFee" || name === "lateFee") {
      calculateTotal(
        name === "monthlyFee" ? value : formData.monthlyFee,
        name === "lateFee" ? value : formData.lateFee
      );
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill monthly fee based on service type
    if (name === "serviceType" && serviceRates[value]) {
      const fee = serviceRates[value].toString();
      setFormData((prev) => ({
        ...prev,
        monthlyFee: fee,
      }));
      calculateTotal(fee, formData.lateFee);
    }

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const calculateTotal = (monthlyFee, lateFee) => {
    const fee = parseFloat(monthlyFee) || 0;
    const late = parseFloat(lateFee) || 0;
    setCalculatedTotal(fee + late);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = "House number is required";
    }

    if (!formData.residentName.trim()) {
      newErrors.residentName = "Resident name is required";
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

    if (!formData.serviceType) {
      newErrors.serviceType = "Service type is required";
    }

    if (!formData.monthlyFee.trim()) {
      newErrors.monthlyFee = "Monthly fee is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Payment Form Data:", {
        ...formData,
        totalAmount: calculatedTotal,
      });
      onSubmit();
      onClose();

      // Reset form
      setFormData({
        houseNumber: "",
        residentName: "",
        email: "",
        phone: "",
        serviceType: "",
        monthlyFee: "",
        dueDate: "",
        paymentDate: "",
        paymentMethod: "",
        paymentStatus: "Pending",
        lateFee: "0",
        notes: "",
      });
      setCalculatedTotal(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Payment Record
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
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Resident Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Resident Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">
                House Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="houseNumber"
                name="houseNumber"
                type="text"
                placeholder="e.g., A-101"
                value={formData.houseNumber}
                onChange={handleInputChange}
                className={errors.houseNumber ? "border-red-500" : ""}
              />
              {errors.houseNumber && (
                <p className="text-sm text-red-500">{errors.houseNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="residentName">
                Resident Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="residentName"
                name="residentName"
                type="text"
                placeholder="Enter resident name"
                value={formData.residentName}
                onChange={handleInputChange}
                className={errors.residentName ? "border-red-500" : ""}
              />
              {errors.residentName && (
                <p className="text-sm text-red-500">{errors.residentName}</p>
              )}
            </div>

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
          </div>
        </div>

        {/* Service & Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Service & Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">
                Service Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  handleSelectChange("serviceType", value)
                }
              >
                <SelectTrigger
                  className={errors.serviceType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
<<<<<<< HEAD
                  <SelectItem value="Basic">Basic (₹2,000)</SelectItem>
                  <SelectItem value="Standard">Standard (₹2,500)</SelectItem>
                  <SelectItem value="Premium">Premium (₹3,000)</SelectItem>
                  <SelectItem value="Premium Plus">
                    Premium Plus (₹3,500)
=======
                  <SelectItem value="Basic">Basic (Rs.2,000)</SelectItem>
                  <SelectItem value="Standard">Standard (Rs.2,500)</SelectItem>
                  <SelectItem value="Premium">Premium (Rs.3,000)</SelectItem>
                  <SelectItem value="Premium Plus">
                    Premium Plus (Rs.3,500)
>>>>>>> origin/main
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.serviceType && (
                <p className="text-sm text-red-500">{errors.serviceType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyFee">
<<<<<<< HEAD
                Monthly Fee (₹) <span className="text-red-500">*</span>
=======
                Monthly Fee (Rs.) <span className="text-red-500">*</span>
>>>>>>> origin/main
              </Label>
              <Input
                id="monthlyFee"
                name="monthlyFee"
                type="number"
                placeholder="Enter monthly fee"
                value={formData.monthlyFee}
                onChange={handleInputChange}
                className={errors.monthlyFee ? "border-red-500" : ""}
              />
              {errors.monthlyFee && (
                <p className="text-sm text-red-500">{errors.monthlyFee}</p>
              )}
            </div>

            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="lateFee">Late Fee (₹)</Label>
=======
              <Label htmlFor="lateFee">Late Fee (Rs.)</Label>
>>>>>>> origin/main
              <Input
                id="lateFee"
                name="lateFee"
                type="number"
                placeholder="Enter late fee"
                value={formData.lateFee}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleSelectChange("paymentMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Online">Online Payment</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) =>
                  handleSelectChange("paymentStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Paid Late">Paid Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Amount Display */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Total Amount
              </Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{calculatedTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Enter any additional notes about the payment"
            value={formData.notes}
            onChange={handleInputChange}
            className="min-h-[80px]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Add Payment Record
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
