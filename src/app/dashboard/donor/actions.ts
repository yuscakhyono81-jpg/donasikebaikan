"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") as string,
      phone: (formData.get("phone") as string) || null,
      birth_date: (formData.get("birth_date") as string) || null,
      address: (formData.get("address") as string) || null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/donor/profile");
}

export async function cancelRecurring(donationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("donations")
    .update({ is_recurring: false, recurring_interval: null } as Record<string, unknown>)
    .eq("id", donationId)
    .eq("donor_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/donor/recurring");
}

export async function submitProposal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("beneficiary_proposals").insert({
    proposer_id: user.id,
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    category_id: formData.get("category_id") as string,
    description: formData.get("description") as string,
    photo_urls: [],
    status: "masuk",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/donor/proposals");
  redirect("/dashboard/donor/proposals");
}
