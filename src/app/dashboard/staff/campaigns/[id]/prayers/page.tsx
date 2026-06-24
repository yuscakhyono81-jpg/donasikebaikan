import { redirect, notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { replyToPrayer } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function PrayersPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: prayers } = await supabase
    .from("donation_prayers")
    .select("id, donor_name, message, reply, replied_at, created_at, is_visible")
    .eq("campaign_id", id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  async function handleReply(formData: FormData) {
    "use server";
    await replyToPrayer(
      formData.get("prayer_id") as string,
      id,
      formData.get("reply") as string
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/staff" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doa Donatur</h1>
          <p className="text-slate-500 text-sm truncate">{campaign.title as string}</p>
        </div>
      </div>

      {!prayers?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Belum ada doa dari donatur</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prayers.map((p) => (
            <div key={p.id as string} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900 text-sm">{p.donor_name as string}</p>
                <p className="text-xs text-slate-400">{formatRelativeTime(p.created_at as string)}</p>
              </div>
              <p className="text-slate-700 text-sm italic">"{p.message as string}"</p>

              {p.reply ? (
                <div className="mt-3 bg-primary-50 rounded-xl p-3 border border-primary-100">
                  <p className="text-xs font-semibold text-primary-700 mb-1">Balasan staf:</p>
                  <p className="text-sm text-primary-800">{p.reply as string}</p>
                  {p.replied_at && (
                    <p className="text-xs text-primary-400 mt-1">{formatRelativeTime(p.replied_at as string)}</p>
                  )}
                </div>
              ) : (
                <form action={handleReply} className="mt-3 flex gap-2">
                  <input type="hidden" name="prayer_id" value={p.id as string} />
                  <textarea
                    name="reply"
                    required
                    rows={2}
                    placeholder="Tulis balasan doa..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors self-end"
                  >
                    Balas
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
