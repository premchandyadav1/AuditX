import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { authenticator } from "otplib"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate QR code
    const otpauth = authenticator.keyuri(user.email || "user", "AuditX", secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase())

    // Store in database
    const { error } = await supabase.from("user_mfa").upsert({
      user_id: user.id,
      secret_key: secret,
      backup_codes: backupCodes,
      is_enabled: false,
    })

    if (error) throw error

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
