import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { model } from "@/lib/ai/model"
import { performOCR } from "@/lib/ai/ocr-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Processing document with real OCR and AI:", file.name)

    const ocrData = await performOCR(file)

    const prompt = `Extract financial data from this document text in JSON format.

    TEXT:
    ${ocrData.extractedText}

    JSON format:
    {
      "documentType": "string",
      "vendor": { "name": "string", "address": "string", "taxId": "string", "contactInfo": "string" },
      "financial": { "totalAmount": number, "currency": "INR", "taxAmount": number, "subtotal": number, "paymentTerms": "string" },
      "documentDetails": { "documentNumber": "string", "date": "YYYY-MM-DD", "dueDate": "YYYY-MM-DD", "referenceNumber": "string" },
      "lineItems": [{ "description": "string", "quantity": number, "unitPrice": number, "amount": number }],
      "parties": { "buyer": "string", "seller": "string", "shippingAddress": "string" },
      "fraudIndicators": { "duplicateRisk": boolean, "priceAnomalyRisk": boolean, "vendorRisk": boolean, "missingFieldsRisk": boolean, "riskScore": number, "riskReasons": [] },
      "confidence": number
    }`

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null

    console.log("[v0] Document processed successfully. Risk score:", extractedData?.fraudIndicators?.riskScore)

    return NextResponse.json({
      success: true,
      data: extractedData,
      processingTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] OCR extraction error:", error)
    return NextResponse.json(
      { error: "Failed to process document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
