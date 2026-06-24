import { redirect } from "next/navigation";
import { FileCheck, ExternalLink, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { addLegalityDoc, deleteLegalityDoc } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLegalityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: docs } = await supabase
    .from("legality_documents")
    .select("id, title, document_type, file_url, issued_by, issued_at, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dokumen Legalitas</h1>
        <p className="text-slate-500 text-sm mt-0.5">SK Kemenag, NPWP, dan izin operasional</p>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Tambah Dokumen</h2>
        <form action={addLegalityDoc} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-sm font-medium text-slate-700">Judul Dokumen <span className="text-red-500">*</span></label>
            <input name="title" required placeholder="Contoh: SK Kemenag 2024" className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Jenis Dokumen</label>
            <select name="document_type" className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="sk_kemenag">SK Kemenag</option>
              <option value="npwp">NPWP</option>
              <option value="izin_operasional">Izin Operasional</option>
              <option value="akte_pendirian">Akte Pendirian</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Diterbitkan Oleh</label>
            <input name="issued_by" placeholder="Contoh: Kementerian Agama RI" className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Tanggal Penerbitan</label>
            <input name="issued_at" type="date" className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">URL File <span className="text-red-500">*</span></label>
            <input name="file_url" type="url" required placeholder="https://..." className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Simpan Dokumen
            </button>
          </div>
        </form>
      </div>

      {/* Documents list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!docs?.length ? (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada dokumen legalitas</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <div key={doc.id as string} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{doc.title as string}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{(doc.document_type as string).replace(/_/g, " ")}</span>
                      {doc.issued_by && <span className="text-xs text-slate-400">· {doc.issued_by as string}</span>}
                      {doc.issued_at && <span className="text-xs text-slate-400">· {formatDate(doc.issued_at as string, "d MMM yyyy")}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {doc.is_active ? <Badge variant="green">Aktif</Badge> : <Badge variant="slate">Nonaktif</Badge>}
                  <a
                    href={doc.file_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Lihat dokumen"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <form action={deleteLegalityDoc}>
                    <input type="hidden" name="id" value={doc.id as string} />
                    <button
                      type="submit"
                      title="Hapus"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => { if (!confirm("Hapus dokumen ini?")) e.preventDefault(); }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
