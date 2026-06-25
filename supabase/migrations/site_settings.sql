-- Tabel pengaturan halaman (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: hanya admin yang bisa update, semua bisa baca
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Only admin can update site_settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Nilai default
INSERT INTO site_settings (key, value) VALUES
  ('hero_banner_url', '/banner-donasi.png'),
  ('hero_headline', 'Satu Sedekah, Seribu Doa'),
  ('hero_subtitle', 'Zakat & Sedekah tersalur transparan — setiap donasi tercatat, setiap dampak terbukti')
ON CONFLICT (key) DO NOTHING;

-- Storage bucket untuk aset situs (banner, logo, dll)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read site-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admin can upload site-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete site-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
