"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
      );
      return;
    }

    // Fetch role dari profile lalu redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role ?? "donor";
    const redirectMap: Record<string, string> = {
      admin: "/dashboard/admin",
      staff: "/dashboard/staff",
      affiliate: "/dashboard/affiliate",
      donor: "/dashboard/donor",
    };
    router.push(redirectMap[role] ?? "/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Masuk ke akun Anda</h1>
      <p className="text-slate-500 text-sm mb-8">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary-600 font-semibold hover:underline">
          Daftar sekarang
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="current-password"
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:underline font-medium"
          >
            Lupa password?
          </Link>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
          Masuk
        </Button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-8">
        Dengan masuk, Anda menyetujui{" "}
        <Link href="/syarat-ketentuan" className="hover:underline">
          Syarat & Ketentuan
        </Link>{" "}
        DonasiKebaikan
      </p>
    </div>
  );
}
