import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import DonationReceipt, { type DonationReceiptProps } from "@/components/pdf/DonationReceipt";

function formatDateId(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function receiptNumber(createdAt: string, id: string): string {
  const d = new Date(createdAt);
  const yymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const suffix = id.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${yymm}-${suffix}`;
}

function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const satuan = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas",
    "tujuh belas", "delapan belas", "sembilan belas",
  ];
  function toWords(num: number): string {
    if (num === 0) return "";
    if (num < 20) return satuan[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const o = num % 10;
      const tens = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
        "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"][t];
      return o === 0 ? tens : `${tens} ${satuan[o]}`;
    }
    if (num < 1000) {
      const h = Math.floor(num / 100);
      const r = num % 100;
      const hw = h === 1 ? "seratus" : `${satuan[h]} ratus`;
      return r === 0 ? hw : `${hw} ${toWords(r)}`;
    }
    if (num < 1_000_000) {
      const k = Math.floor(num / 1000);
      const r = num % 1000;
      const kw = k === 1 ? "seribu" : `${toWords(k)} ribu`;
      return r === 0 ? kw : `${kw} ${toWords(r)}`;
    }
    if (num < 1_000_000_000) {
      const m = Math.floor(num / 1_000_000);
      const r = num % 1_000_000;
      const mw = `${toWords(m)} juta`;
      return r === 0 ? mw : `${mw} ${toWords(r)}`;
    }
    const b = Math.floor(num / 1_000_000_000);
    const r = num % 1_000_000_000;
    const bw = `${toWords(b)} miliar`;
    return r === 0 ? bw : `${bw} ${toWords(r)}`;
  }
  const words = toWords(Math.round(n));
  return words.charAt(0).toUpperCase() + words.slice(1) + " Rupiah";
}

function jenisdonasiFromCategory(slug: string | null | undefined): string {
  if (!slug) return "Infak/Sedekah Tidak Terikat";
  if (slug.includes("zakat")) return "Zakat Mal";
  if (slug.includes("fidyah")) return "Fidyah";
  if (slug.includes("wakaf")) return "Wakaf";
  if (slug.includes("qurban") || slug.includes("kurban")) return "Qurban";
  return "Infak/Sedekah Tidak Terikat";
}

type CampaignJoin = {
  title: string;
  category_id: string;
  categories: { slug: string } | null;
} | null;

interface BankAccount { bank: string; number: string; holder: string }

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/donations/certificate/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const [{ data: donation, error }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, donor_phone, is_anonymous, amount, status, transaction_id, created_at, payment_method, campaign_id, campaigns(title, category_id, categories(slug))")
      .eq("id", id)
      .single(),
    supabase.from("site_settings").select("key, value"),
  ]);

  if (error || !donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }

  if (donation.status !== "success") {
    return NextResponse.json(
      { error: "Bukti hanya tersedia setelah donasi diverifikasi" },
      { status: 400 }
    );
  }

  const settings: Record<string, string> = {};
  for (const row of settingsRows ?? []) settings[row.key] = row.value;

  let bankAccounts: BankAccount[] = [];
  try { bankAccounts = JSON.parse(settings.bank_accounts ?? "[]"); } catch { /* empty */ }
  const firstBank = bankAccounts[0];
  const bankInfo = firstBank
    ? `${firstBank.bank} ${firstBank.number}`
    : "";

  const campaign = donation.campaigns as unknown as CampaignJoin;
  const categorySlug = campaign?.categories?.slug ?? "";
  const donorName = donation.is_anonymous ? "Hamba Allah" : (donation.donor_name ?? "");

  const props: DonationReceiptProps = {
    donorName,
    donorPhone: (donation.donor_phone as string | null) ?? "",
    amount: donation.amount as number,
    campaignTitle: campaign?.title ?? "Program LAZISNUR",
    transactionId: (donation.transaction_id as string | null) ?? donation.id as string,
    date: formatDateId(donation.created_at as string),
    receiptNumber: receiptNumber(donation.created_at as string, donation.id as string),
    donorId: (donation.id as string).slice(0, 8).toUpperCase(),
    paymentType: donation.payment_method === "transfer_manual" ? "bank" : "bank",
    bankInfo,
    jenisdonasi: jenisdonasiFromCategory(categorySlug),
    terbilang: terbilang(donation.amount as number),
    logoPath: path.join(process.cwd(), "public", "logo.png"),
  };

  const component = createElement(DonationReceipt, props);
  const buffer = await renderToBuffer(component as ReactElement<DocumentProps>);
  const filename = `bukti-donasi-${(donation.id as string).slice(0, 8)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
