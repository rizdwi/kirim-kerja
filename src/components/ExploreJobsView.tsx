'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  SearchX,
} from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService, type PersonalizeResult } from '@/lib/ai-service';
import { PageHeader, EmptyState, JobCard } from '@/components/ui';

interface ExploreJobsViewProps {
  profile: UserProfile;
  primaryCv?: DocumentItem;
  onApplyJob: (
    job: JobPost,
    coverLetter: string,
    subject: string,
    adaptedSections: any[],
    claims: any[]
  ) => void;
}

export const ExploreJobsView: React.FC<ExploreJobsViewProps> = ({
  profile,
  primaryCv,
  onApplyJob,
}) => {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const presets = [
    'Semua',
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Frontend',
    'Admin',
    'Marketing',
    'Remote',
    'Visa Ditanggung',
  ];

  const fetchExploreJobs = async (searchKeyword = query) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const q = searchKeyword === 'Semua' ? '' : searchKeyword;
      const res = await fetch(`/api/explore-jobs?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat lowongan real-time.');
      }
      setJobs(data.jobs || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan saat mengambil lowongan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreJobs('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyClick = async (job: JobPost) => {
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
      setToastMsg('AI gagal: ' + (e instanceof Error ? e.message : 'error'));
      setTimeout(() => setToastMsg(null), 4000);
      return;
    }

    onApplyJob(
      job,
      pResult.coverLetter,
      pResult.subject,
      pResult.adaptedSections,
      pResult.claims
    );

    setAppliedJobIds((prev) => [...prev, job.id]);
    setToastMsg(`"${job.title}" di ${job.company} masuk antrean review.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const confidenceBadge = (job: JobPost) => {
    const label = job.confidenceLabel || '';
    if (label.includes('Lokal') || label.includes('Indonesia'))
      return <span className="badge-success">{job.confidenceLabel || 'Lokal Indonesia'}</span>;
    if (label.includes('Visa')) return <span className="badge-purple">{label}</span>;
    return <span className="badge-info">{label || 'Terverifikasi'}</span>;
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      <PageHeader
        title="Jelajah Lowongan"
        subtitle="Agregat lowongan real-time · 1 klik untuk susun surat lamaran"
        action={
          <button
            onClick={() => fetchExploreJobs(query)}
            disabled={isLoading}
            className="btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
        }
      />

      {toastMsg && (
        <div
          role="status"
          className="card p-3.5 border-success-200 dark:border-success-800 flex items-center gap-2.5 animate-slide-up"
        >
          <CheckCircle2 size={17} className="text-success-500 shrink-0" />
          <span className="text-xs font-semibold text-success-700 dark:text-success-300">
            {toastMsg}
          </span>
        </div>
      )}

      {/* Pencarian */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchExploreJobs(query);
              }}
              placeholder="Cari: Frontend, Admin, Marketing, Python…"
              aria-label="Cari lowongan"
              className="input-icon"
            />
          </div>
          <button
            onClick={() => fetchExploreJobs(query)}
            disabled={isLoading}
            className="btn-primary shrink-0"
          >
            Cari
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1">Kategori</span>
          {presets.map((preset) => {
            const active = (query === '' && preset === 'Semua') || query === preset;
            return (
              <button
                key={preset}
                onClick={() => {
                  const keyword = preset === 'Semua' ? '' : preset;
                  setQuery(keyword);
                  fetchExploreJobs(keyword);
                }}
                className={active ? 'chip-active' : 'chip-idle'}
                aria-pressed={active}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16 space-y-3" role="status" aria-live="polite">
          <Loader2 size={30} className="animate-spin text-brand-500 mx-auto" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Mengambil lowongan terbaru…
          </p>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="card p-4 border-danger-200 dark:border-danger-800 flex items-start gap-2.5"
        >
          <AlertCircle size={18} className="shrink-0 text-danger-500 mt-0.5" />
          <p className="text-xs text-danger-700 dark:text-danger-300 font-medium">{errorMsg}</p>
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {jobs.map((job) => {
            const isApplied = appliedJobIds.includes(job.id);
            return (
              <JobCard
                key={job.id}
                job={job}
                badge={confidenceBadge(job)}
                secondaryActions={
                  job.sourceUrl ? (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      title="Buka info lowongan asli"
                      aria-label={`Buka info asli ${job.title}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  ) : undefined
                }
                primaryAction={
                  <button
                    disabled={isApplied}
                    onClick={() => handleApplyClick(job)}
                    className={isApplied ? 'btn btn-sm bg-success-600 text-white cursor-default' : 'btn-primary btn-sm'}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Di Antrean</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Lamar Posisi Ini</span>
                      </>
                    )}
                  </button>
                }
              />
            );
          })}
        </div>
      )}

      {!isLoading && !errorMsg && jobs.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={query ? `Tidak ada hasil untuk "${query}"` : 'Belum ada lowongan'}
          description='Coba kata kunci yang lebih umum seperti "Frontend" atau "Admin", atau pilih kategori cepat di atas.'
        />
      )}
    </div>
  );
};
