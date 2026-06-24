import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, History, Award, RefreshCw, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function DonorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "donor") redirect("/dashboard");

  const { data: donations } = await supabase
    .from("donations")
    .select("id, amount, status, payment_method, created_at, is_recurring, campaigns(title, slug)")
    .eq("donor_id", user.id)
    .order("created_at", { ascending: false });

  const successDonations = (donations ?? []).filter((d) => d.status === "success");
  const totalDonated = successDonations.reduce((s, d) => s + (d.amount as number), 0);
  const campaignsSupported = new Set(successDonations.map((d) => d.campaigns as unknown as { slug: string } | null).filter(Boolean).map((c) => c!.slug)).size;
  const recurringCount = successDonations.filter((d) => d.is_recurring).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Donatur</h1>
        <p className="text-slate-500 text-sm mt-0.5">Assalamu'alaikum, {profile?.full_name as string}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Donasi", value: formatRupiah(totalDonated, true), icon: Heart, color: "primary", href: "/dashboard/donor/history" },
          { label: "Transaksi", value: successDonations.length, icon: History, color: "blue", href: "/dashboard/donor/history" },
          { label: "Campaign", value: campaignsSupported, icon: Award, color: "green", href: "/dashboard/donor/history" },
          { label: "Donasi Rutin", value: recurringCount, icon: RefreshCw, color: "orange", href: "/dashboard/donor/recurring" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "primary" ? "bg-primary-100 text-primary-600" :
              s.color === "blue" ? "bg-blue-100 text-blue-600" :
              s.color === "green" ? "bg-green-100 text-green-600" :
              "bg-orange-100 text-orange-600"
            }`}>
              <s.icon size={18} />
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent donations */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Donasi Terbaru</h2>
          <Link href="/dashboard/donor/history" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {!donations?.length ? (
            <div className="p-10 text-center">
              <Heart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Belum ada donasi</p>
              <Link href="/" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
                Mulai berdonasi
              </Link>
            </div>
          ) : (
            donations.slice(0, 5).map((d) => {
              const camp = d.campaigns as unknown as { title: string; slug: string } | null;
              return (
                <div key={d.id as string} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{camp?.title ?? "Campaign"}</p>
                    <p className="text-xs text-slate-400">{formatRelativeTime(d.created_at as string)}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-semibold text-primary-600">{formatRupiah(d.amount as number, true)}</p>
                    <Badge variant={d.status === "success" ? "green" : d.status === "pending" ? "orange" : "red"} size="sm">
                      {d.status === "success" ? "Sukses" : d.status === "pending" ? "Tertunda" : "Gagal"}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/donor/certificates", label: "Download Sertifikat", icon: Award, desc: "Sertifikat donasi Anda" },
          { href: "/dashboard/donor/proposals/new", label: "Usulkan Penerima", icon: Heart, desc: "Usulkan orang yang perlu bantuan" },
          { href: "/dashboard/donor/profile", label: "Edit Profil", icon: History, desc: "Perbarui data diri Anda" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <l.icon className="w-8 h-8 text-primary-600 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">{l.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
