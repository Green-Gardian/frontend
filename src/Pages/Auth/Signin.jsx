import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Leaf, Lock, User, EyeOff, Eye, Terminal } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import Cookies from "js-cookie";

import { signInFunc, forgotPasswordFunc } from "@/services/auth";

const SignIn = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
    setShowResendVerification(false); // Hide resend option when user types
  };

  const handleResendVerification = async () => {
    if (!credentials.email) {
      setResendMessage("Please enter your email address first");
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      const res = await forgotPasswordFunc({ email: credentials.email });
      
      if (res.error) {
        setResendMessage(res.error);
      } else {
        setResendMessage(res.message || "Verification email sent successfully");
        setShowResendVerification(false);
      }
    } catch (err) {
      setResendMessage("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signInFunc(credentials);

    if (res.error) {
      setError(res.error);
      // Show resend verification option if it's a verification error
      if (res.error.includes("verify your email")) {
        setShowResendVerification(true);
      }
      return;
    }

    //storing token in cookies
    Cookies.set("access_token", res.access_token ? res.access_token : null);
    Cookies.set("refresh_token", res.refresh_token);
    Cookies.set("username", res.username);
    Cookies.set("user_role", res.role);
    Cookies.set("user_society_id", res.society_id);
    
    // Redirect based on user role
    if (res.role === 'super_admin') {
      window.location.href = "/super-admin/";
    } else {
      window.location.href = "/admin/";
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
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to Green Guardian</p>
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

              {resendMessage && (
                <Alert className={resendMessage.includes("successfully") ? "text-green-600 border-green-400" : "text-red-400 border-red-400"}>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>{resendMessage}</AlertTitle>
                </Alert>
              )}

              {showResendVerification && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    Your email address is not verified. Click the button below to resend the verification email.
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    {isResending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    name="email"
                    type="email"
                    className="pl-10 py-5 bg-gray-50"
                  />
                </div>
              </div>

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
                    className="pl-10 py-5 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    className="text-green-600 border-gray-300"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <a
                  className="text-sm font-medium text-[#624DE3]/80 hover:text-[#624DE3]  hover:underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button
              className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
              type="submit"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
