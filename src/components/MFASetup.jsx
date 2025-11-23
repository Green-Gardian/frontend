import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, QrCode, CheckCircle, XCircle, Loader2, KeyRound } from "lucide-react";
import { getMFAStatus, generateMFASecret, enableMFA, disableMFA } from "@/services/auth";

const MFASetup = () => {
  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    setLoading(true);
    const res = await getMFAStatus();
    if (!res.error) {
      setMfaStatus(res);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleGenerateSecret = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");
    const res = await generateMFASecret();
    
    if (res.error) {
      setError(res.error);
    } else {
      setQrCode(res.qrCode);
      setSecret(res.manualEntryKey);
      setShowSetup(true);
      setSuccess("QR code generated. Please scan it with your authenticator app.");
    }
    setGenerating(false);
  };

  const handleEnableMFA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a valid 6-digit TOTP code");
      return;
    }

    setEnabling(true);
    setError("");
    setSuccess("");
    
    const res = await enableMFA(totpCode);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("MFA enabled successfully!");
      setTotpCode("");
      setQrCode("");
      setSecret("");
      setShowSetup(false);
      fetchMFAStatus();
    }
    setEnabling(false);
  };

  const handleDisableMFA = async () => {
    if (!window.confirm("Are you sure you want to disable MFA? This will reduce your account security.")) {
      return;
    }

    setDisabling(true);
    setError("");
    setSuccess("");
    
    const res = await disableMFA();
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("MFA disabled successfully");
      fetchMFAStatus();
    }
    setDisabling(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#121212] flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Multi-Factor Authentication (MFA)</span>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Add an extra layer of security to your account with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="text-red-700 bg-red-50 border-red-200">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="text-green-700 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* MFA Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-[#121212] font-medium">MFA Status</h3>
            <p className="text-gray-600 text-sm">
              {mfaStatus?.mfaEnabled && mfaStatus?.hasSecret && mfaStatus?.mfaVerified ? (
                <span className="text-green-600">Enabled and Active</span>
              ) : mfaStatus?.mfaEnabled && !mfaStatus?.hasSecret ? (
                <span className="text-orange-600">Setup Required</span>
              ) : mfaStatus?.mfaEnabled && mfaStatus?.hasSecret && !mfaStatus?.mfaVerified ? (
                <span className="text-orange-600">Verification Pending</span>
              ) : (
                <span className="text-gray-500">Not Enabled</span>
              )}
            </p>
            {mfaStatus?.isRequired && (
              <p className="text-xs text-orange-600 mt-1">
                MFA is required for your role and cannot be disabled
              </p>
            )}
            {mfaStatus?.mfaEnabled && !mfaStatus?.hasSecret && (
              <p className="text-xs text-blue-600 mt-1">
                Please generate a QR code and complete the setup process
              </p>
            )}
          </div>
          <div className="flex items-center">
            {mfaStatus?.mfaEnabled && mfaStatus?.hasSecret && mfaStatus?.mfaVerified ? (
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            ) : mfaStatus?.mfaEnabled ? (
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            ) : (
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {(!mfaStatus?.mfaEnabled || (mfaStatus?.mfaEnabled && !mfaStatus?.hasSecret)) && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">How to set up MFA:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Generate QR Code" below</li>
              <li>Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Enter the 6-digit code from your app to verify and enable MFA</li>
            </ol>
          </div>
        )}

        {/* QR Code Setup */}
        {showSetup && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-[#121212]">Complete MFA Setup</h4>
            
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Scan this QR code with your authenticator app
                </p>
                
                {secret && (
                  <div className="w-full space-y-2">
                    <Label className="text-xs text-gray-600">Or enter this code manually:</Label>
                    <div className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200">
                      <KeyRound className="h-4 w-4 text-gray-400" />
                      <code className="text-sm font-mono text-gray-700 flex-1">{secret}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          setSuccess("Secret copied to clipboard!");
                          setTimeout(() => setSuccess(""), 2000);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="w-full space-y-2">
                  <Label htmlFor="totpCode" className="text-sm font-medium">
                    Enter verification code
                  </Label>
                  <Input
                    id="totpCode"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setTotpCode(value);
                    }}
                    maxLength={6}
                    className="text-center text-lg tracking-widest font-mono"
                    autoComplete="one-time-code"
                  />
                  <Button
                    onClick={handleEnableMFA}
                    disabled={enabling || totpCode.length !== 6}
                    className="w-full"
                  >
                    {enabling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify and Enable MFA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {!(mfaStatus?.mfaEnabled && mfaStatus?.hasSecret && mfaStatus?.mfaVerified) ? (
            <Button
              onClick={handleGenerateSecret}
              disabled={generating || (showSetup && qrCode)}
              className="flex items-center space-x-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>{qrCode ? "QR Code Generated" : "Generate QR Code"}</span>
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">MFA is Active</span>
              </div>
              {!mfaStatus?.isRequired && (
                <Button
                  onClick={handleDisableMFA}
                  disabled={disabling}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {disabling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Disabling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Disable MFA</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup;

