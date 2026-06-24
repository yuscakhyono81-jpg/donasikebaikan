"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, AlertCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
}

interface ProposalFormProps {
  categories: Category[];
}

export default function ProposalForm({ categories }: ProposalFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran foto maksimal 5 MB per file");
        return false;
      }
      if (!f.type.startsWith("image/")) {
        setErrorMsg("Hanya file gambar yang diperbolehkan");
        return false;
      }
      return true;
    });

    if (valid.length === 0) return;
    setErrorMsg("");

    const combined = [...photos, ...valid].slice(0, 5);
    setPhotos(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setStatus("submitting");

    const form = e.currentTarget;
    const fd = new FormData(form);
    // Append each photo file
    photos.forEach((f) => fd.append("photos", f));

    try {
      const res = await fetch("/api/proposals", { method: "POST", body: fd });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Gagal mengirim usulan");
      setStatus("success");
      setTimeout(() => router.push("/dashboard/donor/proposals"), 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🤲</div>
        <p className="font-bold text-primary-800 text-lg">Usulan Terkirim!</p>
        <p className="text-sm text-primary-600 mt-1">Tim LAZIS NUR akan segera meninjau usulan Anda.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Nama Penerima <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="Nama lengkap penerima"
            className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            No. WA Penerima <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            required
            type="tel"
            placeholder="08xxxxxxxxxx"
            className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Kategori Kebutuhan <span className="text-red-500">*</span>
        </label>
        <select
          name="category_id"
          required
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Alamat Lengkap <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          required
          rows={2}
          placeholder="Alamat lengkap penerima manfaat..."
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Cerita / Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Ceritakan kondisi penerima dan kebutuhan yang diperlukan..."
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* Photo upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Foto Pendukung <span className="text-xs text-slate-400">(opsional, maks. 5 foto)</span>
        </label>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Foto ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-fit"
          >
            {photos.length === 0 ? (
              <>
                <Upload className="w-4 h-4" />
                Pilih Foto
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Tambah Foto ({photos.length}/5)
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoChange}
          className="hidden"
        />
        <p className="text-xs text-slate-400">Format JPG/PNG/WebP · Maks. 5 MB per foto</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Batal
        </button>
        <Button type="submit" loading={status === "submitting"}>
          Kirim Usulan
        </Button>
      </div>
    </form>
  );
}
