"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const heroHeadline = formData.get("hero_headline") as string;
  const heroSubtitle = formData.get("hero_subtitle") as string;
  const heroBannerFile = formData.get("hero_banner_file") as File | null;

  let bannerUrl: string | null = null;

  // Upload banner jika ada file baru
  if (heroBannerFile && heroBannerFile.size > 0) {
    const ext = heroBannerFile.name.split(".").pop();
    const fileName = `hero-banner-${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(fileName, heroBannerFile, { upsert: true, contentType: heroBannerFile.type });

    if (uploadError) return { error: `Upload gagal: ${uploadError.message}` };

    const { data: { publicUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(uploadData.path);

    bannerUrl = publicUrl;
  }

  // Simpan semua settings
  const updates: { key: string; value: string }[] = [
    { key: "hero_headline", value: heroHeadline },
    { key: "hero_subtitle", value: heroSubtitle },
  ];

  if (bannerUrl) {
    updates.push({ key: "hero_banner_url", value: bannerUrl });
  }

  for (const { key, value } of updates) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) return { error: `Gagal simpan ${key}: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/settings");

  return { success: true };
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*");

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}
