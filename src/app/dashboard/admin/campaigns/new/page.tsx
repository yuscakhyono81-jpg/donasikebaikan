import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignForm from "../CampaignForm";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Buat Campaign Baru</h1>
        <p className="text-slate-500 text-sm mt-0.5">Isi formulir di bawah untuk membuat campaign baru</p>
      </div>
      <CampaignForm categories={categories ?? []} />
    </div>
  );
}
