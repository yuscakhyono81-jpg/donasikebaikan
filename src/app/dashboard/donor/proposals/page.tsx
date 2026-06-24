import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function DonorProposalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "donor") redirect("/dashboard");

  const { data: proposals } = await supabase
    .from("beneficiary_proposals")
    .select("id, name, phone, address, status, description, created_at, updated_at, categories(name)")
    .eq("proposer_id", user.id)
    .order("created_at", { ascending: false });

  const statusDesc: Record<string, string> = {
    masuk: "Usulan Anda telah diterima dan akan segera ditinjau",
    diproses: "Tim sedang memproses usulan Anda",
    disurvei: "Tim sedang melakukan survei lapangan",
    dibantu: "Alhamdulillah! Penerima sudah mendapatkan bantuan",
    ditolak: "Mohon maaf, usulan tidak dapat ditindaklanjuti saat ini",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usulan Penerima Manfaat</h1>
          <p className="text-slate-500 text-sm mt-0.5">{proposals?.length ?? 0} usulan</p>
        </div>
        <Link
          href="/dashboard/donor/proposals/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Usulkan
        </Link>
      </div>

      {!proposals?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Belum ada usulan penerima manfaat</p>
          <Link href="/dashboard/donor/proposals/new" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
            Buat usulan pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const cat = p.categories as unknown as { name: string } | null;
            return (
              <div key={p.id as string} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{p.name as string}</h3>
                    {cat && <p className="text-xs text-slate-400 mt-0.5">{cat.name}</p>}
                  </div>
                  <ProposalStatusBadge status={p.status as string} />
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{p.description as string}</p>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-600">{statusDesc[p.status as string] ?? "Status sedang diproses"}</p>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span>Diajukan: {formatDate(p.created_at as string)}</span>
                  {p.updated_at !== p.created_at && (
                    <span>Update: {formatDate(p.updated_at as string)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
