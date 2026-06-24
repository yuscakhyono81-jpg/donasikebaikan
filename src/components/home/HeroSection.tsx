"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    if (query.trim()) {
      router.push(`/campaign?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            Platform Resmi LAZIS NUR · Terpercaya & Terverifikasi
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Bersama Wujudkan{" "}
            <span className="text-secondary-300">Kebaikan Nyata</span>
          </h1>
          <p className="text-primary-100 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Donasikan zakat, infaq, dan sedekah Anda melalui platform crowdfunding
            resmi LAZIS NUR. Transparan, aman, dan berdampak nyata.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari campaign yang ingin didukung..."
              className="w-full pl-11 pr-32 py-3.5 rounded-xl text-slate-900 text-sm bg-white shadow-lg outline-none focus:ring-2 focus:ring-secondary-400"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Cari
            </Button>
          </form>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["Zakat", "Infaq", "Qurban", "Yatim Dhuafa", "Kesehatan"].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/campaign?category=${tag.toLowerCase().replace(" ", "_")}`)}
                className="text-xs font-medium bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: <Heart className="w-5 h-5" />, value: formatRupiah(stats.totalCollected, true), label: "Terkumpul" },
              { icon: <TrendingUp className="w-5 h-5" />, value: stats.totalDonors.toLocaleString("id-ID"), label: "Donatur" },
              { icon: <Shield className="w-5 h-5" />, value: stats.totalCampaigns.toString(), label: "Campaign Aktif" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                <div className="flex justify-center text-secondary-300 mb-1">{stat.icon}</div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-primary-200 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
