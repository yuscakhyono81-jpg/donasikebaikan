import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Snap } from "midtrans-client";
import { z } from "zod/v4";

const schema = z.object({
  campaign_id: z.string().uuid("campaign_id tidak valid"),
  amount: z.number().min(5_000, "Minimal donasi Rp 5.000"),
  donor_name: z.string().min(2),
  donor_email: z.string().email(),
  donor_phone: z.string().optional(),
  message: z.string().max(300).optional(),
  is_anonymous: z.boolean().optional().default(false),
  payment_method: z.enum(["midtrans", "transfer_manual"]).default("midtrans"),
  referral_code: z.string().optional(),
});

const snap = new Snap({
  isProduction: process.env.MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Verify campaign is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title, status, target_amount, collected_amount")
      .eq("id", data.campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign tidak ditemukan" }, { status: 404 });
    }
    if (campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign tidak aktif" }, { status: 400 });
    }

    // Get logged-in user if any
    const { data: { user } } = await supabase.auth.getUser();

    // Generate IDs upfront — hindari SELECT setelah INSERT (RLS memblokir anon SELECT)
    const donationId = randomUUID();
    const orderId = `DON-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const { error: donationError } = await supabase
      .from("donations")
      .insert({
        id: donationId,
        campaign_id: data.campaign_id,
        donor_id: user?.id ?? null,
        donor_name: data.is_anonymous ? "Hamba Allah" : data.donor_name,
        donor_email: data.donor_email,
        donor_phone: data.donor_phone ?? null,
        amount: data.amount,
        message: data.message ?? null,
        is_anonymous: data.is_anonymous,
        status: "pending",
        payment_method: data.payment_method,
        transaction_id: orderId,
        referral_code: data.referral_code ?? null,
        is_recurring: false,
        crm_synced: false,
      });

    if (donationError) {
      console.error("Donation insert error:", donationError);
      return NextResponse.json({ error: "Gagal membuat donasi" }, { status: 500 });
    }

    // Save prayer if message provided
    if (data.message) {
      await supabase.from("donation_prayers").insert({
        donation_id: donationId,
        campaign_id: data.campaign_id,
        donor_name: data.is_anonymous ? "Hamba Allah" : data.donor_name,
        message: data.message,
        is_visible: true,
      });
    }

    // Manual transfer — return donation_id only
    if (data.payment_method === "transfer_manual") {
      return NextResponse.json({ donation_id: donationId });
    }

    // Midtrans Snap — create token
    const snapTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: data.amount,
      },
      customer_details: {
        first_name: data.is_anonymous ? "Hamba Allah" : data.donor_name,
        email: data.donor_email,
        phone: data.donor_phone,
      },
      item_details: [
        {
          id: data.campaign_id,
          price: data.amount,
          quantity: 1,
          name: campaign.title.slice(0, 50),
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/donation/success/${donationId}`,
      },
    });

    return NextResponse.json({
      donation_id: donationId,
      snap_token: snapTransaction.token,
    });
  } catch (err) {
    console.error("Create donation error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
