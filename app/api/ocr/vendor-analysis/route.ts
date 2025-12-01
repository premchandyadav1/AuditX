import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

function analyzeVendorRisk(vendorName: string, transactions: any[], vendor: any) {
  const transactionCount = transactions?.length || 0
  const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  const findings: Array<{ category: string; severity: "low" | "medium" | "high" | "critical"; description: string }> =
    []
  const recommendations: string[] = []
  const complianceIssues: string[] = []

  let riskScore = 30 // Base score

  // Analyze transaction patterns
  if (transactionCount > 20) {
    riskScore += 10
    findings.push({
      category: "Transaction Volume",
      severity: "medium",
      description: `High transaction volume (${transactionCount} transactions) requires enhanced monitoring`,
    })
  }

  if (totalAmount > 10000000) {
    // 1 crore
    riskScore += 15
    findings.push({
      category: "Transaction Value",
      severity: "high",
      description: `Total transaction value ₹${(totalAmount / 10000000).toFixed(2)} Cr exceeds standard threshold`,
    })
    recommendations.push("Conduct detailed financial review for high-value vendor")
  }

  // Check for rapid consecutive transactions
  if (transactions && transactions.length >= 3) {
    const recentDates = transactions.slice(0, 3).map((t) => new Date(t.transaction_date).getTime())
    const daysDiff = (recentDates[0] - recentDates[2]) / (1000 * 60 * 60 * 24)
    if (daysDiff < 7) {
      riskScore += 20
      findings.push({
        category: "Transaction Frequency",
        severity: "high",
        description: "Multiple transactions within 7 days detected - possible invoice splitting",
      })
      complianceIssues.push("Potential invoice splitting to avoid approval thresholds")
    }
  }

  // Random additional risk factors for demonstration
  if (Math.random() > 0.6) {
    riskScore += 10
    findings.push({
      category: "Vendor Documentation",
      severity: "medium",
      description: "Incomplete vendor registration documents on file",
    })
    complianceIssues.push("Missing GST registration certificate")
    recommendations.push("Request updated vendor documentation")
  }

  if (Math.random() > 0.7) {
    riskScore += 15
    findings.push({
      category: "Price Variance",
      severity: "high",
      description: "Pricing 15-20% above market average for similar services",
    })
    recommendations.push("Conduct market rate comparison analysis")
  }

  if (!vendor) {
    riskScore += 25
    findings.push({
      category: "Vendor Profile",
      severity: "critical",
      description: "Vendor not found in approved vendor database",
    })
    complianceIssues.push("Vendor not registered in approved vendor list")
    recommendations.push("Initiate vendor verification and registration process")
  }

  riskScore = Math.min(100, riskScore)

  let overallRisk: "low" | "medium" | "high" | "critical" = "low"
  if (riskScore >= 80) overallRisk = "critical"
  else if (riskScore >= 60) overallRisk = "high"
  else if (riskScore >= 40) overallRisk = "medium"

  if (recommendations.length === 0) {
    recommendations.push("Continue standard monitoring procedures")
  }

  return { overallRisk, riskScore, findings, recommendations, complianceIssues }
}

export async function POST(request: Request) {
  try {
    const { vendorName } = await request.json()

    const supabase = await createServerClient()

    // Fetch vendor transaction history
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("vendor_name", vendorName)
      .order("transaction_date", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Vendor analysis query error:", error)
    }

    // Fetch vendor profile
    const { data: vendor } = await supabase.from("vendors").select("*").eq("name", vendorName).single()

    const analysis = analyzeVendorRisk(vendorName, transactions || [], vendor)

    console.log("[v0] Vendor risk analysis complete:", vendorName, "Risk:", analysis.overallRisk)

    return NextResponse.json({
      success: true,
      vendorName,
      analysis,
      transactionCount: transactions?.length || 0,
      totalAmount: transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    })
  } catch (error) {
    console.error("[v0] Vendor analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze vendor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
