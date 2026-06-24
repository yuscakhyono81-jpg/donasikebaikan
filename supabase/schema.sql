-- ============================================================
-- DonasiKebaikan — Supabase Schema
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  full_name     text not null,
  phone         text,
  avatar_url    text,
  role          text not null default 'donor' check (role in ('admin', 'staff', 'donor', 'affiliate')),
  birth_date    date,
  address       text,
  is_approved   boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Trigger: otomatis buat profil saat user register
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'donor'),
    case when coalesce(new.raw_user_meta_data->>'role', 'donor') = 'affiliate' then false else true end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  icon        text not null default '🤲',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table public.campaigns (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  short_description   text not null,
  description_wp_id   text,
  category_id         uuid references public.categories(id) on delete set null,
  cover_image         text not null default '',
  target_amount       bigint not null default 0,
  collected_amount    bigint not null default 0,
  donor_count         integer not null default 0,
  creator_id          uuid references public.profiles(id) on delete set null,
  status              text not null default 'draft' check (status in ('draft', 'active', 'completed', 'rejected')),
  is_featured         boolean not null default false,
  is_urgent           boolean not null default false,
  deadline            timestamptz not null,
  wp_post_id          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Trigger: update updated_at otomatis
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- DONATIONS
-- ============================================================
create table public.donations (
  id                  uuid primary key default uuid_generate_v4(),
  campaign_id         uuid not null references public.campaigns(id) on delete cascade,
  donor_id            uuid references public.profiles(id) on delete set null,
  donor_name          text not null,
  donor_email         text not null,
  donor_phone         text,
  amount              bigint not null,
  message             text,
  is_anonymous        boolean not null default false,
  status              text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  payment_method      text not null check (payment_method in ('midtrans', 'transfer_manual', 'recurring')),
  transaction_id      text unique,
  proof_url           text,
  is_recurring        boolean not null default false,
  recurring_interval  text check (recurring_interval in ('monthly')),
  referral_code       text,
  crm_synced          boolean not null default false,
  crm_donation_id     text,
  created_at          timestamptz not null default now()
);

-- Trigger: update collected_amount & donor_count di campaigns
create or replace function public.update_campaign_stats()
returns trigger as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'success') or
     (TG_OP = 'UPDATE' and new.status = 'success' and old.status != 'success') then
    update public.campaigns
    set
      collected_amount = collected_amount + new.amount,
      donor_count = donor_count + 1
    where id = new.campaign_id;
  end if;

  if TG_OP = 'UPDATE' and old.status = 'success' and new.status != 'success' then
    update public.campaigns
    set
      collected_amount = greatest(0, collected_amount - old.amount),
      donor_count = greatest(0, donor_count - 1)
    where id = new.campaign_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger donations_update_campaign_stats
  after insert or update on public.donations
  for each row execute procedure public.update_campaign_stats();

-- ============================================================
-- DONATION PRAYERS (doa donatur)
-- ============================================================
create table public.donation_prayers (
  id          uuid primary key default uuid_generate_v4(),
  donation_id uuid not null references public.donations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  donor_name  text not null,
  message     text not null,
  reply       text,
  replied_by  uuid references public.profiles(id) on delete set null,
  replied_at  timestamptz,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- AFFILIATES
-- ============================================================
create table public.affiliates (
  id               uuid primary key default uuid_generate_v4(),
  profile_id       uuid not null unique references public.profiles(id) on delete cascade,
  organization_name text not null,
  phone            text not null,
  bank_name        text,
  account_number   text,
  account_holder   text,
  is_approved      boolean not null default false,
  approved_at      timestamptz,
  approved_by      uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- AFFILIATE CAMPAIGNS (link referral per campaign)
-- ============================================================
create table public.affiliate_campaigns (
  id              uuid primary key default uuid_generate_v4(),
  affiliate_id    uuid not null references public.affiliates(id) on delete cascade,
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  referral_code   text not null unique,
  fee_percentage  numeric(4,2) not null default 5.00 check (fee_percentage >= 3 and fee_percentage <= 7),
  target_amount   bigint,
  created_at      timestamptz not null default now(),
  unique(affiliate_id, campaign_id)
);

-- ============================================================
-- AFFILIATE FEE PAYMENTS (log pembayaran fee)
-- ============================================================
create table public.affiliate_fee_payments (
  id              uuid primary key default uuid_generate_v4(),
  affiliate_id    uuid not null references public.affiliates(id) on delete cascade,
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  period_start    date not null,
  period_end      date not null,
  total_donation  bigint not null,
  fee_amount      bigint not null,
  status          text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at         timestamptz,
  paid_by         uuid references public.profiles(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGN UPDATES (kabar terbaru — sync dari WordPress)
-- ============================================================
create table public.campaign_updates (
  id           uuid primary key default uuid_generate_v4(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  wp_post_id   text,
  title        text not null,
  content      text not null,
  image_url    text,
  published_at timestamptz not null default now()
);

-- ============================================================
-- BENEFICIARY PROPOSALS (usulan penerima manfaat)
-- ============================================================
create table public.beneficiary_proposals (
  id           uuid primary key default uuid_generate_v4(),
  proposer_id  uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  phone        text not null,
  address      text not null,
  category_id  uuid references public.categories(id) on delete set null,
  description  text not null,
  photo_urls   text[] not null default '{}',
  status       text not null default 'masuk' check (status in ('masuk', 'diproses', 'disurvei', 'dibantu', 'ditolak')),
  handler_id   uuid references public.profiles(id) on delete set null,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger beneficiary_proposals_updated_at
  before update on public.beneficiary_proposals
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- LEGALITY DOCUMENTS
-- ============================================================
create table public.legality_documents (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  document_type text not null,
  file_url      text not null,
  issued_by     text,
  issued_at     date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- CRM SYNC LOGS
-- ============================================================
create table public.crm_sync_logs (
  id            uuid primary key default uuid_generate_v4(),
  donation_id   uuid references public.donations(id) on delete cascade,
  sync_type     text not null check (sync_type in ('realtime', 'cron')),
  status        text not null check (status in ('success', 'failed')),
  error_message text,
  synced_at     timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.campaigns enable row level security;
alter table public.donations enable row level security;
alter table public.donation_prayers enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_campaigns enable row level security;
alter table public.affiliate_fee_payments enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.beneficiary_proposals enable row level security;
alter table public.legality_documents enable row level security;
alter table public.crm_sync_logs enable row level security;

-- Helper function: cek role user saat ini
create or replace function public.current_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- PROFILES policies
create policy "Profil bisa dilihat semua user login"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "User hanya bisa update profil sendiri"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admin bisa update semua profil"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- CATEGORIES policies
create policy "Kategori bisa dilihat semua orang"
  on public.categories for select
  using (true);

create policy "Hanya admin yang bisa kelola kategori"
  on public.categories for all
  using (public.current_user_role() = 'admin');

-- CAMPAIGNS policies
create policy "Campaign aktif bisa dilihat semua orang"
  on public.campaigns for select
  using (status = 'active' or auth.uid() is not null);

create policy "Staff dan admin bisa buat campaign"
  on public.campaigns for insert
  with check (public.current_user_role() in ('admin', 'staff'));

create policy "Creator campaign bisa update campaign miliknya"
  on public.campaigns for update
  using (creator_id = auth.uid() or public.current_user_role() = 'admin');

create policy "Admin bisa hapus campaign"
  on public.campaigns for delete
  using (public.current_user_role() = 'admin');

-- DONATIONS policies
create policy "Donasi bisa dilihat oleh donor terkait atau admin/staff"
  on public.donations for select
  using (
    donor_id = auth.uid()
    or public.current_user_role() in ('admin', 'staff')
  );

create policy "Siapapun bisa insert donasi"
  on public.donations for insert
  with check (true);

create policy "Admin dan staff bisa update donasi"
  on public.donations for update
  using (public.current_user_role() in ('admin', 'staff'));

-- DONATION PRAYERS policies
create policy "Doa yang visible bisa dilihat semua orang"
  on public.donation_prayers for select
  using (is_visible = true or public.current_user_role() in ('admin', 'staff'));

create policy "Siapapun bisa insert doa"
  on public.donation_prayers for insert
  with check (true);

create policy "Staff dan admin bisa reply doa"
  on public.donation_prayers for update
  using (public.current_user_role() in ('admin', 'staff'));

-- AFFILIATES policies
create policy "Affiliate bisa lihat profil sendiri"
  on public.affiliates for select
  using (profile_id = auth.uid() or public.current_user_role() in ('admin', 'staff'));

create policy "User bisa daftar sebagai affiliate"
  on public.affiliates for insert
  with check (profile_id = auth.uid());

create policy "Admin bisa update affiliate"
  on public.affiliates for update
  using (public.current_user_role() = 'admin');

-- AFFILIATE CAMPAIGNS policies
create policy "Affiliate campaign bisa dilihat affiliate terkait atau admin"
  on public.affiliate_campaigns for select
  using (
    exists (select 1 from public.affiliates a where a.id = affiliate_id and a.profile_id = auth.uid())
    or public.current_user_role() in ('admin', 'staff')
  );

create policy "Admin bisa kelola affiliate campaigns"
  on public.affiliate_campaigns for all
  using (public.current_user_role() = 'admin');

-- AFFILIATE FEE PAYMENTS policies
create policy "Fee payment bisa dilihat affiliate terkait atau admin"
  on public.affiliate_fee_payments for select
  using (
    exists (select 1 from public.affiliates a where a.id = affiliate_id and a.profile_id = auth.uid())
    or public.current_user_role() in ('admin', 'staff')
  );

create policy "Admin bisa kelola fee payments"
  on public.affiliate_fee_payments for all
  using (public.current_user_role() = 'admin');

-- CAMPAIGN UPDATES policies
create policy "Campaign updates bisa dilihat semua orang"
  on public.campaign_updates for select
  using (true);

create policy "Staff dan admin bisa kelola campaign updates"
  on public.campaign_updates for all
  using (public.current_user_role() in ('admin', 'staff'));

-- BENEFICIARY PROPOSALS policies
create policy "Donor bisa lihat proposal sendiri"
  on public.beneficiary_proposals for select
  using (proposer_id = auth.uid() or public.current_user_role() in ('admin', 'staff'));

create policy "Donor login bisa submit proposal"
  on public.beneficiary_proposals for insert
  with check (proposer_id = auth.uid() and public.current_user_role() = 'donor');

create policy "Admin dan staff bisa update proposal"
  on public.beneficiary_proposals for update
  using (public.current_user_role() in ('admin', 'staff'));

-- LEGALITY DOCUMENTS policies
create policy "Dokumen legalitas aktif bisa dilihat semua orang"
  on public.legality_documents for select
  using (is_active = true or public.current_user_role() = 'admin');

create policy "Admin bisa kelola dokumen legalitas"
  on public.legality_documents for all
  using (public.current_user_role() = 'admin');

-- CRM SYNC LOGS policies
create policy "Hanya admin yang bisa lihat crm sync logs"
  on public.crm_sync_logs for select
  using (public.current_user_role() = 'admin');

create policy "System bisa insert crm sync logs"
  on public.crm_sync_logs for insert
  with check (true);

-- ============================================================
-- REALTIME (aktifkan untuk live ticker)
-- ============================================================
alter publication supabase_realtime add table public.donations;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Kategori
insert into public.categories (name, slug, icon, sort_order) values
  ('Semua', 'semua', '🌟', 0),
  ('Zakat', 'zakat', '💰', 1),
  ('Infaq', 'infaq', '🤲', 2),
  ('Qurban', 'qurban', '🐄', 3),
  ('Pendidikan', 'pendidikan', '🎓', 4),
  ('Kesehatan', 'kesehatan', '🏥', 5),
  ('Kemanusiaan', 'kemanusiaan', '🆘', 6),
  ('Dakwah', 'dakwah', '🕌', 7),
  ('Yatim Dhuafa', 'yatim-dhuafa', '👶', 8),
  ('Pemberdayaan', 'pemberdayaan', '💪', 9);

-- Dokumen legalitas contoh
insert into public.legality_documents (title, document_type, file_url, issued_by, is_active) values
  ('SK Kementerian Agama', 'sk_kemenag', '#', 'Kementerian Agama RI', true),
  ('NPWP LAZIS NUR', 'npwp', '#', 'Direktorat Jenderal Pajak', true),
  ('Izin Operasional LAZ', 'izin_operasional', '#', 'BAZNAS', true),
  ('Laporan Keuangan Audited 2024', 'laporan_keuangan', '#', 'Kantor Akuntan Publik', true);
