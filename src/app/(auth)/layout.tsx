import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-primary-700 font-black text-xl">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight">DonasiKebaikan</span>
        </Link>

        <div>
          <blockquote className="text-2xl font-semibold leading-relaxed mb-6">
            "Perumpamaan orang-orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan
            sebutir benih yang menumbuhkan tujuh bulir, pada tiap-tiap bulir seratus biji."
          </blockquote>
          <cite className="text-primary-200 text-sm not-italic">— QS. Al-Baqarah: 261</cite>
        </div>

        <div className="flex items-center gap-3 text-sm text-primary-200">
          <span>Powered by</span>
          <span className="font-bold text-white">LAZIS NUR</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black">D</span>
              </div>
              <span className="font-bold text-primary-700">DonasiKebaikan</span>
            </Link>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
