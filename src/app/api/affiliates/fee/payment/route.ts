import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const schema = z.object({
  fee_payment_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Hanya admin yang bisa mencatat pembayaran fee" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }

    const { fee_payment_id, notes } = parsed.data;

    const { data: existing, error: fetchError } = await supabase
      .from("affiliate_fee_payments")
      .select("id, status")
      .eq("id", fee_payment_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Fee payment tidak ditemukan" }, { status: 404 });
    }

    if (existing.status === "paid") {
      return NextResponse.json({ error: "Fee ini sudah dibayar sebelumnya" }, { status: 409 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("affiliate_fee_payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paid_by: user.id,
        notes: notes ?? null,
      })
      .eq("id", fee_payment_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Fee payment update error:", updateError);
      return NextResponse.json({ error: "Gagal memperbarui status pembayaran" }, { status: 500 });
    }

    return NextResponse.json({ fee_payment: updated });
  } catch (err) {
    console.error("Fee payment error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
