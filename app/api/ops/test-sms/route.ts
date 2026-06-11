import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert, writeLog } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

// Simple hash to verify key without exposing it
function hashKey(k: string) {
  let h = 0;
  for (let i = 0; i < k.length; i++) h = ((h << 5) - h + k.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).slice(0, 6);
}

function html(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SMS Diagnostic</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font:14px/1.7 monospace;padding:32px 24px;background:#09090B;color:#E5E5E5;max-width:640px}
    h2{font:700 20px sans-serif;color:#C8922A;letter-spacing:.06em;margin-bottom:20px}h3{font:700 14px sans-serif;color:#e0a830;margin:16px 0 8px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}td{padding:7px 10px 7px 0;border-bottom:1px solid #1F2428;vertical-align:top}
    td:first-child{color:#9CA3AF;width:200px;font-size:12px}.ok{color:#6adb8a}.bad{color:#e08080}.warn{color:#e0a830}
    .btn{display:inline-block;background:#C8922A;color:#09090B;border:none;padding:11px 24px;font:700 12px monospace;letter-spacing:.1em;cursor:pointer;text-transform:uppercase;text-decoration:none}
    .btn:hover{background:#E5A83A}.card{background:#111318;border:1px solid #1F2428;padding:16px;margin-bottom:16px}
    hr{border:none;border-top:1px solid #1F2428;margin:20px 0}p{margin-bottom:10px;color:#9CA3AF}ol{color:#9CA3AF;padding-left:20px;line-height:2}a{color:#C8922A}</style>
    </head><body>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// GET — always accessible, shows config + send button
export async function GET(req: NextRequest) {
  const key       = req.nextUrl.searchParams.get("key") ?? "";
  const authed    = key === ADMIN_KEY;
  const serverHash = hashKey(ADMIN_KEY);

  const sid    = process.env.TWILIO_ACCOUNT_SID;
  const token  = process.env.TWILIO_AUTH_TOKEN;
  const from   = process.env.TWILIO_FROM_NUMBER;
  const to     = process.env.ALERT_PHONE_NUMBER;
  const apiKey = process.env.TWILIO_API_KEY;

  const allSet = !!(sid && token && from && to);

  const row = (k: string, v: string, ok: boolean) =>
    `<tr><td>${k}</td><td class="${ok ? "ok" : "bad"}">${v}</td></tr>`;

  const authSection = authed
    ? `<div class="card">
        <p class="ok">Authenticated. Ready to send.</p>
        <form method="POST" action="/api/ops/test-sms?key=${key}">
          <button class="btn" type="submit">SEND TEST SMS NOW</button>
        </form>
       </div>`
    : `<div class="card">
        <p class="warn">Enter your admin key to send a test SMS:</p>
        <form method="GET" action="/api/ops/test-sms" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <input name="key" type="text" placeholder="Admin key" style="flex:1;min-width:200px;background:#1C2028;border:1px solid #2A2F38;color:#E5E5E5;padding:10px 12px;font:13px monospace;outline:none">
          <button class="btn" type="submit">VERIFY KEY</button>
        </form>
        <p style="margin-top:10px;font-size:11px;color:#6B7280">
          Server key hash: <code style="color:#9CA3AF">${serverHash}</code>
          &nbsp;&mdash;&nbsp;
          ${key ? `Your key hash: <code style="color:${hashKey(key) === serverHash ? "#6adb8a" : "#e08080"}">${hashKey(key)}</code> ${hashKey(key) === serverHash ? "(matches)" : "(no match)"}` : "No key provided"}
        </p>
       </div>`;

  return html(`
    <h2>SMS DIAGNOSTIC</h2>
    ${authSection}
    <h3>Twilio Configuration</h3>
    <table>
      ${row("TWILIO_ACCOUNT_SID",  sid   ? sid.slice(0,8)+"..."   : "NOT SET IN VERCEL", !!sid)}
      ${row("TWILIO_AUTH_TOKEN",   token ? token.slice(0,4)+"..." : "NOT SET IN VERCEL", !!token)}
      ${row("TWILIO_FROM_NUMBER",  from  ?? "NOT SET IN VERCEL",  !!from)}
      ${row("ALERT_PHONE_NUMBER",  to    ?? "NOT SET IN VERCEL",  !!to)}
      ${row("TWILIO_API_KEY",      apiKey ? apiKey.slice(0,8)+"..." : "not set (optional)", true)}
    </table>
    ${!allSet ? `<div class="card"><p class="bad">One or more Twilio env vars are missing in Vercel.</p>
      <p>Go to Vercel &rarr; downrangeco-shop &rarr; Settings &rarr; Environment Variables and add all four TWILIO_* vars, then redeploy.</p></div>` : ""}
    <hr>
    <h3>Toll-Free Number Fix (if code 30034)</h3>
    <p>The number +12062036281 is toll-free and requires Twilio verification before sending SMS.</p>
    <p><b>Option A &mdash; Verify toll-free (free, 1-3 business days):</b></p>
    <ol>
      <li>Go to <a href="https://console.twilio.com" target="_blank">console.twilio.com</a></li>
      <li>Phone Numbers &rarr; Manage &rarr; Active Numbers &rarr; click +12062036281</li>
      <li>Find "Toll-Free Verification" &rarr; submit form</li>
    </ol>
    <p style="margin-top:12px"><b>Option B &mdash; Buy local number (~$1.15/mo, instant):</b></p>
    <ol>
      <li>Twilio console &rarr; Buy a Number &rarr; search area code 206</li>
      <li>Buy &rarr; update TWILIO_FROM_NUMBER in Vercel &rarr; redeploy</li>
    </ol>
  `);
}

// POST — sends the actual SMS (requires auth)
export async function POST(req: NextRequest) {
  const url_key = req.nextUrl.searchParams.get("key");
  const hdr_key = req.headers.get("x-admin-key");
  let   body_key = "";

  const ct = req.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");
  const isForm = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart");

  if (isJson) {
    const b = await req.json().catch(() => ({}));
    body_key = b.key ?? "";
  }

  const key = url_key ?? hdr_key ?? body_key;

  if (key !== ADMIN_KEY) {
    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html") || isForm) {
      return html(`<h2>SMS DIAGNOSTIC</h2><p class="bad">Wrong admin key. <a href="/api/ops/test-sms">Try again</a></p>`, 401);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await writeLog({ level: "info", job: "sms-test", message: "Manual SMS test triggered from diagnostic page" });

  const result = await sendSMSAlert(
    `DownRange Shop SMS Test - ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT - All systems operational.`
  );

  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html") || isForm) {
    const ok = result.sent;
    return html(`
      <h2>SMS TEST RESULT</h2>
      <div class="card">
        ${ok
          ? `<p class="ok">SMS SENT SUCCESSFULLY</p>
             <table>
               <tr><td>Twilio SID</td><td class="ok">${result.twilioSid}</td></tr>
               <tr><td>Status</td><td class="ok">${result.twilioStatus}</td></tr>
               <tr><td>Sent to</td><td class="ok">${process.env.ALERT_PHONE_NUMBER}</td></tr>
             </table>`
          : `<p class="bad">SMS FAILED</p>
             <table>
               <tr><td>Error</td><td class="bad">${result.errorMessage ?? "Unknown"}</td></tr>
               <tr><td>Code</td><td class="bad">${result.errorCode ?? "?"}</td></tr>
               <tr><td>HTTP Status</td><td class="warn">${result.httpStatus ?? "?"}</td></tr>
             </table>
             ${result.errorCode === 30034 ? `<p class="warn">Code 30034 = Toll-Free Verification needed. See options below.</p>` : ""}
             ${result.errorCode === 21608 ? `<p class="warn">Code 21608 = Your number +12066016076 needs to be verified in Twilio console under Verified Caller IDs.</p>` : ""}
             ${result.httpStatus === 401  ? `<p class="warn">Auth failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Vercel env vars.</p>` : ""}
             ${result.httpStatus === 403  ? `<p class="warn">Forbidden. Account may be suspended or number not provisioned for SMS.</p>` : ""}`
        }
      </div>
      <p><a href="/api/ops/test-sms?key=${key}">&larr; Back to diagnostic</a></p>
      <hr>
      <p style="font-size:11px;color:#6B7280">Full log in Admin &rarr; Operations tab &rarr; filter "sms"</p>
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
      from_value:  process.env.TWILIO_FROM_NUMBER ?? "not set",
      to_value:    process.env.ALERT_PHONE_NUMBER  ?? "not set",
      api_key_set: !!process.env.TWILIO_API_KEY,
    },
  });
}
