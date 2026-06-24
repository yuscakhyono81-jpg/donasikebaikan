import { redirect } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function DonorHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "donor") redirect("/dashboard");

  let query = supabase
    .from("donations")
    .select("id, amount, status, payment_method, is_recurring, message, created_at, campaigns(title, slug)")
    .eq("donor_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: donations } = await query;

  const methodLabel: Record<string, string> = {
    midtrans: "Midtrans",
    transfer_manual: "Transfer Manual",
    recurring: "Donasi Rutin",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Donasi</h1>
        <p className="text-slate-500 text-sm mt-0.5">{donations?.length ?? 0} transaksi</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { href: "/dashboard/donor/history", label: "Semua" },
          { href: "?status=success", label: "Sukses" },
          { href: "?status=pending", label: "Tertunda" },
          { href: "?status=failed", label: "Gagal" },
        ].map((f) => (
          <Link key={f.href} href={f.href} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors text-slate-600">
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!donations?.length ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada riwayat donasi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {donations.map((d) => {
              const camp = d.campaigns as unknown as { title: string; slug: string } | null;
              return (
                <div key={d.id as string} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/campaign/${camp?.slug ?? "#"}`}
                      className="font-medium text-slate-900 hover:text-primary-600 transition-colors truncate block"
                    >
                      {camp?.title ?? "Campaign"}
                    </Link>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      <span>{formatDate(d.created_at as string, "d MMM yyyy, HH:mm")}</span>
                      <span>{methodLabel[d.payment_method as string] ?? (d.payment_method as string)}</span>
                      {d.is_recurring && <Badge variant="blue" size="sm">Rutin</Badge>}
                    </div>
                    {d.message && <p className="text-xs text-slate-500 mt-1 italic">"{d.message as string}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">{formatRupiah(d.amount as number)}</p>
                    <Badge variant={d.status === "success" ? "green" : d.status === "pending" ? "orange" : "red"} size="sm">
                      {d.status === "success" ? "Sukses" : d.status === "pending" ? "Tertunda" : "Gagal"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
