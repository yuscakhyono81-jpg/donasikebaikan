import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/home/HeroSection";
import LiveDonationTicker from "@/components/home/LiveDonationTicker";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryFilter from "@/components/home/CategoryFilter";
import UrgentCampaigns from "@/components/home/UrgentCampaigns";
import FeaturedCampaigns from "@/components/home/FeaturedCampaigns";
import AllCampaigns from "@/components/home/AllCampaigns";
import StatsBanner from "@/components/home/StatsBanner";
import ZakatCalculatorWidget from "@/components/home/ZakatCalculatorWidget";
import FAQ from "@/components/home/FAQ";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import type { Campaign, Category, DonationPrayer } from "@/types";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [
    { data: campaigns },
    { data: categories },
    { data: recentDonations },
    { data: prayers },
    { count: totalDonors },
    { count: completedCount },
    { data: siteSettingsRows },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*, category:categories(*)")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("donations")
      .select("id, donor_name, amount, campaign_id, created_at, is_anonymous, campaigns(title)")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("donation_prayers")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("status", "success"),
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("site_settings").select("*"),
  ]);

  const allCampaigns = (campaigns as Campaign[]) ?? [];
  const allCategories = (categories as Category[]) ?? [];

  const filteredCampaigns = category
    ? allCampaigns.filter((c) => c.category?.slug === category)
    : allCampaigns;

  const urgentCampaigns = filteredCampaigns.filter((c) => c.is_urgent).slice(0, 3);
  const featuredCampaigns = filteredCampaigns.filter((c) => c.is_featured && !c.is_urgent).slice(0, 3);

  const totalCollected = allCampaigns.reduce((sum, c) => sum + (c.collected_amount ?? 0), 0);

  type TickerRaw = {
    id: string;
    donor_name: string;
    amount: number;
    created_at: string;
    is_anonymous: boolean;
    campaigns: { title: string }[] | { title: string } | null;
  };

  const tickerDonations = (recentDonations ?? []).map((d: TickerRaw) => {
    const campaignTitle = Array.isArray(d.campaigns)
      ? (d.campaigns[0]?.title ?? "Campaign")
      : (d.campaigns?.title ?? "Campaign");
    return {
      id: d.id,
      donor_name: d.donor_name,
      amount: d.amount,
      campaign_title: campaignTitle,
      created_at: d.created_at,
      is_anonymous: d.is_anonymous,
    };
  });

  const heroStats = {
    totalCollected,
    totalDonors: totalDonors ?? 0,
    totalCampaigns: allCampaigns.length,
  };

  const siteSettings: Record<string, string> = {};
  for (const row of siteSettingsRows ?? []) {
    siteSettings[row.key] = row.value;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── 1. Hero Banner ── */}
      <HeroSection
        stats={heroStats}
        bannerUrl={siteSettings.hero_banner_url ?? "/banner-donasi.png"}
        headline={siteSettings.hero_headline ?? "Satu Sedekah, Seribu Doa"}
        subtitle={siteSettings.hero_subtitle ?? "Zakat & Sedekah tersalur transparan — setiap donasi tercatat, setiap dampak terbukti"}
      />

      {/* ── 2. Live Donation Ticker ── */}
      {tickerDonations.length > 0 && (
        <LiveDonationTicker initialDonations={tickerDonations} />
      )}

      {/* ── 3. Feature strip (HowItWorks) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-100">
        <HowItWorks />
      </div>

      {/* ── 4. Campaign sections ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Category Filter */}
        <Suspense>
          <section>
            <CategoryFilter categories={allCategories} />
          </section>
        </Suspense>

        {/* Urgent Campaigns */}
        <UrgentCampaigns campaigns={urgentCampaigns} />

        {/* Featured Campaigns */}
        <FeaturedCampaigns campaigns={featuredCampaigns} />

        {/* All Campaigns */}
        <AllCampaigns
          initialCampaigns={filteredCampaigns.slice(0, 9)}
          initialTotal={filteredCampaigns.length}
          categorySlug={category}
        />
      </div>

      {/* ── 5. Stats Banner — big number ── */}
      <StatsBanner totalDonors={totalDonors ?? 0} totalCollected={totalCollected} totalCampaigns={allCampaigns.length} />

      {/* ── 6. Zakat Calculator + FAQ + Testimonials ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <ZakatCalculatorWidget />
        <FAQ />
        <TestimonialCarousel testimonials={(prayers as DonationPrayer[]) ?? []} />
      </div>
    </div>
  );
}
