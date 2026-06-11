import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert, writeLog } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

function html(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SMS Diagnostic - Down Range Co.</title>
    <style>*{box-sizing:border-box}body{font:14px/1.6 monospace;padding:32px;background:#09090B;color:#E5E5E5;max-width:640px}h2{font-family:sans-serif;color:#C8922A;letter-spacing:0.08em;margin:0 0 24px}table{width:100%;border-collapse:collapse;margin-bottom:24px}td{padding:8px 12px 8px 0;border-bottom:1px solid #1F2428}td:first-child{color:#9CA3AF;width:220px}.ok{color:#6adb8a}.bad{color:#e08080}.warn{color:#e0a830}button{background:#C8922A;color:#09090B;border:none;padding:12px 28px;font:700 13px monospace;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase}button:hover{background:#E5A83A}a{color:#C8922A}hr{border:none;border-top:1px solid #1F2428;margin:24px 0}ol{color:#9CA3AF;line-height:2}li a{color:#C8922A}</style>
    </head><body>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) {
    return html(`<h2>SMS Diagnostic</h2><p class="bad">UNAUTHORIZED -- add ?key=YOUR_ADMIN_KEY to the URL</p><p style="color:#6B7280">Example: /api/ops/test-sms?key=drco-admin-2026</p>`, 401);
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.ALERT_PHONE_NUMBER;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSec = process.env.TWILIO_API_SECRET;

  const row = (k: string, v: string, ok: boolean) =>
    `<tr><td>${k}</td><td class="${ok ? "ok" : "bad"}">${v}</td></tr>`;

  return html(`
    <h2>SMS DIAGNOSTIC</h2>
    <table>
      ${row("TWILIO_ACCOUNT_SID",  sid   ? sid.slice(0,10)+"..." : "NOT SET", !!sid)}
      ${row("TWILIO_AUTH_TOKEN",   token ? token.slice(0,6)+"..." : "NOT SET", !!token)}
      ${row("TWILIO_FROM_NUMBER",  from  ?? "NOT SET", !!from)}
      ${row("ALERT_PHONE_NUMBER",  to    ?? "NOT SET", !!to)}
      ${row("TWILIO_API_KEY",      apiKey ? apiKey.slice(0,10)+"..." : "not set (optional)", true)}
      ${row("TWILIO_API_SECRET",   apiSec ? "set" : "not set (optional)", true)}
    </table>
    ${sid && token && from && to ? `
      <form method="POST" action="/api/ops/test-sms?key=${key}">
        <button type="submit">SEND TEST SMS NOW</button>
      </form>
      <p style="color:#6B7280;margin-top:12px;font-size:12px">
        Sends to: ${to}<br>
        Sends from: ${from}<br>
        Note: Toll-free numbers (+1877/+1888 etc) require Twilio Toll-Free Verification.
        If you see error code 30034, see the fix below.
      </p>
      <hr>
      <h3 style="color:#e0a830;font-family:sans-serif">If SMS fails with code 30034 (toll-free unverified)</h3>
      <p style="color:#9CA3AF"><b>Option A - Verify toll-free (free, 1-3 business days):</b></p>
      <ol>
        <li>Go to <a href="https://console.twilio.com" target="_blank">console.twilio.com</a></li>
        <li>Phone Numbers &rarr; Manage &rarr; Active Numbers</li>
        <li>Click ${from}</li>
        <li>Find "Toll-Free Verification" section</li>
        <li>Submit the form and wait for approval</li>
      </ol>
      <p style="color:#9CA3AF"><b>Option B - Buy a local number (~$1.15/mo, works instantly):</b></p>
      <ol>
        <li>Twilio console &rarr; Buy a Number &rarr; search area code 206</li>
        <li>Buy a local US number</li>
        <li>Update TWILIO_FROM_NUMBER in Vercel env vars</li>
        <li>Redeploy &rarr; SMS works immediately</li>
      </ol>
    ` : `<p class="bad">Configure all TWILIO_* env vars in Vercel Settings first, then redeploy.</p>`}
  `);
}

export async function POST(req: NextRequest) {
  const url_key = req.nextUrl.searchParams.get("key");
  let body_key = "";
  let isJson = false;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    isJson = true;
    const b = await req.json().catch(() => ({}));
    body_key = b.key ?? "";
  }

  const key = url_key ?? req.headers.get("x-admin-key") ?? body_key;
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await writeLog({ level: "info", job: "sms-test", message: "Manual SMS test triggered" });

  const result = await sendSMSAlert(
    `DownRange Shop SMS Test\n${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT\nAll systems operational.`
  );

  // Browser form POST → redirect to GET with result shown
  const accept = req.headers.get("accept") ?? "";
  if (!isJson || accept.includes("text/html")) {
    const statusMsg = result.sent
      ? `<p class="ok">SMS SENT! SID: ${result.twilioSid} &mdash; Status: ${result.twilioStatus}</p>`
      : `<p class="bad">SMS FAILED: ${result.errorMessage ?? "unknown"} (code: ${result.errorCode ?? "?"})</p>
         ${result.errorCode === 30034 ? `<p class="warn">Code 30034 = Toll-Free Verification required. See fix options above.</p>` : ""}
         ${result.errorCode === 21608 ? `<p class="warn">Code 21608 = Unverified number. Go to Twilio console &rarr; Verified Caller IDs &rarr; add +12066016076</p>` : ""}
         ${result.httpStatus === 401 ? `<p class="warn">401 = Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Vercel env vars.</p>` : ""}`;

    return html(`
      <h2>SMS TEST RESULT</h2>
      ${statusMsg}
      <hr>
      <a href="/api/ops/test-sms?key=${key}">&larr; Back to diagnostic</a>
      <hr>
      <p style="color:#6B7280;font-size:12px">
        Full details are in the Operations log in your admin dashboard.<br>
        Admin &rarr; Operations tab &rarr; filter by "sms"
      </p>
    `);
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
      api_key_set: !!process.env.TWILIO_API_KEY,
    },
  });
}
