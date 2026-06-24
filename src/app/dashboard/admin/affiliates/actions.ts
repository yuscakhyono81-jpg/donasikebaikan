"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const REFERRAL_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

async function generateUniqueReferralCode(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 8 }, () =>
      REFERRAL_CHARSET[Math.floor(Math.random() * REFERRAL_CHARSET.length)]
    ).join("");
    const { data } = await supabase
      .from("affiliate_campaigns")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("Gagal generate kode referral unik");
}

export async function assignAffiliateToCampaign(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const affiliateId = formData.get("affiliate_id") as string;
  const campaignId = formData.get("campaign_id") as string;
  const feePercentage = parseFloat(formData.get("fee_percentage") as string);

  if (!affiliateId || !campaignId || isNaN(feePercentage) || feePercentage < 3 || feePercentage > 7) {
    throw new Error("Data tidak lengkap atau tidak valid");
  }

  const referralCode = await generateUniqueReferralCode(supabase);

  const { error } = await supabase.from("affiliate_campaigns").insert({
    affiliate_id: affiliateId,
    campaign_id: campaignId,
    referral_code: referralCode,
    fee_percentage: feePercentage,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/affiliates");
}

export async function removeAffiliateCampaign(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase.from("affiliate_campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/affiliates");
}

export async function approveAffiliate(id: string, approved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("profile_id")
    .eq("id", id)
    .single();

  if (!affiliate) throw new Error("Affiliate not found");

  await supabase
    .from("affiliates")
    .update({ is_approved: approved, approved_at: approved ? new Date().toISOString() : null, approved_by: approved ? user.id : null })
    .eq("id", id);

  await supabase
    .from("profiles")
    .update({ is_approved: approved })
    .eq("id", affiliate.profile_id);

  revalidatePath("/dashboard/admin/affiliates");
}

export async function markFeeAsPaid(feeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("affiliate_fee_payments")
    .update({ status: "paid", paid_at: new Date().toISOString(), paid_by: user.id })
    .eq("id", feeId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/affiliates/fee");
}
