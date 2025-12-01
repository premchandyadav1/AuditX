import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { documentNumber, vendorName, amount, documentType } = await request.json()

    const supabase = await createServerClient()

    // Check for duplicate documents in database
    const { data: existingDocs, error } = await supabase
      .from("documents")
      .select("*")
      .or(
        `document_number.eq.${documentNumber},and(vendor_name.eq.${vendorName},amount.eq.${amount},document_type.eq.${documentType})`,
      )
      .limit(10)

    if (error) {
      console.error("[v0] Duplicate detection query error:", error)
      return NextResponse.json({ isDuplicate: false, matches: [] })
    }

    const isDuplicate = existingDocs && existingDocs.length > 0

    console.log("[v0] Duplicate detection result:", { isDuplicate, matchCount: existingDocs?.length })

    return NextResponse.json({
      isDuplicate,
      matches: existingDocs || [],
      confidence: isDuplicate ? 95 : 0,
    })
  } catch (error) {
    console.error("[v0] Duplicate detection error:", error)
    return NextResponse.json({ isDuplicate: false, matches: [], error: "Detection failed" }, { status: 500 })
  }
}
