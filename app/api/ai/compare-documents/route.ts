import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { model } from "@/lib/ai/model"
import { performOCR } from "@/lib/ai/ocr-utils"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file1 = formData.get("file1") as File
    const file2 = formData.get("file2") as File

    if (!file1 || !file2) {
      return NextResponse.json({ error: "Two files required" }, { status: 400 })
    }

    // Perform real OCR on both files
    const ocr1 = await performOCR(file1)
    const ocr2 = await performOCR(file2)

    const prompt = `You are a forensic document analyst. Compare these two financial documents and identify:

1. Similarities and differences
2. Potential duplicate indicators
3. Suspicious alterations or modifications
4. Inconsistencies in data (amounts, dates, vendor details)
5. Signs of document tampering
6. Risk assessment (0-100)

Provide analysis in JSON format:
{
  "isDuplicate": boolean,
  "similarityScore": 0-100,
  "keyDifferences": ["difference 1", "difference 2"],
  "suspiciousPatterns": ["pattern 1", "pattern 2"],
  "riskAssessment": {
    "score": 0-100,
    "reasons": ["reason 1", "reason 2"]
  },
  "recommendation": "approve|investigate|reject",
  "detailedAnalysis": "comprehensive explanation"
}`

    const docPrompt = `${prompt}\n\nDOCUMENT 1 TEXT:\n${ocr1.extractedText}\n\nDOCUMENT 2 TEXT:\n${ocr2.extractedText}`

    const { text } = await generateText({
      model,
      prompt: docPrompt,
      temperature: 0.3,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      analysis,
      rawResponse: text,
    })
  } catch (error) {
    console.error("Document comparison error:", error)
    return NextResponse.json(
      {
        error: "Document comparison failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
