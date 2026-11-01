'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
  Award,
  XCircle,
  Send,
  FileCheck,
  Building2,
  MapPin,
  Mail,
  LucideIcon,
} from 'lucide-react';
import type { ApplicationStatus } from '@/types';

/* ================= Page header: judul + subjudul + aksi ================= */
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h2 className="page-title">{title}</h2>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/* ================= Empty state konsisten ================= */
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="empty-wrap animate-fade-in">
    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-b from-gray-100 to-gray-200/60 dark:from-white/[0.07] dark:to-white/[0.02] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center">
      <Icon size={26} className="text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="pt-1 flex justify-center">{action}</div>}
  </div>
);

/* ================= Kartu metrik dashboard ================= */
export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: 'brand' | 'warning' | 'success' | 'danger' | 'neutral';
  onClick?: () => void;
}> = ({ label, value, hint, icon: Icon, tone = 'neutral', onClick }) => {
  const toneMap: Record<string, string> = {
    brand:
      'from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-300 border-brand-200/60 dark:border-brand-800/50',
    warning:
      'from-warning-500/15 to-warning-500/5 text-warning-600 dark:text-warning-300 border-warning-200/60 dark:border-warning-800/50',
    success:
      'from-success-500/15 to-success-500/5 text-success-600 dark:text-success-300 border-success-200/60 dark:border-success-800/50',
    danger:
      'from-danger-500/15 to-danger-500/5 text-danger-600 dark:text-danger-300 border-danger-200/60 dark:border-danger-800/50',
    neutral:
      'from-gray-500/10 to-gray-500/5 text-gray-500 dark:text-gray-400 border-gray-200/70 dark:border-white/[0.08]',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`card${onClick ? '-hover' : ''} p-4 sm:p-5 text-left w-full group`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow !tracking-[0.08em] normal-case font-semibold text-[12px]">
          {label}
        </span>
        <span
          className={`w-9 h-9 rounded-xl bg-gradient-to-b border flex items-center justify-center shrink-0 transition-transform duration-150 ${toneMap[tone]} ${onClick ? 'group-hover:scale-110' : ''}`}
        >
          <Icon size={17} strokeWidth={2.2} />
        </span>
      </div>
      <div className="text-[26px] sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-2 tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-snug">
          {hint}
        </div>
      )}
    </Tag>
  );
};

/* ================= Badge status lamaran (terpusat) ================= */
const STATUS_META: Record<ApplicationStatus, { label: string; cls: string; Icon: LucideIcon }> = {
  draf: { label: 'Draf', cls: 'badge-neutral', Icon: FileCheck },
  menunggu_persetujuan: { label: 'Menunggu Persetujuan', cls: 'badge-warning', Icon: Clock },
  disetujui: { label: 'Disetujui', cls: 'badge-info', Icon: CheckCircle2 },
  dalam_antrean_kirim: { label: 'Antrean Kirim', cls: 'badge-info', Icon: Clock },
  terkirim: { label: 'Terkirim', cls: 'badge-success', Icon: Send },
  gagal: { label: 'Gagal Terkirim', cls: 'badge-danger', Icon: XCircle },
  dibatalkan: { label: 'Dibatalkan', cls: 'badge-neutral', Icon: XCircle },
  dibalas: { label: 'Dibalas HRD', cls: 'badge-info', Icon: MessageSquare },
  wawancara: { label: 'Wawancara', cls: 'badge-purple', Icon: Calendar },
  diterima: { label: 'Diterima', cls: 'badge-success', Icon: Award },
  ditolak: { label: 'Belum Sesuai', cls: 'badge-neutral', Icon: XCircle },
};

export const StatusBadge: React.FC<{ status: ApplicationStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const meta = STATUS_META[status] || {
    label: status,
    cls: 'badge-neutral',
    Icon: FileCheck,
  };
  const Icon = meta.Icon;
  return (
    <span className={`${meta.cls} ${className}`}>
      <Icon size={12} strokeWidth={2.4} />
      <span>{meta.label}</span>
    </span>
  );
};

/* ================= Kartu lowongan (dipakai Jobs & Explore) ================= */
export const JobCard: React.FC<{
  job: import('@/types').JobPost;
  badge: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}> = ({ job, badge, primaryAction, secondaryActions }) => (
  <article className="card-hover p-5 flex flex-col gap-4 animate-fade-in">
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug line-clamp-2">
          {job.title}
        </h3>
        <span className="shrink-0">{badge}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
          <Building2 size={14} className="text-gray-400 dark:text-gray-500" />
          {job.company}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
          {job.location}
        </span>
      </div>

      {job.contactEmail && (
        <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 dark:text-brand-300 bg-brand-500/[0.08] dark:bg-brand-400/[0.1] border border-brand-500/15 dark:border-brand-400/20 px-2.5 py-1.5 rounded-lg w-fit max-w-full">
          <Mail size={13} className="shrink-0" />
          <span className="truncate font-medium">{job.contactEmail}</span>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
        {job.description}
      </p>
    </div>

    <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-center gap-1">{secondaryActions}</div>
      <div className="flex-1 flex justify-end">{primaryAction}</div>
    </div>
  </article>
);

/* ================= Progress bar kuota ================= */
export const QuotaBar: React.FC<{ used: number; limit: number }> = ({ used, limit }) => {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const full = used >= limit;
  return (
    <div>
      <div className="progress-track" role="progressbar" aria-valuenow={used} aria-valuemax={limit} aria-label="Kuota pengiriman harian">
        <div
          className={`h-full rounded-full transition-all duration-500 ${full ? 'bg-danger-500' : 'progress-fill'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
