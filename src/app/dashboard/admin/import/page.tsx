import { redirect } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ImportClient from "./ImportClient";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Data</h1>
          <p className="text-slate-500 text-sm mt-0.5">Import data donatur atau donasi dari file CSV/Excel</p>
        </div>
      </div>

      <ImportClient />
    </div>
  );
}
