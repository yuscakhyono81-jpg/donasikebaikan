"use client";

import { Quote, Heart } from "lucide-react";
import type { DonationPrayer } from "@/types";

interface TestimonialCarouselProps {
  testimonials: DonationPrayer[];
}

const CARD_COLORS = [
  { bg: "bg-primary-50", border: "border-primary-100", quote: "text-primary-300", avatar: "from-primary-500 to-primary-700", badge: "bg-primary-100 text-primary-700" },
  { bg: "bg-secondary-50", border: "border-secondary-100", quote: "text-secondary-300", avatar: "from-secondary-500 to-secondary-700", badge: "bg-secondary-100 text-secondary-700" },
  { bg: "bg-blue-50", border: "border-blue-100", quote: "text-blue-300", avatar: "from-blue-500 to-blue-700", badge: "bg-blue-100 text-blue-700" },
];

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  if (testimonials.length === 0) return null;

  const displayed = testimonials.slice(0, 3);

  return (
    <section>
      {/* Heading */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Heart className="w-3.5 h-3.5 fill-primary-500" />
          Doa &amp; Kesan
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Kata Mereka yang Sudah Berdonasi
        </h2>
        <p className="text-slate-500 text-sm">Semangat kebaikan dari para donatur kami</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map((t, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <div
              key={t.id}
              className={`relative ${color.bg} border ${color.border} rounded-3xl p-6 flex flex-col`}
            >
              {/* Decorative quote */}
              <Quote className={`w-10 h-10 ${color.quote} mb-4 shrink-0`} />

              {/* Message */}
              <blockquote className="flex-1">
                <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                  &ldquo;{t.message}&rdquo;
                </p>
              </blockquote>

              {/* Reply from LAZIS NUR */}
              {t.reply && (
                <div className="mb-4 bg-white rounded-xl px-4 py-3 text-xs text-slate-600 border border-slate-100 shadow-sm">
                  <p className={`text-[11px] font-bold mb-1 ${color.badge.split(" ")[1]}`}>
                    Balasan LAZIS NUR:
                  </p>
                  <p className="italic">{t.reply}</p>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className={`w-9 h-9 bg-gradient-to-br ${color.avatar} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                  {t.donor_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.donor_name}</p>
                  <p className="text-xs text-slate-400">Donatur LAZIS NUR</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
