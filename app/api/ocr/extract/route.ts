import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { performOCR } from "@/lib/ai/ocr-utils"

// Use Gemini 2.5 Flash as primary AI model
const model = google("gemini-2.5-flash")

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Processing document with OCR.space + Gemini fallback:", file.name)

    const ocrData = await performOCR(file)

    // If OCR extraction failed, we'll still try to process with AI
    const textToProcess = ocrData.extractedText || `File: ${file.name} (OCR extraction failed - manual analysis needed)`

    const prompt = `You are an expert financial auditor. Extract financial data from this document text in JSON format.

Document: ${file.name}
Text from OCR (may be incomplete):
${textToProcess}

Provide ONLY valid JSON (no markdown, no explanation):
{
  "documentType": "invoice|receipt|purchase_order|contract|expense_report|other",
  "vendor": { 
    "name": "vendor company name", 
    "address": "full address if available", 
    "taxId": "GST/PAN if available", 
    "contactInfo": "email or phone if available" 
  },
  "financial": { 
    "totalAmount": 0, 
    "currency": "INR", 
    "taxAmount": 0, 
    "subtotal": 0, 
    "paymentTerms": "net 30 or similar" 
  },
  "documentDetails": { 
    "documentNumber": "invoice number or ID", 
    "date": "YYYY-MM-DD", 
    "dueDate": "YYYY-MM-DD if available", 
    "referenceNumber": "PO or ref number if available" 
  },
  "lineItems": [{ 
    "description": "item description", 
    "quantity": 0, 
    "unitPrice": 0, 
    "amount": 0 
  }],
  "parties": { 
    "buyer": "buyer/department name", 
    "seller": "vendor name", 
    "shippingAddress": "address if available" 
  },
  "fraudIndicators": { 
    "duplicateRisk": false, 
    "priceAnomalyRisk": false, 
    "vendorRisk": false, 
    "missingFieldsRisk": false, 
    "riskScore": 0, 
    "riskReasons": [] 
  },
  "confidence": 75
}`

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.1,
      maxTokens: 2000,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    let extractedData
    
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[0])
    } else {
      // Complete fallback structure with all required fields
      extractedData = {
        documentType: "unknown",
        vendor: {
          name: "Unable to extract vendor",
          address: "",
          taxId: "",
          contactInfo: "",
        },
        financial: {
          totalAmount: 0,
          currency: "INR",
          taxAmount: 0,
          subtotal: 0,
          paymentTerms: "",
        },
        documentDetails: {
          documentNumber: "DOC-" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          dueDate: "",
          referenceNumber: "",
        },
        lineItems: [],
        parties: {
          buyer: "Unknown",
          seller: "Unknown",
          shippingAddress: "",
        },
        fraudIndicators: {
          duplicateRisk: false,
          priceAnomalyRisk: false,
          vendorRisk: false,
          missingFieldsRisk: true,
          riskScore: 20,
          riskReasons: ["Unable to extract document details"],
        },
        confidence: 10,
      }
    }

    console.log("[v0] Document processed. Risk score:", extractedData?.fraudIndicators?.riskScore)

    return NextResponse.json({
      success: true,
      data: extractedData,
      processingTime: new Date().toISOString(),
      ocrStatus: ocrData.extractedText ? "success" : "failed_fallback_to_ai",
    })
  } catch (error) {
    console.error("[v0] OCR extraction error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process document", 
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Please try uploading a clearer image or PDF"
      },
      { status: 500 },
    )
  }
}
