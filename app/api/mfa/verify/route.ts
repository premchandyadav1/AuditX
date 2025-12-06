import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { authenticator } from "otplib"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's MFA settings
    const { data: mfaData, error: mfaError } = await supabase
      .from("user_mfa")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (mfaError || !mfaData) {
      return NextResponse.json({ error: "MFA not set up" }, { status: 400 })
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: mfaData.secret_key,
    })

    if (!isValid) {
      // Check if it's a backup code
      const backupCodeValid = mfaData.backup_codes?.includes(token.toUpperCase())

      if (backupCodeValid) {
        // Remove used backup code
        const updatedCodes = mfaData.backup_codes.filter((code: string) => code !== token.toUpperCase())
        await supabase.from("user_mfa").update({ backup_codes: updatedCodes }).eq("user_id", user.id)

        return NextResponse.json({ success: true, method: "backup_code" })
      }

      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Enable MFA if verifying for first time
    await supabase
      .from("user_mfa")
      .update({
        is_enabled: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true, method: "totp" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
