'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Layers,
  Star,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  FolderOpen,
} from 'lucide-react';
import { DocumentItem } from '@/types';
import { PageHeader, EmptyState } from '@/components/ui';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onSetPrimary: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onUploadDocument: (doc: DocumentItem) => void;
  onOpenCompile: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onSetPrimary,
  onDeleteDocument,
  onUploadDocument,
  onOpenCompile,
}) => {
  const [selectedDocText, setSelectedDocText] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      let extracted = '';
      const rawContent = event.target?.result;
      if (typeof rawContent === 'string') {
        extracted = rawContent.slice(0, 10000);
      } else if (rawContent instanceof ArrayBuffer) {
        const bytes = new Uint8Array(rawContent);
        let textChunk = '';
        for (let i = 0; i < Math.min(bytes.length, 50000); i++) {
          const charCode = bytes[i];
          if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
            textChunk += String.fromCharCode(charCode);
          }
        }
        extracted = textChunk.replace(/\s+/g, ' ').slice(0, 4000);
        if (!extracted || extracted.length < 50) {
          extracted = `Dokumen: ${file.name}\nUkuran: ${Math.round(file.size / 1024)} KB\nTipe: ${file.type || 'Dokumen Pelamar'}`;
        }
      }

      const newDoc: DocumentItem = {
        id: 'doc_' + Date.now(),
        displayName: file.name,
        label: file.name.toLowerCase().includes('cv')
          ? 'CV'
          : file.name.toLowerCase().includes('sertifikat')
          ? 'Sertifikat'
          : file.name.toLowerCase().includes('transkrip')
          ? 'Transkrip'
          : 'CV',
        kind: 'upload',
        status: 'siap',
        sizeBytes: file.size,
        pageCount: 1,
        isPrimary: documents.length === 0,
        createdAt: new Date().toISOString(),
        extractedText: extracted,
      };
      onUploadDocument(newDoc);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl animate-fade-in">
      <PageHeader
        title="CV & Berkas"
        subtitle="Satu CV utama jadi dasar personalisasi · kompilasi berkas jadi satu PDF"
        action={
          <button onClick={onOpenCompile} className="btn-primary btn-sm sm:!min-h-[44px] sm:!text-sm">
            <Layers size={16} />
            <span>Kompilasi Berkas</span>
          </button>
        }
      />

      {/* Zona unggah */}
      <div className="card card-accent border-dashed !border-2 p-6 sm:p-8 text-center">
        <span className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-brand-500/15 to-brand-500/5 border border-brand-500/20 text-brand-500 dark:text-brand-300 flex items-center justify-center">
          <Upload size={22} />
        </span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-3">
          Unggah berkas baru
        </h3>
        <p className="hint max-w-sm mx-auto">
          PDF / DOCX, maksimal 10 MB. Teks diekstrak otomatis sebagai dasar bukti AI.
        </p>
        <label className="btn-secondary mt-4 cursor-pointer">
          <span>{isUploading ? 'Memproses…' : 'Pilih berkas'}</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,image/*"
            onChange={handleUpload}
            className="sr-only"
            aria-label="Pilih berkas untuk diunggah"
          />
        </label>
      </div>

      {/* Daftar berkas */}
      <div>
        <p className="eyebrow mb-3">
          Tersimpan ({documents.length})
        </p>
        {documents.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Belum ada berkas"
            description="Unggah CV-mu di atas — ia jadi fondasi setiap surat lamaran yang disusun."
          />
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className={`card p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
                  doc.isPrimary ? '!border-brand-500/50 dark:!border-brand-400/40 card-accent' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      doc.isPrimary
                        ? 'bg-gradient-to-b from-brand-500/15 to-brand-500/5 border-brand-500/25 text-brand-500 dark:text-brand-300'
                        : 'bg-gray-100 dark:bg-white/[0.05] border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <FileText size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {doc.displayName}
                      </span>
                      {doc.isPrimary && (
                        <span className="badge-info">
                          <Star size={10} className="fill-current" />
                          CV Utama
                        </span>
                      )}
                      <span className="badge-neutral !text-[10px] uppercase">{doc.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {Math.round(doc.sizeBytes / 1024)} KB · {doc.pageCount} hlm ·{' '}
                      {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:shrink-0 justify-end border-t sm:border-t-0 border-gray-100 dark:border-white/[0.06] pt-3 sm:pt-0">
                  {!doc.isPrimary && (
                    <button
                      onClick={() => onSetPrimary(doc.id)}
                      className="btn-ghost btn-sm"
                    >
                      Jadikan CV Utama
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDocText(doc)}
                    title="Lihat teks terekstraksi"
                    aria-label={`Lihat teks dari ${doc.displayName}`}
                    className="btn-icon text-gray-400 hover:text-brand-500 dark:hover:text-brand-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  >
                    <Eye size={16} />
                  </button>
                  {documents.length > 1 && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Hapus dokumen"
                      aria-label={`Hapus ${doc.displayName}`}
                      className="btn-icon text-gray-400 hover:text-danger-500 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal inspeksi teks */}
      {selectedDocText && (
        <div role="dialog" aria-modal="true" className="modal-backdrop" onClick={() => setSelectedDocText(null)}>
          <div className="modal-panel max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="min-w-0">
                <span className="eyebrow block mb-1">Teks terekstraksi</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {selectedDocText.displayName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocText(null)}
                aria-label="Tutup"
                className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body space-y-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-success-700 dark:text-success-300 font-semibold">
                <CheckCircle2 size={14} />
                Teks ini jadi dasar bukti grounding AI.
              </p>
              <pre className="text-xs card-flat p-4 whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 leading-relaxed max-h-[50vh] overflow-y-auto">
                {selectedDocText.extractedText || 'Tidak ada teks terekstraksi.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
