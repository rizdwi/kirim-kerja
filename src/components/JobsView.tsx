'use client';

import React from 'react';
import { Plus, Sparkles, Trash2, ExternalLink, Send } from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService, type PersonalizeResult } from '@/lib/ai-service';
import { PageHeader, EmptyState, JobCard } from '@/components/ui';

interface JobsViewProps {
  jobs: JobPost[];
  profile: UserProfile;
  primaryCv?: DocumentItem;
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
  const handleGenerateApp = async (job: JobPost) => {
    const cvDoc = primaryCv || {
      id: '',
      displayName: 'CV_Pelamar.pdf',
      label: 'CV' as const,
      kind: 'upload' as const,
      status: 'siap' as const,
      sizeBytes: 0,
      pageCount: 1,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      extractedText: '',
    };
    let pResult: PersonalizeResult;
    try {
      pResult = await AiPersonalizationService.personalize(profile, cvDoc, job);
    } catch (e) {
      alert('AI gagal: ' + (e instanceof Error ? e.message : 'error'));
      return;
    }
    onCreateApplication(
      job,
      pResult.coverLetter,
      pResult.subject,
      pResult.adaptedSections,
      pResult.claims
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      <PageHeader
        title="Lowongan Saya"
        subtitle={`${jobs.length} posisi tersimpan · dari tautan atau teks manual`}
        action={
          <button onClick={onOpenAddJob} className="btn-primary btn-sm sm:!min-h-[44px] sm:!text-sm">
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Lowongan</span>
          </button>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Belum ada lowongan tersimpan"
          description="Tempel tautan lowongan yang ingin kamu lamar — sistem mengekstrak info kontak dan syaratnya otomatis."
          action={
            <button onClick={onOpenAddJob} className="btn-primary">
              <Plus size={16} /> Tambah Lowongan Sekarang
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              badge={
                <span
                  className={`badge ${
                    job.applyType === 'email' ? 'badge-info' : 'badge-purple'
                  }`}
                >
                  Via {job.applyType.toUpperCase()}
                </span>
              }
              secondaryActions={
                <>
                  {job.sourceUrl && (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      title="Buka halaman lowongan asli"
                      aria-label={`Buka halaman asli ${job.title}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    aria-label={`Hapus lowongan ${job.title}`}
                    title="Hapus lowongan"
                    className="btn-icon text-gray-400 hover:text-danger-500 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              }
              primaryAction={
                <button onClick={() => handleGenerateApp(job)} className="btn-primary btn-sm">
                  <Sparkles size={14} />
                  <span>Susun Surat Lamaran</span>
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
