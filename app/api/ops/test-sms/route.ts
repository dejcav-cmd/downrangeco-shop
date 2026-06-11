import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert, writeLog } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

// GET — status page (works in browser)
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) {
    return new NextResponse(
      `<html><body style="font:14px monospace;padding:32px;background:#09090B;color:#E5E5E5">
        <h2 style="color:#C8922A">DownRange SMS Test</h2>
        <p style="color:#e08080">❌ Unauthorized — append ?key=YOUR_ADMIN_KEY to the URL</p>
      </body></html>`, { status: 401, headers: { "Content-Type": "text/html" } }
    );
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.ALERT_PHONE_NUMBER;

  const configOk = !!(sid && token && from && to);

  return new NextResponse(
    `<html><head><meta charset="utf-8"><title>SMS Test — Down Range Co.</title></head>
    <body style="font:14px monospace;padding:32px;background:#09090B;color:#E5E5E5;max-width:600px">
      <h2 style="color:#C8922A;font-family:sans-serif;letter-spacing:0.08em">📱 SMS DIAGNOSTIC</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
        ${[
          ["TWILIO_ACCOUNT_SID",    sid  ? `✓ ${sid.slice(0,8)}…`  : "❌ NOT SET"],
          ["TWILIO_AUTH_TOKEN",     token? `✓ ${token.slice(0,6)}…` : "❌ NOT SET"],
          ["TWILIO_FROM_NUMBER",    from ?? "❌ NOT SET"],
          ["ALERT_PHONE_NUMBER",    to   ?? "❌ NOT SET"],
        ].map(([k,v]) => `<tr>
          <td style="padding:6px 12px 6px 0;color:#9CA3AF;border-bottom:1px solid #1F2428">${k}</td>
          <td style="padding:6px 0;color:${(v as string).startsWith("✓") ? "#6adb8a" : "#e08080"};border-bottom:1px solid #1F2428">${v}</td>
        </tr>`).join("")}
      </table>
      ${configOk ? `
        <form method="POST" action="/api/ops/test-sms?key=${key}">
          <button type="submit" style="background:#C8922A;color:#09090B;border:none;padding:12px 28px;font:700 13px monospace;letter-spacing:0.12em;cursor:pointer;text-transform:uppercase">
            🚀 Send Test SMS Now
          </button>
        </form>
        <p style="color:#6B7280;margin-top:12px;font-size:12px">
          Will send to ${to} from ${from}<br>
          Note: Toll-free numbers (+1877) require Twilio Toll-Free Verification.<br>
          If SMS fails with code 30034, verify at console.twilio.com → Phone Numbers → Manage → your number → Regulatory Compliance.
        </p>
      ` : `<p style="color:#e08080">⚠️ Configure all Twilio env vars in Vercel Settings first.</p>`}
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

// POST — actually send the SMS (used by browser form AND admin dashboard button)
export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
    ?? req.headers.get("x-admin-key")
    ?? (await req.json().catch(() => ({}))).key;

  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await writeLog({ level: "info", job: "sms-test", message: "Manual SMS test triggered" });

  const result = await sendSMSAlert(
    `🧪 DownRange Shop SMS Test\n${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT\nAll systems operational.`
  );

  // If browser form POST, redirect back to GET with result
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    const status = result.sent ? "✅ SMS sent! SID: " + result.twilioSid : "❌ Failed: " + (result.errorMessage ?? "unknown") + " (code " + (result.errorCode ?? "?") + ")";
    return new NextResponse(
      `<html><body style="font:14px monospace;padding:32px;background:#09090B;color:#E5E5E5">
        <h2 style="color:#C8922A">Result</h2>
        <p style="color:${result.sent?"#6adb8a":"#e08080"};font-size:16px">${status}</p>
        <a href="/api/ops/test-sms?key=${key}" style="color:#C8922A">← Back to diagnostic</a>
        ${!result.sent && result.errorCode === 30034 ? `
          <hr style="border-color:#1F2428;margin:20px 0">
          <h3 style="color:#e0a830">Code 30034 — Toll-Free Verification Required</h3>
          <p style="color:#9CA3AF">Your +18777804236 number needs verification before it can send SMS.</p>
          <p><a href="https://console.twilio.com" target="_blank" style="color:#C8922A">Open Twilio Console →</a></p>
          <ol style="color:#9CA3AF;line-height:2">
            <li>Phone Numbers → Manage → Active Numbers</li>
            <li>Click +18777804236</li>
            <li>Scroll to "Toll-Free Verification" section</li>
            <li>Submit verification form (1-3 business days)</li>
            <li>OR: Buy a local number (~$1.15/mo) for instant use</li>
          </ol>
        ` : ""}
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return NextResponse.json({
    sent:          result.sent,
    twilio_sid:    result.twilioSid,
    twilio_status: result.twilioStatus,
    twilio_error:  result.errorMessage,
    twilio_code:   result.errorCode,
    http_status:   result.httpStatus,
    config: {
      sid_set:    !!process.env.TWILIO_ACCOUNT_SID,
      token_set:  !!process.env.TWILIO_AUTH_TOKEN,
      from_value: process.env.TWILIO_FROM_NUMBER ?? "not set",
      to_value:   process.env.ALERT_PHONE_NUMBER  ?? "not set",
    },
  });
}
