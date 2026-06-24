"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  FileBarChart2,
  LogOut,
  Menu,
  X,
  Heart,
  Users,
  ShieldCheck,
  UserCircle,
  History,
  Award,
  RefreshCw,
  FileText,
  BadgeCheck,
  Settings,
  Tag,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navByRole: Record<string, NavItem[]> = {
  affiliate: [
    { href: "/dashboard/affiliate", label: "Ikhtisar", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/affiliate/campaigns", label: "Kampanye & Link", icon: <Megaphone size={18} /> },
    { href: "/dashboard/affiliate/fee", label: "Fee & Pembayaran", icon: <Wallet size={18} /> },
    { href: "/dashboard/affiliate/reports", label: "Laporan", icon: <FileBarChart2 size={18} /> },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Ikhtisar", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/admin/campaigns", label: "Campaign", icon: <Megaphone size={18} /> },
    { href: "/dashboard/admin/donations", label: "Donasi", icon: <Wallet size={18} /> },
    { href: "/dashboard/admin/donors", label: "Donatur", icon: <Users size={18} /> },
    { href: "/dashboard/admin/affiliates", label: "Affiliate", icon: <BadgeCheck size={18} /> },
    { href: "/dashboard/admin/proposals", label: "Usulan PM", icon: <FileText size={18} /> },
    { href: "/dashboard/admin/categories", label: "Kategori", icon: <Tag size={18} /> },
    { href: "/dashboard/admin/legality", label: "Legalitas", icon: <Award size={18} /> },
    { href: "/dashboard/admin/reports", label: "Laporan", icon: <FileBarChart2 size={18} /> },
    { href: "/dashboard/admin/import", label: "Import Data", icon: <Upload size={18} /> },
    { href: "/dashboard/admin/users", label: "Pengguna", icon: <Settings size={18} /> },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Ikhtisar", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/staff/donations/verify", label: "Verifikasi", icon: <ShieldCheck size={18} /> },
    { href: "/dashboard/staff", label: "Campaign", icon: <Megaphone size={18} /> },
  ],
  donor: [
    { href: "/dashboard/donor", label: "Ikhtisar", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/donor/history", label: "Riwayat Donasi", icon: <History size={18} /> },
    { href: "/dashboard/donor/certificates", label: "Sertifikat", icon: <Award size={18} /> },
    { href: "/dashboard/donor/recurring", label: "Donasi Rutin", icon: <RefreshCw size={18} /> },
    { href: "/dashboard/donor/proposals", label: "Usulan PM", icon: <FileText size={18} /> },
    { href: "/dashboard/donor/profile", label: "Profil", icon: <UserCircle size={18} /> },
  ],
};

const roleLabels: Record<string, string> = {
  affiliate: "Affiliate",
  admin: "Admin",
  staff: "Staf",
  donor: "Donatur",
};

interface Props {
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
}

export default function DashboardSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = navByRole[profile.role] ?? [];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-extrabold text-slate-900 leading-none">
          Donasi<span className="text-primary-600">Kebaikan</span>
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-bold text-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-slate-500">{roleLabels[profile.role] ?? profile.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === `/dashboard/${profile.role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-slate-200 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
