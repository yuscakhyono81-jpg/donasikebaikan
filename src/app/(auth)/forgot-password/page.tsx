"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Email terkirim!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Cek inbox email Anda dan klik link untuk mengatur ulang password.
        </p>
        <Link href="/login">
          <Button variant="outline" fullWidth>
            Kembali ke halaman masuk
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke masuk
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Lupa password?</h1>
      <p className="text-slate-500 text-sm mb-8">
        Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          required
          {...register("email")}
        />

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Kirim Link Reset Password
        </Button>
      </form>
    </div>
  );
}
