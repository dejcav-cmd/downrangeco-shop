import { NextRequest, NextResponse } from "next/server";
import { loginRatelimit, checkRateLimit } from "@/lib/ratelimit";
import { writeLog } from "@/lib/opsLogger";
import { loginCustomer, logoutCustomer, getCustomer, updateCustomer, createCustomer, sendMagicLink } from "@/lib/customer";
import { cookies } from "next/headers";

const COOKIE = "dr_customer_token";
const COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "me";
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;

  if (action === "me") {
    if (!token) return NextResponse.json({ customer: null });
    const customer = await getCustomer(token);
    if (!customer) {
      const res = NextResponse.json({ customer: null });
      res.cookies.delete(COOKIE);
      return res;
    }
    return NextResponse.json({ customer });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const jar = await cookies();

  switch (action) {
    case "login": {
      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      const { allowed } = await checkRateLimit(loginRatelimit, `login:${ip}`);
      if (!allowed) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
      const { email, password } = body;
      const result = await loginCustomer(email, password);
      if (!result.token) {
        await writeLog({ level:"warn", job:"auth", message:"Login failed", detail:`Email: ${body.email} · ${result.error}` });
        await writeLog({ level:"warn", job:"auth", message:"Login failed", detail:`${body.email}` });
        return NextResponse.json({ error: result.error ?? "Invalid credentials" }, { status: 401 });
      }
      await writeLog({ level:"ok", job:"auth", message:"Customer login", detail:body.email });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE, result.token, COOKIE_OPTS);
      return res;
    }
    case "register": await writeLog({ level:"info", job:"auth", message:"New registration", detail:body.email }); /* falls through */
    case "register_exec": {
      await writeLog({ level:"info", job:"auth", message:"New customer registration", detail:body.email });
      const { firstName, lastName, email, password } = body;
      const result = await createCustomer({ firstName, lastName, email, password });
      if (!result.customer) return NextResponse.json({ error: result.error }, { status: 400 });
      // Auto-login after register
      const loginResult = await loginCustomer(email, password);
      if (loginResult.token) {
        await writeLog({ level:"ok", job:"auth", message:"Customer login", detail:`${body.email}` });
      const res = NextResponse.json({ ok: true, customer: result.customer });
        res.cookies.set(COOKIE, loginResult.token, COOKIE_OPTS);
        return res;
      }
      return NextResponse.json({ ok: true });
    }
    case "logout": { await writeLog({ level:"info", job:"auth", message:"Customer logout" });
      await writeLog({ level:"info", job:"auth", message:"Customer logout" });
      const token = jar.get(COOKIE)?.value;
      if (token) await logoutCustomer(token).catch(() => {});
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(COOKIE);
      return res;
    }
    case "recover": {
      const result = await sendMagicLink(body.email);
      return NextResponse.json(result);
    }
    case "update": {
      const token = jar.get(COOKIE)?.value;
      if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const result = await updateCustomer(token, body.data);
      if (!result.customer) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ customer: result.customer });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
