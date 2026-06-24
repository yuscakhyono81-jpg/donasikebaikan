import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // Vercel cron secret verification
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Find all active recurring donations
    const { data: recurringDonations, error } = await supabase
      .from("donations")
      .select("id, donor_id, campaign_id, amount, donor_name, donor_email, donor_phone, message, is_anonymous, recurring_interval")
      .eq("is_recurring", true)
      .eq("status", "success");

    if (error || !recurringDonations) {
      return NextResponse.json({ error: "Gagal mengambil data recurring" }, { status: 500 });
    }

    const processed: string[] = [];
    const failed: string[] = [];

    for (const source of recurringDonations) {
      try {
        const orderId = `REC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

        const { error: insertError } = await supabase
          .from("donations")
          .insert({
            campaign_id: source.campaign_id,
            donor_id: source.donor_id,
            donor_name: source.donor_name,
            donor_email: source.donor_email,
            donor_phone: source.donor_phone,
            amount: source.amount,
            message: source.message,
            is_anonymous: source.is_anonymous,
            status: "pending",
            payment_method: "recurring",
            transaction_id: orderId,
            is_recurring: true,
            recurring_interval: source.recurring_interval,
            crm_synced: false,
          });

        if (insertError) {
          failed.push(source.id);
        } else {
          processed.push(source.id);
        }
      } catch {
        failed.push(source.id);
      }
    }

    return NextResponse.json({
      processed: processed.length,
      failed: failed.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron recurring error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
