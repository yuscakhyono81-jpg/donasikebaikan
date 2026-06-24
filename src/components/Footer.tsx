import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";

const FOOTER_LINKS = {
  program: [
    { href: "/campaign?category=zakat", label: "Zakat" },
    { href: "/campaign?category=infaq", label: "Infaq & Sedekah" },
    { href: "/campaign?category=qurban", label: "Qurban" },
    { href: "/campaign?category=pendidikan", label: "Pendidikan" },
    { href: "/campaign?category=kesehatan", label: "Kesehatan" },
    { href: "/kalkulator-zakat", label: "Kalkulator Zakat" },
  ],
  info: [
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/tentang/legalitas", label: "Legalitas" },
    { href: "/tentang/laporan", label: "Laporan Keuangan" },
    { href: "/register/affiliate", label: "Jadi Mitra Afiliasi" },
    { href: "/dashboard/donor/proposals/new", label: "Usul Penerima Manfaat" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-extrabold text-xl text-white leading-none">
                Donasi<span className="text-primary-400">Kebaikan</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">
              Platform penghimpunan dana zakat, infaq, qurban, dan program sosial resmi LAZIS NUR.
              Bersama wujudkan kebaikan nyata untuk sesama.
            </p>
            <p className="text-xs text-slate-500 mb-3">Terdaftar & diawasi:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">SK Kemenag</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">NPWP Resmi</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">Izin Operasional</span>
            </div>
          </div>

          {/* Program */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Program</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.program.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Informasi</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Sosmed */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm">Ikuti Kami</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/lazisnur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram LAZIS NUR"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 3.795a6.042 6.042 0 1 0 0 12.084 6.042 6.042 0 0 0 0-12.084zm0 2.163a3.879 3.879 0 1 1 0 7.758 3.879 3.879 0 0 1 0-7.758zm6.406-3.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@lazisnur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="YouTube LAZIS NUR"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="WhatsApp Admin"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DonasiKebaikan. Hak cipta dilindungi.</p>
          <p>
            Powered by{" "}
            <span className="text-primary-400 font-semibold">LAZIS NUR</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
