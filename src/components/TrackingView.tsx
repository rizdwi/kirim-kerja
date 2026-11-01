'use client';

import React, { useState } from 'react';
import {
  Search,
  Building,
  Mail,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Award,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';

interface TrackingViewProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  applications,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const statusFilters = [
    { id: 'all', label: 'Semua' },
    { id: 'menunggu_persetujuan', label: 'Menunggu Review' },
    { id: 'terkirim', label: 'Terkirim' },
    { id: 'dibalas', label: 'Dibalas' },
    { id: 'wawancara', label: 'Wawancara' },
    { id: 'diterima', label: 'Diterima' },
    { id: 'ditolak', label: 'Ditolak' },
  ];

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'terkirim':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200">
            <CheckCircle2 size={12} />
            <span>Terkirim</span>
          </span>
        );
      case 'menunggu_persetujuan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning-50 text-warning-700 border border-warning-200">
            <Clock size={12} />
            <span>Menunggu Approval</span>
          </span>
        );
      case 'dibalas':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <MessageSquare size={12} />
            <span>Dibalas HRD</span>
          </span>
        );
      case 'wawancara':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar size={12} />
            <span>Tahap Wawancara</span>
          </span>
        );
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Award size={12} />
            <span>Diterima Kerja</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle size={12} />
            <span>Belum Sesuai</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Pelacakan Lamaran Saya
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pantau perkembangan status lamaran yang telah kamu setujui dan kirim.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                  filterStatus === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi / perusahaan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[36px]"
            />
          </div>
        </div>
      </div>

      {/* List or Table */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tidak ada lamaran yang cocok dengan kriteria pencarian.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Coba pilih filter status lain atau reset kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-1 dark:bg-[#0D1117] border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Posisi & Perusahaan</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Tanggal Buat / Kirim</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {app.jobTitle}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-0.5">
                        <Building size={12} />
                        <span>{app.company}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        <span>{app.recipientEmail}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Berkas: {app.attachmentName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      <div>
                        {app.sentAt
                          ? `Terkirim: ${new Date(app.sentAt).toLocaleDateString('id-ID')}`
                          : `Dibuat: ${new Date(app.createdAt).toLocaleDateString('id-ID')}`}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.status)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status dropdown quick update */}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            onUpdateStatus(app.id, e.target.value as ApplicationStatus)
                          }
                          aria-label={`Ubah status lamaran ${app.jobTitle}`}
                          className="text-[11px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[36px]"
                        >
                          <option value="menunggu_persetujuan">Menunggu Approval</option>
                          <option value="terkirim">Terkirim</option>
                          <option value="dibalas">Dibalas HRD</option>
                          <option value="wawancara">Wawancara</option>
                          <option value="diterima">Diterima</option>
                          <option value="ditolak">Ditolak</option>
                        </select>

                        <button
                          onClick={() => setSelectedApp(app)}
                          title="Lihat Rincian Surat Lamaran"
                          aria-label={`Lihat rincian lamaran ${app.jobTitle}`}
                          className="p-1.5 text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Read-only Detail Modal */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#161B22] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-surface-1 dark:bg-[#0D1117]">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Detail Berkas Terkirim
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedApp.jobTitle} - {selectedApp.company}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                aria-label="Tutup rincian lamaran"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Penerima: </span>
                  {selectedApp.recipientEmail}
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Subjek: </span>
                  {selectedApp.subject}
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Lampiran: </span>
                  {selectedApp.attachmentName}
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Salinan Isi Surat Lamaran:
                </span>
                <div className="document-prose bg-white dark:bg-[#161B22] p-4 rounded-lg border border-gray-200 dark:border-gray-800 text-xs sm:text-sm whitespace-pre-line text-gray-800 dark:text-gray-200">
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
