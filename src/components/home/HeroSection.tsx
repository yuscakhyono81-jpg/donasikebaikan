"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Heart, CheckCircle, Sparkles } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface HeroStats {
  totalCollected: number;
  totalDonors: number;
  totalCampaigns: number;
}

interface HeroSectionProps {
  stats: HeroStats;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/campaign?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[100svh] sm:min-h-[90vh] flex flex-col overflow-hidden">
      {/* Background image */}
      <Image
        src="/banner-donasi.png"
        alt="Banner DonasiKebaikan"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark gradient overlay — bottom-heavy so image shows at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      {/* Floating live notification cards — desktop only */}
      <div className="absolute right-8 xl:right-28 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-10">
        {/* Card 1 */}
        <div className="animate-float bg-white/95 backdrop-blur rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 min-w-[256px]">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary-600 fill-primary-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400">Donasi baru masuk</p>
            <p className="text-sm font-bold text-slate-900 truncate">Hamba Allah</p>
            <p className="text-[11px] text-slate-500 truncate">Rp 500.000 · Beasiswa Yatim</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-ping shrink-0" />
        </div>

        {/* Card 2 */}
        <div
          className="animate-float bg-white/95 backdrop-blur rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 min-w-[256px] self-end"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-secondary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400">Campaign selesai 🎉</p>
            <p className="text-sm font-bold text-slate-900 truncate">Target tercapai!</p>
            <p className="text-[11px] text-slate-500 truncate">Air Bersih Pedalaman NTT</p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className="animate-float bg-white/95 backdrop-blur rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 min-w-[256px]"
          style={{ animationDelay: "3s" }}
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400">Pencapaian hari ini</p>
            <p className="text-sm font-bold text-slate-900">Rp 12.5 Juta</p>
            <p className="text-[11px] text-slate-500">dari 48 donatur</p>
          </div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
        <div className="animate-fade-in inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Platform Resmi LAZIS NUR · Terpercaya &amp; Terverifikasi
        </div>
      </div>

      {/* Main content — bottom-aligned */}
      <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Headline */}
        <h1 className="animate-slide-up text-[clamp(3rem,9vw,6.5rem)] font-black text-white leading-none tracking-tight drop-shadow-lg">
          Satu Sedekah,
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 mb-6">
          <h1
            className="animate-slide-up text-[clamp(3rem,9vw,6.5rem)] font-black text-primary-400 leading-none tracking-tight drop-shadow-lg"
            style={{ animationDelay: "80ms" }}
          >
            Seribu Doa
          </h1>
          <p
            className="animate-slide-up text-slate-200 text-base sm:text-lg max-w-sm leading-snug drop-shadow"
            style={{ animationDelay: "160ms" }}
          >
            Zakat &amp; Sedekah tersalur transparan — setiap donasi tercatat, setiap dampak terbukti
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-slide-up flex flex-col sm:flex-row gap-3 mb-7"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/campaign">
            <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-lg shadow-black/30 hover:-translate-y-0.5 hover:shadow-xl">
              <Heart className="w-5 h-5 fill-white" />
              Mulai Berdonasi
            </button>
          </Link>
          <Link href="/campaign">
            <button className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 border border-white/30">
              Lihat Campaign <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="animate-slide-up relative max-w-lg mb-10"
          style={{ animationDelay: "300ms" }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari campaign..."
            className="w-full pl-11 pr-28 py-3.5 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 outline-none focus:bg-white/15 focus:border-primary-400 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Inline stats */}
        <div
          className="animate-slide-up flex flex-wrap items-center gap-6 sm:gap-10"
          style={{ animationDelay: "380ms" }}
        >
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow">
              {formatRupiah(stats.totalCollected, true)}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Dana Terkumpul</p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow">
              {stats.totalDonors.toLocaleString("id-ID")}+
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Donatur</p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow">
              {stats.totalCampaigns}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Campaign Aktif</p>
          </div>
        </div>
      </div>
    </section>
  );
}
