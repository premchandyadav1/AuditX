"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Network, AlertCircle, Users, Zap } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function NetworkAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [networkData, setNetworkData] = useState<any>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadNetworkData()
  }, [])

  async function loadNetworkData() {
    try {
      // Fetch vendors, transactions, and relationships
      const { data: vendors } = await supabase
        .from("vendors")
        .select("*")
        .order("risk_score", { ascending: false })
        .limit(20)

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, vendors(*)")
        .order("created_at", { ascending: false })
        .limit(100)

      // Build network connections
      const connections = buildNetworkConnections(vendors || [], transactions || [])

      setNetworkData(connections)
    } catch (error) {
      console.error("Error loading network data:", error)
    } finally {
      setLoading(false)
    }
  }

  function buildNetworkConnections(vendors: any[], transactions: any[]) {
    const nodes = []
    const edges = []
    const clusters = new Map()

    // Add vendor nodes
    vendors.forEach((vendor) => {
      nodes.push({
        id: vendor.id,
        label: vendor.name,
        type: "vendor",
        riskScore: vendor.risk_score,
        totalAmount: vendor.total_amount,
      })
    })

    // Build department clusters
    transactions.forEach((tx) => {
      if (!clusters.has(tx.department)) {
        clusters.set(tx.department, {
          transactions: [],
          totalAmount: 0,
          vendors: new Set(),
        })
      }
      const cluster = clusters.get(tx.department)
      cluster.transactions.push(tx)
      cluster.totalAmount += Number.parseFloat(tx.amount)
      if (tx.vendor_id) cluster.vendors.add(tx.vendor_id)
    })

    // Detect suspicious patterns
    const suspiciousPatterns = detectSuspiciousPatterns(transactions, vendors)

    return {
      nodes,
      edges,
      clusters: Array.from(clusters.entries()),
      suspiciousPatterns,
      stats: {
        totalVendors: vendors.length,
        totalTransactions: transactions.length,
        highRiskConnections: suspiciousPatterns.length,
      },
    }
  }

  function detectSuspiciousPatterns(transactions: any[], vendors: any[]) {
    const patterns = []

    // Pattern 1: Same vendor multiple departments same day
    const vendorDayMap = new Map()
    transactions.forEach((tx) => {
      const key = `${tx.vendor_id}-${tx.transaction_date}`
      if (!vendorDayMap.has(key)) {
        vendorDayMap.set(key, { departments: new Set(), count: 0, total: 0 })
      }
      const entry = vendorDayMap.get(key)
      entry.departments.add(tx.department)
      entry.count++
      entry.total += Number.parseFloat(tx.amount)
    })

    vendorDayMap.forEach((value, key) => {
      if (value.departments.size > 2 && value.total > 500000) {
        patterns.push({
          type: "Multiple Department Payments",
          severity: "high",
          description: `Same vendor received payments from ${value.departments.size} departments on the same day totaling ₹${value.total.toLocaleString()}`,
        })
      }
    })

    // Pattern 2: Rapid transaction sequences
    const vendorTransactions = new Map()
    transactions.forEach((tx) => {
      if (!vendorTransactions.has(tx.vendor_id)) {
        vendorTransactions.set(tx.vendor_id, [])
      }
      vendorTransactions.get(tx.vendor_id).push(tx)
    })

    vendorTransactions.forEach((txs, vendorId) => {
      if (txs.length >= 5) {
        const dates = txs.map((tx) => new Date(tx.transaction_date).getTime()).sort()
        const avgGap = (dates[dates.length - 1] - dates[0]) / (dates.length - 1) / (1000 * 60 * 60 * 24)
        if (avgGap < 2) {
          patterns.push({
            type: "Rapid Transaction Sequence",
            severity: "medium",
            description: `${txs.length} transactions in ${Math.ceil(avgGap * txs.length)} days (avg gap: ${avgGap.toFixed(1)} days)`,
          })
        }
      }
    })

    return patterns
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading network analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Network Analysis</h1>
        <p className="text-muted-foreground">Visualize relationships between vendors, transactions, and departments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              Network Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData?.stats.totalVendors || 0}</div>
            <p className="text-xs text-muted-foreground">Active vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData?.stats.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">Transaction links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData?.clusters.length || 0}</div>
            <p className="text-xs text-muted-foreground">Department groups</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Suspicious Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{networkData?.suspiciousPatterns.length || 0}</div>
            <p className="text-xs text-muted-foreground">Detected anomalies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="graph" className="space-y-4">
        <TabsList>
          <TabsTrigger value="graph">Network Graph</TabsTrigger>
          <TabsTrigger value="patterns">Suspicious Patterns</TabsTrigger>
          <TabsTrigger value="clusters">Department Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor-Transaction Network</CardTitle>
              <CardDescription>Interactive visualization of payment relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Network className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">Interactive Network Graph</p>
                    <p className="text-sm text-muted-foreground">
                      {networkData?.nodes.length} nodes, {networkData?.stats.totalTransactions} connections
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Visualization shows vendor relationships, transaction flows, and risk clusters
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Suspicious Patterns</CardTitle>
              <CardDescription>AI-identified anomalies in transaction networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkData?.suspiciousPatterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No suspicious patterns detected</p>
                  </div>
                ) : (
                  networkData?.suspiciousPatterns.map((pattern: any, index: number) => (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="font-semibold">{pattern.type}</span>
                        </div>
                        <Badge
                          variant={
                            pattern.severity === "critical"
                              ? "destructive"
                              : pattern.severity === "high"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {pattern.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                        Investigate Pattern
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {networkData?.clusters.map(([department, data]: [string, any]) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="text-lg">{department}</CardTitle>
                  <CardDescription>Department transaction cluster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Transactions:</span>
                    <span className="font-semibold">{data.transactions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">₹{data.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unique Vendors:</span>
                    <span className="font-semibold">{data.vendors.size}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2 bg-transparent">
                    View Cluster Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
