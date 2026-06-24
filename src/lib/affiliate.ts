import type { SupabaseClient } from "@supabase/supabase-js";

export function calculateAffiliateFee(
  totalDonation: number,
  feePercentage: number
): number {
  return Math.floor((totalDonation * feePercentage) / 100);
}

export async function getAffiliateDonationTotal(
  supabase: SupabaseClient,
  referralCode: string,
  periodStart: string,
  periodEnd: string
): Promise<number> {
  const { data, error } = await supabase
    .from("donations")
    .select("amount")
    .eq("referral_code", referralCode)
    .eq("status", "success")
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd);

  if (error || !data) return 0;
  return data.reduce((sum, d) => sum + (d.amount as number), 0);
}

export async function getAffiliateStats(
  supabase: SupabaseClient,
  affiliateId: string
): Promise<{
  total_donations: number;
  total_collected: number;
  total_donors: number;
  fee_pending: number;
  fee_paid: number;
}> {
  const { data: acRows } = await supabase
    .from("affiliate_campaigns")
    .select("referral_code")
    .eq("affiliate_id", affiliateId);

  const referralCodes = (acRows ?? []).map((r) => r.referral_code as string);

  let total_collected = 0;
  let total_donations = 0;
  let total_donors = 0;

  if (referralCodes.length > 0) {
    const { data: donations } = await supabase
      .from("donations")
      .select("amount, donor_id, referral_code")
      .in("referral_code", referralCodes)
      .eq("status", "success");

    if (donations) {
      total_donations = donations.length;
      total_collected = donations.reduce((sum, d) => sum + (d.amount as number), 0);
      total_donors = new Set(donations.map((d) => d.donor_id as string)).size;
    }
  }

  const { data: fees } = await supabase
    .from("affiliate_fee_payments")
    .select("fee_amount, status")
    .eq("affiliate_id", affiliateId);

  let fee_pending = 0;
  let fee_paid = 0;
  for (const fee of fees ?? []) {
    if (fee.status === "pending") fee_pending += fee.fee_amount as number;
    else if (fee.status === "paid") fee_paid += fee.fee_amount as number;
  }

  return { total_donations, total_collected, total_donors, fee_pending, fee_paid };
}
