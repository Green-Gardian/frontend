"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Leaf, Lock, User, EyeOff, Eye, Terminal, ArrowLeft } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"

import Cookies from "js-cookie"

import { signInFunc, forgotPasswordFunc } from "@/services/auth"

const SignIn = () => {
  const [step, setStep] = useState(1) // Step 1: Email/Password, Step 2: TOTP
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    totpCode: "",
  })
  const [error, setError] = useState("")
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
    setError("") // Clear error when user types
    setShowResendVerification(false) // Hide resend option when user types
  }

  const handleResendVerification = async () => {
    if (!credentials.email) {
      setResendMessage("Please enter your email address first")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const res = await forgotPasswordFunc({ email: credentials.email })

      if (res.error) {
        setResendMessage(res.error)
      } else {
        setResendMessage(res.message || "Verification email sent successfully")
        setShowResendVerification(false)
      }
    } catch (err) {
      setResendMessage("Failed to send verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleStep1Submit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await signInFunc({
      email: credentials.email,
      password: credentials.password,
    })

    console.log('res : ',res)

    if (typeof res === "string") {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
      return
    }

    if (res && res.requiresMFASetup === true) {
      Cookies.set("access_token", res.access_token ? res.access_token : null)
      Cookies.set("refresh_token", res.refresh_token)
      Cookies.set("username", res.username)
      Cookies.set("user_role", res.role)
      Cookies.set("user_society_id", res.society_id)
      Cookies.set("society", res.society)
      const redirectPath =
        res.role === "super_admin" ? "/super-admin/settings?mfa_setup=true" : "/admin/settings?mfa_setup=true"
      window.location.href = redirectPath
      setIsLoading(false)
      return
    }

    if (res.role === "resident" || res.role === "driver") {
      setError("Access denied.")
      setIsLoading(false)
      return
    }

    if (res.error) {
      // Check if MFA is required - move to step 2
      if (res.requiresMFA || res.error.includes("TOTP code is required")) {
        setStep(2) // Move to step 2 for TOTP entry
        setError("")
        setIsLoading(false)
        return
      }

      setError(res.error)
      if (res.error.includes("verify your email")) {
        setShowResendVerification(true)
      }
      setIsLoading(false)
      return
    }

    // This should not happen if MFA is required, but just in case
    setIsLoading(false)
    completeSignIn(res)
  }

  const handleStep2Submit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!credentials.totpCode || credentials.totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      setIsLoading(false)
      return
    }

    const res = await signInFunc(credentials)

    if (typeof res === "string") {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
      return
    }

    if (res.error) {
      setError(res.error)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    completeSignIn(res)
  }

  const completeSignIn = (res) => {
    Cookies.set("access_token", res.access_token ? res.access_token : null)
    Cookies.set("refresh_token", res.refresh_token)
    Cookies.set("username", res.username)
    Cookies.set("user_role", res.role)
    Cookies.set("user_society_id", res.society_id)
    Cookies.set("society", res.society)

    // Redirect based on user role
    if (res.role === "super_admin") {
      window.location.href = "/super-admin/"
    } else {
      window.location.href = "/admin/"
    }
  }

  const handleBackToStep1 = () => {
    setStep(1)
    setCredentials({ ...credentials, totpCode: "" })
    setError("")
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
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Welcome Back" : "Verify Your Identity"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1 ? "Sign in to Green Guardian" : "Enter the 6-digit code from your authenticator app"}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <div className={`h-2 w-2 rounded-full ${step === 1 ? "bg-[#624DE3]" : "bg-gray-300"}`}></div>
              <div className={`h-2 w-2 rounded-full ${step === 2 ? "bg-[#624DE3]" : "bg-gray-300"}`}></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8">
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-4">
                {error && (
                  <Alert className="text-red-400 border-red-400">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                {resendMessage && (
                  <Alert
                    className={
                      resendMessage.includes("successfully")
                        ? "text-green-600 border-green-400"
                        : "text-red-400 border-red-400"
                    }
                  >
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
                      value={credentials.email}
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
                      value={credentials.password}
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

                <div className="flex items-center justify-end pt-2">
                  <a
                    className="text-sm font-medium text-[#624DE3]/80 hover:text-[#624DE3] hover:underline"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <Button
                className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-4">
                {error && (
                  <Alert className="text-red-400 border-red-400">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Open your authenticator app and enter the 6-digit code below to complete your login.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totpCode" className="text-sm font-medium">
                    Authentication Code
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Terminal size={18} />
                    </div>
                    <Input
                      id="totpCode"
                      placeholder="000000"
                      onChange={handleChange}
                      name="totpCode"
                      type="text"
                      maxLength={6}
                      value={credentials.totpCode}
                      inputMode="numeric"
                      className="pl-10 py-5 bg-gray-50 text-center text-2xl tracking-widest"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>

              <Button
                className="w-full py-6 bg-[#624DE3]/80 hover:bg-[#624DE3] text-white font-medium"
                type="submit"
                disabled={isLoading || credentials.totpCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                variant="outline"
                className="w-full py-6 flex items-center justify-center gap-2 bg-transparent"
                type="button"
                onClick={handleBackToStep1}
                disabled={isLoading}
              >
                <ArrowLeft size={18} />
                Back to Sign In
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn
