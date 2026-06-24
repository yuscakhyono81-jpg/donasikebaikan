"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils";

// Nisab: 85 gram emas × harga emas per gram
const NISAB_EMAS_GRAM = 85;
const HARGA_EMAS_PER_GRAM = 1_100_000;
const NISAB_MAAL = NISAB_EMAS_GRAM * HARGA_EMAS_PER_GRAM;

// Haul: 1 tahun lunar ≈ 354 hari
// Nishab Perak: 595 gram × harga perak per gram
const HARGA_PERAK_PER_GRAM = 14_000;
const NISAB_PERAK = 595 * HARGA_PERAK_PER_GRAM;

type Tab = "maal" | "penghasilan" | "emas";

interface MaalForm {
  tabungan: string;
  emas: string;
  investasi: string;
  piutang: string;
  hutang: string;
}

interface PenghasilanForm {
  gajiPerBulan: string;
  penghasilanLain: string;
  kebutuhanPokok: string;
}

interface EmasForm {
  emasGram: string;
  perakGram: string;
}

function toNumber(s: string): number {
  return Number(s.replace(/\D/g, "")) || 0;
}

function formatInput(e: React.ChangeEvent<HTMLInputElement>): string {
  const raw = e.target.value.replace(/\D/g, "");
  return raw ? Number(raw).toLocaleString("id-ID") : "";
}

const tooltips: Record<string, string> = {
  tabungan: "Saldo tabungan + deposito + uang tunai yang sudah dimiliki ≥ 1 tahun",
  emas: "Emas / perhiasan yang disimpan sebagai investasi (bukan yang dipakai sehari-hari)",
  investasi: "Saham, reksa dana, obligasi yang sudah cair atau dapat dicairkan",
  piutang: "Uang yang dipinjamkan kepada orang lain dan kemungkinan besar dapat kembali",
  hutang: "Hutang jatuh tempo dalam waktu dekat yang harus dibayar dari harta di atas",
};

export default function ZakatCalculator() {
  const [tab, setTab] = useState<Tab>("maal");

  // Zakat Maal
  const [maal, setMaal] = useState<MaalForm>({
    tabungan: "", emas: "", investasi: "", piutang: "", hutang: "",
  });
  const [maalResult, setMaalResult] = useState<null | { totalHarta: number; zakatAmount: number; wajib: boolean }>(null);

  // Zakat Penghasilan
  const [penghasilan, setPenghasilan] = useState<PenghasilanForm>({
    gajiPerBulan: "", penghasilanLain: "", kebutuhanPokok: "",
  });
  const [penghasilanResult, setPenghasilanResult] = useState<null | {
    penghasilanBersih: number; zakatPerBulan: number; zakatPerTahun: number; wajib: boolean;
  }>(null);

  // Zakat Emas/Perak
  const [emasForm, setEmasForm] = useState<EmasForm>({ emasGram: "", perakGram: "" });
  const [emasResult, setEmasResult] = useState<null | {
    nilaiEmas: number; nilaiPerak: number; zakatEmas: number; zakatPerak: number; wajibEmas: boolean; wajibPerak: boolean;
  }>(null);

  // Maal handlers
  function handleMaalInput(field: keyof MaalForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaal((p) => ({ ...p, [field]: formatInput(e) }));
      setMaalResult(null);
    };
  }

  function hitungMaal() {
    const total =
      toNumber(maal.tabungan) +
      toNumber(maal.emas) +
      toNumber(maal.investasi) +
      toNumber(maal.piutang) -
      toNumber(maal.hutang);
    const wajib = total >= NISAB_MAAL;
    setMaalResult({ totalHarta: total, zakatAmount: wajib ? Math.floor(total * 0.025) : 0, wajib });
  }

  // Penghasilan handlers
  function handlePenghasilanInput(field: keyof PenghasilanForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPenghasilan((p) => ({ ...p, [field]: formatInput(e) }));
      setPenghasilanResult(null);
    };
  }

  function hitungPenghasilan() {
    const pendapatan = toNumber(penghasilan.gajiPerBulan) + toNumber(penghasilan.penghasilanLain);
    const bersih = pendapatan - toNumber(penghasilan.kebutuhanPokok);
    // Nisab penghasilan: NISAB_MAAL / 12 per bulan
    const nisabBulanan = NISAB_MAAL / 12;
    const wajib = bersih >= nisabBulanan;
    const zakatPerBulan = wajib ? Math.floor(bersih * 0.025) : 0;
    setPenghasilanResult({
      penghasilanBersih: bersih,
      zakatPerBulan,
      zakatPerTahun: zakatPerBulan * 12,
      wajib,
    });
  }

  // Emas handlers
  function handleEmasInput(field: keyof EmasForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d.,]/g, "");
      setEmasForm((p) => ({ ...p, [field]: raw }));
      setEmasResult(null);
    };
  }

  function hitungEmas() {
    const gram = parseFloat(emasForm.emasGram.replace(",", ".")) || 0;
    const perakGram = parseFloat(emasForm.perakGram.replace(",", ".")) || 0;
    const nilaiEmas = gram * HARGA_EMAS_PER_GRAM;
    const nilaiPerak = perakGram * HARGA_PERAK_PER_GRAM;
    const wajibEmas = nilaiEmas >= NISAB_MAAL;
    const wajibPerak = nilaiPerak >= NISAB_PERAK;
    setEmasResult({
      nilaiEmas,
      nilaiPerak,
      zakatEmas: wajibEmas ? Math.floor(nilaiEmas * 0.025) : 0,
      zakatPerak: wajibPerak ? Math.floor(nilaiPerak * 0.025) : 0,
      wajibEmas,
      wajibPerak,
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "maal", label: "Zakat Maal" },
    { id: "penghasilan", label: "Zakat Penghasilan" },
    { id: "emas", label: "Zakat Emas & Perak" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Kalkulator Zakat</h2>
            <p className="text-sm text-primary-100">Hitung kewajiban zakat Anda dengan mudah</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-max px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* === ZAKAT MAAL === */}
        {tab === "maal" && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Zakat maal wajib jika total harta bersih ≥ Nisab ({formatRupiah(NISAB_MAAL)}) dan sudah dimiliki selama 1 tahun (haul).
              </p>
            </div>

            {(["tabungan", "emas", "investasi", "piutang"] as const).map((field) => (
              <MaalField
                key={field}
                label={fieldLabel[field]}
                value={maal[field]}
                tooltip={tooltips[field]}
                onChange={handleMaalInput(field)}
              />
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hutang Jatuh Tempo (Rp) <span className="text-xs text-red-500">pengurang</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                <input
                  type="text"
                  value={maal.hutang}
                  onChange={handleMaalInput("hutang")}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button onClick={hitungMaal} fullWidth size="md">
              Hitung Zakat Maal
            </Button>

            {maalResult && (
              <ResultCard
                wajib={maalResult.wajib}
                label="Total Harta Bersih"
                totalValue={maalResult.totalHarta}
                zakatValue={maalResult.zakatAmount}
                nisab={NISAB_MAAL}
                notWajibMsg="Harta belum mencapai nisab. Anda belum wajib zakat maal, namun tetap bisa berinfaq."
              />
            )}
          </div>
        )}

        {/* === ZAKAT PENGHASILAN === */}
        {tab === "penghasilan" && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Zakat penghasilan/profesi sebesar 2,5% dari penghasilan bersih per bulan jika ≥ {formatRupiah(Math.round(NISAB_MAAL / 12))}/bulan.
              </p>
            </div>

            <MaalField
              label="Gaji / Upah Per Bulan (Rp)"
              value={penghasilan.gajiPerBulan}
              onChange={handlePenghasilanInput("gajiPerBulan")}
            />
            <MaalField
              label="Penghasilan Lain Per Bulan (Rp)"
              value={penghasilan.penghasilanLain}
              onChange={handlePenghasilanInput("penghasilanLain")}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Kebutuhan Pokok Per Bulan (Rp) <span className="text-xs text-red-500">pengurang</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                <input
                  type="text"
                  value={penghasilan.kebutuhanPokok}
                  onChange={handlePenghasilanInput("kebutuhanPokok")}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Biaya makan, transportasi, tagihan rutin, dll.</p>
            </div>

            <Button onClick={hitungPenghasilan} fullWidth size="md">
              Hitung Zakat Penghasilan
            </Button>

            {penghasilanResult && (
              <div className={`rounded-2xl p-5 ${penghasilanResult.wajib ? "bg-primary-50 border border-primary-200" : "bg-slate-50 border border-slate-200"}`}>
                {penghasilanResult.wajib ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                      <p className="text-sm font-semibold text-primary-700">Anda wajib membayar zakat penghasilan</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-500 mb-1">Zakat Per Bulan</p>
                        <p className="text-lg font-extrabold text-primary-600">{formatRupiah(penghasilanResult.zakatPerBulan)}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-500 mb-1">Zakat Per Tahun</p>
                        <p className="text-lg font-extrabold text-primary-600">{formatRupiah(penghasilanResult.zakatPerTahun)}</p>
                      </div>
                    </div>
                    <Link href="/campaign?category=zakat">
                      <Button size="sm" fullWidth>
                        Bayar Zakat Sekarang <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    Penghasilan bersih Anda ({formatRupiah(penghasilanResult.penghasilanBersih)}/bulan) belum mencapai nisab.
                    Anda belum wajib zakat penghasilan, tapi tetap bisa berinfaq.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* === ZAKAT EMAS & PERAK === */}
        {tab === "emas" && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Emas: nisab 85 gram ({formatRupiah(NISAB_MAAL)}). Perak: nisab 595 gram ({formatRupiah(NISAB_PERAK)}). Zakat 2,5% dari nilai.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Berat Emas Simpanan (gram)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={emasForm.emasGram}
                  onChange={handleEmasInput("emasGram")}
                  placeholder="0"
                  className="w-full pr-12 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">gram</span>
              </div>
              {emasForm.emasGram && (
                <p className="text-xs text-slate-400 mt-1">
                  ≈ {formatRupiah((parseFloat(emasForm.emasGram.replace(",", ".")) || 0) * HARGA_EMAS_PER_GRAM)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Berat Perak Simpanan (gram)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={emasForm.perakGram}
                  onChange={handleEmasInput("perakGram")}
                  placeholder="0"
                  className="w-full pr-12 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">gram</span>
              </div>
            </div>

            <Button onClick={hitungEmas} fullWidth size="md">
              Hitung Zakat Emas & Perak
            </Button>

            {emasResult && (
              <div className="space-y-3">
                {emasResult.nilaiEmas > 0 && (
                  <ResultCard
                    wajib={emasResult.wajibEmas}
                    label="Nilai Emas"
                    totalValue={emasResult.nilaiEmas}
                    zakatValue={emasResult.zakatEmas}
                    nisab={NISAB_MAAL}
                    notWajibMsg="Emas belum mencapai nisab 85 gram."
                  />
                )}
                {emasResult.nilaiPerak > 0 && (
                  <ResultCard
                    wajib={emasResult.wajibPerak}
                    label="Nilai Perak"
                    totalValue={emasResult.nilaiPerak}
                    zakatValue={emasResult.zakatPerak}
                    nisab={NISAB_PERAK}
                    notWajibMsg="Perak belum mencapai nisab 595 gram."
                  />
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-center text-slate-400 mt-6 border-t border-slate-50 pt-4">
          Harga emas menggunakan referensi Antam. Konsultasikan dengan ahli zakat untuk kepastian hukum.
        </p>
      </div>
    </div>
  );
}

// ——— Sub-components ———

const fieldLabel: Record<string, string> = {
  tabungan: "Tabungan / Deposito / Uang Tunai (Rp)",
  emas: "Emas / Perhiasan Simpanan (Rp)",
  investasi: "Investasi (Saham, Reksa Dana, dll) (Rp)",
  piutang: "Piutang yang Dapat Ditagih (Rp)",
};

function MaalField({
  label,
  value,
  tooltip,
  onChange,
}: {
  label: string;
  value: string;
  tooltip?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {tooltip && (
          <span className="group relative cursor-help">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span className="pointer-events-none absolute left-5 top-0 z-10 w-56 rounded-lg bg-slate-800 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="0"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function ResultCard({
  wajib,
  label,
  totalValue,
  zakatValue,
  nisab,
  notWajibMsg,
}: {
  wajib: boolean;
  label: string;
  totalValue: number;
  zakatValue: number;
  nisab: number;
  notWajibMsg: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${wajib ? "bg-primary-50 border border-primary-200" : "bg-slate-50 border border-slate-200"}`}>
      {wajib ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-semibold text-primary-700">Wajib membayar zakat</p>
          </div>
          <div className="mb-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-base font-bold text-slate-700">{formatRupiah(totalValue)}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-slate-500">Kewajiban Zakat (2,5%)</p>
            <p className="text-2xl font-extrabold text-primary-600">{formatRupiah(zakatValue)}</p>
          </div>
          <Link href="/campaign?category=zakat">
            <Button size="sm" fullWidth>
              Bayar Zakat Sekarang <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </>
      ) : (
        <div>
          <p className="text-sm text-slate-600 font-medium mb-1">{notWajibMsg}</p>
          <p className="text-xs text-slate-400">{label}: {formatRupiah(totalValue)} · Nisab: {formatRupiah(nisab)}</p>
        </div>
      )}
    </div>
  );
}
