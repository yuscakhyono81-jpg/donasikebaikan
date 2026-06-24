import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignForm from "../../CampaignForm";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: campaign }, { data: categories }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, short_description, category_id, cover_image, target_amount, deadline, is_featured, is_urgent, status")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
  ]);

  if (!campaign) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
        <p className="text-slate-500 text-sm mt-0.5 truncate">{campaign.title as string}</p>
      </div>
      <CampaignForm
        categories={categories ?? []}
        campaign={campaign as {
          id: string;
          title: string;
          short_description: string;
          category_id: string;
          cover_image: string;
          target_amount: number;
          deadline: string;
          is_featured: boolean;
          is_urgent: boolean;
          status: string;
        }}
      />
    </div>
  );
}
