import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Users, Wallet, CheckCircle, ExternalLink, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAffiliateStats } from "@/lib/affiliate";
import { formatRupiah, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AffiliateDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, organization_name, is_approved, bank_name, account_number, account_holder")
    .eq("profile_id", user.id)
    .single();

  if (!affiliate) redirect("/register/affiliate");

  const stats = await getAffiliateStats(supabase, affiliate.id as string);

  const { data: acRows } = await supabase
    .from("affiliate_campaigns")
    .select("id, referral_code, fee_percentage, campaign_id, campaigns(title, slug, cover_image, collected_amount, target_amount, status)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentDonations } = await supabase
    .from("donations")
    .select("id, amount, donor_name, is_anonymous, created_at, referral_code")
    .in(
      "referral_code",
      (acRows ?? []).map((r) => r.referral_code as string).filter(Boolean)
    )
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(5);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Affiliate</h1>
        <p className="text-slate-500 text-sm mt-0.5">{affiliate.organization_name as string}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Donasi</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total_donations}</p>
          <p className="text-xs text-slate-400 mt-0.5">transaksi sukses</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Donatur</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total_donors}</p>
          <p className="text-xs text-slate-400 mt-0.5">unik via referral</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fee Tertunda</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatRupiah(stats.fee_pending, true)}</p>
          <p className="text-xs text-slate-400 mt-0.5">belum dibayar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fee Diterima</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatRupiah(stats.fee_paid, true)}</p>
          <p className="text-xs text-slate-400 mt-0.5">sudah dibayar</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Kampanye Aktif</h2>
            <Link
              href="/dashboard/affiliate/campaigns"
              className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>

          {!acRows || acRows.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Belum ada kampanye yang di-assign</p>
          ) : (
            <div className="space-y-3">
              {acRows.map((ac) => {
                const campaign = ac.campaigns as unknown as {
                  title: string;
                  slug: string;
                  cover_image: string;
                  collected_amount: number;
                  target_amount: number;
                  status: string;
                } | null;
                if (!campaign) return null;
                const referralUrl = `${baseUrl}/campaign/${campaign.slug}?ref=${ac.referral_code}`;
                return (
                  <div key={ac.id as string} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{campaign.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600">
                          {ac.referral_code as string}
                        </code>
                        <Badge variant="green">{ac.fee_percentage as number}% fee</Badge>
                      </div>
                    </div>
                    <a
                      href={referralUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Buka link referral"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent donations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Donasi Terbaru</h2>
          </div>

          {!recentDonations || recentDonations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Belum ada donasi via referral</p>
          ) : (
            <div className="space-y-2">
              {recentDonations.map((d) => (
                <div key={d.id as string} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {d.is_anonymous ? "Hamba Allah" : (d.donor_name as string)}
                    </p>
                    <p className="text-xs text-slate-400">{formatRelativeTime(d.created_at as string)}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary-600">
                    {formatRupiah(d.amount as number, true)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank info */}
      {(!affiliate.bank_name || !affiliate.account_number) && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <Wallet className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Lengkapi data bank</p>
            <p className="text-xs text-orange-600 mt-0.5">
              Tambahkan info rekening bank agar admin bisa mentransfer fee Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
