'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  FileText,
  Loader2,
  AlertCircle,
  Building,
  Mail,
  MapPin,
  Sparkles,
  Building2,
} from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService } from '@/lib/ai-service';

interface JobIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  primaryCv?: DocumentItem;
  onJobCreated: (job: JobPost, coverLetter: string, subject: string, adaptedSections: any[], claims: any[]) => void;
}

type TabId = 'url' | 'text' | 'portal';

export const JobIngestModal: React.FC<JobIngestModalProps> = ({
  isOpen,
  onClose,
  profile,
  primaryCv,
  onJobCreated,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [extractedJob, setExtractedJob] = useState<JobPost | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartIngestion = async () => {
    setErrorMessage(null);
    setExtractedJob(null);

    const payload =
      activeTab === 'url' ? { url: urlInput.trim() } : { rawText: textInput.trim() };

    if (activeTab === 'url' && !urlInput.trim()) {
      setErrorMessage('Masukkan tautan lowongan terlebih dahulu.');
      return;
    }
    if (activeTab === 'text' && !textInput.trim()) {
      setErrorMessage('Tempel teks deskripsi lowongan terlebih dahulu.');
      return;
    }

    try {
      setLoadingStage('Membaca halaman lowongan…');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStage('Mengenali posisi dan kualifikasi…');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStage('Mencari kontak HRD…');

      const res = await fetch('/api/ingest-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses lowongan.');
      }

      const job: JobPost = data.job;
      setExtractedJob(job);
      setEditTitle(job.title);
      setEditCompany(job.company);
      setEditEmail(job.contactEmail || '');
      setEditLocation(job.location || 'Indonesia');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan saat membaca lowongan.');
    } finally {
      setLoadingStage(null);
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!extractedJob) return;

    const finalJob: JobPost = {
      ...extractedJob,
      title: editTitle.trim() || extractedJob.title,
      company: editCompany.trim() || extractedJob.company,
      contactEmail: editEmail.trim() || extractedJob.contactEmail,
      location: editLocation.trim() || extractedJob.location,
    };

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

    setLoadingStage('Menyusun surat lamaran dengan AI…');
    try {
      const pResult = await AiPersonalizationService.personalize(profile, cvDoc, finalJob);

      onJobCreated(
        finalJob,
        pResult.coverLetter,
        pResult.subject,
        pResult.adaptedSections,
        pResult.claims
      );

      setUrlInput('');
      setTextInput('');
      setExtractedJob(null);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        'AI gagal menyusun surat: ' + (err.message || 'coba lagi beberapa saat.')
      );
    } finally {
      setLoadingStage(null);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'Tempel Tautan', icon: <LinkIcon size={14} /> },
    { id: 'text', label: 'Tempel Teks', icon: <FileText size={14} /> },
    { id: 'portal', label: 'Portal Kerja', icon: <Building2 size={14} /> },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-modal-title"
      className="modal-backdrop"
      onClick={onClose}
    >
      <div className="modal-panel sm:!max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="ingest-modal-title" className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Tambah Lowongan
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tempel tautan atau teks — sistem mengekstrak detailnya otomatis.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] shrink-0"
          >
            <X size={19} />
          </button>
        </div>

        <div className="modal-body space-y-5">
          {/* Tab */}
          <div className="flex gap-1 p-1 card-flat !rounded-xl overflow-x-auto" role="tablist" aria-label="Sumber lowongan">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-white/[0.08] text-brand-600 dark:text-brand-200 shadow-card'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'portal' && (
            <div className="card p-4 sm:p-5 !border-brand-500/30 dark:!border-brand-400/25 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-brand-700 dark:text-brand-200">
                Impor dari Jobstreet, LinkedIn, Indeed & Meta
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Platform karir memakai proteksi login & anti-bot yang ketat. Cara aman:
              </p>
              <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1.5 leading-relaxed">
                <li>Buka lowongan di akunmu yang sudah login.</li>
                <li>Salin tautan atau teks lowongannya.</li>
                <li>Tempel ke tab <strong>Tempel Tautan</strong> / <strong>Tempel Teks</strong>.</li>
              </ol>
              <p className="text-[11px] text-danger-600 dark:text-danger-300 font-medium card-flat !border-danger-200 dark:!border-danger-800/60 p-2.5">
                Glints dan KitaLulus diblokir otomatis oleh sistem.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button type="button" onClick={() => setActiveTab('url')} className="btn-primary btn-sm flex-1">
                  Ke Tempel Tautan
                </button>
                <button type="button" onClick={() => setActiveTab('text')} className="btn-secondary btn-sm flex-1">
                  Ke Tempel Teks
                </button>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-2 animate-fade-in">
              <label htmlFor="input-job-url" className="label">Tautan halaman lowongan</label>
              <input
                id="input-job-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://…/lowongan/frontend-engineer"
                className="input"
                inputMode="url"
              />
              <p className="hint">Halaman publik dibaca otomatis — posisi, perusahaan, dan kontak HRD.</p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-2 animate-fade-in">
              <label htmlFor="input-job-text" className="label">Teks lengkap lowongan</label>
              <textarea
                id="input-job-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                placeholder="Salin deskripsi lowongan, email HRD, dan syarat posisi ke sini…"
                className="textarea"
              />
              <p className="hint">Untuk halaman yang butuh login atau memblokir bot.</p>
            </div>
          )}

          {!extractedJob && activeTab !== 'portal' && (
            <button
              disabled={Boolean(loadingStage)}
              onClick={handleStartIngestion}
              className="btn-primary w-full"
            >
              {loadingStage ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{loadingStage}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Baca & Ekstrak Lowongan</span>
                </>
              )}
            </button>
          )}

          {errorMessage && (
            <div role="alert" className="card p-3.5 !border-danger-200 dark:!border-danger-800 flex items-start gap-2.5 animate-slide-up">
              <AlertCircle size={17} className="shrink-0 text-danger-500 mt-0.5" />
              <p className="text-xs text-danger-700 dark:text-danger-300 font-medium">{errorMessage}</p>
            </div>
          )}

          {extractedJob && (
            <div className="card-flat p-4 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Hasil ekstraksi</span>
                <span className={extractedJob.confidenceLabel === 'Terdeteksi otomatis' ? 'badge-success' : 'badge-warning'}>
                  {extractedJob.confidenceLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label !text-[11px]">Posisi</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input !min-h-[40px] !text-xs" />
                </div>
                <div>
                  <label className="label !text-[11px]">Perusahaan</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="input-icon !min-h-[40px] !text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label !text-[11px]">Email HRD</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="recruiter@perusahaan.com" className="input-icon !min-h-[40px] !text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label !text-[11px]">Lokasi</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="input-icon !min-h-[40px] !text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={() => setExtractedJob(null)} className="btn-ghost btn-sm" disabled={Boolean(loadingStage)}>
                  Ulangi
                </button>
                <button onClick={handleSaveAndGenerate} disabled={Boolean(loadingStage)} className="btn-primary btn-sm">
                  {loadingStage ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyusun…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Simpan & Buat Lamaran</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
