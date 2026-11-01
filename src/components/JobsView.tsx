'use client';

import React from 'react';
import {
  Building,
  MapPin,
  Mail,
  ExternalLink,
  Plus,
  Sparkles,
  Trash2,
  Send,
} from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService } from '@/lib/ai-service';

interface JobsViewProps {
  jobs: JobPost[];
  profile: UserProfile;
  primaryCv: DocumentItem;
  onOpenAddJob: () => void;
  onDeleteJob: (jobId: string) => void;
  onCreateApplication: (
    job: JobPost,
    coverLetter: string,
    subject: string,
    adaptedSections: any[],
    claims: any[]
  ) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  profile,
  primaryCv,
  onOpenAddJob,
  onDeleteJob,
  onCreateApplication,
}) => {
  const handleGenerateApp = (job: JobPost) => {
    const pResult = AiPersonalizationService.personalize(profile, primaryCv, job);
    onCreateApplication(
      job,
      pResult.coverLetter,
      pResult.subject,
      pResult.adaptedSections,
      pResult.claims
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Lowongan Pekerjaan Tersimpan
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Daftar posisi yang telah kamu tambahkan dari tautan atau teks manual.
          </p>
        </div>

        <button
          onClick={onOpenAddJob}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
        >
          <Plus size={16} />
          <span>Tambah Lowongan</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center space-y-3">
          <Send size={40} className="mx-auto text-gray-400" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Belum ada lowongan tersimpan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Tempel tautan lowongan kerja yang ingin kamu lamar untuk mengekstrak info kontak secara otomatis.
          </p>
          <button
            onClick={onOpenAddJob}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Lowongan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {job.title}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      job.applyType === 'email'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                    }`}
                  >
                    Lamar via {job.applyType.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                    <Building size={14} className="text-gray-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {job.location}
                  </span>
                </div>

                {job.contactEmail && (
                  <div className="flex items-center gap-1.5 text-xs text-brand-700 dark:text-brand-300 bg-brand-50/60 dark:bg-brand-900/20 px-2.5 py-1 rounded">
                    <Mail size={13} />
                    <span>Kontak: {job.contactEmail}</span>
                  </div>
                )}

                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center gap-1.5">
                  {job.sourceUrl && (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Buka Halaman Lowongan Asli"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    aria-label={`Hapus lowongan ${job.title}`}
                    className="p-2 text-gray-400 hover:text-danger-600 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Hapus Lowongan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleGenerateApp(job)}
                  className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
                >
                  <Sparkles size={14} />
                  <span>Susun Surat Lamaran</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
