'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Building,
  MapPin,
  Mail,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService } from '@/lib/ai-service';

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
  }, []);

  const handleApplyClick = (job: JobPost) => {
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

    const pResult = AiPersonalizationService.personalize(profile, cvDoc, job);

    onApplyJob(
      job,
      pResult.coverLetter,
      pResult.subject,
      pResult.adaptedSections,
      pResult.claims
    );

    setAppliedJobIds((prev) => [...prev, job.id]);
    setToastMsg(`Lowongan "${job.title}" di ${job.company} berhasil dimasukkan ke Antrean Lamaran!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-0.5">
            <Sparkles size={15} />
            <span>Pembaruan Real-Time Otomatis</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Jelajah Lowongan Terbuka
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Daftar lowongan kerja yang otomatis terscrap dan ter-update secara berkala. Pilih posisi dan masukkan langsung ke antrean review dengan 1 klik.
          </p>
        </div>

        <button
          onClick={() => fetchExploreJobs(query)}
          disabled={isLoading}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 min-h-[44px]"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-success-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search Bar & Presets */}
      <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchExploreJobs(query);
              }}
              placeholder="Cari lowongan: misal Frontend, Admin, Marketing, Sales, Python..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
            />
          </div>
          <button
            onClick={() => fetchExploreJobs(query)}
            disabled={isLoading}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 min-h-[44px]"
          >
            Cari
          </button>
        </div>

        {/* Keyword Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-gray-500 mr-1">Kategori Cepat:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                const keyword = preset === 'Semua' ? '' : preset;
                setQuery(keyword);
                fetchExploreJobs(keyword);
              }}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ${
                (query === '' && preset === 'Semua') || query === preset
                  ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700 font-bold'
                  : 'bg-surface-1 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-16 space-y-3">
          <Loader2 size={32} className="animate-spin text-brand-600 mx-auto" />
          <p className="text-xs font-semibold text-gray-500">
            Mengambil data lowongan real-time dari jaringan agregasi karir...
          </p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-xl text-xs text-danger-700 dark:text-danger-300 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-danger-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Job Grid */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isApplied = appliedJobIds.includes(job.id);
            return (
              <div
                key={job.id}
                className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                      {job.title}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        job.confidenceLabel?.includes('Lokal') || job.confidenceLabel?.includes('Indonesia')
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : job.confidenceLabel?.includes('Visa')
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {job.confidenceLabel || 'Lokal Indonesia'}
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
                      <span className="truncate">Email: {job.contactEmail}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
                  {job.sourceUrl && (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs"
                      title="Buka info lowongan asli"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}

                  <button
                    disabled={isApplied}
                    onClick={() => handleApplyClick(job)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm min-h-[44px] ${
                      isApplied
                        ? 'bg-success-600 text-white cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Di Antrean Review</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Lamar Posisi Ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="bg-white dark:bg-[#161B22] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tidak ditemukan lowongan dengan kata kunci &quot;{query}&quot;.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Coba pilih kata kunci yang lebih umum seperti &quot;Frontend&quot;, &quot;Admin&quot;, atau klik &quot;Semua&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
