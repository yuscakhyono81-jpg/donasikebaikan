import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyManualTransferReceived, notifyStaffNewTransfer } from "@/lib/wa";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const donationId = formData.get("donation_id") as string | null;
    const file = formData.get("file") as File | null;

    if (!donationId || !file) {
      return NextResponse.json({ error: "donation_id dan file wajib diisi" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5 MB" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify donation exists and is manual transfer
    const { data: donation, error: findError } = await supabase
      .from("donations")
      .select("id, status, payment_method")
      .eq("id", donationId)
      .single();

    if (findError || !donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
    }
    if (donation.payment_method !== "transfer_manual") {
      return NextResponse.json({ error: "Donasi ini bukan transfer manual" }, { status: 400 });
    }
    if (donation.status !== "pending") {
      return NextResponse.json({ error: "Donasi sudah diproses" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `proofs/${donationId}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("donation-proofs")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Gagal upload bukti transfer" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("donation-proofs").getPublicUrl(filePath);

    // Update donation with proof_url
    // Gunakan .select() agar bisa cek apakah row benar-benar ter-update (RLS bisa blokir silently)
    const { data: updatedRows, error: updateError } = await supabase
      .from("donations")
      .update({ proof_url: urlData.publicUrl })
      .eq("id", donationId)
      .select("id");

    if (updateError) {
      console.error("Update proof_url error:", updateError);
      return NextResponse.json({ error: "Gagal menyimpan bukti" }, { status: 500 });
    }
    if (!updatedRows || updatedRows.length === 0) {
      console.error("Update proof_url blocked (RLS atau donasi tidak ditemukan):", donationId);
      return NextResponse.json({ error: "Gagal menyimpan bukti transfer. Jalankan SQL fix RLS di Supabase." }, { status: 500 });
    }

    // Fire-and-forget WA notifications — don't block the response
    supabase
      .from("donations")
      .select("donor_phone, donor_name, amount, campaigns(title)")
      .eq("id", donationId)
      .single()
      .then(
        ({ data: d }) => {
          if (!d) return;
          const campTitle = (d.campaigns as unknown as { title: string } | null)?.title ?? "";
          const staffPhone = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER;

          if (d.donor_phone) {
            notifyManualTransferReceived({
              phone: d.donor_phone as string,
              donorName: d.donor_name as string,
              campaignTitle: campTitle,
              amount: d.amount as number,
            }).catch((e) => console.error("[WA] manual notify donor error:", e));
          }

          if (staffPhone) {
            notifyStaffNewTransfer({
              phone: staffPhone,
              donorName: d.donor_name as string,
              campaignTitle: campTitle,
              amount: d.amount as number,
              donationId,
            }).catch((e) => console.error("[WA] manual notify staff error:", e));
          }
        },
        (e) => console.error("[WA] manual fetch for notify error:", e),
      );

    return NextResponse.json({ success: true, proof_url: urlData.publicUrl });
  } catch (err) {
    console.error("Manual transfer error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
