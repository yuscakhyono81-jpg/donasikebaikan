import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProposalForm from "@/components/proposals/ProposalForm";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "donor") redirect("/dashboard");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/donor/proposals"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usulkan Penerima Manfaat</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Isi formulir untuk mengusulkan seseorang yang membutuhkan bantuan
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-700 font-medium">Cara Kerja</p>
        <p className="text-xs text-blue-600 mt-1">
          Tim LAZIS NUR akan meninjau usulan Anda dan melakukan survei lapangan. Proses biasanya memakan waktu 7–14
          hari kerja. Anda akan mendapat notifikasi WhatsApp saat status berubah.
        </p>
      </div>

      <ProposalForm categories={(categories ?? []) as { id: string; name: string }[]} />
    </div>
  );
}
