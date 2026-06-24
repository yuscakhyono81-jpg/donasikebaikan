"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z
  .object({
    full_name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(10, "Nomor WA minimal 10 digit")
      .regex(/^[0-9+]+$/, "Nomor WA tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          phone: values.phone,
          role: "donor",
        },
      },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered")
          ? "Email ini sudah terdaftar. Silakan masuk."
          : error.message
      );
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
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cek email Anda!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Kami mengirimkan link konfirmasi ke email Anda. Klik link tersebut untuk mengaktifkan
          akun.
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
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Daftar sebagai donatur</h1>
      <p className="text-slate-500 text-sm mb-8">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary-600 font-semibold hover:underline">
          Masuk
        </Link>
        {" · "}
        <Link href="/register/affiliate" className="text-secondary-600 font-semibold hover:underline">
          Daftar sebagai affiliate
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nama Lengkap"
          placeholder="Muhammad Abdullah"
          leftIcon={<User size={16} />}
          error={errors.full_name?.message}
          required
          {...register("full_name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          required
          {...register("email")}
        />

        <Input
          label="Nomor WhatsApp"
          type="tel"
          placeholder="08123456789"
          leftIcon={<Phone size={16} />}
          error={errors.phone?.message}
          hint="Digunakan untuk konfirmasi donasi via WhatsApp"
          required
          {...register("phone")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Minimal 8 karakter"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="new-password"
          required
          {...register("password")}
        />

        <Input
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          leftIcon={<Lock size={16} />}
          error={errors.confirm_password?.message}
          autoComplete="new-password"
          required
          {...register("confirm_password")}
        />

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
          Daftar Sekarang
        </Button>
      </form>
    </div>
  );
}
