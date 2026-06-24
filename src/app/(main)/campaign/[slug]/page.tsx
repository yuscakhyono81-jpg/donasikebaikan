import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CampaignHeader from "@/components/campaign/CampaignHeader";
import RealtimeDonationProgress from "@/components/campaign/RealtimeDonationProgress";
import DonationForm from "@/components/campaign/DonationForm";
import DonorList from "@/components/campaign/DonorList";
import CampaignUpdates from "@/components/campaign/CampaignUpdates";
import PrayerSection from "@/components/campaign/PrayerSection";
import ShareButtons from "@/components/campaign/ShareButtons";
import ImpactInfo from "@/components/campaign/ImpactInfo";
import type { Campaign, Donation, DonationPrayer, CampaignUpdate, CampaignCategory } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("title, short_description, cover_image")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Campaign Tidak Ditemukan" };

  return {
    title: data.title,
    description: data.short_description,
    openGraph: {
      title: data.title,
      description: data.short_description,
      images: data.cover_image ? [data.cover_image] : [],
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!campaign) notFound();

  const campaignData = campaign as Campaign;

  const [{ data: donations }, { data: prayers }, { data: updates }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, amount, message, is_anonymous, created_at")
      .eq("campaign_id", campaignData.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("donation_prayers")
      .select("*")
      .eq("campaign_id", campaignData.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", campaignData.id)
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const donorList = (donations as Donation[]) ?? [];
  const prayerList = (prayers as DonationPrayer[]) ?? [];
  const updateList = (updates as CampaignUpdate[]) ?? [];

  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://donasikebaikan.id"}/campaign/${slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Campaign Info */}
        <div className="lg:col-span-2 space-y-8">
          <CampaignHeader campaign={campaignData} />

          {/* Campaign Description (full) — shown via WordPress or short_description */}
          {campaignData.short_description && (
            <div className="prose prose-sm prose-slate max-w-none">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Tentang Campaign Ini</h3>
              <p className="text-slate-600 leading-relaxed">{campaignData.short_description}</p>
            </div>
          )}

          {/* Impact Info */}
          <ImpactInfo
            category={campaignData.category?.slug as CampaignCategory | undefined}
            targetAmount={campaignData.target_amount}
            collectedAmount={campaignData.collected_amount}
          />

          {/* Campaign Updates */}
          {updateList.length > 0 && <CampaignUpdates updates={updateList} />}

          {/* Prayer Section */}
          <PrayerSection prayers={prayerList} />

          {/* Share */}
          <ShareButtons url={canonicalUrl} title={campaignData.title} />

          {/* Donor List (mobile visible) */}
          <div className="lg:hidden">
            <DonorList donors={donorList} totalDonors={campaignData.donor_count} />
          </div>
        </div>

        {/* Right Column — Sticky Sidebar */}
        <div className="space-y-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Progress — realtime via Supabase subscription */}
            <RealtimeDonationProgress campaign={campaignData} />

            {/* Donation Form */}
            <DonationForm campaignId={campaignData.id} campaignTitle={campaignData.title} />

            {/* Donor List (desktop) */}
            <div className="hidden lg:block">
              <DonorList donors={donorList} totalDonors={campaignData.donor_count} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Donate Button */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-100 p-4 flex gap-3 z-30">
        <div className="flex-1">
          <p className="text-xs text-slate-500 leading-none">Terkumpul</p>
          <p className="text-sm font-bold text-primary-600">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(campaignData.collected_amount)}
          </p>
        </div>
        <a
          href="#donation-form"
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Donasi Sekarang
        </a>
      </div>
    </div>
  );
}
