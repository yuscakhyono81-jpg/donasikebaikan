import { redirect } from "next/navigation";
import { CheckCircle, ImageOff, ExternalLink, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { VerifyButtons } from "./VerifyButtons";
import { ProofImage } from "./ProofImage";

export const dynamic = "force-dynamic";

export default async function AdminVerifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "staff") redirect("/dashboard");

  const { data: donations } = await supabase
    .from("donations")
    .select("id, amount, donor_name, donor_email, donor_phone, is_anonymous, proof_url, created_at, campaigns(title)")
    .eq("status", "pending")
    .eq("payment_method", "transfer_manual")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verifikasi Transfer Manual</h1>
        <p className="text-slate-500 text-sm mt-0.5">{donations?.length ?? 0} donasi menunggu verifikasi</p>
      </div>

      {!donations?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Tidak ada donasi yang perlu diverifikasi</p>
          <p className="text-slate-400 text-sm mt-1">Semua transfer manual sudah diproses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((d) => {
            const camp = d.campaigns as unknown as { title: string } | null;
            const proofUrl = d.proof_url as string | null;

            return (
              <div key={d.id as string} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Info donatur */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className="font-semibold text-slate-900">
                        {d.is_anonymous ? "Hamba Allah" : (d.donor_name as string)}
                      </p>
                      <span className="text-lg font-bold text-primary-600">{formatRupiah(d.amount as number)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">
                      Campaign: <span className="font-medium text-slate-700">{camp?.title ?? "—"}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                      {d.donor_email && <span>Email: {d.donor_email as string}</span>}
                      {d.donor_phone && <span>WA: {d.donor_phone as string}</span>}
                      <span>Masuk: {formatDate(d.created_at as string, "d MMM yyyy, HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/api/donations/receipt/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 border border-slate-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
                      title="Preview Bukti Donasi"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Bukti
                    </a>
                    <VerifyButtons donationId={d.id as string} />
                  </div>
                </div>

                {/* Bukti transfer */}
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 mb-3">Bukti Transfer</p>
                  {proofUrl ? (
                    <div className="flex items-start gap-4">
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 block"
                      >
                        <ProofImage url={proofUrl} />
                      </a>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2">Klik gambar atau tombol di bawah untuk lihat penuh</p>
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka di tab baru
                        </a>
                        <p className="text-xs text-slate-300 mt-2 font-mono break-all">{proofUrl}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <ImageOff className="w-5 h-5" />
                      <p className="text-sm">Belum ada bukti transfer yang diupload</p>
                    </div>
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
