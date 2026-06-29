import path from "path";
import fs from "fs";
import { createElement } from "react";
import type { ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import BuktiSetorDonasi, { type BuktiSetorDonasiProps } from "@/components/pdf/BuktiSetorDonasi";

type CampaignJoin = { title: string; categories: { slug: string } | null } | null;
interface BankAccount { bank: string; number: string; holder: string }

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const [{ data: donation, error }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, donor_phone, is_anonymous, amount, status, transaction_id, created_at, payment_method, campaigns(title, categories(slug))")
      .eq("id", id)
      .single(),
    supabase.from("site_settings").select("key, value"),
  ]);

  if (error || !donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }

  const settings: Record<string, string> = {};
  for (const row of settingsRows ?? []) settings[row.key] = row.value;

  let banks: BankAccount[] = [];
  try { banks = JSON.parse(settings.bank_accounts ?? "[]"); } catch { /* empty */ }
  const firstBank = banks[0];
  const bankInfo = firstBank ? `${firstBank.bank} ${firstBank.number}` : "";

  const campaign = donation.campaigns as unknown as CampaignJoin;
  const donorName = donation.is_anonymous ? "Hamba Allah" : (donation.donor_name as string ?? "");

  let logo = "";
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
    logo = `data:image/png;base64,${buf.toString("base64")}`;
  } catch { /* logo optional */ }

  const props: BuktiSetorDonasiProps = {
    donorName,
    donorPhone: (donation.donor_phone as string | null) ?? "",
    amount: donation.amount as number,
    campaignTitle: campaign?.title ?? "Program LAZISNUR",
    transactionId: (donation.transaction_id as string | null) ?? (donation.id as string),
    date: fmtDate(donation.created_at as string),
    receiptNo: mkReceiptNo(donation.created_at as string, donation.id as string),
    donorIdShort: (donation.id as string).replace(/-/g, "").slice(0, 9).toUpperCase(),
    bankInfo,
    jenis: jenisDonasi(campaign?.categories?.slug),
    tb: terbilang(donation.amount as number),
    logo,
  };

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(createElement(BuktiSetorDonasi, props) as ReactElement<DocumentProps>);
  } catch (err) {
    console.error("[receipt] PDF render error:", err);
    return NextResponse.json({ error: "Gagal membuat PDF" }, { status: 500 });
  }

  const filename = `bukti-setor-donasi-${(donation.id as string).slice(0, 8)}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function mkReceiptNo(createdAt: string, id: string): string {
  const d = new Date(createdAt);
  const yymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const suffix = id.replace(/-/g, "").slice(0, 3).toUpperCase();
  return `${yymm}${suffix}`;
}

function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const satuan = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
    "enam belas", "tujuh belas", "delapan belas", "sembilan belas",
  ];
  function w(x: number): string {
    if (x === 0) return "";
    if (x < 20) return satuan[x];
    if (x < 100) {
      const tens = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
        "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"][Math.floor(x / 10)];
      const r = x % 10;
      return r === 0 ? tens : `${tens} ${satuan[r]}`;
    }
    if (x < 1_000) {
      const h = Math.floor(x / 100);
      const r = x % 100;
      const hw = h === 1 ? "seratus" : `${satuan[h]} ratus`;
      return r === 0 ? hw : `${hw} ${w(r)}`;
    }
    if (x < 1_000_000) {
      const k = Math.floor(x / 1_000);
      const r = x % 1_000;
      const kw = k === 1 ? "seribu" : `${w(k)} ribu`;
      return r === 0 ? kw : `${kw} ${w(r)}`;
    }
    if (x < 1_000_000_000) {
      const m = Math.floor(x / 1_000_000);
      const r = x % 1_000_000;
      const mw = `${w(m)} juta`;
      return r === 0 ? mw : `${mw} ${w(r)}`;
    }
    const b = Math.floor(x / 1_000_000_000);
    const r = x % 1_000_000_000;
    const bw = `${w(b)} miliar`;
    return r === 0 ? bw : `${bw} ${w(r)}`;
  }
  const words = w(Math.round(n));
  return words.charAt(0).toUpperCase() + words.slice(1) + " Rupiah";
}

function jenisDonasi(slug: string | null | undefined): string {
  if (!slug) return "Infak/Sedekah Tidak Terikat";
  if (slug.includes("zakat")) return "Zakat Mal";
  if (slug.includes("fidyah")) return "Fidyah";
  if (slug.includes("wakaf")) return "Wakaf";
  if (slug.includes("qurban") || slug.includes("kurban")) return "Qurban";
  return "Infak/Sedekah Tidak Terikat";
}
