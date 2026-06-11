"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "recover";

export default function AuthPage() {
  const { customer, login, register, recover, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && customer) router.replace("/account/dashboard");
  }, [customer, loading, router]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      if (mode === "login") {
        const err = await login(form.email, form.password);
        if (err) setError(err);
        else router.push("/account/dashboard");
      } else if (mode === "register") {
        const err = await register(form.firstName, form.lastName, form.email, form.password);
        if (err) setError(err);
        else router.push("/account/dashboard");
      } else {
        const sent = await recover(form.email);
        if (sent) setSuccess("Password reset email sent — check your inbox.");
        else setError("Could not send reset email. Check the address and try again.");
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.png" alt="Down Range Co." style={{ height: 48, width: "auto", objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: 28, letterSpacing: "0.08em", color: "var(--text)" }}>
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>
            {mode === "login" ? "Sign in to your account" : mode === "register" ? "Join the Down Range community" : "We'll send you a reset link"}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg2)", border: "1px solid rgba(255,255,255,0.06)", padding: 32 }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["login", "register"] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "10px 20px", background: "transparent", border: "none", borderBottom: `2px solid ${mode === m ? "var(--gold)" : "transparent"}`, color: mode === m ? "var(--gold)" : "var(--muted)", cursor: "pointer", flex: 1, transition: "color 0.15s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Register fields */}
            {mode === "register" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <FieldLabel>First Name</FieldLabel>
                  <Input value={form.firstName} onChange={set("firstName")} placeholder="DJ" />
                </div>
                <div>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input value={form.lastName} onChange={set("lastName")} placeholder="Cavalcanti" />
                </div>
              </div>
            )}

            <div>
              <FieldLabel>Email Address</FieldLabel>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
            </div>

            {mode !== "recover" && (
              <div>
                <FieldLabel>Password</FieldLabel>
                <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={(e: any) => e.key === "Enter" && submit()} />
              </div>
            )}

            {/* Error / success */}
            {error && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#e08080", padding: "10px 12px", background: "rgba(184,64,64,0.1)", border: "1px solid rgba(184,64,64,0.3)" }}>{error}</div>}
            {success && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6adb8a", padding: "10px 12px", background: "rgba(42,106,58,0.1)", border: "1px solid rgba(42,106,58,0.3)" }}>{success}</div>}

            {/* Submit */}
            <button onClick={submit} disabled={submitting}
              style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: 14, border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, marginTop: 4, transition: "background 0.2s" }}>
              {submitting ? "Please wait..." : mode === "login" ? "Sign In →" : mode === "register" ? "Create Account →" : "Send Reset Link →"}
            </button>

            {/* Forgot password */}
            {mode === "login" && (
              <button onClick={() => { setMode("recover"); setError(""); }} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", cursor: "pointer", padding: "4px 0", textAlign: "center" }}>
                Forgot your password?
              </button>
            )}
            {mode === "recover" && (
              <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", cursor: "pointer", padding: "4px 0", textAlign: "center" }}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center", marginTop: 20 }}>
          🔒 Secure · Powered by Shopify
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{children}</div>;
}
function Input({ type = "text", value, onChange, placeholder, onKeyDown }: any) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{ width: "100%", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 13, padding: "11px 14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(200,146,42,0.4)")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}
