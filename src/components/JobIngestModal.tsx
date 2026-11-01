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
} from 'lucide-react';
import { JobPost, UserProfile, DocumentItem } from '@/types';
import { AiPersonalizationService } from '@/lib/ai-service';

interface JobIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  primaryCv: DocumentItem;
  onJobCreated: (job: JobPost, coverLetter: string, subject: string, adaptedSections: any[], claims: any[]) => void;
}

export const JobIngestModal: React.FC<JobIngestModalProps> = ({
  isOpen,
  onClose,
  profile,
  primaryCv,
  onJobCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [extractedJob, setExtractedJob] = useState<JobPost | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable extracted values
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Handle ESC key
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
      setErrorMessage('Silakan masukkan tautan lowongan kerja.');
      return;
    }
    if (activeTab === 'text' && !textInput.trim()) {
      setErrorMessage('Silakan tempel teks deskripsi lowongan.');
      return;
    }

    try {
      setLoadingStage('Membaca halaman lowongan...');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStage('Mengenali posisi dan kualifikasi...');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStage('Mencari cara melamar dan kontak...');

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

  const handleSaveAndGenerate = () => {
    if (!extractedJob) return;

    const finalJob: JobPost = {
      ...extractedJob,
      title: editTitle.trim() || extractedJob.title,
      company: editCompany.trim() || extractedJob.company,
      contactEmail: editEmail.trim() || extractedJob.contactEmail,
      location: editLocation.trim() || extractedJob.location,
    };

    // Run AI Personalization & Grounding Guard
    const pResult = AiPersonalizationService.personalize(profile, primaryCv, finalJob);

    onJobCreated(
      finalJob,
      pResult.coverLetter,
      pResult.subject,
      pResult.adaptedSections,
      pResult.claims
    );

    // Reset and close
    setUrlInput('');
    setTextInput('');
    setExtractedJob(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#161B22] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-surface-1 dark:bg-[#0D1117]">
          <div>
            <h2
              id="ingest-modal-title"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Tambah Lowongan Pekerjaan
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tempel tautan lowongan atau tempel teks langsung untuk dianalisis.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Tabs: URL vs Raw Text */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                setActiveTab('url');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors min-h-[44px] ${
                activeTab === 'url'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LinkIcon size={14} />
              <span>Tempel Tautan Lowongan</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('text');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors min-h-[44px] ${
                activeTab === 'text'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText size={14} />
              <span>Tempel Teks Manual</span>
            </button>
          </div>

          {/* Tab 1: URL input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label
                htmlFor="input-job-url"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Tautan Halaman Lowongan:
              </label>
              <input
                id="input-job-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://karir.perusahaan.com/lowongan/frontend-engineer"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Sistem membaca halaman publik dan mengekstrak info kontak serta syarat lamaran.
              </p>
            </div>
          )}

          {/* Tab 2: Text input */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label
                htmlFor="input-job-text"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Teks Lengkap Lowongan:
              </label>
              <textarea
                id="input-job-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                placeholder="Salin dan tempel deskripsi lowongan, alamat email HRD, dan syarat posisi di sini..."
                className="w-full p-3 text-sm bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Gunakan opsi ini jika halaman lowongan membutuhkan login atau memblokir akses bot.
              </p>
            </div>
          )}

          {/* Fetch Action Button */}
          {!extractedJob && (
            <div className="pt-2">
              <button
                disabled={Boolean(loadingStage)}
                onClick={handleStartIngestion}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-60 min-h-[44px]"
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
            </div>
          )}

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-lg flex items-start gap-2.5 text-xs text-danger-700 dark:text-danger-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-danger-600" />
              <div>
                <span className="font-bold block">Pemberitahuan</span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Extracted Card Preview & Edit */}
          {extractedJob && (
            <div className="bg-surface-1 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Hasil Ekstraksi Lowongan
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    extractedJob.confidenceLabel === 'Terdeteksi otomatis'
                      ? 'bg-success-50 text-success-700 border-success-200'
                      : 'bg-warning-50 text-warning-700 border-warning-200'
                  }`}
                >
                  {extractedJob.confidenceLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Posisi Pekerjaan:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Nama Perusahaan:
                  </label>
                  <div className="relative">
                    <Building
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Email Kontak HRD:
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="recruiter@perusahaan.com"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Lokasi:
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-600 min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setExtractedJob(null)}
                  className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg min-h-[44px]"
                >
                  Ulangi
                </button>
                <button
                  onClick={handleSaveAndGenerate}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors min-h-[44px]"
                >
                  <Sparkles size={14} />
                  <span>Simpan & Buat Lamaran</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
