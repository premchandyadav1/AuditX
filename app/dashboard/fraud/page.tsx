"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Copy,
  DollarSign,
  Users,
  FileX,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  Shield,
} from "lucide-react"

interface FraudAlert {
  id: string
  type: string
  vendor: string
  amount: string
  department: string
  riskLevel: "critical" | "high" | "medium" | "low"
  status: "active" | "investigating" | "resolved"
  detectedDate: string
  evidence: string[]
  aiExplanation: string
  invoiceNo?: string
}

const fraudAlerts: FraudAlert[] = [
  {
    id: "1",
    type: "Duplicate Invoice",
    vendor: "ABC Construction Ltd",
    amount: "₹2,45,000",
    department: "Ministry of Rural Development", // Updated department
    riskLevel: "critical",
    status: "active",
    detectedDate: "2024-01-15",
    invoiceNo: "INV-2024-789",
    evidence: [
      "Same invoice number submitted 3 times",
      "Identical line items and amounts",
      "Different submission dates: Jan 10, Jan 12, Jan 15",
    ],
    aiExplanation:
      "Pattern analysis detected that invoice INV-2024-789 has been submitted three times with identical line items totaling ₹2,45,000. This appears to be an attempt to claim duplicate payments for the same work.",
  },
  {
    id: "2",
    type: "Price Anomaly",
    vendor: "Tech Solutions Inc",
    amount: "₹8,92,000",
    department: "Ministry of Electronics & IT", // Updated department
    riskLevel: "high",
    status: "investigating",
    detectedDate: "2024-01-14",
    invoiceNo: "INV-2024-456",
    evidence: [
      "Price 230% above historical average",
      "No competitive bidding for amount >₹5L",
      "Vendor registered only 2 months ago",
    ],
    aiExplanation:
      "The quoted price for IT equipment exceeds historical procurement data by 230%. Additionally, the tender was awarded without competitive bidding despite exceeding the ₹5 lakh threshold requiring multiple bids.",
  },
  {
    id: "3",
    type: "Missing PO",
    vendor: "Office Supplies Co",
    amount: "₹45,000",
    department: "Ministry of Home Affairs", // Updated department
    riskLevel: "high",
    status: "active",
    detectedDate: "2024-01-13",
    invoiceNo: "INV-2024-123",
    evidence: ["Payment made without Purchase Order", "Amount exceeds ₹25,000 limit", "No approval signature found"],
    aiExplanation:
      "Policy requires Purchase Order for amounts exceeding ₹25,000. This payment of ₹45,000 was processed without a PO and lacks proper authorization signatures.",
  },
  {
    id: "4",
    type: "Fake Vendor",
    vendor: "XYZ Enterprises",
    amount: "₹3,20,000",
    department: "Ministry of Health & Family Welfare", // Updated department
    riskLevel: "critical",
    status: "active",
    detectedDate: "2024-01-12",
    evidence: [
      "GST number validation failed",
      "Registered address does not exist",
      "No digital footprint or previous transactions",
    ],
    aiExplanation:
      "Vendor verification failed. The GST number provided is invalid, and the registered business address does not exist. This appears to be a shell company created for fraudulent billing.",
  },
  {
    id: "5",
    type: "Overbilling",
    vendor: "Medical Equipment Ltd",
    amount: "₹12,50,000",
    department: "Ministry of Health & Family Welfare", // Updated department
    riskLevel: "medium",
    status: "investigating",
    detectedDate: "2024-01-11",
    invoiceNo: "INV-2024-987",
    evidence: ["Quantity billed: 150 units", "GRN received: 120 units", "Discrepancy: 30 units (₹2,50,000)"],
    aiExplanation:
      "Cross-verification between invoice and Goods Receipt Note (GRN) shows discrepancy. Vendor billed for 150 units but only 120 units were actually delivered and received.",
  },
]

const fraudStats = [
  { label: "Total Fraud Detected", value: "₹24.8Cr", icon: DollarSign, trend: "+12.5%" },
  { label: "Active Alerts", value: "28", icon: AlertTriangle, trend: "+5" },
  { label: "Ghost Vendors", value: "7", icon: Users, trend: "+2" },
  { label: "Duplicate Bills", value: "15", icon: Copy, trend: "+3" },
]

export default function FraudPage() {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all")

  const filteredAlerts = filter === "all" ? fraudAlerts : fraudAlerts.filter((alert) => alert.riskLevel === filter)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "high":
        return "bg-chart-5/10 text-chart-5 border-chart-5/30"
      case "medium":
        return "bg-chart-2/10 text-chart-2 border-chart-2/30"
      default:
        return "bg-chart-4/10 text-chart-4 border-chart-4/30"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Fraud & Anomalies</h1>
          <p className="text-muted-foreground">AI-detected suspicious activities with explainable evidence</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {fraudStats.map((stat) => (
            <Card key={stat.label} className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-destructive" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.trend}</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-foreground">Filter by Risk:</span>
          <div className="flex gap-2">
            {["all", "critical", "high", "medium"].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={filter === level ? "default" : "outline"}
                onClick={() => setFilter(level as any)}
                className={filter === level ? "holographic-gradient" : ""}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 bg-card/50 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/50 ${
                  selectedAlert?.id === alert.id ? "border-primary glow-blue" : "border-border/50"
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        alert.riskLevel === "critical" ? "bg-destructive/10" : "bg-chart-5/10"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${alert.riskLevel === "critical" ? "text-destructive" : "text-chart-5"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{alert.type}</h3>
                        <Badge className={getRiskColor(alert.riskLevel)}>{alert.riskLevel.toUpperCase()}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Vendor:</span> {alert.vendor}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span> {alert.amount}
                        </p>
                        <p>
                          <span className="font-medium">Department:</span> {alert.department}
                        </p>
                        {alert.invoiceNo && (
                          <p>
                            <span className="font-medium">Invoice:</span> {alert.invoiceNo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      selectedAlert?.id === alert.id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {selectedAlert?.id === alert.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        AI Explanation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-lg">
                        {alert.aiExplanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Evidence Trail</h4>
                      <ul className="space-y-2">
                        {alert.evidence.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button className="holographic-gradient glow-blue flex-1">Investigate Further</Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Mark as Resolved
                      </Button>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Fraud Types Breakdown */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Fraud Types</h3>
              <div className="space-y-3">
                {[
                  { type: "Duplicate Invoices", count: 8, percentage: 28 },
                  { type: "Price Anomalies", count: 6, percentage: 21 },
                  { type: "Missing PO/GRN", count: 5, percentage: 18 },
                  { type: "Fake Vendors", count: 4, percentage: 14 },
                  { type: "Overbilling", count: 3, percentage: 11 },
                  { type: "Other", count: 2, percentage: 8 },
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{item.type}</span>
                      <span className="text-sm font-medium text-foreground">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full holographic-gradient" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileX className="w-4 h-4 mr-2" />
                  Generate Fraud Report
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Trends
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Vendor Risk Analysis
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
