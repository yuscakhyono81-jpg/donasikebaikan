"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
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
    <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kalkulator Zakat</h2>
            <p className="text-xs text-slate-500">Hitung kewajiban zakat maal Anda</p>
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
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Nisab: {formatRupiah(NISAB_AMOUNT)} (85 gram emas)
            </p>
          </div>

          <Button onClick={hitung} fullWidth disabled={!harta}>
            Hitung Zakat
          </Button>

          {result && (
            <div className={`rounded-xl p-4 ${result.wajib ? "bg-primary-50 border border-primary-100" : "bg-slate-50 border border-slate-200"}`}>
              {result.wajib ? (
                <>
                  <p className="text-sm font-semibold text-primary-700 mb-1">Anda wajib membayar zakat</p>
                  <p className="text-2xl font-extrabold text-primary-600 mb-3">
                    {formatRupiah(result.zakat)}
                  </p>
                  <Link href="/campaign?category=zakat">
                    <Button size="sm" fullWidth>
                      Bayar Zakat Sekarang <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-600 font-medium">
                  Belum mencapai nisab. Harta Anda belum wajib zakat, tapi Anda tetap bisa berinfaq. ☺️
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          <Link href="/kalkulator-zakat" className="text-primary-600 hover:underline">
            Kalkulator lengkap →
          </Link>
        </p>
      </div>
    </section>
  );
}
