'use client';

import React from 'react';
import {
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Shield,
  ArrowRight,
  Send,
  Lock,
} from 'lucide-react';

interface LandingViewProps {
  onEnterApp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-surface-1 dark:bg-[#0D1117] text-gray-900 dark:text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161B22] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base">
              K
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight block">
                KirimKerja
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block -mt-0.5">
                Asisten Lamaran Kerja Semi-Otomatis
              </span>
            </div>
          </div>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
          >
            <span>Buka Aplikasi</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800">
            <Lock size={12} />
            <span>Persetujuan Wajib Setiap Lamaran</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Melamar kerja lebih relevan, cepat, dan tetap dalam kendalimu.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Simpan satu CV utama, tempel tautan lowongan yang ingin kamu lamar, lalu sistem menyusun surat lamaran yang dipersonalisasi. Kamu yang menyetujui setiap email sebelum terkirim.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <span>Mulai Siapkan Lamaran</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* The 3 Concrete Steps */}
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center">
            Tiga Langkah Mudah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Unggah CV Utama
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Unggah dokumen PDF atau kompilasi sertifikat dan transkrip menjadi satu berkas terpadu.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tempel Tautan Lowongan
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Sistem membaca posisi, nama perusahaan, dan alamat kontak HRD secara otomatis.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tinjau & Setujui
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Periksa isi surat dan kecocokan klaim di layar review. Email hanya dikirim setelah kamu klik setujui.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment to Trust & Privacy */}
        <div className="bg-surface-0 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
            <Shield size={20} />
            <h3 className="text-sm font-bold">
              Prinsip Privasi dan Transparansi
            </h3>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              &quot;Kamu yang memutuskan. Tidak ada lamaran yang dikirim tanpa persetujuanmu.&quot;
            </p>
            <p>
              Aplikasi ini bukan bot massal dan tidak mengambil lowongan tanpa izin. AI hanya menyelaraskan kata kunci dari pengalaman yang sudah tertulis di CV kamu tanpa menambah fakta palsu. Setiap data tersimpan dengan aman dan dapat kamu unduh atau hapus kapan saja sesuai UU Pelindungan Data Pribadi (UU No. 27/2022).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161B22] py-6 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>KirimKerja. Asisten Lamaran Kerja Semi-Otomatis.</p>
      </footer>
    </div>
  );
};
