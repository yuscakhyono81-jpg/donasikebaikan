import { redirect } from "next/navigation";
import { Award, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DonorCertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "donor") redirect("/dashboard");

  const { data: donations } = await supabase
    .from("donations")
    .select("id, amount, created_at, campaigns(title)")
    .eq("donor_id", user.id)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sertifikat Donasi</h1>
        <p className="text-slate-500 text-sm mt-0.5">Download sertifikat untuk setiap donasi yang berhasil</p>
      </div>

      {!donations?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Belum ada donasi yang berhasil</p>
          <p className="text-slate-400 text-xs mt-1">Sertifikat tersedia setelah donasi dikonfirmasi</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {donations.map((d) => {
            const camp = d.campaigns as unknown as { title: string } | null;
            return (
              <div key={d.id as string} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">{camp?.title ?? "Campaign"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(d.created_at as string, "d MMMM yyyy")}</p>
                  <p className="text-sm font-bold text-primary-600 mt-0.5">{formatRupiah(d.amount as number)}</p>
                </div>
                <a
                  href={`/api/donations/receipt/${d.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
                  title="Download bukti terima donasi"
                >
                  <Download size={18} />
                </a>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-700 font-medium">Informasi Sertifikat Zakat</p>
        <p className="text-xs text-blue-600 mt-1">
          Untuk donasi zakat, sertifikat khusus zakat tersedia secara otomatis. Hubungi admin jika membutuhkan surat keterangan tambahan.
        </p>
      </div>
    </div>
  );
}
