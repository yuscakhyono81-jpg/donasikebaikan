import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, xlsxResponse } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("beneficiary_proposals")
    .select("id, name, phone, address, description, status, notes, created_at, updated_at, categories(name), profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: proposals, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const statusLabel: Record<string, string> = {
    masuk: "Masuk",
    diproses: "Diproses",
    disurvei: "Disurvei",
    dibantu: "Dibantu",
    ditolak: "Ditolak",
  };

  const rows = (proposals ?? []).map((p) => {
    const cat = p.categories as unknown as { name: string } | null;
    const proposer = p.profiles as unknown as { full_name: string; email: string; phone: string } | null;
    return [
      p.id as string,
      p.name as string,
      p.phone as string,
      p.address as string,
      cat?.name ?? "",
      statusLabel[p.status as string] ?? (p.status as string),
      p.notes as string ?? "",
      proposer?.full_name ?? "",
      proposer?.email ?? "",
      proposer?.phone ?? "",
      formatDate(p.created_at as string),
      formatDate(p.updated_at as string),
    ];
  });

  const wb = buildWorkbook([
    {
      name: "Usulan Penerima Manfaat",
      headers: [
        "ID", "Nama Penerima", "No. WA Penerima", "Alamat",
        "Kategori", "Status", "Catatan",
        "Pengusul", "Email Pengusul", "WA Pengusul",
        "Tgl Masuk", "Tgl Update",
      ],
      rows,
    },
  ]);

  const filename = `laporan-usulan-pm-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return xlsxResponse(wb, filename);
}
