"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, ExternalLink, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, calculateProgress } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";

interface AffiliateCampaignRow {
  id: string;
  referral_code: string;
  fee_percentage: number;
  target_amount: number | null;
  created_at: string;
  campaign_id: string;
  campaigns: {
    title: string;
    slug: string;
    cover_image: string;
    collected_amount: number;
    target_amount: number;
    donor_count: number;
    status: string;
    deadline: string;
  } | null;
  donation_count: number;
  donation_total: number;
}

export default function AffiliateCampaignsPage() {
  const [rows, setRows] = useState<AffiliateCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!affiliate) return;

    const { data: acRows } = await supabase
      .from("affiliate_campaigns")
      .select("id, referral_code, fee_percentage, target_amount, created_at, campaign_id, campaigns(title, slug, cover_image, collected_amount, target_amount, donor_count, status, deadline)")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    if (!acRows) { setLoading(false); return; }

    const enriched: AffiliateCampaignRow[] = await Promise.all(
      acRows.map(async (ac) => {
        const { count, data: donations } = await supabase
          .from("donations")
          .select("amount", { count: "exact" })
          .eq("referral_code", ac.referral_code)
          .eq("status", "success");

        const donation_total = (donations ?? []).reduce((s, d) => s + (d.amount as number), 0);

        return {
          ...ac,
          campaign_id: ac.campaign_id as string,
          referral_code: ac.referral_code as string,
          fee_percentage: ac.fee_percentage as number,
          target_amount: ac.target_amount as number | null,
          campaigns: ac.campaigns as unknown as AffiliateCampaignRow["campaigns"],
          donation_count: count ?? 0,
          donation_total,
        };
      })
    );

    setRows(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    load();
  }, [load]);

  function copyLink(referralUrl: string, code: string) {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kampanye & Link Referral</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Bagikan link referral ke komunitas Anda untuk mulai mengumpulkan donasi
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Belum ada kampanye yang di-assign ke akun Anda.</p>
          <p className="text-sm text-slate-400 mt-1">Hubungi admin untuk mendapatkan akses kampanye.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((ac) => {
            const campaign = ac.campaigns;
            if (!campaign) return null;
            const referralUrl = `${baseUrl}/campaign/${campaign.slug}?ref=${ac.referral_code}`;
            const progress = calculateProgress(campaign.collected_amount, campaign.target_amount);

            return (
              <div key={ac.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Campaign thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {campaign.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={campaign.cover_image}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-primary-400" />
                        </div>
                      )}
                    </div>

                    {/* Campaign info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 leading-snug">{campaign.title}</h3>
                        <Badge variant={campaign.status === "active" ? "green" : "slate"}>
                          {campaign.status === "active" ? "Aktif" : campaign.status}
                        </Badge>
                      </div>

                      <div className="mt-2">
                        <ProgressBar value={progress} className="h-1.5" />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">
                            {formatRupiah(campaign.collected_amount, true)} terkumpul
                          </span>
                          <span className="text-xs text-slate-400">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{ac.donation_count}</p>
                      <p className="text-xs text-slate-500">Donasi</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-primary-600">{formatRupiah(ac.donation_total, true)}</p>
                      <p className="text-xs text-slate-500">Via referral</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{ac.fee_percentage}%</p>
                      <p className="text-xs text-slate-500">Fee Anda</p>
                    </div>
                  </div>

                  {/* Referral link */}
                  <div className="mt-4">
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Link Referral Anda
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-0">
                        <code className="text-xs text-slate-700 truncate">{referralUrl}</code>
                      </div>
                      <button
                        onClick={() => copyLink(referralUrl, ac.referral_code)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                      >
                        {copied === ac.referral_code ? (
                          <><Check size={13} /> Disalin!</>
                        ) : (
                          <><Copy size={13} /> Salin</>
                        )}
                      </button>
                      <a
                        href={referralUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors border border-slate-200"
                        title="Buka link"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </div>

                  {/* Share quick text */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Kode referral:</span>
                    <code className="text-xs font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                      {ac.referral_code}
                    </code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
