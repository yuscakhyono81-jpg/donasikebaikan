"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const { error } = await supabase.from("categories").insert({
    name,
    slug: generateSlug(name),
    icon: (formData.get("icon") as string) || "tag",
    is_active: true,
    sort_order: Number(formData.get("sort_order") || 99),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: generateSlug(name),
      icon: (formData.get("icon") as string) || "tag",
      sort_order: Number(formData.get("sort_order") || 99),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categories");
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: !isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categories");
}
