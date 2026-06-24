import { redirect } from "next/navigation";
import Link from "next/link";
import { Megaphone, ShieldCheck, MessageSquare, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate, calculateProgress } from "@/lib/utils";
import { CampaignStatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "staff" && profile?.role !== "admin") redirect("/dashboard");

  const [
    { data: campaigns },
    { count: pendingVerifyCount },
    { count: unansweredPrayerCount },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, slug, status, collected_amount, target_amount, donor_count, deadline, categories(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("payment_method", "transfer_manual"),
    supabase
      .from("donation_prayers")
      .select("*", { count: "exact", head: true })
      .is("reply", null)
      .eq("is_visible", true),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Staf</h1>
        <p className="text-slate-500 text-sm mt-0.5">Selamat datang, {profile?.full_name as string}</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/staff/donations/verify"
          className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Verifikasi Transfer</p>
            <p className="text-sm text-slate-500">
              {(pendingVerifyCount ?? 0) > 0
                ? `${pendingVerifyCount} menunggu verifikasi`
                : "Tidak ada yang perlu diverifikasi"}
            </p>
          </div>
          {(pendingVerifyCount ?? 0) > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingVerifyCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Doa Belum Dibalas</p>
            <p className="text-sm text-slate-500">
              {(unansweredPrayerCount ?? 0) > 0
                ? `${unansweredPrayerCount} doa belum dibalas`
                : "Semua doa sudah dibalas"}
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900">Semua Campaign</h2>
          </div>
        </div>

        {!campaigns?.length ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Belum ada campaign</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {campaigns.map((c) => {
              const cat = c.categories as unknown as { name: string } | null;
              const progress = calculateProgress(c.collected_amount as number, c.target_amount as number);
              return (
                <div key={c.id as string} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 truncate">{c.title as string}</p>
                      <CampaignStatusBadge status={c.status as string} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {cat && <span>{cat.name}</span>}
                      <span>{c.donor_count as number} donatur</span>
                      <span>{formatRupiah(c.collected_amount as number, true)} terkumpul</span>
                    </div>
                    <div className="mt-2 w-full max-w-xs bg-slate-100 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Link
                      href={`/dashboard/staff/campaigns/${c.id}/update`}
                      className="flex items-center gap-1 text-xs font-medium text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      <Plus size={13} /> Update
                    </Link>
                    <Link
                      href={`/dashboard/staff/campaigns/${c.id}/prayers`}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <MessageSquare size={13} /> Doa
                    </Link>
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
