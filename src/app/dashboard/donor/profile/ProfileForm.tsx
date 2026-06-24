"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "../actions";

interface Props {
  profile: {
    full_name: string;
    email: string;
    phone: string;
    birth_date: string;
    address: string;
  };
}

export default function DonorProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <Input
        label="Nama Lengkap"
        name="full_name"
        required
        defaultValue={profile.full_name}
      />

      <Input
        label="Email"
        type="email"
        value={profile.email}
        disabled
        hint="Email tidak dapat diubah"
      />

      <Input
        label="Nomor WhatsApp"
        name="phone"
        type="tel"
        placeholder="08xxxxxxxxxx"
        defaultValue={profile.phone}
      />

      <Input
        label="Tanggal Lahir"
        name="birth_date"
        type="date"
        defaultValue={profile.birth_date}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Alamat</label>
        <Textarea
          name="address"
          rows={3}
          placeholder="Alamat lengkap Anda..."
          defaultValue={profile.address}
        />
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          Profil berhasil diperbarui!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" loading={isPending}>
        Simpan Perubahan
      </Button>
    </form>
  );
}
