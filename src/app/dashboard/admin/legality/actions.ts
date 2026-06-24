"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addLegalityDoc(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("legality_documents").insert({
    title: formData.get("title") as string,
    document_type: formData.get("document_type") as string,
    file_url: formData.get("file_url") as string,
    issued_by: (formData.get("issued_by") as string) || null,
    issued_at: (formData.get("issued_at") as string) || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/legality");
}

export async function deleteLegalityDoc(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("legality_documents").delete().eq("id", formData.get("id") as string);
  revalidatePath("/dashboard/admin/legality");
}
