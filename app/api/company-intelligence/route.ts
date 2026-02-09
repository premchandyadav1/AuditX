import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { model } from "@/lib/ai/model"

interface ComplianceReport {
  companyName: string
  compliance_status: string
  blacklists: string[]
  legal_cases: string[]
  certifications: string[]
  audit_findings: string
  news_items: string[]
  risk_score: number
  recommendation: string
}

interface MisconductReport {
  companyName: string
  fraud_cases: string[]
  corruption: string[]
  financial_issues: string[]
  complaints: string[]
  investigations: string[]
  court_cases: string[]
  severity: "low" | "medium" | "high" | "critical"
  summary: string
}

interface GeneralReport {
  companyName: string
  overview: {
    type: string
    registration: string
    location: string
    founded?: string
  }
  financial_health: {
    status: string
    revenue?: string
    growth?: string
  }
  reputation: {
    score: number
    description: string
  }
  contracts: {
    count: number
    details: string[]
  }
  risk_indicators: string[]
  news: string[]
  overall_risk_score: number
}

export async function POST(req: NextRequest) {
  try {
    const { companyName, searchType } = await req.json()

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    let prompt = ""
    let responseSchema = null

    if (searchType === "compliance") {
      prompt = `Analyze and provide a structured compliance report for the company: "${companyName}". 
      
Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "companyName": "string",
  "compliance_status": "string - current regulatory compliance level",
  "blacklists": ["array of any government blacklists or sanctions"],
  "legal_cases": ["array of legal violations or court cases"],
  "certifications": ["array of industry certifications held"],
  "audit_findings": "string - summary of any audit issues",
  "news_items": ["array of recent compliance-related news"],
  "risk_score": number between 0-100,
  "recommendation": "string - recommended action"
}

Include information about GST, PAN, licenses, regulatory status. If you cannot find specific information, provide realistic assessments based on available public data.`
      responseSchema = "compliance"
    } else if (searchType === "misconduct") {
      prompt = `Research and provide a structured misconduct report for: "${companyName}".

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "companyName": "string",
  "fraud_cases": ["array of fraud cases or allegations"],
  "corruption": ["array of corruption scandals"],
  "financial_issues": ["array of financial irregularities"],
  "complaints": ["array of vendor or employee complaints"],
  "investigations": ["array of media investigations or inquiries"],
  "court_cases": ["array of relevant court cases"],
  "severity": "string - one of: low, medium, high, critical",
  "summary": "string - executive summary of misconduct findings"
}

Search for fraud cases, corruption scandals, financial irregularities, vendor complaints, whistleblower reports, media investigations. If no misconduct found, return empty arrays and low severity.`
      responseSchema = "misconduct"
    } else {
      prompt = `Provide a comprehensive intelligence report for the company: "${companyName}".

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "companyName": "string",
  "overview": {
    "type": "string - company type/industry",
    "registration": "string - registration status",
    "location": "string - headquarters location",
    "founded": "string - founding year (optional)"
  },
  "financial_health": {
    "status": "string - healthy/concerning/unstable",
    "revenue": "string - approximate revenue (optional)",
    "growth": "string - growth trajectory (optional)"
  },
  "reputation": {
    "score": number between 0-100,
    "description": "string - reputation assessment"
  },
  "contracts": {
    "count": number,
    "details": ["array of major contract details"]
  },
  "risk_indicators": ["array of identified risk factors"],
  "news": ["array of recent relevant news"],
  "overall_risk_score": number between 0-100
}

Include company overview, financial health, reputation score, government contracts history, and risk indicators.`
      responseSchema = "general"
    }

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.2,
      maxTokens: 2000,
    })

    // Parse JSON from response
    let data
    try {
      // Try to extract and clean JSON
      let jsonStr = text.trim()
      
      // Remove markdown code blocks if present
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
      }

      data = JSON.parse(jsonStr)
      
      // Validate the response has expected fields
      if (!data.companyName) {
        data.companyName = companyName
      }
    } catch (e) {
      console.error("JSON parsing error:", e)
      // Return a structured empty response instead of raw text
      if (responseSchema === "compliance") {
        data = {
          companyName,
          compliance_status: "Unable to analyze",
          blacklists: [],
          legal_cases: [],
          certifications: [],
          audit_findings: "Analysis failed",
          news_items: [],
          risk_score: 50,
          recommendation: "Please try again with a different company name",
          error: "Failed to parse response",
        }
      } else if (responseSchema === "misconduct") {
        data = {
          companyName,
          fraud_cases: [],
          corruption: [],
          financial_issues: [],
          complaints: [],
          investigations: [],
          court_cases: [],
          severity: "low",
          summary: "Unable to analyze misconduct",
          error: "Failed to parse response",
        }
      } else {
        data = {
          companyName,
          overview: { type: "", registration: "", location: "" },
          financial_health: { status: "Unable to analyze" },
          reputation: { score: 50, description: "Analysis failed" },
          contracts: { count: 0, details: [] },
          risk_indicators: [],
          news: [],
          overall_risk_score: 50,
          error: "Failed to parse response",
        }
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Company intelligence error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch company intelligence" },
      { status: 500 }
    )
  }
}
