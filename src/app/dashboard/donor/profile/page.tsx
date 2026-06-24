import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DonorProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function DonorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, birth_date, address, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "donor") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Perbarui informasi akun Anda</p>
      </div>
      <DonorProfileForm
        profile={{
          full_name: profile?.full_name as string,
          email: profile?.email as string,
          phone: (profile?.phone as string | null) ?? "",
          birth_date: (profile?.birth_date as string | null) ?? "",
          address: (profile?.address as string | null) ?? "",
        }}
      />
    </div>
  );
}
