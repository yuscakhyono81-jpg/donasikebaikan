"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const slug = generateSlug(title) + "-" + Date.now().toString(36);
  const payload = {
    title,
    slug,
    short_description: formData.get("short_description") as string,
    category_id: formData.get("category_id") as string,
    cover_image: (formData.get("cover_image") as string) || "",
    target_amount: Number(formData.get("target_amount")),
    deadline: formData.get("deadline") as string,
    is_featured: formData.get("is_featured") === "on",
    is_urgent: formData.get("is_urgent") === "on",
    status: (formData.get("status") as string) || "draft",
    creator_id: user.id,
    collected_amount: 0,
    donor_count: 0,
  };

  const { error } = await supabase.from("campaigns").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/campaigns");
  redirect("/dashboard/admin/campaigns");
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = {
    title: formData.get("title") as string,
    short_description: formData.get("short_description") as string,
    category_id: formData.get("category_id") as string,
    cover_image: (formData.get("cover_image") as string) || "",
    target_amount: Number(formData.get("target_amount")),
    deadline: formData.get("deadline") as string,
    is_featured: formData.get("is_featured") === "on",
    is_urgent: formData.get("is_urgent") === "on",
    status: (formData.get("status") as string) || "draft",
  };

  const { error } = await supabase.from("campaigns").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/campaigns");
  redirect("/dashboard/admin/campaigns");
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/campaigns");
}

export async function updateCampaignStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/campaigns");
}
