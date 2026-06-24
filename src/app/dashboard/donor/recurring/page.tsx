import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { cancelRecurring } from "../actions";

export const dynamic = "force-dynamic";

export default async function DonorRecurringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "donor") redirect("/dashboard");

  const { data: recurringDonations } = await supabase
    .from("donations")
    .select("id, amount, recurring_interval, created_at, campaigns(title, slug)")
    .eq("donor_id", user.id)
    .eq("is_recurring", true)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  async function handleCancel(formData: FormData) {
    "use server";
    await cancelRecurring(formData.get("id") as string);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Donasi Rutin</h1>
        <p className="text-slate-500 text-sm mt-0.5">{recurringDonations?.length ?? 0} donasi rutin aktif</p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
        <p className="text-sm text-primary-700 font-medium">Tentang Donasi Rutin</p>
        <p className="text-xs text-primary-600 mt-1">
          Donasi rutin akan diproses secara otomatis setiap bulan menggunakan metode pembayaran yang sama.
          Anda dapat membatalkan kapan saja.
        </p>
      </div>

      {!recurringDonations?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Belum ada donasi rutin aktif</p>
          <p className="text-slate-400 text-xs mt-1">Pilih opsi "Donasi Rutin" saat berdonasi untuk mengaktifkan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringDonations.map((d) => {
            const camp = d.campaigns as unknown as { title: string; slug: string } | null;
            return (
              <div key={d.id as string} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCw className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{camp?.title ?? "Campaign"}</p>
                  <p className="text-sm text-primary-600 font-bold">{formatRupiah(d.amount as number)} / bulan</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dimulai {formatDate(d.created_at as string)}</p>
                </div>
                <form action={handleCancel}>
                  <input type="hidden" name="id" value={d.id as string} />
                  <button
                    type="submit"
                    onClick={(e) => { if (!confirm("Batalkan donasi rutin ini?")) e.preventDefault(); }}
                    className="px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Batalkan
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
