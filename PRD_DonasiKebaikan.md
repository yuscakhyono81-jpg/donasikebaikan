# PRD — DonasiKebaikan
**Platform Crowdfunding Internal LAZIS NUR**
**Versi:** 1.0 | **Tanggal:** 23 Juni 2026 | **Status:** Draft Final

---

## 1. Ringkasan Eksekutif

DonasiKebaikan adalah platform crowdfunding internal milik LAZIS NUR yang memungkinkan penghimpunan dana zakat, infaq, qurban, dan program sosial secara digital. Platform ini dirancang untuk menggantikan ketergantungan pada platform pihak ketiga (seperti Kitabisa) agar LAZIS NUR memiliki kontrol penuh atas data donatur, branding, laporan keuangan, dan sistem afiliasi.

**Domain:** donasikebaikan.id | **Hosting:** Hostinger
**Tech Stack:** Next.js 15 + Supabase + Tailwind CSS + Midtrans
**CMS Konten:** WordPress (Headless)
**Integrasi:** CRM LAZIS NUR (real-time + cron malam)
**Target Launch:** 1–2 minggu

---

## 2. Tujuan & Sasaran

| Tujuan | Indikator Keberhasilan |
|--------|----------------------|
| Platform penghimpunan dana mandiri | 100% donasi tercatat di sistem sendiri |
| Kontrol data donatur penuh | Data donatur tersimpan di DB sendiri + sync ke CRM |
| Sistem afiliasi transparan | UPZ & fundraiser bisa pantau kontribusi & fee real-time |
| Meningkatkan konversi donatur | Fitur trust signal, urgency, dan kemudahan donasi |
| Jangkauan mobile-first | Responsive + PWA, akses optimal via HP & tablet |

---

## 3. Pengguna & Roles

| Role | Deskripsi | Cara Mendapat Akun |
|------|-----------|-------------------|
| **Admin** | Kelola semua aspek platform — approve user, kampanye, laporan | Dibuat manual pertama kali |
| **Staf Internal** | Buat & kelola campaign, update kabar terbaru, balas doa donatur | Dibuat oleh admin |
| **Donatur** | Berdonasi (guest atau login), lihat riwayat, usul penerima manfaat | Daftar mandiri (langsung aktif) |
| **Affiliate (UPZ/Fundraiser)** | Promosi campaign via link referral unik, pantau fee | Daftar mandiri → approve admin |

---

## 4. Fitur Lengkap

### 4.1 Manajemen Campaign
- **Pembuat:** Staf internal LAZIS NUR saja
- **Status campaign:** Draft → Active → Completed / Rejected
- **Featured Campaign:** Admin bisa tandai campaign sebagai "Pilihan"
- **Campaign Mendesak:** Admin bisa aktifkan label DARURAT + tampil di bagian khusus
- **Informasi campaign:**
  - Judul, slug, deskripsi singkat & panjang
  - Cover image/banner
  - Target dana & deadline
  - Kategori program
  - Kabar terbaru (update berkala dari staf, dikelola via WordPress)
  - Deskripsi panjang (dibuat di WordPress, ditarik via API)

### 4.2 Kategori Program (Dikelola Admin)
Zakat · Infaq · Qurban · Pendidikan · Kesehatan · Kemanusiaan · Dakwah · Yatim Dhuafa · Pemberdayaan

### 4.3 Sistem Donasi
- **Donatur guest** (tanpa akun): isi nama + email + nomor WA
- **Donatur login:** data terisi otomatis, bisa lihat riwayat
- **Metode pembayaran:**
  - Midtrans (transfer bank, QRIS, GoPay, OVO, Dana, kartu kredit)
  - Transfer manual (upload bukti → verifikasi staf)
- **Donasi recurring:** donatur login bisa set donasi otomatis bulanan
- **Nominal cepat:** tombol Rp10rb / Rp25rb / Rp50rb / Rp100rb / Rp250rb / Custom
- **Doa saat donasi:** donatur isi pesan doa (tampil di halaman campaign)
- **Opsi anonim:** donatur bisa pilih tampil sebagai "Hamba Allah"

### 4.4 Sistem Afiliasi
- Setiap campaign bisa punya banyak affiliate (UPZ & fundraiser)
- Setiap affiliate mendapat **link referral unik per campaign**
  - Format: `donasikebaikan.id/campaign/[slug]?ref=[kode-affiliate]`
- **Fee marketing:** 3–7% dari total donasi via link referral (diatur per affiliate per campaign)
- Sistem hitung fee otomatis, pembayaran manual oleh tim keuangan LAZIS NUR
- Log pembayaran fee tersimpan di sistem

**Dashboard Affiliate menampilkan:**
- Total donasi terkumpul via link referral (per campaign & total)
- Jumlah donatur unik
- Fee terutang & fee sudah dibayar
- Riwayat pembayaran fee dari LAZIS NUR
- Download laporan PDF/Excel
- Notifikasi real-time (email + WA) saat ada donasi masuk via link mereka

### 4.5 Usulan Penerima Manfaat (PM)
**Siapa:** Hanya donatur yang sudah login (punya akun)

**Form usulan:**
- Nama penerima manfaat
- Alamat lengkap
- Nomor WA penerima manfaat
- Kategori bantuan yang dibutuhkan
- Deskripsi kondisi/masalah
- Upload foto situasi (maks 3 foto)

**Alur status:**
`Masuk` → `Diproses` → `Disurvei` → `Dibantu` / `Ditolak`

**Donatur:** Pantau status dari dashboard + notifikasi WA tiap perubahan status

**Admin:** Daftar usulan + filter per kategori/wilayah + statistik + export Excel

### 4.6 Halaman Campaign Detail
- Cover image/banner
- Judul & deskripsi singkat
- Progress bar (terkumpul vs target) + persentase
- Countdown timer deadline
- Total terkumpul & jumlah donatur
- Tombol Donasi (sticky di mobile)
- Kabar terbaru (dari WordPress, update berkala staf)
- Doa donatur + staf bisa balas doa
- Daftar donatur terbaru (nama/anonim, nominal, waktu)
- Tombol share (WhatsApp, Instagram, TikTok, link copy) dengan embed kode referral otomatis
- Bagian "Dampak Donasi" — contoh: "Rp50.000 = 1 anak yatim makan seminggu"

### 4.7 Homepage
Lihat Section 6 untuk layout detail.

### 4.8 Autentikasi
- Login / Register donatur (email + password)
- Login staf/admin/affiliate (email + password)
- Lupa password via email
- Session management via Supabase Auth

### 4.9 Dashboard Admin
- **Overview:** Total donasi, donatur, campaign aktif, fee terutang
- **Campaign:** CRUD campaign, approve/reject, tandai featured/darurat
- **Donatur:** Daftar lengkap, detail, riwayat donasi per donatur
- **Donasi:** Semua transaksi (filter status, metode, tanggal, campaign)
- **Verifikasi transfer manual:** Approve/reject bukti transfer donatur
- **Affiliate:** Kelola affiliate, set % fee per campaign, log pembayaran fee
- **Usulan PM:** Daftar usulan, update status, filter, export Excel
- **Kategori:** CRUD kategori program
- **Laporan:**
  - Per campaign (tabel + grafik)
  - Per kategori/program
  - Per affiliate (donasi + fee terutang + fee dibayar)
  - Rekap donatur (segmentasi, total donasi, frekuensi)
  - Export Excel/CSV semua laporan
- **Legalitas:** Upload & kelola dokumen legalitas yang tampil di footer

### 4.10 Dashboard Staf Internal
- Buat & edit campaign (status draft)
- Update kabar terbaru campaign (via WordPress CMS)
- Balas doa donatur
- Verifikasi transfer manual
- Lihat laporan campaign yang mereka kelola

### 4.11 Dashboard Donatur
- Riwayat donasi (semua campaign, status, metode)
- Sertifikat donasi & zakat (download PDF)
- Pengaturan donasi recurring (tambah/edit/hapus)
- Daftar usulan PM yang diajukan + status terkini
- Edit profil

### 4.12 Kalkulator Zakat
- Input: penghasilan, emas/perak, tabungan, aset
- Output: kewajiban zakat + jumlah yang harus dibayar
- Tombol langsung "Bayar Zakat Sekarang" ke campaign Zakat aktif

### 4.13 Sertifikat & Bukti Donasi
- PDF otomatis dikirim via email setelah donasi sukses
- Untuk donasi zakat: sertifikat zakat resmi berlogo LAZIS NUR
- Donatur bisa re-download dari dashboard kapan saja

### 4.14 Notifikasi
| Penerima | Trigger | Channel |
|----------|---------|---------|
| Donatur | Donasi berhasil + bukti PDF | Email + WA |
| Donatur | Status usulan PM berubah | WA |
| Affiliate | Ada donasi masuk via link mereka | Email + WA |
| Staf | Ada transfer manual masuk (perlu verifikasi) | WA |
| Staf | Campaign mendekati deadline | WA |
| Admin | Affiliate baru daftar (perlu approve) | WA |

### 4.15 Integrasi WordPress (Headless CMS)
Konten yang dikelola via WordPress:
- Kabar terbaru per campaign
- Artikel/blog LAZIS NUR
- Halaman statis (Tentang Kami, Program, Legalitas)
- Media & galeri kegiatan
- Laporan keuangan (upload PDF)
- Deskripsi panjang campaign

### 4.16 Integrasi CRM LAZIS NUR
- **Real-time:** Setiap donasi sukses → push ke `/api/donors` + `/api/donations` CRM
- **Cron malam (00:00):** Rekonsiliasi data — sinkronisasi ulang semua data donatur & donasi
- **Field yang disync:**
  - Donor: nama, phone, email, birthDate, address → `donors` table CRM
  - Donation: amount, type, paymentMethod, programId → `donations` table CRM

### 4.17 Fitur Konversi & Engagement

**Urgency & Social Proof:**
- Live donation ticker (nama + nominal + campaign, berjalan otomatis)
- Popup notifikasi donasi real-time: "Budi baru donasi Rp50.000"
- Progress bar dinamis (update real-time)
- Countdown timer deadline
- Counter "X orang sudah berdonasi hari ini"

**Mobile-First:**
- Fully responsive (mobile, tablet, desktop)
- PWA — bisa install di homescreen HP
- Tombol donasi sticky di bawah layar saat scroll
- QRIS fullscreen di mobile
- One-tap share ke WhatsApp, Instagram Story, TikTok

**Gamifikasi (Fase 2):**
- Badge donatur: "Donatur Setia", "Donatur Qurban 2026"
- Leaderboard affiliate — "Top 3 Fundraiser Bulan Ini"
- Milestone campaign: "🎉 Campaign ini baru capai 50%!"

### 4.18 Trust Signals
- Logo + nama LAZIS NUR di navbar & footer
- "Powered by LAZIS NUR" di footer
- SK Kemenag, NPWP, izin operasional di footer
- Laporan keuangan audited (link ke PDF)
- Logo mitra/UPZ (Askrindo Syariah, dll)
- Counter live total donasi, donatur, penerima manfaat

---

## 5. Arsitektur Sistem

```
donasikebaikan.id (Next.js 15 + Supabase)
        │
        ├── WordPress (Headless CMS) ──────── Konten & artikel
        │   └── REST API / WPGraphQL
        │
        ├── Midtrans ──────────────────────── Payment gateway
        │   └── Webhook → update status donasi
        │
        ├── WA API (Fonnte/WA Business) ───── Notifikasi
        │   └── Donatur, affiliate, staf
        │
        └── CRM LAZIS NUR (Next.js + Prisma)
            ├── Real-time: POST /api/donors + /api/donations
            └── Cron 00:00: rekonsiliasi bulk
```

---

## 6. Layout Homepage

```
[NAVBAR sticky] Logo | Kampanye | Kategori | Tentang | Kalkulator Zakat | 🔍 | Masuk

[HERO] "Bersama Wujudkan Kebaikan Nyata"
       [Search bar besar]
       Counter: Rp X terkumpul | X Donatur | X Campaign

[LIVE TICKER] ← Ahmad donasi Rp100rb · Siti Rp50rb untuk Qurban 2026 · →

[KATEGORI] Semua | Zakat | Infaq | Qurban | Pendidikan | Kesehatan | dst...

[🚨 CAMPAIGN MENDESAK] — label DARURAT merah, countdown timer
  [Card] [Card] [Card]

[⭐ CAMPAIGN PILIHAN] — dipilih admin
  [Card] [Card] [Card]                              [Lihat Semua →]

[SEMUA CAMPAIGN] Filter | Kategori | Urutkan
  [Card] [Card] [Card] [Card]
                    [Muat Lebih Banyak]

[DAMPAK NYATA] 👨‍👩‍👧 1.240 Keluarga | 🎓 340 Beasiswa | 🏥 89 Pasien | 🕌 12 Masjid

[DOA & TESTIMONI] Carousel doa donatur

[KALKULATOR ZAKAT mini] → Hitung & langsung donasi

[FOOTER] Logo | Legalitas | Sosmed | Powered by LAZIS NUR

[💬 FLOAT] Chat Admin WA — pojok kanan bawah
```

---

## 7. Database Schema (Supabase)

### Tabel Utama

**profiles** (extends Supabase auth.users)
```
id, email, full_name, phone, avatar_url, role (admin|staff|donor|affiliate),
birth_date, address, is_approved, created_at
```

**campaigns**
```
id, title, slug, short_description, description_wp_id (dari WordPress),
category_id, cover_image, target_amount, collected_amount, donor_count,
creator_id, status (draft|active|completed|rejected), is_featured,
is_urgent, deadline, wp_post_id, created_at, updated_at
```

**categories**
```
id, name, slug, icon, is_active, sort_order, created_at
```

**donations**
```
id, campaign_id, donor_id (null jika guest), donor_name, donor_email,
donor_phone, amount, message (doa), is_anonymous, status (pending|success|failed),
payment_method (midtrans|transfer_manual|recurring), transaction_id,
proof_url (transfer manual), is_recurring, recurring_interval,
crm_synced, crm_donation_id, created_at
```

**affiliates**
```
id, profile_id, organization_name, phone, bank_name, account_number,
account_holder, is_approved, approved_at, approved_by, created_at
```

**affiliate_campaigns**
```
id, affiliate_id, campaign_id, referral_code, fee_percentage (3-7),
target_amount, created_at
```

**affiliate_fee_payments**
```
id, affiliate_id, campaign_id, period_start, period_end,
total_donation, fee_amount, status (pending|paid), paid_at,
paid_by, notes, created_at
```

**campaign_updates** (kabar terbaru — sync dari WordPress)
```
id, campaign_id, wp_post_id, title, content, image_url, published_at
```

**donation_prayers** (doa donatur)
```
id, donation_id, campaign_id, donor_name, message, reply, replied_by,
replied_at, is_visible, created_at
```

**beneficiary_proposals** (usulan penerima manfaat)
```
id, proposer_id (donor), name, phone, address, category_id,
description, photo_urls (array), status (masuk|diproses|disurvei|dibantu|ditolak),
handler_id (staf), notes, created_at, updated_at
```

**legality_documents**
```
id, title, document_type, file_url, issued_by, issued_at, is_active, created_at
```

**crm_sync_logs**
```
id, donation_id, sync_type (realtime|cron), status (success|failed),
error_message, synced_at
```

---

## 8. Fase Implementasi

### Fase 1 — Core MVP (Minggu 1, hari 1–5)
- Setup project (Next.js + Supabase + Tailwind)
- Database schema Supabase
- Autentikasi (login/register semua role)
- Homepage (hero, kategori, campaign cards, live ticker, float WA)
- Halaman campaign detail
- Proses donasi via Midtrans
- Transfer manual (upload bukti)
- Notifikasi email dasar

### Fase 2 — Afiliasi & Dashboard (Minggu 1–2, hari 5–10)
- Sistem link referral affiliate
- Dashboard admin (campaign, donasi, donatur)
- Dashboard staf
- Dashboard donatur (riwayat, sertifikat PDF)
- Dashboard affiliate (statistik, fee, laporan)
- Notifikasi WA (Fonnte)
- Kalkulator zakat

### Fase 3 — Fitur Lengkap (Minggu 2)
- Donasi recurring
- Usulan penerima manfaat
- Laporan lengkap + export Excel
- Integrasi WordPress headless
- Integrasi CRM LAZIS NUR (real-time + cron)
- PWA setup
- Live donation ticker real-time (Supabase Realtime)
- Sertifikat PDF otomatis
- Import data existing (CSV donatur + donasi)

### Fase 4 — Polish & Launch
- SEO & meta tags
- Performance optimization
- Trust signals & legalitas di footer
- Testing end-to-end
- Deploy ke Hostinger + domain donasikebaikan.id
- Gamifikasi (badge, leaderboard) — opsional post-launch

---

## 9. Hal Yang Belum Ditentukan

| Item | Keterangan |
|------|-----------|
| WA API provider | Fonnte, Wablas, atau WA Business API — perlu pilih |
| WordPress URL | URL WordPress LAZIS NUR yang akan jadi headless CMS |
| CRM API base URL | URL production CRM LAZIS NUR |
| CRM API auth token | Token untuk autentikasi request dari DonasiKebaikan ke CRM |
| Midtrans credentials | Client key + server key (sandbox dulu, lalu production) |
| Nomor WA admin | Untuk floating chat button |
| Data CSV existing | File Excel/CSV campaign + donatur + transaksi yang perlu diimport |
| Dokumen legalitas | File SK Kemenag, NPWP, izin operasional untuk upload |
| Logo & aset brand | Logo donasikebaikan.id final |

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|---------|
| Deadline 1-2 minggu sangat ketat | Prioritas fase 1 & 2 dulu, fitur non-core bisa post-launch |
| Integrasi WordPress kompleks | Gunakan WP REST API (tidak perlu WPGraphQL), mock data dulu |
| Integrasi CRM bisa ada breaking changes | Implement dengan try-catch, gagal sync masuk antrian retry |
| Data import CSV mungkin tidak bersih | Sediakan preview + validasi sebelum import |
| Midtrans sandbox vs production | Gunakan environment variable, test di sandbox dulu |
