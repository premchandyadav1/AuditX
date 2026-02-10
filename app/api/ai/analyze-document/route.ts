import { type NextRequest, NextResponse } from "next/server"
import { performOCR } from "@/lib/ai/ocr-utils"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ocrData = await performOCR(file)

    // Perform basic fraud detection on extracted text
    const extractedText = ocrData.extractedText.toLowerCase()
    
    // Simple heuristic fraud detection
    const fraudIndicators = {
      duplicateText: (extractedText.match(/duplicate|copy|replica/g) || []).length > 0,
      suspiciousPatterns: (extractedText.match(/tampered|forged|altered|modified/g) || []).length > 0,
      missingVendorInfo: extractedText.length < 100 || !extractedText.includes("vendor"),
      unusualAmounts: extractedText.match(/\d{8,}/g) ? (extractedText.match(/\d{8,}/g) || []).length > 0 : false,
    }

    const riskScore = Object.values(fraudIndicators).filter(Boolean).length * 25

    return NextResponse.json({
      success: true,
      documentType: "financial_document",
      extractedText: ocrData.extractedText,
      fileName: ocrData.fileName,
      fraudIndicators,
      riskScore: Math.min(riskScore, 100),
      confidence: 75,
      recommendation: riskScore > 50 ? "investigate" : "approve",
    })
  } catch (error) {
    console.error("Document analysis error:", error)
    return NextResponse.json(
      {
        error: "Document analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
