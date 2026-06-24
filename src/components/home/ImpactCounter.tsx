"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Users, BookOpen, Home } from "lucide-react";
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
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, start]);

  return value;
}

function CounterItem({
  icon,
  label,
  target,
  format,
  color,
  started,
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  format: (n: number) => string;
  color: string;
  started: boolean;
}) {
  const value = useCountUp(target, 1800, started);
  return (
    <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{format(value)}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function ImpactCounter({ stats }: ImpactCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
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
      color: "bg-primary-600",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      label: "Donatur",
      target: stats.totalDonors,
      format: (n: number) => n.toLocaleString("id-ID"),
      color: "bg-blue-500",
    },
    {
      icon: <Home className="w-6 h-6 text-white" />,
      label: "Penerima Manfaat",
      target: stats.totalBeneficiaries,
      format: (n: number) => n.toLocaleString("id-ID"),
      color: "bg-secondary-500",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      label: "Campaign Selesai",
      target: stats.totalCampaignsCompleted,
      format: (n: number) => n.toLocaleString("id-ID"),
      color: "bg-purple-500",
    },
  ];

  return (
    <section ref={sectionRef} className="bg-gradient-to-br from-primary-50 to-slate-50 rounded-3xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dampak Nyata Bersama</h2>
        <p className="text-slate-500 text-sm">Setiap donasi menciptakan perubahan yang terasa</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" ref={sectionRef}>
        {items.map((item) => (
          <CounterItem key={item.label} {...item} started={started} />
        ))}
      </div>
    </section>
  );
}
