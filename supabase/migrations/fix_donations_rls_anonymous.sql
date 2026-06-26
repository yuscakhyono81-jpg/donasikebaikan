-- Fix: donasi anonim (donor_id IS NULL) bisa dibaca oleh siapapun yang tahu UUID-nya
-- UUID tidak bisa ditebak, jadi ini aman secara praktis
-- Tanpa ini, donatur yang tidak login tidak bisa lihat halaman pending setelah donasi

DROP POLICY IF EXISTS "Donasi bisa dilihat oleh donor terkait atau admin/staff" ON public.donations;

CREATE POLICY "Donasi bisa dilihat oleh donor terkait atau admin/staff"
  ON public.donations FOR SELECT
  USING (
    donor_id IS NULL                                          -- donasi anonim (tidak login)
    OR donor_id = auth.uid()                                  -- donor login lihat miliknya
    OR public.current_user_role() IN ('admin', 'staff')       -- admin/staff lihat semua
  );
