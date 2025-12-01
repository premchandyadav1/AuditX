"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, BookCheck, Shield } from "lucide-react"

interface ComplianceRule {
  id: string
  name: string
  description: string
  category: string
  violations: number
  compliant: number
  total: number
}

const rules: ComplianceRule[] = [
  {
    id: "1",
    name: "Tender Bidding Requirement",
    description: "Tenders exceeding ₹5L must have minimum 3 competitive bids",
    category: "Procurement",
    violations: 6,
    compliant: 42,
    total: 48,
  },
  {
    id: "2",
    name: "GST Validation",
    description: "All vendor GST numbers must be validated against government database",
    category: "Tax Compliance",
    violations: 3,
    compliant: 139,
    total: 142,
  },
  {
    id: "3",
    name: "Purchase Order Mandatory",
    description: "Transactions exceeding ₹25,000 require approved Purchase Order",
    category: "Procurement",
    violations: 5,
    compliant: 218,
    total: 223,
  },
  {
    id: "4",
    name: "Blacklist Check",
    description: "Vendors must not be on government blacklist",
    category: "Vendor Management",
    violations: 2,
    compliant: 140,
    total: 142,
  },
  {
    id: "5",
    name: "Approved Procurement List",
    description: "Items must match department approved procurement categories",
    category: "Procurement",
    violations: 8,
    compliant: 215,
    total: 223,
  },
]

interface ViolationCase {
  id: string
  rule: string
  transaction: string
  vendor: string
  amount: string
  date: string
  aiExplanation: string
}

const violations: ViolationCase[] = [
  {
    id: "1",
    rule: "Tender Bidding Requirement",
    transaction: "INV-2024-456",
    vendor: "Tech Solutions Inc",
    amount: "₹8,92,000",
    date: "2024-01-14",
    aiExplanation:
      "Tender value ₹8.92L exceeds ₹5L threshold but only single bid received. Policy requires minimum 3 competitive bids for transparency.",
  },
  {
    id: "2",
    rule: "Purchase Order Mandatory",
    transaction: "INV-2024-123",
    vendor: "Office Supplies Co",
    amount: "₹45,000",
    date: "2024-01-13",
    aiExplanation:
      "Transaction amount ₹45,000 exceeds ₹25,000 limit but no Purchase Order found. Payment processed without proper authorization.",
  },
  {
    id: "3",
    rule: "GST Validation",
    transaction: "INV-2024-987",
    vendor: "XYZ Enterprises",
    amount: "₹3,20,000",
    date: "2024-01-12",
    aiExplanation:
      "GST number 29AABCU9603R1ZX failed validation against GSTN database. Vendor credentials appear fraudulent.",
  },
]

export default function CompliancePage() {
  const overallCompliance = Math.round(
    (rules.reduce((acc, r) => acc + r.compliant, 0) / rules.reduce((acc, r) => acc + r.total, 0)) * 100,
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Policy Compliance</h1>
          <p className="text-muted-foreground">AI-powered compliance monitoring and rule enforcement</p>
        </div>

        {/* Compliance Score */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center glow-blue">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{overallCompliance}%</div>
                  <div className="text-xs text-muted-foreground">Compliant</div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Overall Compliance Score</h2>
                <p className="text-muted-foreground">
                  {rules.reduce((acc, r) => acc + r.violations, 0)} active violations across {rules.length} policy rules
                </p>
              </div>
            </div>
            <Button className="holographic-gradient glow-blue">Generate Compliance Report</Button>
          </div>
        </Card>

        {/* Policy Rules */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Active Policy Rules</h3>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => {
                const complianceRate = Math.round((rule.compliant / rule.total) * 100)
                return (
                  <div key={rule.id} className="p-4 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{rule.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-foreground">{complianceRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-chart-4">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{rule.compliant} Compliant</span>
                      </div>
                      {rule.violations > 0 && (
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle className="w-4 h-4" />
                          <span>{rule.violations} Violations</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-4" style={{ width: `${complianceRate}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recent Violations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Recent Violations</h3>
            </div>

            <div className="space-y-4">
              {violations.map((violation) => (
                <div key={violation.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-start gap-3 mb-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{violation.rule}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Vendor: {violation.vendor}</p>
                        <p>
                          Amount: {violation.amount} • {violation.transaction}
                        </p>
                        <p className="text-xs">{violation.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs font-semibold text-primary">AI Explanation</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{violation.aiExplanation}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      Review Case
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Compliance by Department */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-6">Compliance by Department</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { dept: "Ministry of Health", score: 88, violations: 8 },
              { dept: "Ministry of Education", score: 94, violations: 3 },
              { dept: "Ministry of Defence", score: 97, violations: 2 },
              { dept: "Ministry of Rural Development", score: 91, violations: 5 },
            ].map((dept) => (
              <div key={dept.dept} className="p-4 rounded-lg border border-border/50 bg-background/50">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-foreground mb-1">{dept.score}%</div>
                  <div className="text-sm font-medium text-foreground">{dept.dept}</div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full holographic-gradient" style={{ width: `${dept.score}%` }} />
                </div>
                <div className="text-xs text-center text-muted-foreground">{dept.violations} violations</div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
