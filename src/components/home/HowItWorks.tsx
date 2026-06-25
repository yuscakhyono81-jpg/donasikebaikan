"use client";

import { useEffect, useRef } from "react";
import { Search, CreditCard, HandHeart, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Search,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    numberColor: "text-primary-500",
    borderColor: "border-primary-200",
    title: "Pilih Program Kebaikan",
    desc: "Temukan campaign yang menyentuh hatimu — zakat, infaq, qurban, atau beasiswa yatim dhuafa.",
  },
  {
    number: "02",
    icon: CreditCard,
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-600",
    numberColor: "text-secondary-500",
    borderColor: "border-secondary-200",
    title: "Bayar dengan Mudah",
    desc: "Transfer bank, QRIS, atau dompet digital — selesai dalam hitungan menit, konfirmasi otomatis.",
  },
  {
    number: "03",
    icon: HandHeart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    numberColor: "text-blue-500",
    borderColor: "border-blue-200",
    title: "Dampak Nyata Tersalur",
    desc: "Donasi disalurkan transparan, laporan berkala dikirim langsung ke WhatsApp atau email kamu.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-4">
      {/* Heading */}
      <div className="scroll-reveal mb-12 text-center">
        <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-2">
          Cara Berdonasi
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          3 Langkah <em className="not-italic text-primary-600">Mudah</em> Berdonasi
        </h2>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base leading-relaxed">
          Dari pilih program hingga dampak tersalur — semua bisa kamu pantau sendiri.
        </p>
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        {/* Connecting line (desktop) */}
        <div className="absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-blue-200 hidden sm:block pointer-events-none" />

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="scroll-reveal relative flex flex-col items-center text-center"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Step circle with icon */}
              <div className="relative mb-5">
                <div className={`w-20 h-20 ${step.iconBg} rounded-2xl flex items-center justify-center shadow-md border-2 ${step.borderColor} relative z-10`}>
                  <Icon className={`w-9 h-9 ${step.iconColor}`} />
                </div>
                {/* Number badge */}
                <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 ${step.borderColor} flex items-center justify-center text-[11px] font-black ${step.numberColor} z-20`}>
                  {step.number}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[220px]">{step.desc}</p>

              {/* Arrow between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-9 -right-5 hidden sm:flex items-center justify-center z-20">
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
