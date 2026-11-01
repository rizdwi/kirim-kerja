'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, EmailSettings } from '@/types';
import { StorageService } from '@/lib/storage';

interface SettingsViewProps {
  profile: UserProfile;
  emailSettings: EmailSettings;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveEmailSettings: (settings: EmailSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  emailSettings,
  onSaveProfile,
  onSaveEmailSettings,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);
  const [interestsText, setInterestsText] = useState(profile.interests.join(', '));
  const [salary, setSalary] = useState(profile.salaryExpectation || '');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      fullName: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      interests: interestsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3),
      salaryExpectation: salary.trim(),
    };
    onSaveProfile(updated);
    setSaveNotice('Perubahan profil berhasil disimpan.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDownloadAllData = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KirimKerja_DataPribadi_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAccountData = () => {
    StorageService.clearAllData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Pengaturan Akun & Privasi
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Kelola data diri, akun Gmail terhubung, serta kontrol privasi sesuai UU PDP.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-300 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <User size={18} className="text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Data Profil Pelamar
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nomor HP (Format E.164):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+628123456789"
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kota Domisili:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ekspektasi Gaji (Opsional):
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Contoh: Rp 12.000.000 - Rp 15.000.000"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bidang yang Diminati (Pisahkan dengan koma, maksimal 3):
            </label>
            <input
              type="text"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              placeholder="Frontend Developer, Fullstack Developer, UI/UX"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm min-h-[44px]"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Gmail Connection Card */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Mail size={18} className="text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Koneksi Pengiriman Email
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-1 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {emailSettings.gmailEmail}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200">
                Terhubung
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              Aplikasi hanya meminta izin untuk mengirim email lamaran yang telah kamu setujui. Kami tidak membaca isi kotak masuk kamu.
            </p>
          </div>

          <button
            onClick={() =>
              onSaveEmailSettings({
                ...emailSettings,
                gmailConnected: !emailSettings.gmailConnected,
              })
            }
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors min-h-[44px] ${
              emailSettings.gmailConnected
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                : 'bg-brand-600 text-white border-brand-600'
            }`}
          >
            {emailSettings.gmailConnected ? 'Cabut Akses' : 'Hubungkan Gmail'}
          </button>
        </div>
      </div>

      {/* Daily Apply Limit (15 - 18 max per day) */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Clock size={18} className="text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Batas Pengiriman Harian (Anti-Spam Gmail)
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Atur batas maksimal lamaran terkirim per hari (antara 15 sampai 18 email). Pembatasan ini menjaga agar akun Gmail kamu tidak dianggap mengirim spam oleh filter email rekruter.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {[15, 16, 17, 18].map((limitVal) => (
              <button
                key={limitVal}
                type="button"
                onClick={() =>
                  onSaveEmailSettings({
                    ...emailSettings,
                    dailyLimit: limitVal,
                  })
                }
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors min-h-[44px] ${
                  emailSettings.dailyLimit === limitVal
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-surface-1 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200'
                }`}
              >
                {limitVal} Email / Hari
              </button>
            ))}
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block pt-1">
            Saat ini terkirim: {emailSettings.dailySentCount} dari {emailSettings.dailyLimit} kuota hari ini.
          </span>
        </div>
      </div>

      {/* Privacy, UU PDP, & Data Protection */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Shield size={18} className="text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Privasi & Hak Data (UU PDP No. 27/2022)
          </h3>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Sesuai dengan ketentuan perlindungan data pribadi, kamu berhak mengunduh seluruh data yang tersimpan serta menghapus seluruh riwayat lamaran dan profil kapan saja. Berkas CV kamu tidak dibagikan ke pihak ketiga selain rekruter yang telah kamu setujui secara eksplisit.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadAllData}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            <Download size={15} />
            <span>Unduh Seluruh Data Saya (JSON)</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors border border-danger-200 dark:border-danger-800 min-h-[44px]"
          >
            <Trash2 size={15} />
            <span>Hapus Seluruh Data Akun</span>
          </button>
        </div>
      </div>

      {/* Two-step Account Deletion Confirmation (PRD 6.8 & AFD 4.11) */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#161B22] rounded-xl p-6 max-w-md w-full border border-danger-200 dark:border-danger-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-danger-600 font-bold text-sm">
              <AlertTriangle size={20} />
              <span>Konfirmasi Hapus Akun & Data</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Tindakan ini akan menghapus permanen seluruh profil, berkas CV yang diunggah, antrean lamaran, dan riwayat persetujuan dari peramban ini. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg min-h-[44px]"
              >
                Batal
              </button>
              <button
                onClick={handleClearAccountData}
                className="px-4 py-2 text-xs font-semibold bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors min-h-[44px]"
              >
                Ya, Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
