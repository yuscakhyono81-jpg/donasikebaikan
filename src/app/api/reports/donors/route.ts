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

    // Fetch all registered donors
    const { data: donors } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, birth_date, address, created_at")
      .eq("role", "donor")
      .order("created_at", { ascending: false });

    // Fetch successful donations with donor info
    let donationQuery = supabase
      .from("donations")
      .select("donor_id, donor_name, donor_email, donor_phone, amount, payment_method, is_anonymous, is_recurring, created_at, campaigns(title)")
      .eq("status", "success");

    if (dateFrom) donationQuery = donationQuery.gte("created_at", dateFrom);
    if (dateTo) donationQuery = donationQuery.lte("created_at", dateTo + "T23:59:59");

    const { data: donations } = await donationQuery.order("created_at", { ascending: false });

    // Aggregate stats per registered donor
    const donorStats: Record<string, { totalAmount: number; count: number; lastDonation: string }> = {};
    for (const d of donations ?? []) {
      if (!d.donor_id) continue;
      const id = d.donor_id as string;
      if (!donorStats[id]) donorStats[id] = { totalAmount: 0, count: 0, lastDonation: "" };
      donorStats[id].totalAmount += d.amount as number;
      donorStats[id].count += 1;
      if (!donorStats[id].lastDonation || (d.created_at as string) > donorStats[id].lastDonation) {
        donorStats[id].lastDonation = d.created_at as string;
      }
    }

    // Sheet 1: Registered donors summary
    const donorHeaders = [
      "Nama Lengkap",
      "Email",
      "No. WA",
      "Tanggal Lahir",
      "Alamat",
      "Total Donasi (Rp)",
      "Jumlah Transaksi",
      "Donasi Terakhir",
      "Terdaftar",
    ];
    const donorRows = (donors ?? []).map((d) => {
      const stats = donorStats[d.id as string] ?? { totalAmount: 0, count: 0, lastDonation: "" };
      return [
        d.full_name as string,
        d.email as string,
        (d.phone as string | null) ?? "",
        d.birth_date ? formatDate(d.birth_date as string) : "",
        (d.address as string | null) ?? "",
        stats.totalAmount,
        stats.count,
        stats.lastDonation ? formatDate(stats.lastDonation) : "",
        formatDate(d.created_at as string),
      ];
    });

    // Sheet 2: All donation transactions (including anonymous/guest)
    const transactionHeaders = [
      "Tanggal",
      "Nama Donatur",
      "Email",
      "No. WA",
      "Kampanye",
      "Jumlah (Rp)",
      "Metode Pembayaran",
      "Anonim",
      "Recurring",
    ];
    const transactionRows = (donations ?? []).map((d) => {
      const camp = d.campaigns as unknown as { title: string } | null;
      const methodLabel: Record<string, string> = {
        midtrans: "Midtrans",
        transfer_manual: "Transfer Manual",
        recurring: "Recurring",
      };
      return [
        formatDate(d.created_at as string),
        d.is_anonymous ? "Hamba Allah" : (d.donor_name as string),
        (d.donor_email as string) ?? "",
        (d.donor_phone as string | null) ?? "",
        camp?.title ?? "",
        d.amount as number,
        methodLabel[d.payment_method as string] ?? (d.payment_method as string),
        d.is_anonymous ? "Ya" : "Tidak",
        d.is_recurring ? "Ya" : "Tidak",
      ];
    });

    // Sheet 3: Donor segmentation by total donation
    const segmentMap: Record<string, number> = {
      "< Rp50 rb": 0,
      "Rp50 rb – Rp500 rb": 0,
      "Rp500 rb – Rp2 jt": 0,
      "> Rp2 jt": 0,
    };
    for (const stats of Object.values(donorStats)) {
      if (stats.totalAmount < 50_000) segmentMap["< Rp50 rb"]++;
      else if (stats.totalAmount < 500_000) segmentMap["Rp50 rb – Rp500 rb"]++;
      else if (stats.totalAmount < 2_000_000) segmentMap["Rp500 rb – Rp2 jt"]++;
      else segmentMap["> Rp2 jt"]++;
    }

    const segmentHeaders = ["Segmen Donatur", "Jumlah Donatur"];
    const segmentRows = Object.entries(segmentMap).map(([label, count]) => [label, count]);

    const wb = buildWorkbook([
      { name: "Rekap Donatur", headers: donorHeaders, rows: donorRows },
      { name: "Semua Transaksi", headers: transactionHeaders, rows: transactionRows },
      { name: "Segmentasi Donatur", headers: segmentHeaders, rows: segmentRows },
    ]);

    const filename = `laporan-donatur-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return xlsxResponse(wb, filename);
  } catch (err) {
    console.error("Reports donors error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
