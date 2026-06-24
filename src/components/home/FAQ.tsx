"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Bagaimana cara berdonasi di DonasiKebaikan?",
    a: "Pilih campaign yang ingin didukung, klik tombol Donasi, masukkan nominal, lalu selesaikan pembayaran via transfer bank, e-wallet, QRIS, atau kartu kredit. Konfirmasi otomatis dikirim via WhatsApp/email.",
  },
  {
    q: "Apakah donasi saya aman dan terpercaya?",
    a: "Ya. DonasiKebaikan adalah platform resmi LAZIS NUR yang terdaftar di Kemenag, memiliki NPWP aktif, dan izin operasional lengkap. Seluruh dana dikelola secara akuntabel dengan audit berkala.",
  },
  {
    q: "Bisakah saya berdonasi atas nama orang lain atau almarhum?",
    a: "Tentu. Saat mengisi form donasi, Anda dapat mencantumkan nama penerima donasi dan menyertakan pesan doa. Donasi atas nama almarhum/almarhumah sangat dianjurkan dalam Islam.",
  },
  {
    q: "Bagaimana dana donasi saya digunakan?",
    a: "Setiap campaign memiliki target dan program yang jelas. Kami menerbitkan laporan penyaluran dana secara berkala yang bisa Anda akses di dashboard donatur atau kami kirimkan langsung ke WhatsApp Anda.",
  },
  {
    q: "Apakah ada potongan biaya administrasi?",
    a: "Potongan platform sangat minimal (2–3% untuk biaya payment gateway) dan sudah diperhitungkan dalam struktur campaign. Kami berkomitmen agar manfaat donasi Anda terasa maksimal.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-4">
      <div className="scroll-reveal mb-10">
        <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-2">FAQ</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          Pertanyaan yang<br />Sering Ditanyakan.
        </h2>
      </div>

      <div className="space-y-2 max-w-3xl">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="scroll-reveal border border-slate-200 rounded-2xl overflow-hidden bg-white transition-shadow hover:border-primary-200"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {/* Answer — animated with max-height trick */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "200px" : "0px" }}
              >
                <p className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
