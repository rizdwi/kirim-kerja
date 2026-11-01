'use client';

import React, { useState } from 'react';
import {
  Search,
  Building2,
  Mail,
  Eye,
  X,
  FileSearch,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui';

interface TrackingViewProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'menunggu_persetujuan', label: 'Menunggu Approval' },
  { value: 'terkirim', label: 'Terkirim' },
  { value: 'dibalas', label: 'Dibalas HRD' },
  { value: 'wawancara', label: 'Wawancara' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Ditolak' },
];

export const TrackingView: React.FC<TrackingViewProps> = ({
  applications,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const statusFilters = [
    { id: 'all', label: 'Semua' },
    { id: 'menunggu_persetujuan', label: 'Menunggu' },
    { id: 'terkirim', label: 'Terkirim' },
    { id: 'dibalas', label: 'Dibalas' },
    { id: 'wawancara', label: 'Wawancara' },
    { id: 'diterima', label: 'Diterima' },
    { id: 'ditolak', label: 'Ditolak' },
  ];

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      app.jobTitle.toLowerCase().includes(q) ||
      app.company.toLowerCase().includes(q) ||
      app.recipientEmail.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      <PageHeader
        title="Lamaran Saya"
        subtitle={`${applications.length} lamaran terlacak · perbarui status saat ada kabar dari rekruter`}
      />

      {/* Filter + pencarian */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter status">
            {statusFilters.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={filterStatus === tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={filterStatus === tab.id ? 'chip-active' : 'chip-idle'}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64 shrink-0">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi / perusahaan…"
              aria-label="Cari lamaran"
              className="input-icon"
            />
          </div>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Tidak ada lamaran yang cocok"
          description="Coba ubah filter status atau kata kunci pencarian."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredApps.map((app) => (
            <article key={app.id} className="card-hover p-5 flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                    {app.jobTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Building2 size={13} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{app.company}</span>
                  </div>
                </div>
                <StatusBadge status={app.status} className="shrink-0" />
              </div>

              <div className="card-flat px-3.5 py-2.5 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate font-medium">{app.recipientEmail}</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {app.sentAt
                    ? `Terkirim ${new Date(app.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : `Dibuat ${new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  <span aria-hidden> · </span>
                  {app.attachmentName}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label htmlFor={`status-${app.id}`} className="sr-only">
                  Ubah status lamaran {app.jobTitle}
                </label>
                <select
                  id={`status-${app.id}`}
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                  className="select !min-h-[40px] !text-xs flex-1"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedApp(app)}
                  title="Lihat rincian surat"
                  aria-label={`Lihat rincian lamaran ${app.jobTitle}`}
                  className="btn-icon btn-secondary shrink-0"
                >
                  <Eye size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal rincian */}
      {selectedApp && (
        <div role="dialog" aria-modal="true" className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="modal-panel max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="min-w-0">
                <span className="eyebrow block mb-1">Salinan surat terkirim</span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">
                  {selectedApp.jobTitle} · {selectedApp.company}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                aria-label="Tutup rincian"
                className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <dl className="card-flat p-4 space-y-1 text-xs">
                <div className="info-row"><dt className="text-gray-500 dark:text-gray-400 font-medium">Penerima</dt><dd className="font-semibold text-gray-900 dark:text-white text-right break-all">{selectedApp.recipientEmail}</dd></div>
                <div className="info-row"><dt className="text-gray-500 dark:text-gray-400 font-medium">Subjek</dt><dd className="font-semibold text-gray-900 dark:text-white text-right">{selectedApp.subject}</dd></div>
                <div className="info-row"><dt className="text-gray-500 dark:text-gray-400 font-medium">Lampiran</dt><dd className="font-semibold text-gray-900 dark:text-white text-right">{selectedApp.attachmentName}</dd></div>
                <div className="info-row"><dt className="text-gray-500 dark:text-gray-400 font-medium">Status</dt><dd><StatusBadge status={selectedApp.status} /></dd></div>
              </dl>

              <div>
                <span className="eyebrow block mb-2">Isi surat lamaran</span>
                <div className="document-prose card p-5 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                  {selectedApp.coverLetter}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
