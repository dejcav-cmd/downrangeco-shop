import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert, writeLog } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await writeLog({ level: "info", job: "sms-test", message: "Manual SMS test triggered from admin" });

  const result = await sendSMSAlert(
    `🧪 DownRange Shop SMS Test\n${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT\nAll systems go.`
  );

  return NextResponse.json({
    sent:           result.sent,
    twilio_sid:     result.twilioSid,
    twilio_status:  result.twilioStatus,
    twilio_error:   result.errorMessage,
    twilio_code:    result.errorCode,
    http_status:    result.httpStatus,
    config: {
      sid_set:    !!process.env.TWILIO_ACCOUNT_SID,
      token_set:  !!process.env.TWILIO_AUTH_TOKEN,
      from_value: process.env.TWILIO_FROM_NUMBER ?? "not set",
      to_value:   process.env.ALERT_PHONE_NUMBER  ?? "not set",
    },
  });
}
