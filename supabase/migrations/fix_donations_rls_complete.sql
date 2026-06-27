-- ============================================================
-- FIX LENGKAP: RLS policy tabel donations
-- Jalankan file ini sepenuhnya di Supabase SQL Editor
-- ============================================================

-- Hapus semua policy donations yang ada (bersih total)
DROP POLICY IF EXISTS "Donasi bisa dilihat oleh donor terkait atau admin/staff" ON public.donations;
DROP POLICY IF EXISTS "Siapapun bisa insert donasi" ON public.donations;
DROP POLICY IF EXISTS "Admin dan staff bisa update donasi" ON public.donations;
DROP POLICY IF EXISTS "Donor bisa upload bukti transfer" ON public.donations;

-- 1. SELECT: donor login lihat miliknya, donasi anonim bisa dibaca siapapun, admin/staff lihat semua
CREATE POLICY "Donasi bisa dilihat oleh donor terkait atau admin/staff"
  ON public.donations FOR SELECT
  USING (
    donor_id IS NULL
    OR donor_id = auth.uid()
    OR public.current_user_role() IN ('admin', 'staff')
  );

-- 2. INSERT: siapapun bisa donasi (termasuk tidak login / anonim)
CREATE POLICY "Siapapun bisa insert donasi"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- 3. UPDATE proof_url: donor (login atau anonim) bisa upload bukti pada donasi pending
CREATE POLICY "Donor bisa upload bukti transfer"
  ON public.donations FOR UPDATE
  USING (
    (donor_id IS NULL OR donor_id = auth.uid())
    AND status = 'pending'
    AND payment_method = 'transfer_manual'
  )
  WITH CHECK (
    (donor_id IS NULL OR donor_id = auth.uid())
    AND status = 'pending'
    AND payment_method = 'transfer_manual'
  );

-- 4. UPDATE status/verifikasi: hanya admin/staff
CREATE POLICY "Admin dan staff bisa update donasi"
  ON public.donations FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'staff'));
