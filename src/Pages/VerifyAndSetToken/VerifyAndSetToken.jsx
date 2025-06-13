import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Leaf,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { verifyEmail } from "@/services/auth";

const VerifyAndSetToken = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setErrors({
        token: "No verification token found. Please check your email link.",
      });
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmissionStatus(null);
    setStatusMessage("");

    if (!token) {
      setErrors({
        token: "No verification token found. Please check your email link.",
      });
      return;
    }

    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyEmail(token, { password: formData.password,confirmPassword:formData.confirm_password });

      if (result?.error) {
        setSubmissionStatus("error");
        setStatusMessage(result.error);
        return;
      }

      setSubmissionStatus("success");
      setStatusMessage(
        "Your email has been verified and password has been set successfully!"
      );
    } catch (error) {
      setSubmissionStatus("error");
      setStatusMessage(
        "Failed to verify email or set password. The token may be invalid or expired."
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#624DE3]/20 to-white p-4">
      <Card className="max-w-[420px] w-full border-none shadow-lg">
        <CardHeader className="space-y-6 pt-8 pb-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-[#624DE3]/20 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-[#624DE3]" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
            <p className="text-muted-foreground">
              Verify your email and set your password
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-8">
          {errors.token && (
            <Alert className="mb-6 bg-red-50 text-red-800 border-red-200 border">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{errors.token}</AlertDescription>
            </Alert>
          )}

          {submissionStatus && (
            <Alert
              className={`mb-6 w-full ${
                submissionStatus === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              } border`}
            >
              <div className="flex items-center gap-2">
                {submissionStatus === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="w-full">{statusMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-10 py-5 bg-gray-50 ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={isSubmitting || submissionStatus === "success"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting || submissionStatus === "success"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm_password"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="confirm_password"
                    placeholder="Confirm your password"
                    onChange={handleChange}
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-10 py-5 bg-gray-50 ${
                      errors.confirm_password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={isSubmitting || submissionStatus === "success"}
                  />
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">
                    {errors.confirm_password}
                  </p>
                )}
              </div>
            </div>

            {submissionStatus === "success" ? (
              <Button
                type="button"
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-medium"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </Button>
            ) : (
              <Button
                className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
                type="submit"
                disabled={
                  isSubmitting || !token || submissionStatus === "success"
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Verify & Set Password"
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyAndSetToken;
