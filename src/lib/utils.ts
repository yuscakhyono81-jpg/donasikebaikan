import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number, short = false): string {
  if (short) {
    if (amount >= 1_000_000_000) return `Rp${(amount / 1_000_000_000).toFixed(1)} M`;
    if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)} jt`;
    if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)} rb`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, fmt = "d MMMM yyyy"): string {
  return format(new Date(date), fmt, { locale: id });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { locale: id, addSuffix: true });
}

export function calculateProgress(collected: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((collected / target) * 100), 100);
}

export function getDaysRemaining(deadline: string | Date): number {
  return Math.max(0, differenceInDays(new Date(deadline), new Date()));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function generateReferralCode(affiliateId: string, campaignId: string): string {
  const short = affiliateId.slice(-4) + campaignId.slice(-4);
  return short.toUpperCase();
}
