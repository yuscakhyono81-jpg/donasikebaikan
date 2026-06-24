import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, is_approved")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "affiliate" && !profile.is_approved) {
    redirect("/pending-approval");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar profile={profile as { id: string; full_name: string; email: string; role: string; avatar_url?: string }} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
