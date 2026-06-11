import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.ALERT_PHONE_NUMBER;

  // Return config state for diagnosis
  const config = {
    sid_set:    !!sid,
    sid_prefix: sid?.slice(0, 6),
    token_set:  !!token,
    from_set:   !!from,
    from_value: from,
    to_set:     !!to,
    to_value:   to,
  };

  if (!sid || !token || !from || !to) {
    return NextResponse.json({ sent: false, config, error: "Missing credentials" });
  }

  try {
    const body = new URLSearchParams({
      To:   to,
      From: from,
      Body: `🧪 DownRange Shop SMS Test — ${new Date().toISOString()} — All systems go!`,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await res.json();

    return NextResponse.json({
      sent:        res.ok,
      http_status: res.status,
      twilio_sid:  data.sid,
      twilio_status: data.status,
      twilio_error:  data.message ?? data.error_message ?? null,
      twilio_code:   data.code ?? null,
      config,
    });
  } catch (e: any) {
    return NextResponse.json({ sent: false, config, error: e.message });
  }
}
