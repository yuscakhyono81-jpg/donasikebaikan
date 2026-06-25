import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate, calculateProgress } from "@/lib/utils";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import { deleteCampaignAction, toggleCampaignStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, title, slug, status, collected_amount, target_amount, donor_count, deadline, created_at, categories(name)")
    .order("created_at", { ascending: false });

  if (campaignError) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-2xl">
        <h2 className="font-bold text-red-700 mb-2">Debug Error</h2>
        <pre className="text-xs text-red-600 whitespace-pre-wrap">{JSON.stringify(campaignError, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Campaign</h1>
          <p className="text-slate-500 text-sm mt-0.5">{campaigns?.length ?? 0} total campaign</p>
        </div>
        <Link
          href="/dashboard/admin/campaigns/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Buat Campaign
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!campaigns?.length ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Belum ada campaign</p>
            <Link href="/dashboard/admin/campaigns/new" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
              Buat campaign pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Terkumpul</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Donatur</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.map((c) => {
                  const cat = c.categories as unknown as { name: string } | null;
                  const progress = calculateProgress(c.collected_amount as number, c.target_amount as number);
                  return (
                    <tr key={c.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900 max-w-[200px] truncate">{c.title as string}</p>
                          <div className="w-full max-w-[200px] bg-slate-100 rounded-full h-1.5 mt-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{cat?.name ?? "—"}</td>
                      <td className="px-5 py-4">
                        <CampaignStatusBadge status={c.status as string} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-medium text-slate-900">{formatRupiah(c.collected_amount as number, true)}</p>
                        <p className="text-xs text-slate-400">dari {formatRupiah(c.target_amount as number, true)}</p>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-700">{c.donor_count as number}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(c.deadline as string, "d MMM yyyy")}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <form action={toggleCampaignStatusAction}>
                            <input type="hidden" name="id" value={c.id as string} />
                            <input type="hidden" name="status" value={c.status as string} />
                            <button
                              type="submit"
                              title={c.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              {c.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                          </form>
                          <Link
                            href={`/dashboard/admin/campaigns/${c.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <form action={deleteCampaignAction}>
                            <input type="hidden" name="id" value={c.id as string} />
                            <button
                              type="submit"
                              title="Hapus"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={(e) => { if (!confirm("Hapus campaign ini?")) e.preventDefault(); }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
