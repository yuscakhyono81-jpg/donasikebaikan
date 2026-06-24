import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; variant: "green" | "orange" | "red" }> = {
  success: { label: "Sukses", variant: "green" },
  pending: { label: "Tertunda", variant: "orange" },
  failed: { label: "Gagal", variant: "red" },
};

const methodLabel: Record<string, string> = {
  midtrans: "Midtrans",
  transfer_manual: "Transfer Manual",
  recurring: "Rutin",
};

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; method?: string }>;
}) {
  const { status, method } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  let query = supabase
    .from("donations")
    .select("id, amount, donor_name, is_anonymous, status, payment_method, created_at, campaigns(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (method) query = query.eq("payment_method", method);

  const { data: donations } = await query;

  const { count: pendingManualCount } = await supabase
    .from("donations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("payment_method", "transfer_manual");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Semua Donasi</h1>
          <p className="text-slate-500 text-sm mt-0.5">{donations?.length ?? 0} transaksi</p>
        </div>
        {(pendingManualCount ?? 0) > 0 && (
          <Link
            href="/dashboard/admin/donations/verify"
            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <ShieldCheck size={16} />
            {pendingManualCount} perlu diverifikasi
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: "/dashboard/admin/donations", label: "Semua" },
          { href: "?status=success", label: "Sukses" },
          { href: "?status=pending", label: "Tertunda" },
          { href: "?status=failed", label: "Gagal" },
          { href: "?method=transfer_manual", label: "Transfer Manual" },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors text-slate-600"
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!donations?.length ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Belum ada donasi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Donatur</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jumlah</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Metode</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {donations.map((d) => {
                  const camp = d.campaigns as unknown as { title: string } | null;
                  const statusConfig = statusLabel[d.status as string] ?? { label: d.status, variant: "slate" as const };
                  return (
                    <tr key={d.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {d.is_anonymous ? "Hamba Allah" : (d.donor_name as string)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[200px]">
                        <span className="truncate block">{camp?.title ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        {formatRupiah(d.amount as number)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {methodLabel[d.payment_method as string] ?? (d.payment_method as string)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(d.created_at as string, "d MMM yyyy, HH:mm")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
