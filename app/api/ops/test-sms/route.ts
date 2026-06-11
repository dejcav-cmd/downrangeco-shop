import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const testMsg = `🧪 DownRange Shop SMS Test\n${new Date().toISOString()}\nAll systems go.`;
  const sent = await sendSMSAlert(testMsg);
  return NextResponse.json({
    sent,
    config: {
      sid_set:   !!process.env.TWILIO_ACCOUNT_SID,
      token_set: !!process.env.TWILIO_AUTH_TOKEN,
      from_set:  !!process.env.TWILIO_FROM_NUMBER && process.env.TWILIO_FROM_NUMBER !== "REPLACE_WITH_TWILIO_NUMBER",
      to_set:    !!process.env.ALERT_PHONE_NUMBER,
      to_number: process.env.ALERT_PHONE_NUMBER ?? "not set",
      from_number: process.env.TWILIO_FROM_NUMBER ?? "not set",
    },
  });
}
