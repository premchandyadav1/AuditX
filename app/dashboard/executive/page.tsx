"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle2, Shield } from "lucide-react"

export default function ExecutiveDashboardPage() {
  const [stats, setStats] = useState({
    totalAudited: 0,
    fraudDetected: 0,
    recoveredAmount: 0,
    complianceScore: 0,
    trendData: [],
    departmentData: [],
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // Fetch key metrics
    const { data: transactions } = await supabase.from("transactions").select("amount")
    const { data: fraudCases } = await supabase.from("fraud_cases").select("estimated_loss, recovered_amount")
    const { data: violations } = await supabase.from("policy_violations").select("severity")

    const totalAudited = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const fraudDetected = fraudCases?.length || 0
    const recoveredAmount = fraudCases?.reduce((sum, f) => sum + Number(f.recovered_amount || 0), 0) || 0
    const complianceScore = violations ? Math.max(0, 100 - violations.length * 2) : 100

    setStats({
      totalAudited,
      fraudDetected,
      recoveredAmount,
      complianceScore,
      trendData: [],
      departmentData: [],
    })
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Executive Dashboard</h2>
        <p className="text-muted-foreground">High-level overview for leadership</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audited</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalAudited / 10000000).toFixed(2)}Cr</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              12% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fraudDetected}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              -8% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.recoveredAmount / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              23% recovery rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Excellent performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Fraud Detection Trend</CardTitle>
            <CardDescription>Number of cases detected per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart visualization will appear here
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Department Risk Distribution</CardTitle>
            <CardDescription>Risk levels across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart visualization will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
