import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const schema = z.object({
  campaign_id: z.string().uuid(),
  amount: z.number().min(5_000, "Minimal donasi Rp 5.000"),
  donor_name: z.string().min(2),
  donor_email: z.string().email(),
  donor_phone: z.string().optional(),
  message: z.string().max(300).optional(),
  is_anonymous: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Login diperlukan untuk donasi recurring" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }

    const data = parsed.data;

    // Verify campaign
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, status")
      .eq("id", data.campaign_id)
      .single();

    if (!campaign || campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign tidak aktif" }, { status: 400 });
    }

    const orderId = `REC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        campaign_id: data.campaign_id,
        donor_id: user.id,
        donor_name: data.is_anonymous ? "Hamba Allah" : data.donor_name,
        donor_email: data.donor_email,
        donor_phone: data.donor_phone ?? null,
        amount: data.amount,
        message: data.message ?? null,
        is_anonymous: data.is_anonymous,
        status: "pending",
        payment_method: "recurring",
        transaction_id: orderId,
        is_recurring: true,
        recurring_interval: "monthly",
        crm_synced: false,
      })
      .select("id")
      .single();

    if (error || !donation) {
      return NextResponse.json({ error: "Gagal membuat donasi recurring" }, { status: 500 });
    }

    return NextResponse.json({ donation_id: donation.id, message: "Donasi recurring berhasil dijadwalkan" });
  } catch (err) {
    console.error("Recurring setup error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("donations")
      .select("id, campaign_id, amount, status, is_recurring, recurring_interval, created_at, campaigns(title, slug)")
      .eq("donor_id", user.id)
      .eq("is_recurring", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal mengambil data recurring" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Get recurring error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
