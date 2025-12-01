"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, AlertTriangle, CheckCircle2, Network } from "lucide-react"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"

const vendorData = [
  { name: "ABC Construction", transactions: 45, totalAmount: 245, riskScore: 85, status: "high-risk" },
  { name: "Tech Solutions", transactions: 32, totalAmount: 892, riskScore: 78, status: "high-risk" },
  { name: "Office Supplies Co", transactions: 28, totalAmount: 145, riskScore: 72, status: "medium-risk" },
  { name: "Medical Equipment", transactions: 15, totalAmount: 1250, riskScore: 12, status: "trusted" },
  { name: "Books & Supplies", transactions: 22, totalAmount: 320, riskScore: 8, status: "trusted" },
  { name: "Vehicle Maintenance", transactions: 18, totalAmount: 185, riskScore: 15, status: "trusted" },
  { name: "XYZ Enterprises", transactions: 3, totalAmount: 320, riskScore: 95, status: "blacklisted" },
]

const scatterData = vendorData.map((v) => ({
  x: v.transactions,
  y: v.totalAmount,
  riskScore: v.riskScore,
  name: v.name,
}))

export default function VendorsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "trusted":
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">Trusted</Badge>
      case "high-risk":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">High Risk</Badge>
      case "medium-risk":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">Medium Risk</Badge>
      case "blacklisted":
        return <Badge className="bg-destructive text-destructive-foreground">Blacklisted</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Analytics</h1>
          <p className="text-muted-foreground">Risk analysis and transaction patterns by vendor</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">142</div>
            <div className="text-sm text-muted-foreground">Total Vendors</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-destructive/30">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">7</div>
            <div className="text-sm text-muted-foreground">High Risk Vendors</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-chart-4/30">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-chart-4" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">118</div>
            <div className="text-sm text-muted-foreground">Trusted Vendors</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Network className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">Fraud Networks</div>
          </Card>
        </div>

        {/* Vendor Risk Scatter Plot */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">Vendor Risk Analysis</h3>
            <p className="text-sm text-muted-foreground">Transaction volume vs. total amount with risk scoring</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 252)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Transactions"
                stroke="oklch(0.65 0.02 252)"
                label={{ value: "Number of Transactions", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Amount (Lakhs)"
                stroke="oklch(0.65 0.02 252)"
                label={{ value: "Total Amount (₹ Lakhs)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "oklch(0.18 0.03 252)",
                  border: "1px solid oklch(0.28 0.04 252)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0.005 252)",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "x") return [`${value} transactions`, "Transactions"]
                  if (name === "y") return [`₹${value}L`, "Amount"]
                  return [value, name]
                }}
              />
              <Scatter data={scatterData} fill="oklch(0.58 0.18 252)">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.riskScore > 70 ? "oklch(0.58 0.22 25)" : "oklch(0.58 0.18 252)"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Vendor List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Vendor Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Vendor Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Transactions</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Total Amount</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Risk Score</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.map((vendor, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{vendor.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{vendor.transactions}</td>
                    <td className="p-4 text-sm text-foreground font-semibold">₹{vendor.totalAmount}L</td>
                    <td className="p-4">
                      <span
                        className={`text-sm font-bold ${
                          vendor.riskScore >= 70
                            ? "text-destructive"
                            : vendor.riskScore >= 40
                              ? "text-chart-5"
                              : "text-chart-4"
                        }`}
                      >
                        {vendor.riskScore}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(vendor.status)}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
