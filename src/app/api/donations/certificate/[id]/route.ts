import { NextRequest, NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import DonationCertificate from "@/components/pdf/DonationCertificate";
import ZakatCertificate from "@/components/pdf/ZakatCertificate";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type CampaignJoin = {
  title: string;
  category_id: string;
  categories: { slug: string } | null;
} | null;

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/donations/certificate/[id]">
) {
  const { id } = await ctx.params;

  const supabase = await createClient();

  const { data: donation, error } = await supabase
    .from("donations")
    .select("id, donor_name, amount, status, transaction_id, created_at, campaign_id, campaigns(title, category_id, categories(slug))")
    .eq("id", id)
    .single();

  if (error || !donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }

  if (donation.status !== "success") {
    return NextResponse.json({ error: "Sertifikat hanya tersedia untuk donasi yang berhasil" }, { status: 400 });
  }

  const campaign = donation.campaigns as unknown as CampaignJoin;
  const categorySlug = campaign?.categories?.slug ?? "";
  const isZakat = categorySlug === "zakat";

  const props = {
    donorName: donation.donor_name,
    amount: donation.amount,
    campaignTitle: campaign?.title ?? "Program LAZIS NUR",
    transactionId: donation.transaction_id ?? donation.id,
    date: formatDate(donation.created_at),
  };

  const component = isZakat
    ? createElement(ZakatCertificate, props)
    : createElement(DonationCertificate, props);

  const buffer = await renderToBuffer(component as ReactElement<DocumentProps>);
  const filename = `sertifikat-donasi-${donation.id.slice(0, 8)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
