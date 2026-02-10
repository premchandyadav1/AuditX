import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "This feature is temporarily unavailable. Use regular search instead." },
    { status: 503 }
  )
}
