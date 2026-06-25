"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, BookOpen, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils";

const NISAB_EMAS = 85;
const HARGA_EMAS_PER_GRAM = 1_100_000;
const NISAB_AMOUNT = NISAB_EMAS * HARGA_EMAS_PER_GRAM;

export default function ZakatCalculatorWidget() {
  const [harta, setHarta] = useState("");
  const [result, setResult] = useState<null | { wajib: boolean; zakat: number }>(null);

  const hitung = () => {
    const amount = Number(harta.replace(/\D/g, ""));
    if (!amount) return;
    const wajib = amount >= NISAB_AMOUNT;
    const zakat = wajib ? amount * 0.025 : 0;
    setResult({ wajib, zakat });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw ? Number(raw).toLocaleString("id-ID") : "";
    setHarta(formatted);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — info panel */}
        <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-8 sm:p-10 flex flex-col justify-between">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-600/20 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-900/40 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              Wajib Bagi Yang Mampu
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Kalkulator<br />Zakat Maal
            </h2>
            <p className="text-primary-200 text-sm leading-relaxed mb-8">
              Hitung kewajiban zakat hartamu dengan mudah. Zakat maal sebesar 2.5% dari total harta yang telah mencapai nisab dan haul.
            </p>

            {/* Info nisab */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3.5 border border-white/10">
                <Star className="w-4 h-4 text-secondary-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-semibold">Nisab Emas</p>
                  <p className="text-primary-300 text-xs mt-0.5">{NISAB_EMAS} gram emas = {formatRupiah(NISAB_AMOUNT)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3.5 border border-white/10">
                <Shield className="w-4 h-4 text-secondary-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-semibold">Kadar Zakat</p>
                  <p className="text-primary-300 text-xs mt-0.5">2.5% dari total harta yang dimiliki</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8">
            <Link href="/kalkulator-zakat" className="inline-flex items-center gap-1.5 text-primary-200 hover:text-white text-sm font-medium transition-colors">
              Kalkulator lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right — calculator */}
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hitung Zakatmu</h3>
              <p className="text-xs text-slate-500">Masukkan total harta yang dimiliki</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Harta (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  value={harta}
                  onChange={handleInput}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 inline-block" />
                Nisab: {formatRupiah(NISAB_AMOUNT)}
              </p>
            </div>

            <Button onClick={hitung} fullWidth disabled={!harta}>
              Hitung Zakat Saya
            </Button>

            {result && (
              <div className={`rounded-2xl p-5 ${result.wajib ? "bg-primary-50 border border-primary-100" : "bg-slate-50 border border-slate-200"}`}>
                {result.wajib ? (
                  <>
                    <p className="text-sm font-semibold text-primary-700 mb-1">Anda wajib membayar zakat</p>
                    <p className="text-3xl font-black text-primary-600 mb-4 tabular-nums">
                      {formatRupiah(result.zakat)}
                    </p>
                    <Link href="/campaign?category=zakat">
                      <Button size="sm" fullWidth>
                        Bayar Zakat Sekarang <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Belum wajib zakat</p>
                    <p className="text-sm text-slate-500">
                      Harta Anda belum mencapai nisab. Tapi Anda tetap bisa berinfaq atau bersedekah kapan saja.
                    </p>
                    <Link href="/campaign" className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium mt-3 hover:underline">
                      Lihat campaign infaq <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
