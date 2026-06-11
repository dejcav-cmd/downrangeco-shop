const KV_URL   = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LOG_KEY  = "drshop:ops:log";
const MAX_LOGS = 500;

export type LogLevel = "ok" | "info" | "warn" | "error" | "critical";

export interface OpsLog {
  id:        string;
  ts:        string;
  level:     LogLevel;
  job:       string;
  message:   string;
  detail?:   string;
  duration?: number;
  meta?:     Record<string, string | number | boolean | null>;
}

async function kv(path: string, body?: any): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}${path}`, {
      method:  body !== undefined ? "POST" : "GET",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body:    body !== undefined ? JSON.stringify(body) : undefined,
      cache:   "no-store",
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

// ── Write ────────────────────────────────────────────────────────────
export async function writeLog(entry: Omit<OpsLog, "id" | "ts">): Promise<void> {
  const log: OpsLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date().toISOString(),
    ...entry,
  };
  try {
    await kv(`/lpush/${LOG_KEY}`, { value: JSON.stringify(log) });
    await kv(`/ltrim/${LOG_KEY}`, { start: 0, stop: MAX_LOGS - 1 });
  } catch { /* logging must never crash a job */ }
}

// ── Read ─────────────────────────────────────────────────────────────
export async function readLogs(count = 200): Promise<OpsLog[]> {
  try {
    const data = await kv(`/lrange/${LOG_KEY}/0/${Math.min(count, MAX_LOGS) - 1}`);
    if (!data?.result) return [];
    return (data.result as string[])
      .map(s => { try { return JSON.parse(s) as OpsLog; } catch { return null; } })
      .filter((x): x is OpsLog => x !== null);
  } catch { return []; }
}

// ── Clear ────────────────────────────────────────────────────────────
export async function clearLogs(): Promise<void> {
  await kv(`/del/${LOG_KEY}`, {});
}

// ── Stats ─────────────────────────────────────────────────────────────
export async function getStats() {
  const logs = await readLogs(MAX_LOGS);
  return {
    total:       logs.length,
    errors:      logs.filter(l => l.level === "error" || l.level === "critical").length,
    warnings:    logs.filter(l => l.level === "warn").length,
    smsAttempts: logs.filter(l => l.job === "sms").length,
    smsFailed:   logs.filter(l => l.job === "sms" && (l.level === "error" || l.level === "warn")).length,
    cartActions: logs.filter(l => l.job === "cart").length,
    authEvents:  logs.filter(l => l.job === "auth").length,
    lastRun:     logs[0]?.ts ?? null,
  };
}

// ── SMS — always logs, even on missing config ─────────────────────────
export async function sendSMSAlert(message: string): Promise<{
  sent: boolean; twilioSid?: string; twilioStatus?: string;
  errorMessage?: string; errorCode?: number; httpStatus?: number;
}> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.ALERT_PHONE_NUMBER;

  // Log immediately — even if not configured
  if (!sid || !token || !from || !to) {
    const missing = [!sid && "TWILIO_ACCOUNT_SID", !token && "TWILIO_AUTH_TOKEN", !from && "TWILIO_FROM_NUMBER", !to && "ALERT_PHONE_NUMBER"].filter(Boolean).join(", ");
    await writeLog({ level: "warn", job: "sms", message: "SMS skipped — not configured", detail: `Missing env vars: ${missing}` });
    return { sent: false, errorMessage: `Missing: ${missing}` };
  }

  const start = Date.now();
  let twilioData: any = {};
  let httpStatus = 0;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }).toString(),
      }
    );

    httpStatus    = res.status;
    twilioData    = await res.json().catch(() => ({}));
    const ok      = res.ok && !!twilioData.sid;
    const duration = Date.now() - start;

    if (ok) {
      await writeLog({
        level: "ok", job: "sms",
        message: `SMS sent → ${to}`,
        detail:  `SID: ${twilioData.sid} · Status: ${twilioData.status} · From: ${from}`,
        duration,
        meta:    { http_status: httpStatus, twilio_status: twilioData.status, twilio_sid: twilioData.sid },
      });
      return { sent: true, twilioSid: twilioData.sid, twilioStatus: twilioData.status, httpStatus };
    } else {
      const errMsg  = twilioData.message ?? twilioData.error_message ?? "Unknown Twilio error";
      const errCode = twilioData.code ?? twilioData.error_code ?? null;
      await writeLog({
        level: "error", job: "sms",
        message: `SMS FAILED → ${to}`,
        detail:  `HTTP ${httpStatus} · Code ${errCode} · ${errMsg}`,
        duration,
        meta:    { http_status: httpStatus, twilio_code: errCode, from_number: from, to_number: to },
      });
      return { sent: false, errorMessage: errMsg, errorCode: errCode, httpStatus };
    }
  } catch (e: any) {
    const duration = Date.now() - start;
    await writeLog({
      level: "error", job: "sms",
      message: `SMS exception → ${to}`,
      detail:  e.message,
      duration,
      meta:    { http_status: httpStatus, from_number: from, to_number: to },
    });
    return { sent: false, errorMessage: e.message, httpStatus };
  }
}

// ── Job runner ────────────────────────────────────────────────────────
export async function runJob<T>(
  name: string,
  fn: () => Promise<T>,
  alertOnFailure = true
): Promise<T | null> {
  const start = Date.now();
  await writeLog({ level: "info", job: name, message: "Job started" });
  try {
    const result = await fn();
    await writeLog({ level: "ok", job: name, message: "Job completed", duration: Date.now() - start });
    return result;
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await writeLog({ level: "error", job: name, message: "Job FAILED", detail: msg, duration: Date.now() - start });
    if (alertOnFailure) await sendSMSAlert(`🚨 DownRange Shop — ${name} FAILED\n${msg.slice(0, 140)}`);
    return null;
  }
}

// ── Consecutive failure check ─────────────────────────────────────────
export async function checkConsecutiveFailures(job: string, threshold = 3): Promise<boolean> {
  const logs    = await readLogs(50);
  const jobLogs = logs.filter(l => l.job === job && l.level !== "info").slice(0, threshold);
  return jobLogs.length >= threshold && jobLogs.every(l => l.level === "error" || l.level === "critical");
}
