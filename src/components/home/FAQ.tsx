"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus, HelpCircle, MessageCircle } from "lucide-react";

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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
        {/* Left — heading + decoration */}
        <div className="scroll-reveal lg:col-span-2 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-100 mb-5">
            <MessageCircle className="w-3.5 h-3.5" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
            Pertanyaan yang<br />
            <em className="not-italic text-primary-600">Sering Ditanyakan</em>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-8">
            Belum menemukan jawaban yang kamu cari? Hubungi kami langsung.
          </p>

          {/* Big decorative icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center">
              <HelpCircle className="w-12 h-12 text-primary-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-400 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
              {FAQS.length}
            </div>
          </div>

          <div className="mt-8">
            <a
              href="https://wa.me/62811234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Hubungi via WhatsApp →
            </a>
          </div>
        </div>

        {/* Right — accordion */}
        <div className="lg:col-span-3 space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="scroll-reveal border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:border-primary-200 hover:shadow-sm"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 text-xs font-black tabular-nums w-5 ${isOpen ? "text-primary-600" : "text-slate-300"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">
                      {faq.q}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isOpen ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? "200px" : "0px" }}
                >
                  <p className="px-6 pb-5 pl-14 text-slate-600 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
