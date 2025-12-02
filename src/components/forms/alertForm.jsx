import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, AlertTriangle, Clock, Send } from "lucide-react";
import Cookies from "js-cookie";

const AlertForm = ({ onClose, onSubmit, alertToEdit = null, alertTypes = [] }) => {
  const isEditMode = !!alertToEdit;
  const userSocietyId = Cookies.get("user_society_id");
  
  // Fallback: If no society_id in cookies, try to get it from JWT token
  const getSocietyIdFromToken = () => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.society_id || payload.societyId;
      } catch (error) {
        console.error("Error parsing JWT token:", error);
        return null;
      }
    }
    return null;
  };
  
  const societyId = userSocietyId || getSocietyIdFromToken();
  


  const [formData, setFormData] = useState({
    title: "",
    message: "",
    alertTypeId: "",
    priority: "medium",
    scheduledFor: "",
    expiresAt: "",
  });

  // Set default alert type if only one is available
  useEffect(() => {
    if (alertTypes && alertTypes.length === 1 && !formData.alertTypeId) {
      setFormData(prev => ({
        ...prev,
        alertTypeId: alertTypes[0].id.toString()
      }));
    }
  }, [alertTypes, formData.alertTypeId]);

  // Helper function to get current time in datetime-local format
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    // Add 1 minute to current time to ensure it's in the future
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  useEffect(() => {
    if (alertToEdit) {
      setFormData({
        title: alertToEdit.title || "",
        message: alertToEdit.message || "",
        alertTypeId: alertToEdit.alert_type_id?.toString() || "",
        priority: alertToEdit.priority || "medium",
        scheduledFor: alertToEdit.scheduled_for ? new Date(alertToEdit.scheduled_for).toISOString().slice(0, 16) : "",
        expiresAt: alertToEdit.expires_at ? new Date(alertToEdit.expires_at).toISOString().slice(0, 16) : "",
      });
      setIsScheduled(!!alertToEdit.scheduled_for);
    }
  }, [alertToEdit]);

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

    if (!formData.title.trim()) {
      newErrors.title = "Alert title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Alert message is required";
    }

    if (!formData.alertTypeId) {
      newErrors.alertTypeId = "Alert type is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!societyId) {
      newErrors.societyId = "Society ID is required. Please log in again.";
    }

         if (isScheduled) {
       if (!formData.scheduledFor) {
         newErrors.scheduledFor = "Scheduled time is required when scheduling is enabled";
       } else {
         const scheduledDate = new Date(formData.scheduledFor);
         if (isNaN(scheduledDate.getTime())) {
           newErrors.scheduledFor = "Please enter a valid date and time";
         } else {
           const now = new Date();
           if (scheduledDate <= now) {
             newErrors.scheduledFor = "Scheduled time must be in the future";
           }
         }
       }
     }

         if (formData.expiresAt && formData.scheduledFor) {
       const scheduledDate = new Date(formData.scheduledFor);
       const expiresDate = new Date(formData.expiresAt);
       
       if (isNaN(expiresDate.getTime())) {
         newErrors.expiresAt = "Please enter a valid expiry date and time";
       } else if (expiresDate <= scheduledDate) {
         newErrors.expiresAt = "Expiry time must be after scheduled time";
       }
     }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const submitData = {
          ...formData,
          societyId: parseInt(societyId),
          scheduledFor: isScheduled && formData.scheduledFor ? formData.scheduledFor : null,
          expiresAt: formData.expiresAt || null,
        };



        await onSubmit(submitData);
      } catch (error) {
        console.error("Error submitting alert:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <AlertTriangle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Alert Title *
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter alert title"
          className={`mt-1 ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
          Alert Message *
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Enter alert message"
          rows={3}
          className={`mt-1 ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      {/* Alert Type and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="alertTypeId" className="text-sm font-medium text-gray-700">
            Alert Type *
          </Label>
          <Select
            value={formData.alertTypeId}
            onValueChange={(value) => handleInputChange("alertTypeId", value)}
          >
            <SelectTrigger className={`mt-1 ${errors.alertTypeId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}>
              <SelectValue placeholder={alertTypes && alertTypes.length > 0 ? "Select alert type" : "Loading alert types..."} />
            </SelectTrigger>
                         <SelectContent>
               {alertTypes && alertTypes.length > 0 ? (
                alertTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  {alertTypes === null ? "Loading..." : "No alert types available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.alertTypeId && (
            <p className="mt-1 text-sm text-red-600">{errors.alertTypeId}</p>
          )}
          {alertTypes && alertTypes.length === 0 && (
            <p className="mt-1 text-sm text-yellow-600">
              No alert types configured. Please contact an administrator.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
            Priority *
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange("priority", value)}
          >
            <SelectTrigger className={`mt-1 ${errors.priority ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priority.value)}
                    {priority.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
        </div>
      </div>

      {/* Scheduling Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isScheduled"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isScheduled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule for later
          </Label>
        </div>

        {isScheduled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledFor" className="text-sm font-medium text-gray-700">
                  Scheduled For *
                </Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                  min={getCurrentDateTimeLocal()}
                  className={`mt-1 ${errors.scheduledFor ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.scheduledFor && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledFor}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expiresAt" className="text-sm font-medium text-gray-700">
                  Expires At
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                  min={formData.scheduledFor || getCurrentDateTimeLocal()}
                  className={`mt-1 ${errors.expiresAt ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.expiresAt && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiresAt}</p>
                )}
              </div>
            </div>
            
                         {/* Help text for scheduling */}
             <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
               <p className="font-medium mb-1">Scheduling Tips:</p>
               <ul className="space-y-1">
                 <li>• Scheduled time must be in the future</li>
                 <li>• Expiry time is optional but must be after scheduled time</li>
               </ul>
             </div>
          </div>
        )}
      </div>

             {/* Society ID Error */}
       {errors.societyId && (
         <div className="text-center py-4">
           <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
             {errors.societyId}
           </p>
         </div>
       )}

       {/* Action Buttons */}
       <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : isScheduled ? (
            <>
              <Clock className="h-4 w-4" />
              {isEditMode ? "Update Schedule" : "Schedule Alert"}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isEditMode ? "Update Alert" : "Send Alert"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AlertForm;
