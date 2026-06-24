"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/login?message=password_updated");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Atur ulang password</h1>
      <p className="text-slate-500 text-sm mb-8">Masukkan password baru Anda.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Password Baru"
          type="password"
          placeholder="Minimal 8 karakter"
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          required
          {...register("password")}
        />

        <Input
          label="Konfirmasi Password Baru"
          type="password"
          placeholder="Ulangi password baru"
          leftIcon={<Lock size={16} />}
          error={errors.confirm_password?.message}
          required
          {...register("confirm_password")}
        />

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Simpan Password Baru
        </Button>
      </form>
    </div>
  );
}
