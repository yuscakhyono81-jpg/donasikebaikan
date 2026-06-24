import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

interface DonorRow {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  birth_date?: string;
}

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

function parseCsvRows(buffer: ArrayBuffer): Record<string, string>[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]!];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
}

function normalizeRow(raw: Record<string, string>): DonorRow | null {
  // Accept multiple column name variants (lowercase, with spaces, etc.)
  const get = (keys: string[]) =>
    keys.map((k) => raw[k] ?? raw[k.toLowerCase()] ?? "").find((v) => v !== "") ?? "";

  const full_name = get(["full_name", "Nama", "nama", "name", "Name"]);
  const email = get(["email", "Email", "e-mail"]);

  if (!full_name || !email) return null;

  return {
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: get(["phone", "Phone", "telepon", "Telepon", "no_hp", "WhatsApp"]) || undefined,
    address: get(["address", "Address", "alamat", "Alamat"]) || undefined,
    birth_date: get(["birth_date", "tanggal_lahir", "Tanggal Lahir"]) || undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const previewOnly = formData.get("preview") === "true";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const rows = parseCsvRows(buffer);

    if (rows.length === 0) {
      return NextResponse.json({ error: "File kosong atau format tidak didukung" }, { status: 400 });
    }

    const result: ImportResult = { total: rows.length, imported: 0, skipped: 0, errors: [] };
    const preview: DonorRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const normalized = normalizeRow(rows[i]!);
      if (!normalized) {
        result.errors.push({ row: i + 2, reason: "Kolom nama atau email kosong" });
        continue;
      }

      if (previewOnly) {
        preview.push(normalized);
        continue;
      }

      // Check if email already exists in profiles
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalized.email)
        .maybeSingle();

      if (existing) {
        result.skipped++;
        continue;
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        email: normalized.email,
        full_name: normalized.full_name,
        phone: normalized.phone ?? null,
        address: normalized.address ?? null,
        birth_date: normalized.birth_date ?? null,
        role: "donor",
        is_approved: true,
      });

      if (insertError) {
        result.errors.push({ row: i + 2, reason: insertError.message });
      } else {
        result.imported++;
      }
    }

    if (previewOnly) {
      return NextResponse.json({ preview: preview.slice(0, 20), total: rows.length });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Import Donors] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
