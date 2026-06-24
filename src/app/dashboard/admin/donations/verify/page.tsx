import { redirect } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { verifyDonation } from "../actions";

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

  async function handleVerify(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const action = formData.get("action") as string;
    await verifyDonation(id, action === "approve");
  }

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
            return (
              <div key={d.id as string} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-slate-900">
                        {d.is_anonymous ? "Hamba Allah" : (d.donor_name as string)}
                      </p>
                      <span className="text-xl font-bold text-primary-600">{formatRupiah(d.amount as number)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Campaign: <span className="font-medium text-slate-700">{camp?.title ?? "—"}</span></p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {d.donor_email && <span>Email: {d.donor_email as string}</span>}
                      {d.donor_phone && <span>WA: {d.donor_phone as string}</span>}
                      <span>Dikirim: {formatDate(d.created_at as string, "d MMM yyyy, HH:mm")}</span>
                    </div>
                    {d.proof_url && (
                      <a
                        href={d.proof_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-primary-600 hover:underline font-medium"
                      >
                        Lihat bukti transfer
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={handleVerify}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={15} />
                        Terima
                      </button>
                    </form>
                    <form action={handleVerify}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={15} />
                        Tolak
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
