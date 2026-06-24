import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Megaphone, Wallet, Users, BadgeCheck,
  TrendingUp, Clock, ChevronRight, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatRelativeTime, formatDate } from "@/lib/utils";
import { Badge, CampaignStatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    { count: campaignCount },
    { count: donorCount },
    { count: affiliateCount },
    { count: proposalCount },
    { data: revenueData },
    { data: recentDonations },
    { data: recentCampaigns },
  ] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "donor"),
    supabase.from("affiliates").select("*", { count: "exact", head: true }),
    supabase.from("beneficiary_proposals").select("*", { count: "exact", head: true }).eq("status", "masuk"),
    supabase.from("donations").select("amount").eq("status", "success"),
    supabase
      .from("donations")
      .select("id, amount, donor_name, is_anonymous, created_at, status, payment_method, campaigns(title)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("campaigns")
      .select("id, title, status, collected_amount, target_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((s, d) => s + (d.amount as number), 0);

  const statCards = [
    { label: "Total Campaign", value: campaignCount ?? 0, icon: Megaphone, color: "primary", unit: "kampanye", href: "/dashboard/admin/campaigns" },
    { label: "Total Terkumpul", value: formatRupiah(totalRevenue, true), icon: Wallet, color: "green", unit: "dari donasi sukses", href: "/dashboard/admin/donations" },
    { label: "Donatur", value: donorCount ?? 0, icon: Users, color: "blue", unit: "terdaftar", href: "/dashboard/admin/donors" },
    { label: "Affiliate", value: affiliateCount ?? 0, icon: BadgeCheck, color: "purple", unit: "mitra", href: "/dashboard/admin/affiliates" },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary-100 text-primary-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ikhtisar platform DonasiKebaikan</p>
        </div>
        {(proposalCount ?? 0) > 0 && (
          <Link
            href="/dashboard/admin/proposals"
            className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-orange-100 transition-colors"
          >
            <FileText size={16} />
            {proposalCount} usulan baru
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon size={18} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.unit}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent donations */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Donasi Terbaru</h2>
            </div>
            <Link href="/dashboard/admin/donations" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {!recentDonations?.length ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada donasi</p>
            ) : (
              recentDonations.map((d) => {
                const camp = d.campaigns as unknown as { title: string } | null;
                return (
                  <div key={d.id as string} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {d.is_anonymous ? "Hamba Allah" : (d.donor_name as string)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{camp?.title ?? "—"}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-semibold text-primary-600">{formatRupiah(d.amount as number, true)}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(d.created_at as string)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Campaign Terbaru</h2>
            </div>
            <Link href="/dashboard/admin/campaigns" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {!recentCampaigns?.length ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada campaign</p>
            ) : (
              recentCampaigns.map((c) => (
                <div key={c.id as string} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.title as string}</p>
                    <p className="text-xs text-slate-400">{formatDate(c.created_at as string)}</p>
                  </div>
                  <div className="ml-3 shrink-0">
                    <CampaignStatusBadge status={c.status as string} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/admin/campaigns/new", label: "Buat Campaign", icon: Megaphone, color: "primary" },
            { href: "/dashboard/admin/donations/verify", label: "Verifikasi Transfer", icon: Wallet, color: "orange" },
            { href: "/dashboard/admin/affiliates", label: "Kelola Affiliate", icon: BadgeCheck, color: "purple" },
            { href: "/dashboard/admin/reports", label: "Laporan", icon: FileText, color: "blue" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[action.color] ?? colorMap.primary}`}>
                <action.icon size={20} />
              </div>
              <span className="text-xs font-medium text-slate-700 leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
