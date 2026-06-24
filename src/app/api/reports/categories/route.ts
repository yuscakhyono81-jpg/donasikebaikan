import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, xlsxResponse } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "staff"].includes(profile.role as string)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    // Fetch all successful donations joined with campaign categories
    let donationQuery = supabase
      .from("donations")
      .select("amount, created_at, campaigns(title, categories(name))")
      .eq("status", "success");

    if (dateFrom) donationQuery = donationQuery.gte("created_at", dateFrom);
    if (dateTo) donationQuery = donationQuery.lte("created_at", dateTo + "T23:59:59");

    const [{ data: donations }, { data: categories }] = await Promise.all([
      donationQuery,
      supabase.from("categories").select("name, slug").eq("is_active", true).order("sort_order"),
    ]);

    // Aggregate by category
    const categoryMap: Record<string, { total: number; count: number; campaigns: Set<string> }> = {};
    for (const d of donations ?? []) {
      const campaign = d.campaigns as unknown as { title: string; categories: { name: string } | null } | null;
      const catName = campaign?.categories?.name ?? "Tidak Berkategori";
      if (!categoryMap[catName]) {
        categoryMap[catName] = { total: 0, count: 0, campaigns: new Set() };
      }
      categoryMap[catName].total += d.amount as number;
      categoryMap[catName].count += 1;
      if (campaign?.title) categoryMap[catName].campaigns.add(campaign.title);
    }

    // Sheet 1: Summary per category
    const summaryHeaders = [
      "Kategori",
      "Total Donasi (Rp)",
      "Jumlah Transaksi",
      "Rata-rata per Transaksi (Rp)",
      "Jumlah Campaign Terlibat",
    ];
    const summaryRows = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([cat, stats]) => [
        cat,
        stats.total,
        stats.count,
        stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
        stats.campaigns.size,
      ]);

    // Sheet 2: Campaigns per category
    const campaignHeaders = [
      "Kategori",
      "Judul Campaign",
      "Terkumpul (Rp)",
      "Target (Rp)",
      "Jumlah Donatur",
      "Status",
    ];
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("title, status, collected_amount, target_amount, donor_count, categories(name)")
      .order("collected_amount", { ascending: false });

    const campaignRows = (campaigns ?? []).map((c) => {
      const cat = c.categories as unknown as { name: string } | null;
      return [
        cat?.name ?? "Tidak Berkategori",
        c.title as string,
        c.collected_amount as number,
        c.target_amount as number,
        c.donor_count as number,
        c.status as string,
      ];
    });

    const wb = buildWorkbook([
      { name: "Ringkasan per Kategori", headers: summaryHeaders, rows: summaryRows },
      { name: "Campaign per Kategori", headers: campaignHeaders, rows: campaignRows },
    ]);

    const filename = `laporan-kategori-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return xlsxResponse(wb, filename);
  } catch (err) {
    console.error("Reports categories error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
