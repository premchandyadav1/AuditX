import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parse } from "csv-parse/sync"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const importType = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Create import job
    const { data: job, error: jobError } = await supabase
      .from("import_jobs")
      .insert({
        user_id: user.id,
        file_url: file.name,
        file_name: file.name,
        import_type: importType,
        total_rows: records.length,
        status: "processing",
      })
      .select()
      .single()

    if (jobError) throw jobError

    // Process records based on import type
    let processed = 0
    let failed = 0
    const errors: any[] = []

    for (const record of records) {
      try {
        if (importType === "transactions") {
          await supabase.from("transactions").insert({
            user_id: user.id,
            amount: Number.parseFloat(record.amount),
            transaction_date: record.date,
            vendor_id: record.vendor_id,
            department: record.department,
            description: record.description,
            invoice_number: record.invoice_number,
            category: record.category,
          })
        } else if (importType === "vendors") {
          await supabase.from("vendors").insert({
            name: record.name,
            tax_id: record.tax_id,
            contact_email: record.email,
            contact_phone: record.phone,
            address: record.address,
            category: record.category,
          })
        }
        processed++
      } catch (err: any) {
        failed++
        errors.push({ row: record, error: err.message })
      }
    }

    // Update job status
    await supabase
      .from("import_jobs")
      .update({
        status: "completed",
        processed_rows: processed,
        failed_rows: failed,
        errors: errors,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)

    // Log activity
    await supabase.from("activity_timeline").insert({
      user_id: user.id,
      action: "imported_data",
      resource_type: importType,
      metadata: { job_id: job.id, processed, failed },
    })

    return NextResponse.json({
      job_id: job.id,
      processed,
      failed,
      errors: failed > 0 ? errors : undefined,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
