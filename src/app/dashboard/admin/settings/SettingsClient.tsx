"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Save, ImageIcon, Type, AlignLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { saveSiteSettings } from "./actions";

interface Props {
  settings: Record<string, string>;
}

export default function SettingsClient({ settings }: Props) {
  const [headline, setHeadline] = useState(settings.hero_headline ?? "Satu Sedekah, Seribu Doa");
  const [subtitle, setSubtitle] = useState(settings.hero_subtitle ?? "Zakat & Sedekah tersalur transparan — setiap donasi tercatat, setiap dampak terbukti");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBanner = settings.hero_banner_url ?? "/banner-donasi.png";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const formData = new FormData();
    formData.set("hero_headline", headline);
    formData.set("hero_subtitle", subtitle);
    if (bannerFile) formData.set("hero_banner_file", bannerFile);

    const result = await saveSiteSettings(formData);

    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("success");
      setBannerFile(null);
      setBannerPreview(null);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Banner Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-slate-900">Banner Hero</h2>
        </div>
        <div className="p-6">
          {/* Preview */}
          <div className="relative w-full aspect-[16/5] rounded-xl overflow-hidden bg-slate-100 mb-4">
            <Image
              src={bannerPreview ?? currentBanner}
              alt="Banner preview"
              fill
              className="object-cover"
              unoptimized={!!bannerPreview}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white">
              <p className="text-xl font-black drop-shadow">{headline}</p>
              <p className="text-xs text-white/80 mt-1 max-w-sm">{subtitle}</p>
            </div>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              {bannerFile ? bannerFile.name : "Klik untuk ganti gambar banner"}
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP — rekomendasi 1920×600px</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Teks Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Type className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-slate-900">Teks Hero</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Headline Utama
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Satu Sedekah, Seribu Doa"
            />
            <p className="text-xs text-slate-400 mt-1">Tampil sebagai judul besar di atas banner</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" /> Subtitle
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Zakat & Sedekah tersalur transparan..."
            />
            <p className="text-xs text-slate-400 mt-1">Tampil di bawah headline, maksimal 2 baris</p>
          </div>
        </div>
      </div>

      {/* Status & Submit */}
      {status === "error" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}
      {status === "success" && (
        <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Pengaturan berhasil disimpan! Halaman beranda sudah diperbarui.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
      >
        {status === "saving" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
        ) : (
          <><Save className="w-4 h-4" /> Simpan Pengaturan</>
        )}
      </button>
    </form>
  );
}
