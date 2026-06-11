#!/usr/bin/env python3
"""
DownRange Shop Monitor — runs on OpenClaw (Mac Mini)
Monitors shop.downrangeco.com every 5 minutes
Sends SMS via Twilio on failure
Logs to SQLite

Install:
  pip3 install requests schedule

Run once:
  python3 downrange_monitor.py

Run as background service (launchd):
  Create ~/Library/LaunchAgents/com.downrange.monitor.plist (see below)
"""

import requests
import schedule
import time
import sqlite3
import os
import json
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────
SHOP_URL        = "https://shop.downrangeco.com"
HEALTH_ENDPOINT = f"{SHOP_URL}/api/ops/health"
ADMIN_KEY       = os.environ.get("DR_ADMIN_KEY", "drco-admin-2026")
CHECK_INTERVAL  = 5  # minutes

# Twilio
TWILIO_SID      = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN    = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM     = os.environ.get("TWILIO_FROM_NUMBER", "")
ALERT_TO        = os.environ.get("ALERT_PHONE_NUMBER", "")

# Alert throttle — don't spam SMS
ALERT_COOLDOWN_SECS = 900   # 15 min between SMS for same issue
last_alert: dict = {}

# DB
DB_PATH = os.path.expanduser("~/downrange_monitor.db")

# ── Database ──────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS checks (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ts       TEXT    NOT NULL,
            status   TEXT    NOT NULL,
            latency  INTEGER,
            detail   TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ts       TEXT    NOT NULL,
            channel  TEXT    NOT NULL,
            message  TEXT    NOT NULL,
            sent     INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

def log_check(status: str, latency: int, detail: str = ""):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO checks (ts, status, latency, detail) VALUES (?,?,?,?)",
                 (datetime.utcnow().isoformat(), status, latency, detail))
    # Keep last 10,000 rows
    conn.execute("DELETE FROM checks WHERE id NOT IN (SELECT id FROM checks ORDER BY id DESC LIMIT 10000)")
    conn.commit()
    conn.close()

def log_alert(channel: str, message: str, sent: bool):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO alerts (ts, channel, message, sent) VALUES (?,?,?,?)",
                 (datetime.utcnow().isoformat(), channel, message, int(sent)))
    conn.commit()
    conn.close()

# ── SMS ───────────────────────────────────────────────────────────────
def send_sms(message: str, key: str = "default") -> bool:
    """Send SMS with throttle — won't fire again for same key within cooldown."""
    global last_alert
    now = time.time()
    if key in last_alert and now - last_alert[key] < ALERT_COOLDOWN_SECS:
        print(f"[SMS] Throttled ({key}) — cooldown active")
        return False
    if not all([TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, ALERT_TO]):
        print("[SMS] Twilio not configured — set env vars")
        log_alert("sms", message, False)
        return False
    try:
        resp = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json",
            auth=(TWILIO_SID, TWILIO_TOKEN),
            data={"To": ALERT_TO, "From": TWILIO_FROM, "Body": message},
            timeout=10,
        )
        sent = resp.status_code in (200, 201)
        if sent:
            last_alert[key] = now
            print(f"[SMS] Sent: {message[:60]}...")
        else:
            print(f"[SMS] Failed: {resp.status_code} {resp.text[:100]}")
        log_alert("sms", message, sent)
        return sent
    except Exception as e:
        print(f"[SMS] Error: {e}")
        log_alert("sms", message, False)
        return False

# ── Health Check ──────────────────────────────────────────────────────
consecutive_failures = 0
FAILURE_THRESHOLD    = 3  # SMS after this many consecutive failures

def run_check():
    global consecutive_failures
    start   = time.time()
    ts      = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    try:
        resp = requests.get(
            HEALTH_ENDPOINT,
            headers={"x-admin-key": ADMIN_KEY},
            timeout=15,
        )
        latency = int((time.time() - start) * 1000)
        data    = resp.json()
        status  = data.get("status", "unknown")
        checks  = data.get("checks", [])
        failed  = [c for c in checks if c.get("status") == "error"]
        detail  = f"HTTP {resp.status_code} · {status} · {len(failed)} errors"

        if resp.status_code >= 500 or status == "degraded":
            consecutive_failures += 1
            log_check("error", latency, detail)
            print(f"[{ts}] ❌ DEGRADED ({latency}ms) — {detail}")

            if consecutive_failures >= FAILURE_THRESHOLD:
                msg = (
                    f"🚨 DownRange Shop DOWN\n"
                    f"Status: {status}\n"
                    f"Failed checks: {', '.join(c['name'] for c in failed)}\n"
                    f"Time: {ts} UTC"
                )
                send_sms(msg, key="site-down")
        else:
            if consecutive_failures >= FAILURE_THRESHOLD:
                # Recovery — send all-clear
                send_sms(f"✅ DownRange Shop RECOVERED\nStatus: {status}\n{ts} UTC", key="site-recovered")
            consecutive_failures = 0
            log_check("ok", latency, detail)
            print(f"[{ts}] ✓ OK ({latency}ms) — {status}")

    except requests.exceptions.Timeout:
        consecutive_failures += 1
        latency = int((time.time() - start) * 1000)
        log_check("timeout", latency, "Request timed out after 15s")
        print(f"[{ts}] ⏱ TIMEOUT ({latency}ms)")
        if consecutive_failures >= FAILURE_THRESHOLD:
            send_sms(f"🚨 DownRange Shop TIMEOUT\nSite not responding after 15s\n{ts} UTC", key="timeout")

    except Exception as e:
        consecutive_failures += 1
        latency = int((time.time() - start) * 1000)
        log_check("error", latency, str(e))
        print(f"[{ts}] 💥 ERROR: {e}")
        if consecutive_failures >= FAILURE_THRESHOLD:
            send_sms(f"🚨 DownRange Shop Monitor ERROR\n{str(e)[:120]}\n{ts} UTC", key="monitor-error")

# ── Scheduled jobs ────────────────────────────────────────────────────
def daily_summary():
    """Send a daily status SMS summary at 8am."""
    conn  = sqlite3.connect(DB_PATH)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    rows  = conn.execute(
        "SELECT status, COUNT(*) FROM checks WHERE ts LIKE ? GROUP BY status",
        (f"{today}%",)
    ).fetchall()
    conn.close()
    counts = {r[0]: r[1] for r in rows}
    total  = sum(counts.values())
    errors = counts.get("error", 0) + counts.get("timeout", 0)
    uptime = round((1 - errors/total) * 100, 1) if total else 100
    msg = (
        f"📊 DownRange Shop Daily Report\n"
        f"Date: {today} UTC\n"
        f"Checks: {total} · Errors: {errors}\n"
        f"Uptime: {uptime}%"
    )
    send_sms(msg, key=f"daily-{today}")

# ── Main ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print(f"DownRange Shop Monitor starting")
    print(f"  Endpoint: {HEALTH_ENDPOINT}")
    print(f"  Interval: every {CHECK_INTERVAL} min")
    print(f"  SMS:      {'enabled' if TWILIO_SID else 'disabled (set TWILIO_* env vars)'}")
    print(f"  Alert to: {ALERT_TO or 'not set'}")
    print(f"  DB:       {DB_PATH}")
    print()

    # Run immediately
    run_check()

    # Schedule
    schedule.every(CHECK_INTERVAL).minutes.do(run_check)
    schedule.every().day.at("08:00").do(daily_summary)

    while True:
        schedule.run_pending()
        time.sleep(30)

# ── launchd plist (save to ~/Library/LaunchAgents/com.downrange.monitor.plist) ──
LAUNCHD_PLIST = """
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>             <string>com.downrange.monitor</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/path/to/downrange_monitor.py</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>DR_ADMIN_KEY</key>         <string>YOUR_ADMIN_KEY</string>
    <key>TWILIO_ACCOUNT_SID</key>   <string>YOUR_SID</string>
    <key>TWILIO_AUTH_TOKEN</key>    <string>YOUR_TOKEN</string>
    <key>TWILIO_FROM_NUMBER</key>   <string>+1XXXXXXXXXX</string>
    <key>ALERT_PHONE_NUMBER</key>   <string>+1XXXXXXXXXX</string>
  </dict>
  <key>RunAtLoad</key>        <true/>
  <key>KeepAlive</key>        <true/>
  <key>StandardOutPath</key>  <string>/tmp/downrange-monitor.log</string>
  <key>StandardErrorPath</key><string>/tmp/downrange-monitor.err</string>
</dict>
</plist>
"""
