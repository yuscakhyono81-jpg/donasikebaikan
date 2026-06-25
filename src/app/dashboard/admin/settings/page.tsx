import { Layers } from "lucide-react";
import { getSiteSettings } from "./actions";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pengaturan Beranda</h1>
        </div>
        <p className="text-slate-500 text-sm ml-12">
          Ubah banner, headline, dan teks yang tampil di halaman utama situs.
        </p>
      </div>

      <SettingsClient settings={settings} />
    </div>
  );
}
