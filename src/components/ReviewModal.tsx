'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Mail,
  ExternalLink,
  Edit3,
  Check,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Application, DocumentItem, EmailSettings } from '@/types';

interface ReviewModalProps {
  application: Application | null;
  documents: DocumentItem[];
  emailSettings: EmailSettings;
  isOpen: boolean;
  onClose: () => void;
  onApproveAndSend: (
    appId: string,
    recipientEmail: string,
    subject: string,
    coverLetter: string,
    attachmentDocId: string
  ) => Promise<void>;
  onSaveDraft: (
    appId: string,
    updates: Partial<Application>
  ) => void;
  onDeleteApplication: (appId: string) => void;
  onConfirmClaim: (appId: string, claimId: string) => void;
  onRemoveClaim: (appId: string, claimId: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  application,
  documents,
  emailSettings,
  isOpen,
  onClose,
  onApproveAndSend,
  onSaveDraft,
  onDeleteApplication,
  onConfirmClaim,
  onRemoveClaim,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [attachmentDocId, setAttachmentDocId] = useState('');
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Sync state with selected application
  useEffect(() => {
    if (application) {
      setRecipientEmail(application.recipientEmail || '');
      setSubject(application.subject || '');
      setCoverLetter(application.coverLetter || '');
      setAttachmentDocId(application.attachmentDocId || (documents[0]?.id || ''));
      setIsEditingBody(false);
      setShowConfirmDialog(false);
      setNotice(null);
    }
  }, [application, documents]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showConfirmDialog) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirmDialog, onClose]);

  if (!isOpen || !application) return null;

  const unconfirmedClaims = application.claims.filter((c) => c.status === 'unconfirmed');
  const hasUnconfirmedClaims = unconfirmedClaims.length > 0;
  const selectedDoc = documents.find((d) => d.id === attachmentDocId) || documents[0];

  const handleSaveChanges = () => {
    onSaveDraft(application.id, {
      recipientEmail,
      subject,
      coverLetter,
      attachmentDocId,
      attachmentName: selectedDoc?.displayName || 'CV.pdf',
    });
    setNotice('Draf tersimpan.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleExecuteSend = async () => {
    setIsSending(true);
    setShowConfirmDialog(false);
    try {
      await onApproveAndSend(
        application.id,
        recipientEmail,
        subject,
        coverLetter,
        attachmentDocId
      );
      onClose();
    } catch {
      setNotice('Gagal mengirim. Coba lagi.');
    } finally {
      setIsSending(false);
    }
  };

  const gmailWebComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(coverLetter)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-panel sm:!max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="min-w-0">
            <span className="badge-info mb-1.5">Pemeriksaan Lamaran</span>
            <h2 id="review-modal-title" className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
              {application.jobTitle} <span className="text-gray-400 font-semibold">· {application.company}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog review"
            className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] shrink-0"
          >
            <X size={19} />
          </button>
        </div>

        {notice && (
          <div role="status" className="px-5 sm:px-6 py-2.5 text-xs font-semibold bg-brand-500/[0.08] dark:bg-brand-400/[0.1] text-brand-700 dark:text-brand-200 border-b border-brand-500/15 flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Body: 2 kolom di desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Kolom kiri: email + surat */}
          <div className="lg:col-span-7 space-y-4">
            <div className="card-flat p-4 space-y-3.5">
              <div>
                <label htmlFor="rec-email" className="label">Penerima (email HRD)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="rec-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recruiter@perusahaan.co.id"
                    className="input-icon"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rec-subject" className="label">Subjek email</label>
                <input
                  id="rec-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="rec-attachment" className="label">Lampiran</label>
                <div className="relative">
                  <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    id="rec-attachment"
                    value={attachmentDocId}
                    onChange={(e) => setAttachmentDocId(e.target.value)}
                    className="select !pl-10"
                  >
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        [{doc.label}] {doc.displayName} ({Math.round(doc.sizeBytes / 1024)} KB)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
                <span className="eyebrow">Isi surat lamaran</span>
                <button
                  onClick={() => setIsEditingBody(!isEditingBody)}
                  className="btn-ghost btn-sm"
                  aria-pressed={isEditingBody}
                >
                  <Edit3 size={14} />
                  <span>{isEditingBody ? 'Selesai' : 'Edit'}</span>
                </button>
              </div>
              {isEditingBody ? (
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={12}
                  aria-label="Edit isi surat lamaran"
                  className="textarea font-serif mt-3"
                />
              ) : (
                <div className="document-prose text-gray-800 dark:text-gray-200 whitespace-pre-line text-sm leading-relaxed pt-3">
                  {coverLetter}
                </div>
              )}
              <p className="hint mt-3 card-flat !bg-ai-50 dark:!bg-ai-800/20 !border-ai-200 dark:!border-ai-800/50 p-3">
                Surat diselaraskan dengan kata kunci lowongan dari CV aslimu — tanpa mengubah fakta pengalaman.
              </p>
            </div>
          </div>

          {/* Kolom kanan: grounding guard */}
          <div className="lg:col-span-5 space-y-4">
            {hasUnconfirmedClaims ? (
              <div className="card p-4 sm:p-5 !border-warning-500/50 dark:!border-warning-400/40 card-accent space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-warning-500/12 border border-warning-500/25 text-warning-600 dark:text-warning-300 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-warning-700 dark:text-warning-200">
                      {unconfirmedClaims.length} klaim perlu konfirmasi
                    </h3>
                    <p className="text-xs text-warning-700/80 dark:text-warning-300/80 mt-0.5 leading-relaxed">
                      Tidak ditemukan di CV aslimu. Konfirmasi atau hapus — tombol kirim terkunci sampai beres.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {unconfirmedClaims.map((claim) => (
                    <div key={claim.id} className="card-flat p-3 space-y-2.5">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        “{claim.text}”
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onConfirmClaim(application.id, claim.id)}
                          className="btn btn-sm flex-1 bg-success-600 hover:bg-success-700 text-white"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Benar, pengalamanku</span>
                        </button>
                        <button
                          onClick={() => onRemoveClaim(application.id, claim.id)}
                          className="btn btn-sm border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-4 flex items-start gap-3 !border-success-500/40 dark:!border-success-400/30">
                <span className="w-9 h-9 rounded-xl bg-success-500/12 border border-success-500/25 text-success-600 dark:text-success-300 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </span>
                <p className="text-xs leading-relaxed text-success-700 dark:text-success-200">
                  <strong className="block font-bold">Semua klaim terverifikasi</strong>
                  Setiap kualifikasi bersumber langsung dari CV aslimu.
                </p>
              </div>
            )}

            <div className="card-flat p-4 space-y-3">
              <h3 className="eyebrow">Penyelarasan dari CV</h3>
              {application.adaptedSections.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Surat disusun langsung dari profil CV tanpa penyesuaian khusus.
                </p>
              ) : (
                application.adaptedSections.map((sec) => (
                  <div key={sec.id} className="card p-3.5 space-y-1.5">
                    <div className="text-xs font-bold text-brand-600 dark:text-brand-300">{sec.field}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{sec.adaptedText}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-1.5 border-t border-gray-100 dark:border-white/[0.06]">
                      Bukti: {sec.evidence}
                    </p>
                  </div>
                ))
              )}
            </div>

            {application.notes && (
              <p className="card-flat p-3.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <strong className="block text-gray-700 dark:text-gray-300 mb-1">Catatan</strong>
                {application.notes}
              </p>
            )}
          </div>
        </div>

        {/* Footer aksi */}
        <div className="modal-footer">
          <div className="flex items-center gap-1">
            <button onClick={() => onDeleteApplication(application.id)} className="btn-danger-ghost btn-sm">
              Hapus
            </button>
            <button onClick={handleSaveChanges} className="btn-ghost btn-sm">
              Simpan Draf
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={gmailWebComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm"
              title="Buka di tab Gmail dengan teks terisi"
            >
              <ExternalLink size={14} />
              <span>Buka di Gmail</span>
            </a>
            <button
              disabled={hasUnconfirmedClaims || isSending}
              onClick={() => setShowConfirmDialog(true)}
              className="btn-primary flex-1 sm:flex-none"
            >
              <Send size={15} />
              <span>{isSending ? 'Mengirim…' : hasUnconfirmedClaims ? 'Konfirmasi Klaim Dulu' : 'Setujui & Kirim'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi kirim */}
      {showConfirmDialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" onClick={() => setShowConfirmDialog(false)}>
          <div className="bg-white dark:bg-[#161B22] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-pop border border-gray-200 dark:border-white/[0.08] space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
              Kirim lamaran ini?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Email dikirim ke <strong className="text-gray-900 dark:text-white break-all">{recipientEmail}</strong> dengan
              lampiran <strong className="text-gray-900 dark:text-white">{selectedDoc?.displayName}</strong>.
            </p>
            <p className="hint card-flat p-3">
              Tercatat di riwayat dan mengurangi kuota harian 1 email. Kuota tersisa hari ini: {Math.max(0, emailSettings.dailyLimit - emailSettings.dailySentCount)}.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirmDialog(false)} className="btn-ghost">
                Batal
              </button>
              <button onClick={handleExecuteSend} disabled={isSending} className="btn-primary">
                {isSending ? 'Memproses…' : 'Ya, Kirim Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
