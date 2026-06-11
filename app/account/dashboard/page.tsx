import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AccountDashboard from "@/components/AccountDashboard";

export const metadata = { title: "My Account — Down Range Co." };

export default function DashboardPage() {
  return (
    <>
      <Masthead />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <AccountDashboard />
      </main>
      <Footer />
    </>
  );
}
