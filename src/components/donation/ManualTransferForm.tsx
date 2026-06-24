"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface ManualTransferFormProps {
  donationId: string;
  donorEmail: string;
}

export default function ManualTransferForm({ donationId, donorEmail }: ManualTransferFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 5 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(selected.type)) {
      setErrorMsg("Format file harus JPG, PNG, WebP, atau PDF");
      return;
    }

    setFile(selected);
    setErrorMsg("");
    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Pilih bukti transfer terlebih dahulu");
      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("donation_id", donationId);

    try {
      const res = await fetch("/api/donations/manual", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal upload bukti");

      setStatus("success");
      setTimeout(() => {
        router.push(`/donation/success/${donationId}`);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal upload. Coba lagi.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6 text-center shadow-sm">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-slate-900">Bukti Transfer Diterima!</p>
        <p className="text-sm text-slate-500 mt-1">Tim kami akan memverifikasi dalam 1×24 jam. Konfirmasi dikirim ke {donorEmail}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 mb-4">Upload Bukti Transfer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">Klik untuk pilih file</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, atau PDF · Maks. 5 MB</p>
            </>
          )}
          {file && !preview && (
            <p className="text-sm text-slate-700 mt-2">{file.name}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={status === "uploading"}
          disabled={!file}
        >
          Kirim Bukti Transfer
        </Button>

        <p className="text-xs text-center text-slate-400">
          Verifikasi dilakukan dalam 1×24 jam hari kerja
        </p>
      </form>
    </div>
  );
}
