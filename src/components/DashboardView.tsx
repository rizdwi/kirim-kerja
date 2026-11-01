'use client';

import React from 'react';
import {
  Clock,
  Send,
  FileCheck,
  ShieldCheck,
  Plus,
  ArrowRight,
  Layers,
  Building,
} from 'lucide-react';
import { Application, DocumentItem, EmailSettings, UserProfile } from '@/types';

interface DashboardViewProps {
  profile: UserProfile;
  primaryCv?: DocumentItem;
  applications: Application[];
  emailSettings: EmailSettings;
  onOpenAddJob: () => void;
  onOpenQueue: () => void;
  onOpenCompile: () => void;
  onReviewApp: (app: Application) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  primaryCv,
  applications,
  emailSettings,
  onOpenAddJob,
  onOpenQueue,
  onOpenCompile,
  onReviewApp,
}) => {
  const waitingApps = applications.filter((a) => a.status === 'menunggu_persetujuan');
  const sentApps = applications.filter(
    (a) => a.status === 'terkirim' || a.status === 'dibalas' || a.status === 'wawancara'
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome & Trust Banner */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">
            <ShieldCheck size={16} />
            <span>Kendali Penuh Pelamar</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Selamat datang, {profile.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
            Sistem membantu menyelaraskan CV dan surat lamaran berdasarkan lowongan. Setiap lamaran wajib kamu periksa dan setujui sebelum dikirim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddJob}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Lowongan</span>
          </button>
          <button
            onClick={onOpenCompile}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            <Layers size={16} />
            <span>Kompilasi Berkas</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Waiting Approvals */}
        <div
          onClick={onOpenQueue}
          className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:border-brand-500 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Menunggu Persetujuan</span>
            <div className="w-8 h-8 rounded-lg bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {waitingApps.length}
          </div>
          <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-1 flex items-center gap-1">
            <span>Buka antrean review</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Metric 2: Sent Applications */}
        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Lamaran Terkirim</span>
            <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 flex items-center justify-center font-bold">
              <Send size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {sentApps.length}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Melalui akun Gmail kamu
          </div>
        </div>

        {/* Metric 3: Daily Quota */}
        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Kuota Kirim Hari Ini</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {emailSettings.dailySentCount} / {emailSettings.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-brand-600 h-full transition-all"
              style={{
                width: `${Math.min(100, (emailSettings.dailySentCount / emailSettings.dailyLimit) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            Maksimal 20 email per hari
          </div>
        </div>

        {/* Metric 4: Primary CV */}
        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>CV Utama Aktif</span>
            <FileCheck size={16} className="text-brand-600" />
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white mt-2 truncate">
            {primaryCv?.displayName || 'Belum ada CV'}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Dasar personalisasi berkas
          </div>
        </div>
      </div>

      {/* Waiting Approvals Section (Highest priority action) */}
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Lamaran Menunggu Persetujuan Kamu
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Periksa isi surat dan kecocokan klaim sebelum mengizinkan pengiriman.
            </p>
          </div>
          {waitingApps.length > 0 && (
            <button
              onClick={onOpenQueue}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <span>Lihat semua ({waitingApps.length})</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {waitingApps.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            <Clock size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tidak ada lamaran yang menunggu persetujuan.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tempel tautan lowongan baru untuk menyiapkan lamaran terpersonalisasi.
            </p>
            <button
              onClick={onOpenAddJob}
              className="mt-3 inline-flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus size={14} />
              <span>Tambah Lowongan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {waitingApps.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="bg-surface-1 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {app.jobTitle}
                    </span>
                    <span className="text-[10px] bg-warning-50 text-warning-700 border border-warning-200 font-semibold px-2 py-0.5 rounded-full shrink-0">
                      Menunggu Approval
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <Building size={12} />
                    <span>{app.company}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Penerima: {app.recipientEmail}
                  </div>
                </div>

                {app.claims.filter((c) => c.status === 'unconfirmed').length > 0 && (
                  <div className="text-[11px] bg-warning-50 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 px-2.5 py-1 rounded border border-warning-200 dark:border-warning-800">
                    Ada klaim baru yang wajib kamu konfirmasi.
                  </div>
                )}

                <button
                  onClick={() => onReviewApp(app)}
                  className="w-full flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors min-h-[40px]"
                >
                  <span>Tinjau & Setujui</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
