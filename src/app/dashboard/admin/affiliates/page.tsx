import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, BadgeCheck, Link2, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { approveAffiliate, assignAffiliateToCampaign, removeAffiliateCampaign } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [affiliatesRes, activeCampaignsRes, assignmentsRes] = await Promise.all([
    supabase
      .from("affiliates")
      .select("id, organization_name, phone, bank_name, account_number, is_approved, approved_at, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, title")
      .eq("status", "active")
      .order("title"),
    supabase
      .from("affiliate_campaigns")
      .select("id, referral_code, fee_percentage, created_at, affiliates(organization_name), campaigns(title, slug)")
      .order("created_at", { ascending: false }),
  ]);

  const affiliates = affiliatesRes.data;
  const activeCampaigns = activeCampaignsRes.data;
  const assignments = assignmentsRes.data;
  const approvedAffiliates = (affiliates ?? []).filter((a) => a.is_approved);

  async function handleApprove(formData: FormData) {
    "use server";
    await approveAffiliate(formData.get("id") as string, formData.get("action") === "approve");
  }

  async function handleAssign(formData: FormData) {
    "use server";
    await assignAffiliateToCampaign(formData);
  }

  async function handleRemoveAssignment(formData: FormData) {
    "use server";
    await removeAffiliateCampaign(formData.get("id") as string);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Affiliate</h1>
          <p className="text-slate-500 text-sm mt-0.5">{affiliates?.length ?? 0} mitra affiliate</p>
        </div>
        <Link
          href="/dashboard/admin/affiliates/fee"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-200 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
        >
          Kelola Fee
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!affiliates?.length ? (
          <div className="p-12 text-center">
            <BadgeCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada pendaftar affiliate</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Organisasi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kontak</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Bank</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mendaftar</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {affiliates.map((aff) => {
                  const person = aff.profiles as unknown as { full_name: string; email: string } | null;
                  return (
                    <tr key={aff.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{aff.organization_name as string}</p>
                        <p className="text-xs text-slate-400">{person?.full_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{person?.email}</p>
                        <p className="text-xs text-slate-400">{aff.phone as string}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {aff.bank_name ? (
                          <div>
                            <p>{aff.bank_name as string}</p>
                            <p className="text-xs text-slate-400 font-mono">{aff.account_number as string}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Belum diisi</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {aff.is_approved ? (
                          <Badge variant="green">Disetujui</Badge>
                        ) : (
                          <Badge variant="orange">Menunggu</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(aff.created_at as string, "d MMM yyyy")}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          {!aff.is_approved ? (
                            <form action={handleApprove}>
                              <input type="hidden" name="id" value={aff.id as string} />
                              <input type="hidden" name="action" value="approve" />
                              <button
                                type="submit"
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle size={13} /> Setujui
                              </button>
                            </form>
                          ) : (
                            <form action={handleApprove}>
                              <input type="hidden" name="id" value={aff.id as string} />
                              <input type="hidden" name="action" value="reject" />
                              <button
                                type="submit"
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <XCircle size={13} /> Cabut
                              </button>
                            </form>
                          )}
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
      {/* Campaign Assignment Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Link2 size={18} />
          Kelola Kampanye Affiliate
        </h2>

        {/* Assign form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-1.5">
            <Plus size={16} />
            Tambah Assignment Baru
          </h3>
          {approvedAffiliates.length === 0 || (activeCampaigns ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">
              {approvedAffiliates.length === 0
                ? "Belum ada affiliate yang disetujui."
                : "Belum ada campaign aktif."}
            </p>
          ) : (
            <form action={handleAssign} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Affiliate</label>
                <select
                  name="affiliate_id"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                >
                  <option value="">Pilih affiliate…</option>
                  {approvedAffiliates.map((a) => (
                    <option key={a.id as string} value={a.id as string}>
                      {a.organization_name as string}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Campaign Aktif</label>
                <select
                  name="campaign_id"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[220px]"
                >
                  <option value="">Pilih campaign…</option>
                  {(activeCampaigns ?? []).map((c) => (
                    <option key={c.id as string} value={c.id as string}>
                      {c.title as string}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Fee % (3–7)</label>
                <input
                  name="fee_percentage"
                  type="number"
                  min="3"
                  max="7"
                  step="0.5"
                  defaultValue="5"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Assign & Generate Kode
              </button>
            </form>
          )}
        </div>

        {/* Existing assignments table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {!assignments?.length ? (
            <div className="p-10 text-center">
              <Link2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Belum ada assignment campaign</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Affiliate</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode Referral</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dibuat</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assignments.map((ac) => {
                    const aff = ac.affiliates as unknown as { organization_name: string } | null;
                    const camp = ac.campaigns as unknown as { title: string; slug: string } | null;
                    return (
                      <tr key={ac.id as string} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{aff?.organization_name ?? "—"}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-[200px]">
                          <span className="truncate block">{camp?.title ?? "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="bg-primary-50 text-primary-700 font-bold text-xs px-2 py-1 rounded-lg tracking-wider">
                            {ac.referral_code as string}
                          </code>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant="blue">{ac.fee_percentage as number}%</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(ac.created_at as string, "d MMM yyyy")}</td>
                        <td className="px-5 py-3.5">
                          <form action={handleRemoveAssignment}>
                            <input type="hidden" name="id" value={ac.id as string} />
                            <button
                              type="submit"
                              title="Hapus assignment"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={(e) => { if (!confirm("Hapus assignment ini? Kode referral akan nonaktif.")) e.preventDefault(); }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </form>
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
    </div>
  );
}
