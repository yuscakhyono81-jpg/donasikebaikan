import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyManualTransferVerified } from "@/lib/wa";
import { syncDonationWithLog } from "@/lib/crm";

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/donations/verify/[id]">
) {
  const { id } = await ctx.params;

  try {
    const supabase = await createClient();

    // Only staff or admin can verify
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json() as { action: "approve" | "reject" };

    if (!["approve", "reject"].includes(body.action)) {
      return NextResponse.json({ error: "action harus approve atau reject" }, { status: 400 });
    }

    const newStatus = body.action === "approve" ? "success" : "failed";

    const { data: donation, error: updateError } = await supabase
      .from("donations")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("payment_method", "transfer_manual")
      .select("id, campaign_id, amount, donor_name, donor_phone, campaigns(title)")
      .single();

    if (updateError || !donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan atau gagal diperbarui" }, { status: 404 });
    }

    // Fire-and-forget WA + CRM — don't block the response
    const campTitle = (donation.campaigns as unknown as { title: string } | null)?.title ?? "";

    if (donation.donor_phone) {
      notifyManualTransferVerified({
        phone: donation.donor_phone as string,
        donorName: donation.donor_name as string,
        campaignTitle: campTitle,
        amount: donation.amount as number,
        approved: body.action === "approve",
      }).catch((e) => console.error("[WA] verify notify error:", e));
    }

    if (body.action === "approve") {
      syncDonationWithLog(supabase, donation.id, "realtime").catch((e) =>
        console.error("[CRM] verify sync error:", e)
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error("Verify donation error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
