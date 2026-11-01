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
  X,
} from 'lucide-react';
import { UserProfile, EmailSettings } from '@/types';
import { StorageService } from '@/lib/storage';
import { PageHeader } from '@/components/ui';

interface SettingsViewProps {
  profile: UserProfile;
  emailSettings: EmailSettings;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveEmailSettings: (settings: EmailSettings) => void;
}

const SectionHead: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
    <span className="w-8 h-8 rounded-lg bg-gradient-to-b from-brand-500/15 to-brand-500/5 border border-brand-500/20 text-brand-500 dark:text-brand-300 flex items-center justify-center">
      {icon}
    </span>
    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
  </div>
);

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
    setSaveNotice('Profil berhasil disimpan.');
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

  const field = (label: string, control: React.ReactNode, hint?: string) => (
    <div>
      <label className="label">{label}</label>
      {control}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl animate-fade-in">
      <PageHeader
        title="Pengaturan"
        subtitle="Profil pelamar, koneksi email, dan kontrol privasimu"
      />

      {saveNotice && (
        <div role="status" className="card p-3.5 border-success-200 dark:border-success-800 flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 size={17} className="text-success-500 shrink-0" />
          <span className="text-xs font-semibold text-success-700 dark:text-success-300">{saveNotice}</span>
        </div>
      )}

      {/* Profil */}
      <section className="card p-5 sm:p-6 space-y-5">
        <SectionHead icon={<User size={16} />} title="Data Profil Pelamar" />
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Nama lengkap', (
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" autoComplete="name" />
            ))}
            {field('Nomor HP', (
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+628123456789" required className="input" autoComplete="tel" />
            ), 'Format internasional, mis. +62812…')}
            {field('Kota domisili', (
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="input" autoComplete="address-level2" />
            ))}
            {field('Ekspektasi gaji (opsional)', (
              <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Rp 12–15 juta" className="input" />
            ))}
          </div>
          {field('Bidang yang diminati', (
            <input type="text" value={interestsText} onChange={(e) => setInterestsText(e.target.value)} placeholder="Frontend Developer, UI/UX" className="input" />
          ), 'Pisahkan dengan koma, maksimal 3 bidang.')}
          <div className="flex justify-end pt-1">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Simpan Profil
            </button>
          </div>
        </form>
      </section>

      {/* Gmail */}
      <section className="card p-5 sm:p-6 space-y-4">
        <SectionHead icon={<Mail size={16} />} title="Koneksi Email" />
        <div className="card-flat p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {emailSettings.gmailEmail || 'Belum terhubung'}
              </span>
              {emailSettings.gmailConnected ? (
                <span className="badge-success">Terhubung</span>
              ) : (
                <span className="badge-warning">Belum terhubung</span>
              )}
            </div>
            <p className="hint max-w-md">
              Izin hanya untuk mengirim lamaran yang kamu setujui. Isi kotak masuk tidak dibaca.
            </p>
          </div>
          <button
            onClick={() =>
              onSaveEmailSettings({ ...emailSettings, gmailConnected: !emailSettings.gmailConnected })
            }
            className={emailSettings.gmailConnected ? 'btn-secondary btn-sm shrink-0' : 'btn-primary btn-sm shrink-0'}
          >
            {emailSettings.gmailConnected ? 'Cabut Akses' : 'Hubungkan Gmail'}
          </button>
        </div>
      </section>

      {/* Batas harian */}
      <section className="card p-5 sm:p-6 space-y-4">
        <SectionHead icon={<Clock size={16} />} title="Batas Pengiriman Harian" />
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          15–18 email per hari menjaga akun Gmail-mu tidak ditandai spam oleh filter rekruter.
          Terkirim hari ini: <strong className="text-gray-800 dark:text-gray-200 tabular-nums">{emailSettings.dailySentCount}/{emailSettings.dailyLimit}</strong>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih batas harian">
          {[15, 16, 17, 18].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onSaveEmailSettings({ ...emailSettings, dailyLimit: v })}
              aria-pressed={emailSettings.dailyLimit === v}
              className={emailSettings.dailyLimit === v ? 'chip-active' : 'chip-idle'}
            >
              {v}/hari
            </button>
          ))}
        </div>
      </section>

      {/* Privasi */}
      <section className="card p-5 sm:p-6 space-y-4">
        <SectionHead icon={<Shield size={16} />} title="Privasi & Data (UU PDP)" />
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Kamu berhak mengunduh seluruh data atau menghapusnya permanen kapan saja.
          CV tidak dibagikan ke pihak ketiga selain rekruter yang kamu setujui.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={handleDownloadAllData} className="btn-secondary">
            <Download size={15} />
            <span>Unduh Dataku (JSON)</span>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger-ghost border border-danger-200 dark:border-danger-800">
            <Trash2 size={15} />
            <span>Hapus Seluruh Data</span>
          </button>
        </div>
      </section>

      {/* Konfirmasi hapus */}
      {showDeleteConfirm && (
        <div role="dialog" aria-modal="true" className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-panel max-w-md !rounded-2xl m-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-danger-500/10 border border-danger-500/25 text-danger-500 flex items-center justify-center">
                  <AlertTriangle size={19} />
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  Hapus semua data?
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Profil, berkas CV, antrean lamaran, dan riwayat persetujuan akan dihapus
                permanen dari peramban ini. Tidak bisa dibatalkan.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">
                  Batal
                </button>
                <button onClick={handleClearAccountData} className="btn !bg-danger-600 hover:!bg-danger-700 text-white">
                  Ya, Hapus Semua
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              aria-label="Tutup"
              className="btn-icon absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
