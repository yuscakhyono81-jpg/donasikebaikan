"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, Heart, TrendingUp, CheckCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface StatsBannerProps {
  totalDonors: number;
  totalCollected: number;
  totalCampaigns: number;
}

function useCountUp(target: number, duration = 2200, start = false) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!start || target === 0) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, start]);

  return value;
}

export default function StatsBanner({ totalDonors, totalCollected, totalCampaigns }: StatsBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  const donors = useCountUp(totalDonors || 1234, 2200, started);
  const campaigns = useCountUp(totalCampaigns || 45, 2000, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: TrendingUp,
      iconBg: "bg-primary-500/20",
      iconColor: "text-primary-400",
      value: formatRupiah(started ? totalCollected : 0, true),
      label: "Dana Terkumpul",
      suffix: "",
    },
    {
      icon: Users,
      iconBg: "bg-secondary-500/20",
      iconColor: "text-secondary-400",
      value: donors.toLocaleString("id-ID"),
      label: "Donatur Aktif",
      suffix: "+",
    },
    {
      icon: Heart,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      value: campaigns.toLocaleString("id-ID"),
      label: "Campaign Aktif",
      suffix: "",
    },
    {
      icon: CheckCircle,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
      value: "98",
      label: "% Dana Tersalur",
      suffix: "%",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-24 overflow-hidden bg-slate-900"
    >
      {/* Decorative blobs */}
      <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-primary-400 text-sm font-bold uppercase tracking-widest mb-2">
            Dampak Nyata
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Bersama Kita Berikan yang Terbaik
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors duration-300"
              >
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white tabular-nums leading-none mb-1">
                  {stat.value}
                  {stat.suffix && stat.suffix !== "%" && (
                    <span className="text-primary-400">{stat.suffix}</span>
                  )}
                  {stat.suffix === "%" && (
                    <span className="text-2xl text-primary-400">%</span>
                  )}
                </p>
                <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/register">
            <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-10 py-4 rounded-full text-base sm:text-lg transition-all duration-200 shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/30">
              Bergabung Sekarang!
            </button>
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            Sudah {(totalDonors || 1234).toLocaleString("id-ID")}+ donatur mempercayai kami
          </p>
        </div>
      </div>
    </section>
  );
}
