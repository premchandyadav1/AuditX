"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, ExternalLink } from "lucide-react"

interface Transaction {
  id: string
  date: string
  department: string
  vendor: string
  amount: string
  invoiceNo: string
  poNo?: string
  grnNo?: string
  status: "clear" | "suspicious" | "non-compliant"
  riskScore: number
}

const transactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    department: "Ministry of Rural Development",
    vendor: "ABC Construction Ltd",
    amount: "₹2,45,000",
    invoiceNo: "INV-2024-789",
    poNo: "PO-2024-156",
    grnNo: "GRN-2024-892",
    status: "suspicious",
    riskScore: 85,
  },
  {
    id: "2",
    date: "2024-01-14",
    department: "Ministry of Electronics & IT",
    vendor: "Tech Solutions Inc",
    amount: "₹8,92,000",
    invoiceNo: "INV-2024-456",
    poNo: "PO-2024-245",
    status: "suspicious",
    riskScore: 78,
  },
  {
    id: "3",
    date: "2024-01-13",
    department: "Ministry of Home Affairs",
    vendor: "Office Supplies Co",
    amount: "₹45,000",
    invoiceNo: "INV-2024-123",
    status: "non-compliant",
    riskScore: 72,
  },
  {
    id: "4",
    date: "2024-01-12",
    department: "Ministry of Health & Family Welfare",
    vendor: "Medical Equipment Ltd",
    amount: "₹12,50,000",
    invoiceNo: "INV-2024-987",
    poNo: "PO-2024-389",
    grnNo: "GRN-2024-445",
    status: "clear",
    riskScore: 12,
  },
  {
    id: "5",
    date: "2024-01-11",
    department: "Ministry of Education",
    vendor: "Books & Supplies Inc",
    amount: "₹3,20,000",
    invoiceNo: "INV-2024-654",
    poNo: "PO-2024-198",
    grnNo: "GRN-2024-567",
    status: "clear",
    riskScore: 8,
  },
  {
    id: "6",
    date: "2024-01-10",
    department: "Ministry of Road Transport",
    vendor: "Vehicle Maintenance Co",
    amount: "₹1,85,000",
    invoiceNo: "INV-2024-321",
    poNo: "PO-2024-432",
    status: "clear",
    riskScore: 15,
  },
]

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "clear":
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">Clear</Badge>
      case "suspicious":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Suspicious</Badge>
      case "non-compliant":
        return <Badge className="bg-chart-5/10 text-chart-5 border-chart-5/30">Non-Compliant</Badge>
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive"
    if (score >= 40) return "text-chart-5"
    return "text-chart-4"
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
          <p className="text-muted-foreground">All financial transactions with AI risk scoring</p>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                onClick={() => setSelectedStatus("all")}
                className={selectedStatus === "all" ? "holographic-gradient" : ""}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === "suspicious" ? "default" : "outline"}
                onClick={() => setSelectedStatus("suspicious")}
                className={selectedStatus === "suspicious" ? "holographic-gradient" : ""}
              >
                Suspicious
              </Button>
              <Button
                variant={selectedStatus === "clear" ? "default" : "outline"}
                onClick={() => setSelectedStatus("clear")}
                className={selectedStatus === "clear" ? "holographic-gradient" : ""}
              >
                Clear
              </Button>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Department</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Vendor</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Invoice No</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Risk Score</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground">{transaction.date}</td>
                    <td className="p-4 text-sm text-foreground">{transaction.department}</td>
                    <td className="p-4 text-sm text-foreground font-medium">{transaction.vendor}</td>
                    <td className="p-4 text-sm text-foreground font-semibold">{transaction.amount}</td>
                    <td className="p-4 text-sm text-muted-foreground font-mono">{transaction.invoiceNo}</td>
                    <td className="p-4">{getStatusBadge(transaction.status)}</td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${getRiskColor(transaction.riskScore)}`}>
                        {transaction.riskScore}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-4 h-4" />
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
