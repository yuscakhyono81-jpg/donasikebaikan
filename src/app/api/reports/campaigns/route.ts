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

    if (!profile || !["admin", "staff"].includes(profile.role as string)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const status = searchParams.get("status");

    let query = supabase
      .from("campaigns")
      .select(
        "title, slug, status, collected_amount, target_amount, donor_count, deadline, created_at, categories(name)"
      );

    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");
    if (status) query = query.eq("status", status);

    const { data: campaigns, error } = await query.order("collected_amount", { ascending: false });

    if (error) {
      console.error("Reports campaigns query error:", error);
      return NextResponse.json({ error: "Gagal mengambil data campaign" }, { status: 500 });
    }

    const headers = [
      "Judul Campaign",
      "Kategori",
      "Status",
      "Terkumpul (Rp)",
      "Target (Rp)",
      "Jumlah Donatur",
      "Progres (%)",
      "Deadline",
      "Tanggal Dibuat",
    ];

    const rows = (campaigns ?? []).map((c) => {
      const cat = c.categories as unknown as { name: string } | null;
      const collected = c.collected_amount as number;
      const target = c.target_amount as number;
      const pct = target > 0 ? Math.round((collected / target) * 100) : 0;
      return [
        c.title as string,
        cat?.name ?? "",
        c.status as string,
        collected,
        target,
        c.donor_count as number,
        pct,
        formatDate(c.deadline as string),
        formatDate(c.created_at as string),
      ];
    });

    const wb = buildWorkbook([{ name: "Laporan Campaign", headers, rows }]);
    const filename = `laporan-campaign-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return xlsxResponse(wb, filename);
  } catch (err) {
    console.error("Reports campaigns error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
