// Central operations logger — all cron jobs, sync events, errors flow through here

const KV_URL   = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LOG_KEY  = "drshop:ops:log";
const MAX_LOGS = 500;

export type LogLevel = "info" | "warn" | "error" | "critical" | "ok";

export interface OpsLog {
  id:        string;
  ts:        string;          // ISO timestamp
  level:     LogLevel;
  job:       string;          // e.g. "product-sync", "health-check"
  message:   string;
  detail?:   string;
  duration?: number;          // ms
}

async function kv(method: string, path: string, body?: any) {
  if (!KV_URL || !KV_TOKEN) return null;
  const url = `${KV_URL}${path}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.ok ? res.json() : null;
}

export async function writeLog(entry: Omit<OpsLog, "id" | "ts">): Promise<void> {
  const log: OpsLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
    ...entry,
  };
  try {
    // LPUSH + LTRIM keeps the list capped at MAX_LOGS
    await kv("POST", `/lpush/${LOG_KEY}`, { value: JSON.stringify(log) });
    await kv("POST", `/ltrim/${LOG_KEY}`, { start: 0, stop: MAX_LOGS - 1 });
  } catch { /* never let logging kill a job */ }
}

export async function readLogs(count = 100): Promise<OpsLog[]> {
  try {
    const data = await kv("GET", `/lrange/${LOG_KEY}/0/${count - 1}`);
    if (!data?.result) return [];
    return data.result.map((s: string) => JSON.parse(s)).filter(Boolean);
  } catch { return []; }
}

export async function getStats(): Promise<{
  total: number; errors: number; warnings: number; lastRun: string | null;
}> {
  const logs = await readLogs(MAX_LOGS);
  return {
    total:    logs.length,
    errors:   logs.filter(l => l.level === "error" || l.level === "critical").length,
    warnings: logs.filter(l => l.level === "warn").length,
    lastRun:  logs[0]?.ts ?? null,
  };
}

// Wrapped job runner — times execution, catches errors, logs everything
export async function runJob<T>(
  name: string,
  fn: () => Promise<T>,
  alertOnFailure = true
): Promise<T | null> {
  const start = Date.now();
  try {
    const result = await fn();
    await writeLog({ level: "ok", job: name, message: "Completed successfully", duration: Date.now() - start });
    return result;
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await writeLog({ level: "error", job: name, message: "Job failed", detail: msg, duration: Date.now() - start });
    if (alertOnFailure) {
      await sendSMSAlert(`🚨 DownRange Shop — ${name} FAILED\n${msg.slice(0, 140)}`).catch(() => {});
    }
    return null;
  }
}

// SMS alerting via Twilio — only fires if credentials are set
export async function sendSMSAlert(message: string): Promise<boolean> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.ALERT_PHONE_NUMBER;
  if (!sid || !token || !from || !to) return false;

  try {
    const body = new URLSearchParams({ To: to, From: from, Body: message });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    return res.ok;
  } catch { return false; }
}

// Consecutive failure counter — alerts after N failures in a row
export async function checkConsecutiveFailures(job: string, threshold = 3): Promise<boolean> {
  try {
    const logs = await readLogs(50);
    const jobLogs = logs.filter(l => l.job === job).slice(0, threshold);
    const allFailed = jobLogs.length >= threshold && jobLogs.every(l => l.level === "error" || l.level === "critical");
    return allFailed;
  } catch { return false; }
}
