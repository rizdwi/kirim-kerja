'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  CheckCircle,
  FileText,
  Mail,
  ExternalLink,
  Edit3,
  Check,
  Info,
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

  // Handle ESC key to close modal (R-32)
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

  // Check unconfirmed claims
  const unconfirmedClaims = application.claims.filter((c) => c.status === 'unconfirmed');
  const hasUnconfirmedClaims = unconfirmedClaims.length > 0;

  // Selected document
  const selectedDoc = documents.find((d) => d.id === attachmentDocId) || documents[0];

  const handleSaveChanges = () => {
    onSaveDraft(application.id, {
      recipientEmail,
      subject,
      coverLetter,
      attachmentDocId,
      attachmentName: selectedDoc?.displayName || 'CV.pdf',
    });
    setNotice('Perubahan draf berhasil disimpan.');
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
      setNotice('Gagal mengirim email. Silakan coba lagi.');
    } finally {
      setIsSending(false);
    }
  };

  // 1-Click Gmail Web Compose URL generator (personal testing fallback)
  const gmailWebComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(coverLetter)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#161B22] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-surface-1 dark:bg-[#0D1117]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
                Pemeriksaan Lamaran
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {application.id}
              </span>
            </div>
            <h2
              id="review-modal-title"
              className="text-lg font-bold text-gray-900 dark:text-white mt-1"
            >
              {application.jobTitle} - {application.company}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup dialog review"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {notice && (
          <div className="bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 px-6 py-2.5 text-xs font-medium border-b border-brand-200 dark:border-brand-800 flex items-center gap-2">
            <Info size={16} />
            <span>{notice}</span>
          </div>
        )}

        {/* Modal Body: 2-Column Desktop Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Email Details & Document Preview */}
          <div className="lg:col-span-7 space-y-4">
            {/* Metadata Fields (Recipient, Subject, Attachment) */}
            <div className="bg-surface-1 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <div>
                <label
                  htmlFor="rec-email"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Penerima (Email HRD / Rekruter):
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="rec-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recruiter@perusahaan.co.id"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rec-subject"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subjek Email:
                </label>
                <input
                  id="rec-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="rec-attachment"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Lampiran Berkas:
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    id="rec-attachment"
                    value={attachmentDocId}
                    onChange={(e) => setAttachmentDocId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
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

            {/* Document Letter Body (Source Serif 4 styled) */}
            <div className="bg-white dark:bg-[#161B22] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Isi Surat Lamaran
                </span>
                <button
                  onClick={() => setIsEditingBody(!isEditingBody)}
                  className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline min-h-[44px] px-2"
                >
                  <Edit3 size={14} />
                  <span>{isEditingBody ? 'Selesai Edit' : 'Edit Surat'}</span>
                </button>
              </div>

              {isEditingBody ? (
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={12}
                  className="w-full p-3 font-serif text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              ) : (
                <div className="document-prose text-gray-800 dark:text-gray-200 whitespace-pre-line text-sm leading-relaxed p-1">
                  {coverLetter}
                </div>
              )}

              <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-ai-50 dark:bg-ai-800/30 p-2.5 rounded-lg border border-ai-200 dark:border-ai-800/60">
                Tip: Teks surat telah diselaraskan dengan kata kunci lowongan dari CV asli kamu tanpa mengubah fakta pengalaman.
              </div>
            </div>
          </div>

          {/* Right Column: Grounding Guard & Evidence Panel */}
          <div className="lg:col-span-5 space-y-4">
            {/* Grounding Guard: Unconfirmed Claims */}
            {hasUnconfirmedClaims ? (
              <div className="bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-600/70 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="text-warning-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-warning-800 dark:text-warning-300">
                      Klaim Baru Perlu Konfirmasi
                    </h3>
                    <p className="text-xs text-warning-700 dark:text-warning-400 mt-0.5">
                      Sistem mendeteksi klaim berikut tidak ditemukan di berkas CV asli kamu. Konfirmasi atau hapus sebelum lamaran dapat disetujui.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {unconfirmedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white dark:bg-[#161B22] p-3 rounded-lg border border-warning-300 dark:border-warning-700/60 space-y-2"
                    >
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        &quot;{claim.text}&quot;
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onConfirmClaim(application.id, claim.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-success-600 hover:bg-success-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors min-h-[40px]"
                        >
                          <Check size={14} />
                          <span>Benar, Ini Pengalamanku</span>
                        </button>
                        <button
                          onClick={() => onRemoveClaim(application.id, claim.id)}
                          className="flex items-center justify-center gap-1 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors min-h-[40px] border border-danger-200 dark:border-danger-800"
                        >
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="text-success-600 shrink-0" size={20} />
                <div className="text-xs text-success-800 dark:text-success-300">
                  <span className="font-bold block">Seluruh Klaim Terverifikasi Grounded</span>
                  Semua kualifikasi dalam surat ini bersumber langsung dari CV asli kamu.
                </div>
              </div>
            )}

            {/* Evidence & Adaptation Details */}
            <div className="bg-surface-1 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Penyelarasan Dari CV Asli
              </h3>

              {application.adaptedSections.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tidak ada penyesuaian khusus. Surat disusun langsung dari profil CV.
                </p>
              ) : (
                <div className="space-y-3">
                  {application.adaptedSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="bg-white dark:bg-[#161B22] p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs space-y-1.5"
                    >
                      <div className="font-semibold text-brand-700 dark:text-brand-300">
                        {sec.field}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-800 dark:text-gray-200 block mb-0.5">
                          Teks Diadaptasi:
                        </span>
                        {sec.adaptedText}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                        Bukti CV: {sec.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Notes */}
            {application.notes && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <span className="font-semibold block mb-0.5">Catatan Lowongan:</span>
                {application.notes}
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer / Action Controls */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161B22] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onDeleteApplication(application.id)}
              className="text-xs text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20 px-3 py-2 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              Hapus dari Antrean
            </button>
            <button
              onClick={handleSaveChanges}
              className="text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 min-h-[44px]"
            >
              Simpan Draf
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* 1-Click Personal Web Compose fallback */}
            <a
              href={gmailWebComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 min-h-[44px]"
              title="Buka langsung di tab Gmail kamu dengan teks terisi"
            >
              <ExternalLink size={14} />
              <span>Buka di Web Gmail</span>
            </a>

            {/* Primary Submit Button */}
            <button
              disabled={hasUnconfirmedClaims || isSending}
              onClick={() => setShowConfirmDialog(true)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all min-h-[44px] ${
                hasUnconfirmedClaims || isSending
                  ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-70'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-sm'
              }`}
            >
              <Send size={16} />
              <span>
                {isSending
                  ? 'Mengirim...'
                  : hasUnconfirmedClaims
                  ? 'Konfirmasi Klaim Dahulu'
                  : 'Setujui dan Kirim'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before Final Dispatch (PRD 6.5 & AFD 4.5) */}
      {showConfirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#161B22] rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Konfirmasi Pengiriman Lamaran
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Email akan dikirim ke <span className="font-bold text-gray-900 dark:text-white">{recipientEmail}</span> dari akun Gmail kamu dengan lampiran <span className="font-semibold">{selectedDoc?.displayName}</span>.
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-500 dark:text-gray-400">
              Pengiriman ini akan dicatat dalam riwayat lamaran dan mengurangi kuota harian 1 email.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium min-h-[44px]"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteSend}
                disabled={isSending}
                className="px-5 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors min-h-[44px]"
              >
                {isSending ? 'Memproses...' : 'Ya, Kirim Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
