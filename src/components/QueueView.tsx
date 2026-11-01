'use client';

import React from 'react';
import {
  Clock,
  Building,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Application } from '@/types';

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
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Antrean Lamaran Kerja
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Setiap lamaran wajib kamu tinjau dan setujui sebelum dikirim ke rekruter.
          </p>
        </div>

        <button
          onClick={onOpenAddJob}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
        >
          <Plus size={16} />
          <span>Tambah Lowongan Baru</span>
        </button>
      </div>

      {waitingApps.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center space-y-3">
          <Clock size={40} className="mx-auto text-gray-400" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Tidak ada lamaran yang menunggu persetujuan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Semua draf lamaran telah selesai ditinjau. Kamu dapat menempelkan tautan lowongan baru untuk menyiapkan berkas lamaran berikutnya.
          </p>
          <button
            onClick={onOpenAddJob}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Lowongan Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {waitingApps.map((app) => {
            const unconfirmedCount = app.claims.filter((c) => c.status === 'unconfirmed').length;

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {app.jobTitle}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-warning-50 text-warning-700 border border-warning-200">
                      Menunggu Persetujuan
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                      <Building size={14} className="text-gray-400" />
                      {app.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      {app.recipientEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} className="text-gray-400" />
                      {app.attachmentName}
                    </span>
                  </div>

                  <div className="pt-1">
                    {unconfirmedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-warning-700 dark:text-warning-300 bg-warning-50 dark:bg-warning-900/30 px-2 py-0.5 rounded border border-warning-200 dark:border-warning-800">
                        <AlertTriangle size={12} />
                        {unconfirmedCount} klaim baru perlu dikonfirmasi di layar review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success-700 dark:text-success-300 bg-success-50 dark:bg-success-900/30 px-2 py-0.5 rounded border border-success-200 dark:border-success-800">
                        <CheckCircle size={12} />
                        Semua klaim terverifikasi grounded dari CV asli
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => onDeleteApp(app.id)}
                    aria-label={`Hapus lamaran ${app.jobTitle}`}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Hapus dari antrean"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => onReviewApp(app)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm min-h-[44px]"
                  >
                    <span>Tinjau & Setujui</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
