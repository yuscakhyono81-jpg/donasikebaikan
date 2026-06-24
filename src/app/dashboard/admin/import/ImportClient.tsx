"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type ImportType = "donors" | "donations";

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

interface PreviewDonor {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface PreviewDonation {
  donor_name: string;
  donor_email: string;
  campaign_id: string;
  amount: number;
  payment_method: string;
  status: string;
}

type PreviewRow = PreviewDonor | PreviewDonation;

function isDonation(row: PreviewRow): row is PreviewDonation {
  return "campaign_id" in row;
}

export default function ImportClient() {
  const [importType, setImportType] = useState<ImportType>("donors");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview([]);
    setResult(null);
    setError(null);
  }

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("preview", "true");

    try {
      const res = await fetch(`/api/import/${importType}`, { method: "POST", body: fd });
      const json = await res.json() as { preview?: PreviewRow[]; total?: number; error?: string };

      if (!res.ok || json.error) {
        setError(json.error ?? "Gagal memproses file");
      } else {
        setPreview(json.preview ?? []);
        setPreviewTotal(json.total ?? 0);
      }
    } catch {
      setError("Koneksi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/import/${importType}`, { method: "POST", body: fd });
      const json = await res.json() as ImportResult & { error?: string };

      if (!res.ok || json.error) {
        setError(json.error ?? "Gagal mengimport");
      } else {
        setResult(json);
        setPreview([]);
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setError("Koneksi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  const donorTemplate = "full_name,email,phone,address,birth_date\nBudi Santoso,budi@example.com,08123456789,Jl. Mawar No. 1,1990-05-15";
  const donationTemplate = "donor_name,donor_email,donor_phone,campaign_id,amount,payment_method,status,is_anonymous,donated_at\nBudi Santoso,budi@example.com,08123456789,uuid-campaign-here,100000,transfer_manual,success,tidak,2024-01-15";

  function downloadTemplate() {
    const content = importType === "donors" ? donorTemplate : donationTemplate;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-${importType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Pilih Jenis Import</h2>
        <div className="flex gap-3">
          {(["donors", "donations"] as ImportType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setImportType(t); setFile(null); setPreview([]); setResult(null); setError(null); if (fileRef.current) fileRef.current.value = ""; }}
              className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                importType === t
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {t === "donors" ? "Import Donatur" : "Import Donasi"}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {importType === "donors"
            ? "Import data profil donatur dari file CSV/Excel. Email yang sudah terdaftar akan dilewati."
            : "Import riwayat donasi dari file CSV/Excel. Pastikan campaign_id valid dan ada di sistem."}
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upload File</h2>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={13} />
            Template CSV
          </button>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-slate-300 mb-2" />
          {file ? (
            <span className="text-sm font-medium text-primary-700">{file.name}</span>
          ) : (
            <>
              <span className="text-sm text-slate-500">Klik untuk pilih file CSV/Excel</span>
              <span className="text-xs text-slate-400 mt-1">Maksimal 10MB</span>
            </>
          )}
        </label>

        {file && (
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
              Preview Data
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Import Sekarang
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Preview Data</h2>
            <span className="text-xs text-slate-400">
              Menampilkan {preview.length} dari {previewTotal} baris
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {importType === "donors" ? (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Telepon</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Alamat</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Donatur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nominal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Metode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {preview.map((row, i) =>
                  isDonation(row) ? (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{row.donor_name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.donor_email}</td>
                      <td className="px-4 py-2.5 text-primary-600 font-semibold">{formatRupiah(row.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.payment_method}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.status === "success" ? "bg-green-100 text-green-700" :
                          row.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>{row.status}</span>
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{row.full_name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.email}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.phone ?? "—"}</td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{row.address ?? "—"}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          {previewTotal > 20 && (
            <p className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
              {previewTotal - 20} baris lainnya tidak ditampilkan
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Hasil Import</h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Baris", value: result.total, icon: FileSpreadsheet, color: "text-slate-700" },
              { label: "Berhasil Diimport", value: result.imported, icon: CheckCircle, color: "text-green-600" },
              { label: "Dilewati / Error", value: result.skipped + result.errors.length, icon: XCircle, color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                <s.icon className={`w-6 h-6 mx-auto mb-1.5 ${s.color}`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Detail Error ({result.errors.length} baris):</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <XCircle size={13} className="shrink-0 mt-0.5" />
                    <span>Baris {e.row}: {e.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
