import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateAffiliateFee, getAffiliateDonationTotal } from "@/lib/affiliate";
import { z } from "zod/v4";

const schema = z.object({
  affiliate_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  period_start: z.string().date(),
  period_end: z.string().date(),
});

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }

    const { affiliate_id, campaign_id, period_start, period_end } = parsed.data;

    const { data: ac, error: acError } = await supabase
      .from("affiliate_campaigns")
      .select("referral_code, fee_percentage")
      .eq("affiliate_id", affiliate_id)
      .eq("campaign_id", campaign_id)
      .single();

    if (acError || !ac) {
      return NextResponse.json({ error: "Pasangan affiliate-campaign tidak ditemukan" }, { status: 404 });
    }

    const total_donation = await getAffiliateDonationTotal(
      supabase,
      ac.referral_code as string,
      period_start,
      period_end
    );

    const fee_amount = calculateAffiliateFee(total_donation, ac.fee_percentage as number);

    const { data: existing } = await supabase
      .from("affiliate_fee_payments")
      .select("id")
      .eq("affiliate_id", affiliate_id)
      .eq("campaign_id", campaign_id)
      .eq("period_start", period_start)
      .eq("period_end", period_end)
      .single();

    if (existing) {
      return NextResponse.json({
        error: "Fee untuk periode ini sudah dihitung",
        existing_id: existing.id,
      }, { status: 409 });
    }

    const { data: feePayment, error: insertError } = await supabase
      .from("affiliate_fee_payments")
      .insert({
        affiliate_id,
        campaign_id,
        period_start,
        period_end,
        total_donation,
        fee_amount,
        status: "pending",
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Fee insert error:", insertError);
      return NextResponse.json({ error: "Gagal menyimpan kalkulasi fee" }, { status: 500 });
    }

    return NextResponse.json({ fee_payment: feePayment });
  } catch (err) {
    console.error("Fee calculate error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
