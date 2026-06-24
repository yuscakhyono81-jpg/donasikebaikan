import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const category_id = formData.get("category_id") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("photos") as File[];

    if (!name || !phone || !address || !category_id || !description) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran foto maksimal 5 MB per file" }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Hanya file gambar yang diperbolehkan" }, { status: 400 });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `proposals/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = new Uint8Array(await file.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from("proposal-photos")
        .upload(filePath, buffer, { contentType: file.type, upsert: false });

      if (uploadErr) {
        console.error("Photo upload error:", uploadErr);
        continue;
      }

      const { data: urlData } = supabase.storage.from("proposal-photos").getPublicUrl(filePath);
      photoUrls.push(urlData.publicUrl);
    }

    const { error } = await supabase.from("beneficiary_proposals").insert({
      proposer_id: user.id,
      name,
      phone,
      address,
      category_id,
      description,
      photo_urls: photoUrls,
      status: "masuk",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Proposal create error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
