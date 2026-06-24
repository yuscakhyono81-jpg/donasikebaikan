"use client";

import { useEffect, useRef } from "react";
import { Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    title: "Pilih & Donasi Instan",
    desc: "Temukan program kebaikan, pilih nominal, dan selesaikan pembayaran dalam hitungan menit melalui berbagai metode.",
  },
  {
    icon: Shield,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Aman & Terpercaya",
    desc: "Terdaftar resmi di Kemenag, NPWP aktif, dan seluruh campaign diverifikasi ketat oleh tim LAZIS NUR.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-600",
    title: "Transparan 100%",
    desc: "Laporan penyaluran dana dikirim langsung ke donatur secara berkala. Setiap rupiah bisa dilacak kemanfaatannya.",
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
      <div className="scroll-reveal mb-10">
        <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-2">
          Kenapa DonasiKebaikan?
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight max-w-xl">
          Donasi, <em className="not-italic text-primary-600">Cepat</em> seperti Kilat
        </h2>
        <p className="text-slate-500 mt-3 max-w-xl text-base leading-relaxed">
          Platform zakat &amp; donasi resmi LAZIS NUR dengan teknologi modern — aman,
          transparan, dan terasa dampaknya.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="scroll-reveal group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 ${f.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
