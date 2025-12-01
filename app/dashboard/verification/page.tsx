"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, CheckCircle2, XCircle, AlertCircle, Search } from "lucide-react"
import { toast } from "sonner"

export default function VerificationPage() {
  const [verifying, setVerifying] = useState(false)
  const [gstNumber, setGstNumber] = useState("")
  const [panNumber, setPanNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  async function verifyGST() {
    setVerifying(true)
    // Simulate API call
    setTimeout(() => {
      toast.success("GST verification completed", {
        description: "Vendor is registered and active",
      })
      setVerifying(false)
    }, 2000)
  }

  async function verifyPAN() {
    setVerifying(true)
    setTimeout(() => {
      toast.success("PAN verification completed", {
        description: "Valid PAN number confirmed",
      })
      setVerifying(false)
    }, 2000)
  }

  async function verifyBankAccount() {
    setVerifying(true)
    setTimeout(() => {
      toast.success("Bank account verified", {
        description: "Account is active and matches vendor details",
      })
      setVerifying(false)
    }, 2000)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">External Verification</h1>
        <p className="text-muted-foreground">Verify vendors through government databases and banking APIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">243</div>
            <p className="text-xs text-muted-foreground">Successful verifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">12</div>
            <p className="text-xs text-muted-foreground">Failed verifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">5</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gst" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gst">GST Verification</TabsTrigger>
          <TabsTrigger value="pan">PAN Verification</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
          <TabsTrigger value="sanctions">Sanctions Check</TabsTrigger>
        </TabsList>

        <TabsContent value="gst">
          <Card>
            <CardHeader>
              <CardTitle>GST Number Verification</CardTitle>
              <CardDescription>Verify vendor GST registration with Government of India database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter GST Number (e.g., 29ABCDE1234F1Z5)"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={verifyGST} disabled={verifying || !gstNumber}>
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Verify
                </Button>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Recent Verifications
                </h3>
                <div className="space-y-2">
                  {[
                    { gst: "29ABCDE1234F1Z5", vendor: "Tech Solutions Pvt Ltd", status: "verified" },
                    { gst: "27XYZAB5678C2D9", vendor: "Global Supplies Inc", status: "verified" },
                    { gst: "19PQRST9012E3F4", vendor: "Construction Materials", status: "failed" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                      <div>
                        <p className="text-sm font-medium">{item.vendor}</p>
                        <p className="text-xs text-muted-foreground">{item.gst}</p>
                      </div>
                      <Badge variant={item.status === "verified" ? "default" : "destructive"}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pan">
          <Card>
            <CardHeader>
              <CardTitle>PAN Card Verification</CardTitle>
              <CardDescription>Verify PAN details with Income Tax Department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={verifyPAN} disabled={verifying || !panNumber}>
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Verification</CardTitle>
              <CardDescription>Verify vendor bank account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={verifyBankAccount} disabled={verifying || !accountNumber}>
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sanctions">
          <Card>
            <CardHeader>
              <CardTitle>Sanctions Watchlist Check</CardTitle>
              <CardDescription>Check vendor against global sanctions lists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-green-500/20 bg-green-500/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">All Clear</span>
                </div>
                <p className="text-sm text-muted-foreground">No matches found in sanctions databases</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Checked Against:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• UN Security Council Sanctions List</li>
                  <li>• OFAC Specially Designated Nationals</li>
                  <li>• EU Consolidated Financial Sanctions List</li>
                  <li>• UK HM Treasury Sanctions List</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
