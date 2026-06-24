import { redirect } from "next/navigation";
import { Tag, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { createCategory, toggleCategoryActive, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, icon, is_active, sort_order, created_at")
    .order("sort_order");

  async function handleCreate(formData: FormData) {
    "use server";
    await createCategory(formData);
  }

  async function handleToggle(formData: FormData) {
    "use server";
    await toggleCategoryActive(formData.get("id") as string, formData.get("is_active") === "true");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteCategory(formData.get("id") as string);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kategori</h1>
        <p className="text-slate-500 text-sm mt-0.5">{categories?.length ?? 0} kategori</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Tambah Kategori</h2>
        <form action={handleCreate} className="flex items-end gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nama Kategori <span className="text-red-500">*</span></label>
            <input
              name="name"
              required
              placeholder="Contoh: Pendidikan"
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Icon</label>
            <input
              name="icon"
              placeholder="book"
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 w-28"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Urutan</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={99}
              min={1}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 w-20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shrink-0"
          >
            Tambah
          </button>
        </form>
      </div>

      {/* Categories table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!categories?.length ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada kategori</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Icon</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urutan</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <tr key={cat.id as string} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{cat.name as string}</td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{cat.slug as string}</td>
                  <td className="px-5 py-4 text-slate-600">{cat.icon as string}</td>
                  <td className="px-5 py-4 text-center text-slate-600">{cat.sort_order as number}</td>
                  <td className="px-5 py-4 text-center">
                    {cat.is_active ? (
                      <Badge variant="green">Aktif</Badge>
                    ) : (
                      <Badge variant="slate">Nonaktif</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <form action={handleToggle}>
                        <input type="hidden" name="id" value={cat.id as string} />
                        <input type="hidden" name="is_active" value={String(cat.is_active)} />
                        <button
                          type="submit"
                          title={cat.is_active ? "Nonaktifkan" : "Aktifkan"}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          {cat.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </form>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={cat.id as string} />
                        <button
                          type="submit"
                          title="Hapus"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => { if (!confirm("Hapus kategori ini?")) e.preventDefault(); }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
