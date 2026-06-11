import { NextRequest, NextResponse } from "next/server";
import { writeLog, sendSMSAlert } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const SID       = process.env.TWILIO_ACCOUNT_SID!;
const API_KEY   = process.env.TWILIO_API_KEY;
const API_SEC   = process.env.TWILIO_API_SECRET;
const AUTH_TOK  = process.env.TWILIO_AUTH_TOKEN!;

function twAuth() {
  const user = API_KEY ?? SID;
  const pass = API_SEC ?? AUTH_TOK;
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

function html(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Provision Number</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font:14px/1.7 monospace;padding:32px 24px;background:#09090B;color:#E5E5E5;max-width:640px}
    h2{font:700 20px sans-serif;color:#C8922A;letter-spacing:.06em;margin-bottom:20px}h3{color:#e0a830;font:700 14px sans-serif;margin:16px 0 8px}
    .card{background:#111318;border:1px solid #1F2428;padding:16px;margin-bottom:16px}.ok{color:#6adb8a}.bad{color:#e08080}.warn{color:#e0a830}
    table{width:100%;border-collapse:collapse;margin:12px 0}td{padding:6px 10px 6px 0;border-bottom:1px solid #1F2428}td:first-child{color:#9CA3AF;width:180px}
    .btn{background:#C8922A;color:#09090B;border:none;padding:11px 24px;font:700 12px monospace;letter-spacing:.1em;cursor:pointer;text-transform:uppercase}
    .btn:hover{background:#E5A83A}.btn-buy{background:#16A34A;color:#fff}.btn-buy:hover{background:#15803D}
    a{color:#C8922A}p{color:#9CA3AF;margin-bottom:10px}hr{border:none;border-top:1px solid #1F2428;margin:20px 0}</style>
    </head><body>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// GET — show available numbers to buy
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key") ?? "";
  if (key !== ADMIN_KEY) {
    return html(`<h2>Provision Phone Number</h2>
      <div class="card">
        <p class="bad">Admin key required.</p>
        <form method="GET"><input name="key" placeholder="Admin key" style="background:#1C2028;border:1px solid #2A2F38;color:#E5E5E5;padding:9px 12px;font:13px monospace;width:260px;margin-right:8px">
        <button class="btn" type="submit">GO</button></form>
      </div>`, 401);
  }

  // Search for available 206 (Seattle) numbers
  let numbers: any[] = [];
  let searchErr = "";
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/AvailablePhoneNumbers/US/Local.json?AreaCode=206&SmsEnabled=true&Limit=5`,
      { headers: { Authorization: twAuth() }, signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    if (!res.ok) searchErr = data.message ?? `HTTP ${res.status}`;
    else numbers = data.available_phone_numbers ?? [];
  } catch (e: any) { searchErr = e.message; }

  // Also try 253 (Tacoma/Federal Way) if 206 empty
  let numbers253: any[] = [];
  if (numbers.length === 0 && !searchErr) {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${SID}/AvailablePhoneNumbers/US/Local.json?AreaCode=253&SmsEnabled=true&Limit=3`,
        { headers: { Authorization: twAuth() }, signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      numbers253 = data.available_phone_numbers ?? [];
    } catch {}
  }

  const allNumbers = [...numbers, ...numbers253];

  return html(`
    <h2>PROVISION PHONE NUMBER</h2>
    <div class="card">
      <p>The number +12062036281 belongs to a different Twilio account (error 21660).<br>
      Buy a local number on account ${SID.slice(0,8)}... to fix SMS.</p>
      <p class="warn">Cost: ~$1.15/month. Works immediately, no verification needed.</p>
    </div>

    ${searchErr ? `<div class="card"><p class="bad">Search error: ${searchErr}</p></div>` : ""}

    ${allNumbers.length > 0 ? `
      <h3>Available Numbers (Seattle/Tacoma area)</h3>
      <table>
        <tr><td><b>Number</b></td><td><b>Locality</b></td><td></td></tr>
        ${allNumbers.map(n => `
          <tr>
            <td class="ok">${n.phone_number}</td>
            <td>${n.locality ?? ""}, ${n.region ?? ""}</td>
            <td>
              <form method="POST" action="/api/ops/provision-number?key=${key}" style="display:inline">
                <input type="hidden" name="number" value="${n.phone_number}">
                <button class="btn btn-buy" type="submit">BUY $1.15/mo</button>
              </form>
            </td>
          </tr>`).join("")}
      </table>
    ` : !searchErr ? `<div class="card"><p class="warn">No numbers found in 206/253. <a href="/api/ops/provision-number?key=${key}&areacode=360">Try 360 (WA)</a></p></div>` : ""}

    <hr>
    <p><a href="/api/ops/test-sms?key=${key}">&larr; Back to SMS diagnostic</a></p>
    <p style="font-size:11px;color:#6B7280;margin-top:8px">After buying, this page auto-updates TWILIO_FROM_NUMBER in your Vercel env and triggers a redeploy.</p>
  `);
}

// POST — buy the selected number + update Vercel env
export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key") ?? "";
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct      = req.headers.get("content-type") ?? "";
  let   number  = "";

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart")) {
    const text = await req.text();
    number = new URLSearchParams(text).get("number") ?? "";
  } else {
    const body = await req.json().catch(() => ({}));
    number = body.number ?? "";
  }

  if (!number) return html(`<h2>Error</h2><p class="bad">No number specified.</p>`, 400);

  await writeLog({ level: "info", job: "provision", message: `Attempting to buy ${number}` });

  // 1. Buy the number
  try {
    const buyRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/IncomingPhoneNumbers.json`,
      {
        method: "POST",
        headers: { Authorization: twAuth(), "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ PhoneNumber: number, SmsMethod: "POST" }).toString(),
        signal: AbortSignal.timeout(15000),
      }
    );
    const buyData = await buyRes.json();
    if (!buyRes.ok) {
      await writeLog({ level: "error", job: "provision", message: `Buy failed: ${buyData.message}`, meta: { code: buyData.code, http: buyRes.status } });
      return html(`<h2>PURCHASE FAILED</h2><div class="card"><p class="bad">${buyData.message}</p><p>Code: ${buyData.code}</p></div>
        <p><a href="/api/ops/provision-number?key=${key}">&larr; Back</a></p>`);
    }

    await writeLog({ level: "ok", job: "provision", message: `Number purchased: ${number}`, detail: `SID: ${buyData.sid}` });

    // 2. Update Vercel env var TWILIO_FROM_NUMBER
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    let   vercelUpdated = false;
    let   vercelMsg     = "Vercel token not set — update TWILIO_FROM_NUMBER manually in Vercel Settings";

    if (VERCEL_TOKEN) {
      try {
        // Get project env vars to find the ID for TWILIO_FROM_NUMBER
        const projRes = await fetch(
          "https://api.vercel.com/v9/projects/downrangeco-shop/env",
          { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
        );
        const projData = await projRes.json();
        const existing = (projData.envs ?? []).find((e: any) => e.key === "TWILIO_FROM_NUMBER");

        if (existing) {
          // Update existing
          const upRes = await fetch(
            `https://api.vercel.com/v9/projects/downrangeco-shop/env/${existing.id}`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
              body: JSON.stringify({ value: number }),
            }
          );
          vercelUpdated = upRes.ok;
          vercelMsg = upRes.ok ? `Updated TWILIO_FROM_NUMBER to ${number}` : "Vercel update failed";
        } else {
          // Create new
          const crRes = await fetch(
            "https://api.vercel.com/v10/projects/downrangeco-shop/env",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
              body: JSON.stringify([{ key: "TWILIO_FROM_NUMBER", value: number, type: "encrypted", target: ["production", "preview"] }]),
            }
          );
          vercelUpdated = crRes.ok;
          vercelMsg = crRes.ok ? `Created TWILIO_FROM_NUMBER = ${number}` : "Vercel create failed";
        }
      } catch (e: any) { vercelMsg = `Vercel API error: ${e.message}`; }
    }

    return html(`
      <h2>NUMBER PURCHASED</h2>
      <div class="card">
        <p class="ok">Successfully purchased ${number}</p>
        <table>
          <tr><td>Phone Number</td><td class="ok">${number}</td></tr>
          <tr><td>Twilio SID</td><td>${buyData.sid}</td></tr>
          <tr><td>Vercel Update</td><td class="${vercelUpdated ? "ok" : "warn"}">${vercelMsg}</td></tr>
        </table>
      </div>
      ${!vercelUpdated ? `
        <div class="card">
          <p class="warn">Manually update in Vercel:</p>
          <p>Settings &rarr; Environment Variables &rarr; TWILIO_FROM_NUMBER &rarr; set to <b>${number}</b> &rarr; Save &rarr; Redeploy</p>
        </div>` : `
        <div class="card">
          <p class="ok">Vercel env updated. Trigger a redeploy to activate.</p>
          <p style="margin-top:8px"><a href="https://vercel.com/dejcav-cmd/downrangeco-shop/deployments" target="_blank" class="btn" style="display:inline-block;text-decoration:none">Redeploy on Vercel &rarr;</a></p>
        </div>`}
      <hr>
      <p><a href="/api/ops/test-sms?key=${key}">Test SMS with new number &rarr;</a></p>
    `);
  } catch (e: any) {
    await writeLog({ level: "error", job: "provision", message: "Provision exception", detail: e.message });
    return html(`<h2>ERROR</h2><div class="card"><p class="bad">${e.message}</p></div>`);
  }
}
