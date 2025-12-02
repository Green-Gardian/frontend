import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, AlertTriangle } from "lucide-react";

const BlockVehicleModal = ({ vehicle, onClose, onConfirm }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError("Please provide a reason for blocking this vehicle");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await onConfirm(vehicle.id, reason);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to block vehicle");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Block Vehicle
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
                    <div
                        className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        You are about to block vehicle:{" "}
                        <span className="font-semibold text-gray-900">
                            {vehicle?.plate_no}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600">
                        This action will prevent the vehicle from being assigned to any driver.
                    </p>
                </div>

                {/* Reason Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="reason"
                        className="text-sm font-medium text-gray-700"
                    >
                        Reason for Blocking *
                    </Label>
                    <Textarea
                        id="reason"
                        placeholder="e.g., Vehicle involved in accident, Under repair, etc."
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                        className={`w-full min-h-[100px] ${error ? "border-red-500 focus:border-red-500" : ""
                            }`}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                        Please provide a detailed reason for blocking this vehicle
                    </p>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Blocking..." : "Block Vehicle"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BlockVehicleModal;
