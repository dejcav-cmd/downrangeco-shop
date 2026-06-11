import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "160px", lineHeight: 1, color: "rgba(200,146,42,0.1)", letterSpacing: "0.04em", marginBottom: "-20px" }}>404</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px" }}>// Page not found</div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "0.04em", color: "var(--text)", marginBottom: "16px" }}>
            SHOT WENT <span style={{ color: "var(--gold)" }}>WIDE.</span>
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 300, marginBottom: "32px", maxWidth: "320px", margin: "0 auto 32px" }}>
            That page doesn't exist. Let's get you back on target.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/products" style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 24px", textDecoration: "none" }}>
              Shop Products
            </a>
            <a href="/" style={{ background: "transparent", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 24px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>
              Go Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
