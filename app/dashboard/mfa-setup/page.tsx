"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Smartphone, Key, CheckCircle2, Copy } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function MFASetupPage() {
  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)

  const setupMFA = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mfa/setup", { method: "POST" })
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep(2)
      toast.success("MFA setup initiated")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyMFA = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setStep(3)
      toast.success("MFA enabled successfully!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Backup codes copied!")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Multi-Factor Authentication</h2>
        <p className="text-muted-foreground">Add an extra layer of security to your account</p>
      </div>

      <div className="max-w-2xl">
        {step === 1 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Enable Two-Factor Authentication
              </CardTitle>
              <CardDescription>Protect your AuditX account with 2FA using an authenticator app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Step 1: Install Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Download Google Authenticator, Microsoft Authenticator, or Authy on your mobile device
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Step 2: Scan QR Code</p>
                    <p className="text-sm text-muted-foreground">
                      Use your authenticator app to scan the QR code we'll provide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Step 3: Verify</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your app to complete setup
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={setupMFA} disabled={loading} className="w-full">
                Begin Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Use your authenticator app to scan this QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {qrCode && (
                  <div className="p-4 bg-white rounded-lg">
                    <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input value={secret} readOnly className="font-mono" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(secret)
                      toast.success("Secret copied!")
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <Button onClick={verifyMFA} disabled={loading || verificationCode.length !== 6} className="w-full">
                Verify & Enable
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                MFA Enabled Successfully!
              </CardTitle>
              <CardDescription>Save your backup codes in a secure location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                  Important: Save these backup codes
                </p>
                <p className="text-sm text-muted-foreground">
                  Use these codes if you lose access to your authenticator app. Each code can only be used once.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Backup Codes</Label>
                  <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50 rounded-lg font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="p-2 bg-background rounded">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => (window.location.href = "/dashboard/settings")} className="w-full">
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
