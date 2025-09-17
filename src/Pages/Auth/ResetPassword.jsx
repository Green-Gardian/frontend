import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Leaf, Lock, EyeOff, Eye, CheckCircle, Terminal, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resetPasswordFunc } from "@/services/auth";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(""); // Clear error when user types
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError(""); // Clear error when user types
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!password || !confirmPassword) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await resetPasswordFunc(token, {
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#624DE3]/20 to-white p-4">
        <Card className="max-w-[420px] w-full border-none shadow-lg">
          <CardHeader className="space-y-6 pt-8 pb-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-green-600">
                Password Reset Successfully!
              </h1>
              <p className="text-muted-foreground">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  You will be redirected to the sign-in page in a few seconds.
                </p>
              </div>

              <Button
                asChild
                className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
              >
                <Link to="/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#624DE3]/20 to-white p-4">
        <Card className="max-w-[420px] w-full border-none shadow-lg">
          <CardHeader className="space-y-6 pt-8 pb-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <Terminal className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-red-600">
                Invalid Reset Link
              </h1>
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            <div className="space-y-6">
              <Alert className="text-red-400 border-red-400">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{error}</AlertTitle>
              </Alert>

              <Button
                asChild
                className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
              >
                <Link to="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {error && (
                <Alert className="text-red-400 border-red-400">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    placeholder="Enter your new password"
                    onChange={handlePasswordChange}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    className="pl-10 py-5 bg-gray-50"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    onChange={handleConfirmPasswordChange}
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    className="pl-10 py-5 bg-gray-50"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Password requirements:</strong>
                  <br />
                  • At least 6 characters long
                  <br />
                  • Both passwords must match
                </p>
              </div>
            </div>

            <Button
              className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-8">
          <div className="w-full text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="text-[#624DE3] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
