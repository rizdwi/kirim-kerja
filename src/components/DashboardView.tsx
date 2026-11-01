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
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Application, DocumentItem, EmailSettings, UserProfile } from '@/types';
import { StatCard, StatusBadge, EmptyState, QuotaBar } from '@/components/ui';

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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
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
  const sentApps = applications.filter((a) =>
    ['terkirim', 'dibalas', 'wawancara', 'diterima'].includes(a.status)
  );
  const repliedApps = applications.filter((a) =>
    ['dibalas', 'wawancara', 'diterima'].includes(a.status)
  );
  const recentApps = [...applications]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);
  const quotaLeft = Math.max(0, emailSettings.dailyLimit - emailSettings.dailySentCount);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      {/* Hero sambutan */}
      <div className="card card-accent p-5 sm:p-7 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-500/10 dark:bg-brand-400/10 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-300 mb-2">
              <ShieldCheck size={15} strokeWidth={2.4} />
              <span>Kendali penuh di tanganmu — tak ada lamaran terkirim tanpa persetujuanmu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {greeting()},{' '}
              <span className="text-gradient">{profile.fullName?.split(' ')[0] || 'Pencari Kerja'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xl leading-relaxed">
              {waitingApps.length > 0
                ? `Ada ${waitingApps.length} lamaran menunggu tinjauanmu sebelum dikirim ke rekruter.`
                : 'Semua lamaran sudah beres. Tambah lowongan baru untuk disiapkan surat lamarannya.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button onClick={onOpenAddJob} className="btn-primary">
              <Plus size={16} strokeWidth={2.4} />
              <span>Tambah Lowongan</span>
            </button>
            <button onClick={onOpenCompile} className="btn-secondary">
              <Layers size={16} />
              <span>Kompilasi Berkas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Menunggu Persetujuan"
          value={waitingApps.length}
          icon={Clock}
          tone="warning"
          onClick={waitingApps.length > 0 ? onOpenQueue : undefined}
          hint={
            waitingApps.length > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-300">
                Buka antrean <ArrowRight size={12} />
              </span>
            ) : (
              'Antrean kosong'
            )
          }
        />
        <StatCard
          label="Terkirim"
          value={sentApps.length}
          icon={Send}
          tone="success"
          hint="Via akun Gmail kamu"
        />
        <StatCard
          label="Dibalas / Wawancara"
          value={repliedApps.length}
          icon={Sparkles}
          tone="brand"
          hint="Respons positif rekruter"
        />
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow !tracking-[0.08em] normal-case font-semibold text-[12px]">
              Kuota Hari Ini
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 tabular-nums">
              {emailSettings.dailySentCount}/{emailSettings.dailyLimit}
            </span>
          </div>
          <div className="mt-3">
            <QuotaBar used={emailSettings.dailySentCount} limit={emailSettings.dailyLimit} />
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            {quotaLeft > 0 ? `Sisa ${quotaLeft} kiriman` : 'Kuota habis — lanjut besok'}
          </div>
        </div>
      </div>

      {/* Antrean prioritas */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Perlu Tinjauanmu
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Periksa isi surat & kecocokan klaim sebelum mengizinkan pengiriman.
            </p>
          </div>
          {waitingApps.length > 0 && (
            <button
              onClick={onOpenQueue}
              className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline flex items-center gap-1 shrink-0 min-h-[36px]"
            >
              Lihat semua ({waitingApps.length}) <ArrowRight size={14} />
            </button>
          )}
        </div>

        {waitingApps.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Antrean review kosong"
            description="Tempel tautan lowongan baru — sistem menyiapkan surat lamaran terpersonalisasi untuk kamu tinjau."
            action={
              <button onClick={onOpenAddJob} className="btn-primary btn-sm">
                <Plus size={14} /> Tambah Lowongan
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {waitingApps.slice(0, 4).map((app) => {
              const unconfirmed = app.claims.filter((c) => c.status === 'unconfirmed').length;
              return (
                <div key={app.id} className="card-flat p-4 flex flex-col gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {app.jobTitle}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      <Building size={12} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{app.company}</span>
                      <span aria-hidden>·</span>
                      <span className="truncate">{app.recipientEmail}</span>
                    </div>
                  </div>
                  {unconfirmed > 0 && (
                    <div className="badge-warning self-start">
                      {unconfirmed} klaim baru perlu dikonfirmasi
                    </div>
                  )}
                  <button
                    onClick={() => onReviewApp(app)}
                    className="btn-secondary btn-sm w-full"
                  >
                    Tinjau & Setujui <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Aktivitas terakhir + CV */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="card p-5 sm:p-6 lg:col-span-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight mb-1">
            Aktivitas Terakhir
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Lamaran yang baru kamu buat atau kirim.
          </p>
          {recentApps.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-white/[0.08] rounded-xl">
              Belum ada aktivitas. Mulai dari menambah lowongan.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {recentApps.map((app) => (
                <li key={app.id}>
                  <button
                    onClick={() => onReviewApp(app)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left group min-h-[44px]"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                        {app.jobTitle}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {app.company} · {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <StatusBadge status={app.status} className="shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 sm:p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight mb-1">
            CV Utama
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Dasar personalisasi semua surat lamaran.
          </p>
          <div className="flex items-start gap-3 card-flat p-3.5 flex-1">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-500/15 to-brand-500/5 border border-brand-200/60 dark:border-brand-800/50 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
              <FileCheck size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {primaryCv?.displayName || 'Belum ada CV'}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {primaryCv
                  ? `${Math.round(primaryCv.sizeBytes / 1024)} KB · dasar bukti grounding AI`
                  : 'Unggah CV di menu CV & Berkas'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
