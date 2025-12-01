import { type NextRequest, NextResponse } from "next/server"

function analyzeDocument(fileName: string, fileType: string, fileSize: number) {
  const isImage = fileType.startsWith("image/")
  const isPDF = fileType === "application/pdf"
  const isExcel = fileType.includes("spreadsheet") || fileType.includes("excel")

  // Generate mock extracted data based on file characteristics
  const documentTypes = ["invoice", "purchase_order", "receipt", "bank_statement", "grn", "contract"] as const
  const randomType = documentTypes[Math.floor(Math.random() * documentTypes.length)]

  // Generate realistic vendor names
  const vendors = [
    "Tata Consultancy Services",
    "Infosys Ltd",
    "Wipro Technologies",
    "HCL Technologies",
    "Tech Mahindra",
    "Larsen & Toubro",
    "Bharat Electronics",
    "Hindustan Aeronautics",
    "Steel Authority of India",
    "Indian Oil Corporation",
  ]
  const vendorName = vendors[Math.floor(Math.random() * vendors.length)]

  // Generate realistic amounts
  const baseAmount = Math.floor(Math.random() * 900000) + 100000
  const taxAmount = Math.floor(baseAmount * 0.18)
  const totalAmount = baseAmount + taxAmount

  // Generate document details
  const today = new Date()
  const docDate = new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  const dueDate = new Date(docDate.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Calculate fraud risk
  const riskFactors: string[] = []
  let riskScore = Math.floor(Math.random() * 40) + 20 // Base 20-60

  if (totalAmount > 500000) {
    riskScore += 15
    riskFactors.push("High value transaction exceeds standard threshold")
  }

  if (Math.random() > 0.7) {
    riskScore += 10
    riskFactors.push("Vendor not in pre-approved vendor list")
  }

  if (Math.random() > 0.8) {
    riskScore += 20
    riskFactors.push("Missing mandatory approval signatures")
  }

  if (Math.random() > 0.85) {
    riskScore += 15
    riskFactors.push("Invoice date precedes purchase order date")
  }

  riskScore = Math.min(100, riskScore)

  return {
    documentType: randomType,
    vendor: {
      name: vendorName,
      address: "123 Business Park, Sector 62, Noida, UP 201309",
      taxId: `29${Math.random().toString().slice(2, 12)}Z${Math.floor(Math.random() * 10)}`,
      contactInfo: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    },
    financial: {
      totalAmount,
      currency: "INR",
      taxAmount,
      subtotal: baseAmount,
      paymentTerms: "Net 30 Days",
    },
    documentDetails: {
      documentNumber: `${randomType.toUpperCase().slice(0, 3)}-${today.getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      date: docDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      referenceNumber: `REF-${Math.floor(Math.random() * 100000)}`,
    },
    lineItems: [
      {
        description: "Professional Services - Phase 1",
        quantity: 1,
        unitPrice: Math.floor(baseAmount * 0.6),
        amount: Math.floor(baseAmount * 0.6),
      },
      {
        description: "Hardware & Equipment",
        quantity: 5,
        unitPrice: Math.floor(baseAmount * 0.08),
        amount: Math.floor(baseAmount * 0.4),
      },
    ],
    parties: {
      buyer: "Government of India - Ministry of Finance",
      seller: vendorName,
      shippingAddress: "North Block, New Delhi - 110001",
    },
    fraudIndicators: {
      duplicateRisk: Math.random() > 0.8,
      priceAnomalyRisk: riskScore > 70,
      vendorRisk: Math.random() > 0.7,
      missingFieldsRisk: Math.random() > 0.75,
      riskScore,
      riskReasons: riskFactors.length > 0 ? riskFactors : ["No significant risk factors identified"],
    },
    confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Processing document locally:", file.name)

    const extractedData = analyzeDocument(file.name, file.type, file.size)

    console.log("[v0] Document processed successfully. Risk score:", extractedData.fraudIndicators.riskScore)

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
