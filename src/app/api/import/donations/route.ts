import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

interface DonationRow {
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  campaign_id: string;
  amount: number;
  payment_method: "midtrans" | "transfer_manual" | "recurring";
  status: "pending" | "success" | "failed";
  message?: string;
  is_anonymous: boolean;
  donated_at?: string;
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

function normalizeRow(raw: Record<string, string>): DonationRow | null {
  const get = (keys: string[]) =>
    keys.map((k) => raw[k] ?? raw[k.toLowerCase()] ?? "").find((v) => v !== "") ?? "";

  const donor_name = get(["donor_name", "Nama Donatur", "nama"]);
  const donor_email = get(["donor_email", "Email", "email"]);
  const campaign_id = get(["campaign_id", "ID Campaign"]);
  const amountRaw = get(["amount", "nominal", "Nominal"]);
  const amount = Number(amountRaw.replace(/[^0-9]/g, ""));

  if (!donor_name || !donor_email || !campaign_id || !amount || isNaN(amount)) return null;

  const methodRaw = get(["payment_method", "metode", "Metode Pembayaran"]).toLowerCase();
  const methodMap: Record<string, DonationRow["payment_method"]> = {
    midtrans: "midtrans",
    transfer: "transfer_manual",
    transfer_manual: "transfer_manual",
    manual: "transfer_manual",
    recurring: "recurring",
  };
  const payment_method = methodMap[methodRaw] ?? "transfer_manual";

  const statusRaw = get(["status", "Status"]).toLowerCase();
  const statusMap: Record<string, DonationRow["status"]> = {
    success: "success",
    sukses: "success",
    berhasil: "success",
    pending: "pending",
    failed: "failed",
    gagal: "failed",
  };
  const status = statusMap[statusRaw] ?? "success";

  const donated_at = get(["donated_at", "tanggal", "Tanggal Donasi"]) || undefined;
  const anonRaw = get(["is_anonymous", "anonim", "Anonim"]).toLowerCase();
  const is_anonymous = anonRaw === "ya" || anonRaw === "true" || anonRaw === "1";

  return {
    donor_name: donor_name.trim(),
    donor_email: donor_email.trim().toLowerCase(),
    donor_phone: get(["donor_phone", "telepon", "WhatsApp"]) || undefined,
    campaign_id: campaign_id.trim(),
    amount,
    payment_method,
    status,
    message: get(["message", "pesan", "Pesan"]) || undefined,
    is_anonymous,
    donated_at: donated_at || undefined,
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
    const preview: DonationRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const normalized = normalizeRow(rows[i]!);
      if (!normalized) {
        result.errors.push({ row: i + 2, reason: "Kolom wajib kosong atau nominal tidak valid" });
        continue;
      }

      if (previewOnly) {
        preview.push(normalized);
        continue;
      }

      // Verify campaign exists
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("id", normalized.campaign_id)
        .maybeSingle();

      if (!campaign) {
        result.errors.push({ row: i + 2, reason: `Campaign ID tidak ditemukan: ${normalized.campaign_id}` });
        continue;
      }

      const orderId = `IMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      const { error: insertError } = await supabase.from("donations").insert({
        campaign_id: normalized.campaign_id,
        donor_name: normalized.is_anonymous ? "Hamba Allah" : normalized.donor_name,
        donor_email: normalized.donor_email,
        donor_phone: normalized.donor_phone ?? null,
        amount: normalized.amount,
        message: normalized.message ?? null,
        is_anonymous: normalized.is_anonymous,
        status: normalized.status,
        payment_method: normalized.payment_method,
        transaction_id: orderId,
        is_recurring: normalized.payment_method === "recurring",
        crm_synced: false,
        created_at: normalized.donated_at ?? new Date().toISOString(),
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
    console.error("[Import Donations] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
