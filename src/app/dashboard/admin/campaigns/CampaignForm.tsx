"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCampaign, updateCampaign } from "./actions";

interface Category { id: string; name: string }

interface CampaignData {
  id: string;
  title: string;
  short_description: string;
  category_id: string;
  cover_image: string;
  target_amount: number;
  deadline: string;
  is_featured: boolean;
  is_urgent: boolean;
  status: string;
}

interface Props {
  categories: Category[];
  campaign?: CampaignData;
}

export default function CampaignForm({ categories, campaign }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isEdit = !!campaign;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCampaign(campaign.id, formData);
        } else {
          await createCampaign(formData);
        }
        router.push("/dashboard/admin/campaigns");
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <Input
        label="Judul Campaign"
        name="title"
        required
        placeholder="Contoh: Bantu Santri Yatim Beli Al-Qur'an"
        defaultValue={campaign?.title}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Deskripsi Singkat <span className="text-red-500">*</span></label>
        <Textarea
          name="short_description"
          required
          rows={3}
          placeholder="Deskripsi singkat yang muncul di kartu campaign..."
          defaultValue={campaign?.short_description}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Kategori <span className="text-red-500">*</span></label>
        <select
          name="category_id"
          required
          defaultValue={campaign?.category_id ?? ""}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <Input
        label="URL Foto Cover"
        name="cover_image"
        type="url"
        placeholder="https://..."
        defaultValue={campaign?.cover_image}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Target Dana (Rp)"
          name="target_amount"
          type="number"
          required
          min={10000}
          step={1000}
          placeholder="5000000"
          defaultValue={campaign?.target_amount}
        />

        <Input
          label="Deadline"
          name="deadline"
          type="date"
          required
          min={todayStr}
          defaultValue={campaign?.deadline ? campaign.deadline.split("T")[0] : ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          defaultValue={campaign?.status ?? "draft"}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={campaign?.is_featured} className="rounded" />
          <span className="text-sm text-slate-700">Campaign Pilihan (Featured)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_urgent" defaultChecked={campaign?.is_urgent} className="rounded" />
          <span className="text-sm text-slate-700">Mendesak (Urgent)</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isEdit ? "Simpan Perubahan" : "Buat Campaign"}
        </Button>
      </div>
    </form>
  );
}
