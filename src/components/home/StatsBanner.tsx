"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface StatsBannerProps {
  totalDonors: number;
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

export default function StatsBanner({ totalDonors }: StatsBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(totalDonors || 1234, 2200, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 text-center overflow-hidden bg-slate-50 border-y border-slate-100"
    >
      {/* Decorative large circles */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-100/60 pointer-events-none" />
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-100/60 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4">
        <p className="text-slate-500 text-base sm:text-lg mb-3">
          Bergabung Bersama Lebih Dari
        </p>

        {/* Big number */}
        <div className="text-[clamp(4rem,18vw,9rem)] font-black text-slate-900 leading-none tabular-nums tracking-tight mb-3">
          {count.toLocaleString("id-ID")}
          <span className="text-primary-500">+</span>
        </div>

        <p className="text-slate-500 text-base sm:text-lg mb-10">
          Donatur Aktif dari Seluruh Nusantara
        </p>

        <Link href="/register">
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-10 py-4 rounded-full text-base sm:text-lg transition-all duration-200 shadow-lg shadow-primary-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-200">
            Bergabung Sekarang!
          </button>
        </Link>
      </div>
    </section>
  );
}
