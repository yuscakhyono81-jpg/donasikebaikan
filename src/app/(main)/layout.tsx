import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import RealtimeDonationToast from "@/components/RealtimeDonationToast";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <RealtimeDonationToast />
    </>
  );
}
