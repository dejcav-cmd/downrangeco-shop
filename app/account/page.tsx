import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AuthPage from "@/components/AuthPage";

export const metadata = { title: "My Account — Down Range Co." };

export default function AccountPage() {
  return (
    <>
      <Masthead />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <AuthPage />
      </main>
      <Footer />
    </>
  );
}
