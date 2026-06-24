import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/ui/Badge";
import { updateProposalStatus } from "./actions";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "masuk", label: "Masuk" },
  { value: "diproses", label: "Diproses" },
  { value: "disurvei", label: "Disurvei" },
  { value: "dibantu", label: "Dibantu" },
  { value: "ditolak", label: "Ditolak" },
];

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "staff") redirect("/dashboard");

  let query = supabase
    .from("beneficiary_proposals")
    .select("id, name, phone, address, description, status, notes, created_at, updated_at, categories(name), profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: proposals } = await query;

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    await updateProposalStatus(
      formData.get("id") as string,
      formData.get("status") as string,
      (formData.get("notes") as string) || undefined,
    );
  }

  const exportUrl = `/api/reports/proposals${status ? `?status=${status}` : ""}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usulan Penerima Manfaat</h1>
          <p className="text-slate-500 text-sm mt-0.5">{proposals?.length ?? 0} usulan</p>
        </div>
        <Link
          href={exportUrl}
          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          <Download size={15} />
          Export Excel
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/dashboard/admin/proposals"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !status
              ? "bg-primary-600 text-white border-primary-600"
              : "border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600"
          }`}
        >
          Semua
        </a>
        {statusOptions.map((s) => (
          <a
            key={s.value}
            href={`?status=${s.value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              status === s.value
                ? "bg-primary-600 text-white border-primary-600"
                : "border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>

      {!proposals?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Belum ada usulan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const cat = p.categories as unknown as { name: string } | null;
            const proposer = p.profiles as unknown as { full_name: string; email: string } | null;
            return (
              <div key={p.id as string} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{p.name as string}</h3>
                      <ProposalStatusBadge status={p.status as string} />
                      {cat && <span className="text-xs text-slate-400">{cat.name}</span>}
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{p.description as string}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>WA: {p.phone as string}</span>
                      <span className="truncate max-w-[200px]">Alamat: {p.address as string}</span>
                      {proposer && <span>Pengusul: {proposer.full_name}</span>}
                      <span>Masuk: {formatDate(p.created_at as string)}</span>
                    </div>
                    {p.notes && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-100">
                        Catatan: {p.notes as string}
                      </p>
                    )}
                  </div>

                  <form action={handleUpdateStatus} className="flex flex-col gap-2 shrink-0 min-w-[160px]">
                    <input type="hidden" name="id" value={p.id as string} />
                    <select
                      name="status"
                      defaultValue={p.status as string}
                      className="rounded-lg border border-slate-200 text-sm px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      name="notes"
                      defaultValue={(p.notes as string) ?? ""}
                      placeholder="Catatan (opsional)"
                      className="rounded-lg border border-slate-200 text-xs px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Update Status
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
