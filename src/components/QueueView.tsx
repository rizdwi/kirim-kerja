'use client';

import React from 'react';
import {
  Plus,
  ArrowRight,
  Trash2,
  Building2,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { Application } from '@/types';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui';

interface QueueViewProps {
  applications: Application[];
  onReviewApp: (app: Application) => void;
  onDeleteApp: (appId: string) => void;
  onOpenAddJob: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  applications,
  onReviewApp,
  onDeleteApp,
  onOpenAddJob,
}) => {
  const waitingApps = applications.filter((a) => a.status === 'menunggu_persetujuan');

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      <PageHeader
        title="Antrean Lamaran"
        subtitle={`${waitingApps.length} menunggu tinjauan · tak ada yang terkirim tanpa persetujuanmu`}
        action={
          <button onClick={onOpenAddJob} className="btn-primary btn-sm sm:!min-h-[44px] sm:!text-sm">
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Lowongan</span>
          </button>
        }
      />

      {waitingApps.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Antrean kosong — semua sudah ditinjau"
          description="Tempel tautan lowongan baru untuk menyiapkan surat lamaran berikutnya."
          action={
            <button onClick={onOpenAddJob} className="btn-primary">
              <Plus size={16} /> Tambah Lowongan Baru
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {waitingApps.map((app, i) => {
            const unconfirmedCount = app.claims.filter((c) => c.status === 'unconfirmed').length;
            return (
              <article
                key={app.id}
                className="card-hover p-5 flex flex-col md:flex-row md:items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                      {app.jobTitle}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                      <Building2 size={13} className="text-gray-400" />
                      {app.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5 truncate max-w-full">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{app.recipientEmail}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText size={13} className="text-gray-400" />
                      {app.attachmentName}
                    </span>
                  </div>

                  {unconfirmedCount > 0 ? (
                    <span className="badge-warning">
                      <AlertTriangle size={12} />
                      {unconfirmedCount} klaim perlu dikonfirmasi
                    </span>
                  ) : (
                    <span className="badge-success">
                      <CheckCircle2 size={12} />
                      Klaim terverifikasi dari CV
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 md:shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/[0.06]">
                  <button
                    onClick={() => onDeleteApp(app.id)}
                    aria-label={`Hapus lamaran ${app.jobTitle}`}
                    title="Hapus dari antrean"
                    className="btn-icon text-gray-400 hover:text-danger-500 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => onReviewApp(app)}
                    className="btn-primary flex-1 md:flex-none"
                  >
                    <span>Tinjau & Setujui</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
