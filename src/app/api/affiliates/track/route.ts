import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const to = req.nextUrl.searchParams.get("to") ?? "/";

  if (!ref) {
    return NextResponse.redirect(new URL(to, req.url));
  }

  const supabase = await createClient();

  const { data: ac } = await supabase
    .from("affiliate_campaigns")
    .select("id, campaign_id, campaigns(slug)")
    .eq("referral_code", ref)
    .single();

  const destination = ac
    ? `/campaign/${(ac.campaigns as unknown as { slug: string } | null)?.slug ?? ""}`
    : to;

  const response = NextResponse.redirect(new URL(destination, req.url));
  response.cookies.set("dk_ref", ref, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { referral_code } = (await req.json()) as { referral_code?: string };

    if (!referral_code) {
      return NextResponse.json({ error: "referral_code diperlukan" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: ac, error } = await supabase
      .from("affiliate_campaigns")
      .select("id, campaign_id, affiliate_id, fee_percentage, campaigns(title, slug)")
      .eq("referral_code", referral_code)
      .single();

    if (error || !ac) {
      return NextResponse.json({ error: "Kode referral tidak valid" }, { status: 404 });
    }

    return NextResponse.json({ valid: true, affiliate_campaign: ac });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
