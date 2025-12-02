import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Leaf, Mail, ArrowLeft, CheckCircle, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { forgotPasswordFunc } from "@/services/auth";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const res = await forgotPasswordFunc({ email });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMessage(res.message || "If the email exists, a password reset link has been sent");
        setSuccess(true);
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
                Check Your Email
              </h1>
              <p className="text-muted-foreground">
                {successMessage.includes("verification") 
                  ? "We've sent a verification link to your email address"
                  : "We've sent a password reset link to your email address"
                }
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  {successMessage.includes("verification") 
                    ? `If an account with the email ${email} exists and is not verified, you will receive a verification link shortly.`
                    : `If an account with the email ${email} exists, you will receive a password reset link shortly.`
                  }
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {successMessage.includes("verification") 
                      ? "The verification link will expire in 24 hours for security purposes."
                      : "The reset link will expire in 1 hour for security purposes."
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  asChild
                  className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
                >
                  <Link to="/signin">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email?{" "}
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="text-[#624DE3] hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </div>
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
            <h1 className="text-2xl font-bold tracking-tight">Forgot Password?</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a reset link
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
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    placeholder="Enter your email address"
                    onChange={handleChange}
                    name="email"
                    type="email"
                    value={email}
                    className="pl-10 py-5 bg-gray-50"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
