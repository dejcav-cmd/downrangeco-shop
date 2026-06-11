import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AccountDashboard from "@/components/AccountDashboard";

export const metadata = { title: "My Account — Down Range Co." };

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <AccountDashboard />
      </main>
      <Footer />
    </>
  );
}
