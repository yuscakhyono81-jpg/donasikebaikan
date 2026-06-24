"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { DonationPrayer } from "@/types";

interface TestimonialCarouselProps {
  testimonials: DonationPrayer[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const prev = () => setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  const current = testimonials[index];

  return (
    <section className="bg-primary-50 rounded-3xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Doa & Kesan Donatur</h2>
        <p className="text-slate-500 text-sm">Semangat kebaikan dari para donatur</p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <Quote className="w-10 h-10 text-primary-200 mb-4 mx-auto" />

        <blockquote className="text-center">
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed italic mb-6">
            &ldquo;{current.message}&rdquo;
          </p>
          <footer className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {current.donor_name.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-slate-900">{current.donor_name}</p>
            {current.reply && (
              <div className="mt-3 bg-white rounded-xl px-4 py-3 text-sm text-slate-600 border border-primary-100 max-w-sm">
                <p className="text-xs font-semibold text-primary-600 mb-1">Balasan Tim LAZIS NUR:</p>
                <p className="italic">{current.reply}</p>
              </div>
            )}
          </footer>
        </blockquote>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary-600" : "w-1.5 bg-slate-300"}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
