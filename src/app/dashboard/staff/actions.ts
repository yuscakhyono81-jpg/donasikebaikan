"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addCampaignUpdate(campaignId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("campaign_updates").insert({
    campaign_id: campaignId,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: (formData.get("image_url") as string) || null,
    published_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/staff/campaigns/${campaignId}/update`);
  redirect(`/dashboard/staff`);
}

export async function replyToPrayer(prayerId: string, campaignId: string, reply: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("donation_prayers")
    .update({ reply, replied_by: user.id, replied_at: new Date().toISOString() })
    .eq("id", prayerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/staff/campaigns/${campaignId}/prayers`);
}

export async function staffVerifyDonation(id: string, approved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const status = approved ? "success" : "failed";
  const { error } = await supabase.from("donations").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/staff/donations/verify");
}
