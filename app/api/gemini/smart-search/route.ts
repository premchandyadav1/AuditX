import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServerClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Convert natural language to SQL query
    const prompt = `Convert this natural language query into a Supabase query structure:

Query: "${query}"

Available tables and their columns:
- vendors: id, name, tax_id, risk_score, total_amount, category
- transactions: id, amount, transaction_date, vendor_id, department, risk_score, is_flagged
- fraud_cases: id, title, severity, status, estimated_loss, detection_date
- documents: id, file_name, department, upload_date, status

Return a JSON object with:
{
  "table": "table_name",
  "columns": ["col1", "col2"],
  "filters": {"column": "value"},
  "orderBy": {"column": "desc"},
  "limit": 10
}

Only return the JSON, no explanation.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse query" }, { status: 400 })
    }

    const queryStructure = JSON.parse(jsonMatch[0])

    // Execute the query
    let queryBuilder = supabase.from(queryStructure.table).select(queryStructure.columns.join(", "))

    // Apply filters
    if (queryStructure.filters) {
      for (const [key, value] of Object.entries(queryStructure.filters)) {
        if (typeof value === "string" && value.includes(">")) {
          queryBuilder = queryBuilder.gt(key, Number.parseInt(value.replace(">", "")))
        } else if (typeof value === "string" && value.includes("<")) {
          queryBuilder = queryBuilder.lt(key, Number.parseInt(value.replace("<", "")))
        } else {
          queryBuilder = queryBuilder.eq(key, value)
        }
      }
    }

    // Apply ordering
    if (queryStructure.orderBy) {
      const [column, direction] = Object.entries(queryStructure.orderBy)[0]
      queryBuilder = queryBuilder.order(column, { ascending: direction === "asc" })
    }

    // Apply limit
    if (queryStructure.limit) {
      queryBuilder = queryBuilder.limit(queryStructure.limit)
    }

    const { data, error } = await queryBuilder

    if (error) throw error

    // Generate natural language summary
    const summaryPrompt = `Summarize these query results in 2-3 sentences:

Query: ${query}
Results: ${JSON.stringify(data)}

Be concise and highlight key insights.`

    const summaryResult = await model.generateContent(summaryPrompt)
    const summary = summaryResult.response.text()

    return NextResponse.json({
      query: queryStructure,
      results: data,
      count: data?.length || 0,
      summary,
    })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
