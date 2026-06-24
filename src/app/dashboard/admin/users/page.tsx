import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { updateUserRole } from "./actions";

export const dynamic = "force-dynamic";

const roles = ["admin", "staff", "donor", "affiliate"] as const;
const roleLabels: Record<string, string> = {
  admin: "Admin",
  staff: "Staf",
  donor: "Donatur",
  affiliate: "Affiliate",
};

const roleBadgeVariant: Record<string, "red" | "blue" | "green" | "purple"> = {
  admin: "red",
  staff: "blue",
  donor: "green",
  affiliate: "purple",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, is_approved, created_at")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);

  const { data: users } = await query;

  async function handleRoleChange(formData: FormData) {
    "use server";
    await updateUserRole(formData.get("id") as string, formData.get("role") as string);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h1>
        <p className="text-slate-500 text-sm mt-0.5">{users?.length ?? 0} pengguna</p>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-2">
        <a href="/dashboard/admin/users" className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors text-slate-600">
          Semua
        </a>
        {roles.map((r) => (
          <a key={r} href={`?role=${r}`} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors text-slate-600">
            {roleLabels[r]}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!users?.length ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada pengguna</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Bergabung</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ubah Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id as string} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {u.full_name as string}
                      {u.id === user.id && <span className="ml-2 text-xs text-slate-400">(Anda)</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{u.email as string}</td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={roleBadgeVariant[u.role as string] ?? "slate"}>
                        {roleLabels[u.role as string] ?? (u.role as string)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(u.created_at as string, "d MMM yyyy")}</td>
                    <td className="px-5 py-4">
                      {u.id !== user.id ? (
                        <form action={handleRoleChange} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id as string} />
                          <select
                            name="role"
                            defaultValue={u.role as string}
                            className="rounded-lg border border-slate-200 text-sm px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>{roleLabels[r]}</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Simpan
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
