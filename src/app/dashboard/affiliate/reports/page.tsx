"use client";

import { useState, useCallback } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ReportRow {
  date: string;
  donor_name: string;
  campaign_title: string;
  referral_code: string;
  amount: number;
}

export default function AffiliateReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);

  const generate = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!affiliate) { setLoading(false); return; }

    const { data: acRows } = await supabase
      .from("affiliate_campaigns")
      .select("referral_code, campaigns(title)")
      .eq("affiliate_id", affiliate.id);

    if (!acRows || acRows.length === 0) {
      setRows([]);
      setLoading(false);
      setGenerated(true);
      return;
    }

    const campaignByCode: Record<string, string> = {};
    for (const ac of acRows) {
      campaignByCode[ac.referral_code as string] = (ac.campaigns as unknown as { title: string } | null)?.title ?? "—";
    }

    const codes = acRows.map((ac) => ac.referral_code as string);

    const { data: donations } = await supabase
      .from("donations")
      .select("donor_name, is_anonymous, amount, referral_code, created_at")
      .in("referral_code", codes)
      .eq("status", "success")
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo + "T23:59:59")
      .order("created_at", { ascending: true });

    const report: ReportRow[] = (donations ?? []).map((d) => ({
      date: d.created_at as string,
      donor_name: d.is_anonymous ? "Hamba Allah" : (d.donor_name as string),
      campaign_title: campaignByCode[d.referral_code as string] ?? "—",
      referral_code: d.referral_code as string,
      amount: d.amount as number,
    }));

    const total = report.reduce((s, r) => s + r.amount, 0);
    setRows(report);
    setTotalDonations(report.length);
    setTotalCollected(total);
    setGenerated(true);
    setLoading(false);
  }, [dateFrom, dateTo]);

  function downloadCSV() {
    const header = ["Tanggal", "Donatur", "Kampanye", "Kode Referral", "Jumlah (Rp)"];
    const csvRows = rows.map((r) => [
      formatDate(r.date),
      r.donor_name,
      r.campaign_title,
      r.referral_code,
      r.amount.toString(),
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-afiliasi-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate dan unduh laporan donasi referral berdasarkan periode
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Filter Periode</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button onClick={generate} loading={loading}>
            Generate Laporan
          </Button>
        </div>
      </div>

      {/* Results */}
      {generated && (
        <>
          {/* Summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Donasi</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalDonations} transaksi</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Terkumpul via Referral</p>
              <p className="text-2xl font-bold text-primary-600 mt-0.5">{formatRupiah(totalCollected)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                Detail Donasi ({rows.length})
              </h2>
              {rows.length > 0 && (
                <Button variant="outline" size="sm" onClick={downloadCSV}>
                  <FileDown size={15} />
                  Unduh CSV
                </Button>
              )}
            </div>

            {rows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Tidak ada donasi pada periode {formatDate(dateFrom)} – {formatDate(dateTo)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Donatur</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kampanye</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode Ref</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDate(row.date)}</td>
                        <td className="px-5 py-3 text-slate-900 font-medium">{row.donor_name}</td>
                        <td className="px-5 py-3 text-slate-700 max-w-[200px] truncate">{row.campaign_title}</td>
                        <td className="px-5 py-3">
                          <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                            {row.referral_code}
                          </code>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-primary-600">
                          {formatRupiah(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">
                        Total
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-primary-700">
                        {formatRupiah(totalCollected)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
