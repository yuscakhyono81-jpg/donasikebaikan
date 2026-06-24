"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  dateFrom: string;
  dateTo: string;
}

export function ReportFilters({ dateFrom, dateTo }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);

  function apply() {
    const params = new URLSearchParams({ date_from: from, date_to: to });
    router.push(`/dashboard/admin/reports?${params.toString()}`);
  }

  function reset() {
    setFrom("");
    setTo("");
    router.push("/dashboard/admin/reports");
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={15} className="text-slate-400" />
        <h2 className="font-semibold text-slate-900 text-sm">Filter Periode</h2>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1.5">Dari Tanggal</label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1.5">Sampai Tanggal</label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button onClick={apply} size="sm">Terapkan</Button>
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
        )}
      </div>
    </div>
  );
}
