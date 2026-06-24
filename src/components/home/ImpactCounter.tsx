"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Users, Home, BookOpen } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface ImpactStats {
  totalCollected: number;
  totalDonors: number;
  totalBeneficiaries: number;
  totalCampaignsCompleted: number;
}

interface ImpactCounterProps {
  stats: ImpactStats;
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return value;
}

function CounterItem({
  icon,
  label,
  target,
  format,
  accentColor,
  started,
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  format: (n: number) => string;
  accentColor: string;
  started: boolean;
}) {
  const value = useCountUp(target, 1800, started);
  return (
    <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 group">
      <div
        className={`w-12 h-12 ${accentColor} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tabular-nums">
        {format(value)}
      </p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function ImpactCounter({ stats }: ImpactCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const items = [
    {
      icon: <Heart className="w-6 h-6 text-white fill-white" />,
      label: "Total Terkumpul",
      target: stats.totalCollected,
      format: (n: number) => formatRupiah(n, true),
      accentColor: "bg-primary-600",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      label: "Total Donatur",
      target: stats.totalDonors,
      format: (n: number) => n.toLocaleString("id-ID"),
      accentColor: "bg-blue-500",
    },
    {
      icon: <Home className="w-6 h-6 text-white" />,
      label: "Penerima Manfaat",
      target: stats.totalBeneficiaries,
      format: (n: number) => n.toLocaleString("id-ID"),
      accentColor: "bg-secondary-500",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      label: "Campaign Selesai",
      target: stats.totalCampaignsCompleted,
      format: (n: number) => n.toLocaleString("id-ID"),
      accentColor: "bg-purple-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative rounded-3xl p-8 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
      }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #bbf7d0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
            Dampak Nyata
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Dampak Nyata Bersama
          </h2>
          <p className="text-slate-500 text-sm">
            Setiap donasi menciptakan perubahan yang terasa
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <CounterItem key={item.label} {...item} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
