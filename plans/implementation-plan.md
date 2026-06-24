# Implementation Plan — DonasiKebaikan
**Platform Crowdfunding Internal LAZIS NUR**
**Total estimasi:** 10–14 hari kerja

---

## Fase 1 — Foundation & Core (Hari 1–3)

### 1.1 Setup & Konfigurasi
- [ ] Setup environment variables (`.env.local`)
- [ ] Konfigurasi Supabase project (buat project baru di supabase.com)
- [ ] Setup Supabase client (browser + server)
- [ ] Update `tailwind.config` dengan warna brand DonasiKebaikan
- [ ] Setup font (Inter/Plus Jakarta Sans)
- [ ] Update `layout.tsx` (metadata, font, provider)
- [ ] Update `globals.css`

### 1.2 Database Schema Supabase
- [ ] Buat tabel `profiles` + trigger dari auth.users
- [ ] Buat tabel `categories`
- [ ] Buat tabel `campaigns`
- [ ] Buat tabel `donations`
- [ ] Buat tabel `donation_prayers`
- [ ] Buat tabel `affiliates`
- [ ] Buat tabel `affiliate_campaigns`
- [ ] Buat tabel `affiliate_fee_payments`
- [ ] Buat tabel `campaign_updates`
- [ ] Buat tabel `beneficiary_proposals`
- [ ] Buat tabel `legality_documents`
- [ ] Buat tabel `crm_sync_logs`
- [ ] Setup Row Level Security (RLS) semua tabel
- [ ] Seed data awal: kategori + 3 campaign dummy + 1 admin

### 1.3 Autentikasi
- [ ] Halaman `/login` — form email + password
- [ ] Halaman `/register` — form donatur (nama, email, password, WA)
- [ ] Halaman `/register/affiliate` — form affiliate (organisasi, dll)
- [ ] Halaman `/forgot-password`
- [ ] Middleware auth (proteksi route dashboard)
- [ ] Callback Supabase Auth (`/auth/callback`)
- [ ] Redirect sesuai role setelah login

### 1.4 Komponen UI Dasar
- [ ] `components/ui/Button.tsx` — variant: primary, secondary, outline, ghost
- [ ] `components/ui/Input.tsx` — dengan label & error state
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Badge.tsx` — untuk label status, kategori
- [ ] `components/ui/Modal.tsx`
- [ ] `components/ui/ProgressBar.tsx`
- [ ] `components/ui/Spinner.tsx`
- [ ] `lib/utils.ts` — cn(), formatRupiah(), formatDate(), calculateProgress()

---

## Fase 2 — Homepage & Campaign (Hari 3–5)

### 2.1 Layout Utama
- [ ] `components/Navbar.tsx` — logo, menu, search icon, login button
- [ ] `components/Footer.tsx` — legalitas, sosmed, powered by LAZIS NUR
- [ ] `components/FloatingWhatsApp.tsx` — chat admin WA pojok kanan bawah
- [ ] `components/SearchModal.tsx` — modal search real-time
- [ ] `app/(main)/layout.tsx` — wrapper Navbar + Footer + FloatingWA

### 2.2 Homepage
- [ ] `app/(main)/page.tsx` — homepage utama
- [ ] `components/home/HeroSection.tsx` — banner + search + impact counter
- [ ] `components/home/LiveDonationTicker.tsx` — ticker berjalan (Supabase Realtime)
- [ ] `components/home/CategoryFilter.tsx` — tab kategori horizontal scroll
- [ ] `components/home/UrgentCampaigns.tsx` — section campaign mendesak
- [ ] `components/home/FeaturedCampaigns.tsx` — section campaign pilihan
- [ ] `components/home/AllCampaigns.tsx` — grid semua campaign + filter + load more
- [ ] `components/home/ImpactCounter.tsx` — statistik dampak nyata
- [ ] `components/home/TestimonialCarousel.tsx` — doa & testimoni donatur
- [ ] `components/home/ZakatCalculatorWidget.tsx` — widget mini kalkulator zakat

### 2.3 Campaign Card
- [ ] `components/CampaignCard.tsx` — foto, judul, progress bar, donatur, nominal, countdown

### 2.4 Halaman Campaign Detail
- [ ] `app/(main)/campaign/[slug]/page.tsx`
- [ ] `components/campaign/CampaignHeader.tsx` — banner, judul, deskripsi singkat
- [ ] `components/campaign/DonationProgress.tsx` — progress bar + statistik + countdown
- [ ] `components/campaign/DonationForm.tsx` — nominal, nama, email, WA, doa, anonim
- [ ] `components/campaign/DonorList.tsx` — daftar donatur terbaru
- [ ] `components/campaign/CampaignUpdates.tsx` — kabar terbaru dari WordPress
- [ ] `components/campaign/PrayerSection.tsx` — doa donatur + balasan staf
- [ ] `components/campaign/ShareButtons.tsx` — share WA/IG/TikTok/copy link
- [ ] `components/campaign/ImpactInfo.tsx` — "Rp50rb = X manfaat"
- [ ] Sticky donation button di mobile

---

## Fase 3 — Proses Donasi & Payment (Hari 5–7)

### 3.1 Midtrans Integration
- [ ] Install `midtrans-client` package
- [ ] `app/api/donations/create/route.ts` — buat order Midtrans
- [ ] `app/api/donations/webhook/route.ts` — handle Midtrans webhook (update status)
- [ ] `components/donation/MidtransPayment.tsx` — embed Snap popup
- [ ] Halaman `/donation/success/[id]` — konfirmasi sukses
- [ ] Halaman `/donation/pending/[id]` — menunggu pembayaran
- [ ] Halaman `/donation/failed/[id]` — pembayaran gagal

### 3.2 Transfer Manual
- [ ] `app/api/donations/manual/route.ts` — simpan donasi manual
- [ ] `components/donation/ManualTransferForm.tsx` — instruksi rekening + upload bukti
- [ ] Upload bukti ke Supabase Storage
- [ ] `app/api/donations/verify/[id]/route.ts` — staf verifikasi manual

### 3.3 Donasi Recurring
- [ ] `app/api/donations/recurring/route.ts` — setup recurring
- [ ] `app/api/cron/recurring/route.ts` — proses recurring bulanan (Vercel cron)
- [ ] UI setting recurring di dashboard donatur

### 3.4 Sertifikat PDF
- [ ] Install `@react-pdf/renderer`
- [ ] `components/pdf/DonationCertificate.tsx` — template sertifikat donasi
- [ ] `components/pdf/ZakatCertificate.tsx` — template sertifikat zakat khusus
- [ ] `app/api/donations/certificate/[id]/route.ts` — generate & return PDF

---

## Fase 4 — Sistem Afiliasi (Hari 6–8)

### 4.1 Link Referral
- [ ] Generate kode referral unik saat affiliate di-assign ke campaign
- [ ] Middleware tracking referral — simpan `ref` code ke cookie saat donatur klik link
- [ ] Attach referral code ke setiap donasi yang masuk via link tersebut
- [ ] `app/api/affiliates/track/route.ts` — catat klik referral

### 4.2 Kalkulasi Fee
- [ ] `lib/affiliate.ts` — fungsi hitung fee dari total donasi per periode
- [ ] `app/api/affiliates/fee/calculate/route.ts` — hitung fee periode tertentu
- [ ] `app/api/affiliates/fee/payment/route.ts` — catat pembayaran fee oleh admin

### 4.3 Dashboard Affiliate
- [x] `app/(dashboard)/affiliate/page.tsx` — overview statistik
- [x] `app/(dashboard)/affiliate/campaigns/page.tsx` — daftar campaign + link referral
- [x] `app/(dashboard)/affiliate/fee/page.tsx` — fee terutang + riwayat pembayaran
- [x] `app/(dashboard)/affiliate/reports/page.tsx` — download laporan PDF/Excel

---

## Fase 5 — Dashboard Admin & Staf (Hari 7–10)

### 5.1 Dashboard Admin
- [x] `app/(dashboard)/admin/page.tsx` — overview (total donasi, donatur, campaign, fee)
- [x] `app/(dashboard)/admin/campaigns/page.tsx` — daftar + CRUD campaign
- [x] `app/(dashboard)/admin/campaigns/new/page.tsx` — form buat campaign baru
- [x] `app/(dashboard)/admin/campaigns/[id]/edit/page.tsx` — edit campaign
- [x] `app/(dashboard)/admin/donations/page.tsx` — semua transaksi + filter
- [x] `app/(dashboard)/admin/donations/verify/page.tsx` — verifikasi transfer manual
- [x] `app/(dashboard)/admin/donors/page.tsx` — daftar donatur + detail
- [ ] `app/(dashboard)/admin/affiliates/page.tsx` — kelola affiliate + approve
- [ ] `app/(dashboard)/admin/affiliates/fee/page.tsx` — kelola fee + log pembayaran
- [ ] `app/(dashboard)/admin/proposals/page.tsx` — usulan PM + update status
- [ ] `app/(dashboard)/admin/categories/page.tsx` — CRUD kategori
- [ ] `app/(dashboard)/admin/legality/page.tsx` — upload dokumen legalitas
- [ ] `app/(dashboard)/admin/reports/page.tsx` — semua laporan + export Excel
- [ ] `app/(dashboard)/admin/users/page.tsx` — kelola user & role

### 5.2 Dashboard Staf
- [x] `app/(dashboard)/staff/page.tsx` — campaign yang dikelola
- [x] `app/(dashboard)/staff/campaigns/[id]/update/page.tsx` — tambah kabar terbaru
- [x] `app/(dashboard)/staff/campaigns/[id]/prayers/page.tsx` — balas doa donatur
- [x] `app/(dashboard)/staff/donations/verify/page.tsx` — verifikasi transfer manual

### 5.3 Dashboard Donatur
- [x] `app/(dashboard)/donor/page.tsx` — overview riwayat donasi
- [x] `app/(dashboard)/donor/history/page.tsx` — riwayat lengkap donasi
- [x] `app/(dashboard)/donor/certificates/page.tsx` — download sertifikat
- [x] `app/(dashboard)/donor/recurring/page.tsx` — kelola donasi recurring
- [x] `app/(dashboard)/donor/proposals/page.tsx` — daftar usulan PM + status
- [x] `app/(dashboard)/donor/proposals/new/page.tsx` — form usul PM baru
- [x] `app/(dashboard)/donor/profile/page.tsx` — edit profil

---

## Fase 6 — Laporan & Export (Hari 9–10)

- [x] Install `xlsx` package (SheetJS)
- [x] `app/api/reports/campaigns/route.ts` — laporan per campaign
- [x] `app/api/reports/categories/route.ts` — laporan per kategori
- [x] `app/api/reports/affiliates/route.ts` — laporan afiliasi + fee
- [x] `app/api/reports/donors/route.ts` — rekap donatur
- [x] `lib/excel.ts` — helper generate file Excel
- [x] Komponen tabel laporan dengan filter tanggal

---

## Fase 7 — Integrasi Eksternal (Hari 10–12)

### 7.1 Notifikasi WA (Fonnte)
- [x] `lib/wa.ts` — wrapper kirim WA via Fonnte API
- [x] Template WA: konfirmasi donasi, bukti zakat, notif affiliate, notif staf, update status PM
- [x] Integrasi ke webhook Midtrans + manual verification flow

### 7.2 WordPress Headless CMS
- [x] `lib/wordpress.ts` — fetch post/page dari WP REST API
- [x] `app/api/wordpress/sync/route.ts` — sync kabar terbaru campaign dari WordPress
- [x] Update `CampaignUpdates.tsx` untuk pakai data WordPress
- [x] Halaman artikel/blog dari WordPress

### 7.3 Integrasi CRM LAZIS NUR
- [x] `lib/crm.ts` — wrapper POST ke CRM API (`/api/donors`, `/api/donations`)
- [x] Panggil `lib/crm.ts` setelah setiap donasi sukses (real-time sync)
- [x] `app/api/cron/crm-sync/route.ts` — rekonsiliasi malam (Vercel cron job)
- [x] Log setiap sync di tabel `crm_sync_logs`
- [x] Retry otomatis jika sync gagal

### 7.4 Import Data CSV
- [x] `app/(dashboard)/admin/import/page.tsx` — halaman import data
- [x] `app/api/import/donors/route.ts` — parse + validasi + import CSV donatur
- [x] `app/api/import/donations/route.ts` — parse + validasi + import CSV donasi
- [x] Preview tabel sebelum import + laporan hasil import

---

## Fase 8 — Fitur Khusus (Hari 11–12)

### 8.1 Kalkulator Zakat
- [ ] `app/(main)/kalkulator-zakat/page.tsx`
- [ ] `components/ZakatCalculator.tsx` — form input harta + hasil kewajiban
- [ ] Tombol langsung ke campaign Zakat aktif

### 8.2 Usulan Penerima Manfaat
- [ ] Form usulan + upload foto (Supabase Storage)
- [ ] Tracking status di dashboard donatur
- [ ] Admin kelola status + filter + export Excel
- [ ] Notifikasi WA ke donatur saat status berubah

### 8.3 PWA Setup
- [ ] `public/manifest.json` — PWA manifest
- [ ] `public/sw.js` — service worker (caching)
- [ ] Icon PWA berbagai ukuran
- [ ] Update `layout.tsx` dengan PWA meta tags

### 8.4 Supabase Realtime
- [ ] Setup Supabase Realtime subscription di `LiveDonationTicker`
- [ ] Popup notifikasi donasi real-time (toast notification)
- [ ] Update progress bar campaign secara real-time

---

## Fase 9 — Deploy & Launch (Hari 13–14)

- [ ] Konfigurasi environment variables production
- [ ] Setup Midtrans production credentials
- [ ] Setup WA API production
- [ ] Test end-to-end: donasi, afiliasi, dashboard, laporan
- [ ] Deploy ke Hostinger (atau Vercel → point ke donasikebaikan.id)
- [ ] Setup custom domain donasikebaikan.id
- [ ] Setup SSL (HTTPS)
- [ ] Test mobile (iOS + Android)
- [ ] Import data existing (CSV donatur + donasi)
- [ ] Upload dokumen legalitas
- [ ] Soft launch ke tim internal dulu

---

## Urutan File Yang Dibuat (Prioritas)

```
Hari 1:   .env.local, supabase schema SQL, lib/utils.ts, lib/supabase/
Hari 2:   types/index.ts, components/ui/*, app/layout.tsx, globals.css
Hari 3:   app/(auth)/login, register, forgot-password
Hari 4:   Navbar, Footer, FloatingWA, SearchModal, CampaignCard
Hari 5:   Homepage semua section, app/(main)/page.tsx
Hari 6:   Campaign detail page + DonationForm
Hari 7:   Midtrans integration + webhook + success/fail pages
Hari 8:   Transfer manual + sertifikat PDF
Hari 9:   Sistem afiliasi + link referral + kalkulasi fee
Hari 10:  Dashboard admin (campaign, donasi, donatur)
Hari 11:  Dashboard staf, donatur, affiliate
Hari 12:  Laporan + export Excel + integrasi CRM + notifikasi WA
Hari 13:  WordPress headless + usulan PM + kalkulator zakat + PWA
Hari 14:  Testing + deploy + import data CSV
```

---

## Dependencies Yang Perlu Diinstall

```bash
# Payment
npm install midtrans-client

# PDF Generation
npm install @react-pdf/renderer

# Excel Export
npm install xlsx

# WA Notification (Fonnte)
# Gunakan native fetch ke Fonnte API

# Realtime sudah include di @supabase/supabase-js

# Icon
npm install lucide-react

# Utility
npm install clsx tailwind-merge

# Date handling
npm install date-fns

# Form validation
npm install zod react-hook-form @hookform/resolvers

# Charts (untuk laporan)
npm install recharts
```

---

## Hal Yang Perlu Disiapkan Sebelum Coding

1. **Supabase project** — buat di supabase.com, copy URL + anon key ke `.env.local`
2. **Midtrans sandbox account** — daftar di sandbox.midtrans.com, copy client key + server key
3. **Fonnte/WA API** — daftar di fonnte.com, copy token
4. **WordPress URL LAZIS NUR** — URL CMS yang akan jadi headless CMS
5. **CRM API URL + token** — dari tim IT CRM LAZIS NUR
6. **Nomor WA admin** — untuk floating chat button
7. **File CSV** — data donatur + donasi existing untuk diimport
8. **Aset brand** — logo donasikebaikan.id (SVG/PNG)
9. **Dokumen legalitas** — SK Kemenag, NPWP, izin operasional (PDF)
