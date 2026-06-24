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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    // Fetch affiliates with their profiles
    const { data: affiliates } = await supabase
      .from("affiliates")
      .select("id, organization_name, bank_name, account_number, account_holder, is_approved, created_at, profiles(full_name, email, phone)")
      .order("organization_name");

    // Fetch affiliate campaigns with referral performance
    const { data: acRows } = await supabase
      .from("affiliate_campaigns")
      .select("affiliate_id, referral_code, fee_percentage, affiliates(organization_name), campaigns(title)");

    // Fetch donations via referral codes
    let donationQuery = supabase
      .from("donations")
      .select("amount, referral_code, created_at, donor_name, is_anonymous, campaigns(title)")
      .eq("status", "success")
      .not("referral_code", "is", null);

    if (dateFrom) donationQuery = donationQuery.gte("created_at", dateFrom);
    if (dateTo) donationQuery = donationQuery.lte("created_at", dateTo + "T23:59:59");

    const { data: donations } = await donationQuery;

    // Fetch fee payments
    let feeQuery = supabase
      .from("affiliate_fee_payments")
      .select("affiliate_id, fee_amount, total_donation, status, period_start, period_end, paid_at, affiliates(organization_name), campaigns(title)");

    if (dateFrom) feeQuery = feeQuery.gte("period_start", dateFrom);
    if (dateTo) feeQuery = feeQuery.lte("period_end", dateTo);

    const { data: feePayments } = await feeQuery.order("period_start", { ascending: false });

    // Aggregate donations by affiliate
    const codeToAffiliate: Record<string, { affiliateId: string; orgName: string; campaignTitle: string; feePercentage: number }> = {};
    for (const ac of acRows ?? []) {
      const aff = ac.affiliates as unknown as { organization_name: string } | null;
      const camp = ac.campaigns as unknown as { title: string } | null;
      codeToAffiliate[ac.referral_code as string] = {
        affiliateId: ac.affiliate_id as string,
        orgName: aff?.organization_name ?? "",
        campaignTitle: camp?.title ?? "",
        feePercentage: ac.fee_percentage as number,
      };
    }

    const affiliateStats: Record<string, { totalDonations: number; totalAmount: number; feePending: number; feePaid: number }> = {};
    for (const aff of affiliates ?? []) {
      affiliateStats[aff.id as string] = { totalDonations: 0, totalAmount: 0, feePending: 0, feePaid: 0 };
    }
    for (const d of donations ?? []) {
      const info = codeToAffiliate[d.referral_code as string];
      if (info && affiliateStats[info.affiliateId]) {
        affiliateStats[info.affiliateId].totalDonations += 1;
        affiliateStats[info.affiliateId].totalAmount += d.amount as number;
      }
    }
    for (const fp of feePayments ?? []) {
      const affId = fp.affiliate_id as string;
      if (affiliateStats[affId]) {
        if (fp.status === "pending") affiliateStats[affId].feePending += fp.fee_amount as number;
        else affiliateStats[affId].feePaid += fp.fee_amount as number;
      }
    }

    // Sheet 1: Affiliate summary
    const summaryHeaders = [
      "Organisasi",
      "Nama PIC",
      "Email",
      "No. WA",
      "Bank",
      "No. Rekening",
      "Atas Nama",
      "Status",
      "Total Donasi via Referral",
      "Total Terkumpul (Rp)",
      "Fee Tertunda (Rp)",
      "Fee Dibayar (Rp)",
      "Terdaftar",
    ];
    const summaryRows = (affiliates ?? []).map((aff) => {
      const pic = aff.profiles as unknown as { full_name: string; email: string; phone: string } | null;
      const stats = affiliateStats[aff.id as string] ?? { totalDonations: 0, totalAmount: 0, feePending: 0, feePaid: 0 };
      return [
        aff.organization_name as string,
        pic?.full_name ?? "",
        pic?.email ?? "",
        pic?.phone ?? "",
        (aff.bank_name as string | null) ?? "",
        (aff.account_number as string | null) ?? "",
        (aff.account_holder as string | null) ?? "",
        aff.is_approved ? "Aktif" : "Pending",
        stats.totalDonations,
        stats.totalAmount,
        stats.feePending,
        stats.feePaid,
        formatDate(aff.created_at as string),
      ];
    });

    // Sheet 2: Donation detail via referral
    const donationHeaders = [
      "Tanggal",
      "Donatur",
      "Kampanye",
      "Kode Referral",
      "Organisasi Affiliate",
      "Jumlah (Rp)",
    ];
    const donationRows = (donations ?? []).map((d) => {
      const info = codeToAffiliate[d.referral_code as string];
      const camp = d.campaigns as unknown as { title: string } | null;
      return [
        formatDate(d.created_at as string),
        d.is_anonymous ? "Hamba Allah" : (d.donor_name as string),
        camp?.title ?? info?.campaignTitle ?? "",
        d.referral_code as string,
        info?.orgName ?? "",
        d.amount as number,
      ];
    });

    // Sheet 3: Fee payments
    const feeHeaders = [
      "Organisasi",
      "Kampanye",
      "Periode Mulai",
      "Periode Selesai",
      "Total Donasi (Rp)",
      "Fee (Rp)",
      "Status",
      "Tanggal Dibayar",
    ];
    const feeRows = (feePayments ?? []).map((fp) => {
      const aff = fp.affiliates as unknown as { organization_name: string } | null;
      const camp = fp.campaigns as unknown as { title: string } | null;
      return [
        aff?.organization_name ?? "",
        camp?.title ?? "",
        formatDate(fp.period_start as string),
        formatDate(fp.period_end as string),
        fp.total_donation as number,
        fp.fee_amount as number,
        fp.status === "paid" ? "Dibayar" : "Tertunda",
        fp.paid_at ? formatDate(fp.paid_at as string) : "",
      ];
    });

    const wb = buildWorkbook([
      { name: "Ringkasan Affiliate", headers: summaryHeaders, rows: summaryRows },
      { name: "Detail Donasi Referral", headers: donationHeaders, rows: donationRows },
      { name: "Riwayat Fee", headers: feeHeaders, rows: feeRows },
    ]);

    const filename = `laporan-afiliasi-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return xlsxResponse(wb, filename);
  } catch (err) {
    console.error("Reports affiliates error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
