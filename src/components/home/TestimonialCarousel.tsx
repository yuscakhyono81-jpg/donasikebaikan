"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { DonationPrayer } from "@/types";

interface TestimonialCarouselProps {
  testimonials: DonationPrayer[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1)),
    [testimonials.length]
  );
  const prev = () => setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  return (
    <section
      className="relative rounded-3xl p-8 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative background quote */}
      <div className="absolute top-4 right-8 opacity-[0.06]">
        <Quote className="w-32 h-32 text-primary-600" />
      </div>

      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
            Doa &amp; Kesan
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Doa &amp; Kesan Donatur</h2>
          <p className="text-slate-500 text-sm">Semangat kebaikan dari para donatur kami</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Quote icon */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Quote className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          <blockquote className="text-center min-h-[100px] flex flex-col items-center justify-center">
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed italic mb-6">
              &ldquo;{current.message}&rdquo;
            </p>
            <footer className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {current.donor_name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-slate-900 mt-1">{current.donor_name}</p>
              {current.reply && (
                <div className="mt-3 bg-white rounded-xl px-4 py-3 text-sm text-slate-600 border border-primary-100 max-w-sm shadow-sm">
                  <p className="text-xs font-semibold text-primary-600 mb-1">
                    Balasan Tim LAZIS NUR:
                  </p>
                  <p className="italic">{current.reply}</p>
                </div>
              )}
            </footer>
          </blockquote>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-primary-600" : "w-1.5 bg-slate-300"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
