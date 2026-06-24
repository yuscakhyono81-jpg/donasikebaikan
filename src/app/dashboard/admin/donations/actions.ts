"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyManualTransferVerified } from "@/lib/wa";
import { syncDonationWithLog } from "@/lib/crm";

export async function verifyDonation(id: string, approved: boolean, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const status = approved ? "success" : "failed";
  const { error } = await supabase
    .from("donations")
    .update({ status, notes } as Record<string, unknown>)
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Fetch donation details for WA notification + CRM sync
  const { data: donation } = await supabase
    .from("donations")
    .select("donor_phone, donor_name, donor_email, amount, is_anonymous, campaigns(title)")
    .eq("id", id)
    .single();

  if (donation && donation.donor_phone && !donation.is_anonymous) {
    const camp = donation.campaigns as unknown as { title: string } | null;
    notifyManualTransferVerified({
      phone: donation.donor_phone as string,
      donorName: donation.donor_name as string,
      campaignTitle: camp?.title ?? "",
      amount: donation.amount as number,
      approved,
    }).catch((e) => console.error("[WA] verify notify error:", e));
  }

  if (approved) {
    syncDonationWithLog(supabase, id, "realtime").catch((e) =>
      console.error("[CRM] verify sync error:", e)
    );
  }

  revalidatePath("/dashboard/admin/donations/verify");
}
