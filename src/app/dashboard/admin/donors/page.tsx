import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDonorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: donors } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "donor")
    .order("created_at", { ascending: false });

  const donorIds = (donors ?? []).map((d) => d.id as string);

  const { data: donationStats } = await supabase
    .from("donations")
    .select("donor_id, amount, status")
    .in("donor_id", donorIds)
    .eq("status", "success");

  const statsMap: Record<string, { total: number; count: number }> = {};
  for (const d of donationStats ?? []) {
    const id = d.donor_id as string;
    if (!statsMap[id]) statsMap[id] = { total: 0, count: 0 };
    statsMap[id].total += d.amount as number;
    statsMap[id].count += 1;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Donatur</h1>
        <p className="text-slate-500 text-sm mt-0.5">{donors?.length ?? 0} donatur terdaftar</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!donors?.length ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada donatur</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. WA</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Donasi</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaksi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {donors.map((donor) => {
                  const stats = statsMap[donor.id as string] ?? { total: 0, count: 0 };
                  return (
                    <tr key={donor.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900">{donor.full_name as string}</td>
                      <td className="px-5 py-4 text-slate-600">{donor.email as string}</td>
                      <td className="px-5 py-4 text-slate-600">{(donor.phone as string | null) ?? "—"}</td>
                      <td className="px-5 py-4 text-right font-semibold text-primary-600">
                        {stats.count > 0 ? formatRupiah(stats.total, true) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-700">{stats.count}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(donor.created_at as string, "d MMM yyyy")}</td>
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
