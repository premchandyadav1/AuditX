import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServerClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI("AIzaSyBZP3AK10xyB7jW6vbBwZs4UBh-VUqpmoQ")

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    const supabase = createServerClient()

    // Fetch relevant context from database
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    const { data: highRiskVendors } = await supabase
      .from("vendors")
      .select("*")
      .gte("risk_score", 70)
      .order("risk_score", { ascending: false })
      .limit(10)

    const { data: recentAlerts } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    const contextData = {
      recentTransactions: recentTransactions || [],
      highRiskVendors: highRiskVendors || [],
      recentAlerts: recentAlerts || [],
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const systemPrompt = `You are AuditX AI Copilot, an expert fraud detection assistant for the Government of India audit system.

You have access to real-time data from the AuditX database:

RECENT TRANSACTIONS (Last 20):
${JSON.stringify(contextData.recentTransactions, null, 2)}

HIGH RISK VENDORS:
${JSON.stringify(contextData.highRiskVendors, null, 2)}

RECENT ALERTS:
${JSON.stringify(contextData.recentAlerts, null, 2)}

Your capabilities:
- Fraud pattern analysis
- Vendor risk assessment
- Transaction anomaly detection
- Compliance checking
- Spending trend analysis
- Natural language database queries
- Predictive risk modeling
- Investigation recommendations

Answer the user's question using the provided data. Be specific, cite actual numbers from the data, and provide actionable insights. If you detect fraud patterns, explain them clearly.

User question: ${message}`

    const chat = model.startChat({
      history: conversationHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(systemPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      response: text,
      context: {
        transactionsAnalyzed: contextData.recentTransactions.length,
        highRiskVendorsCount: contextData.highRiskVendors.length,
        activeAlertsCount: contextData.recentAlerts.length,
      },
    })
  } catch (error) {
    console.error("AI Copilot error:", error)
    return NextResponse.json(
      {
        error: "AI Copilot failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
