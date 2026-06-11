import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthPage from "@/components/AuthPage";

export const metadata = { title: "My Account — Down Range Co." };

export default function AccountPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <AuthPage />
      </main>
      <Footer />
    </>
  );
}
