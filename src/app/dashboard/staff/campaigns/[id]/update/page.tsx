import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addCampaignUpdate } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function CampaignUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "staff" && profile?.role !== "admin") redirect("/dashboard");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: updates } = await supabase
    .from("campaign_updates")
    .select("id, title, content, image_url, published_at")
    .eq("campaign_id", id)
    .order("published_at", { ascending: false })
    .limit(10);

  async function handleSubmit(formData: FormData) {
    "use server";
    await addCampaignUpdate(id, formData);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/staff" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Update Campaign</h1>
          <p className="text-slate-500 text-sm truncate">{campaign.title as string}</p>
        </div>
      </div>

      <form action={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Judul Update <span className="text-red-500">*</span></label>
          <input name="title" required placeholder="Contoh: Alhamdulillah, target 50% tercapai!" className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Isi Update <span className="text-red-500">*</span></label>
          <textarea name="content" required rows={6} placeholder="Ceritakan perkembangan campaign ini..." className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">URL Foto (opsional)</label>
          <input name="image_url" type="url" placeholder="https://..." className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/staff" className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
            Publikasikan Update
          </button>
        </div>
      </form>

      {/* Recent updates */}
      {(updates?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Update Sebelumnya</h2>
          <div className="space-y-3">
            {updates!.map((u) => (
              <div key={u.id as string} className="border border-slate-100 rounded-xl p-4">
                <p className="font-medium text-slate-900 text-sm">{u.title as string}</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{u.content as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
