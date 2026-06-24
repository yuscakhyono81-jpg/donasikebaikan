import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🕐</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Akun Anda sedang diverifikasi
        </h1>
        <p className="text-slate-500 mb-2">
          Tim LAZIS NUR sedang memverifikasi akun affiliate Anda. Proses ini biasanya
          membutuhkan waktu 1×24 jam kerja.
        </p>
        <p className="text-slate-400 text-sm mb-8">
          Anda akan mendapat notifikasi via WhatsApp setelah akun disetujui.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button fullWidth>Kembali ke Beranda</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" fullWidth>
              Masuk dengan akun lain
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
