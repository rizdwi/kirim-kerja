'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Layers,
  Star,
  Trash2,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { DocumentItem } from '@/types';

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

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: 'doc_' + Date.now(),
        displayName: file.name,
        label: file.name.toLowerCase().includes('cv')
          ? 'CV'
          : file.name.toLowerCase().includes('sertifikat')
          ? 'Sertifikat'
          : 'Transkrip',
        kind: 'upload',
        status: 'siap',
        sizeBytes: file.size || 350000,
        pageCount: 1,
        isPrimary: documents.length === 0,
        createdAt: new Date().toISOString(),
        extractedText: `Nama Berkas: ${file.name}\nTeks terekstraksi dari dokumen ${file.name} untuk dasar personalisasi surat lamaran dan pencocokan keahlian teknis.`,
      };
      onUploadDocument(newDoc);
      setIsUploading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Kelola CV & Berkas Pelengkap
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Unggah satu CV utama sebagai dasar personalisasi, atau kompilasi beberapa dokumen menjadi satu PDF.
          </p>
        </div>

        <button
          onClick={onOpenCompile}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
        >
          <Layers size={16} />
          <span>Kompilasi Berkas Terpadu</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-[#161B22] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-brand-500 transition-colors">
        <Upload size={32} className="mx-auto text-brand-600 mb-2" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Unggah Berkas Baru (PDF / DOCX)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          Maksimal 10 MB per file. Teks akan diekstrak secara otomatis untuk kebutuhan personalisasi.
        </p>

        <label className="mt-3 inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors min-h-[44px]">
          <span>{isUploading ? 'Memproses berkas...' : 'Pilih Berkas dari Komputer'}</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,image/*"
            onChange={handleSimulatedUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
          Daftar Berkas Tersimpan ({documents.length})
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white dark:bg-[#161B22] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                doc.isPrimary
                  ? 'border-brand-500/70 shadow-sm'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.isPrimary
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <FileText size={20} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {doc.displayName}
                    </span>
                    {doc.isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        <Star size={10} className="fill-brand-600 text-brand-600" />
                        <span>CV Utama</span>
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {doc.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(doc.sizeBytes / 1024)} KB · {doc.pageCount} halaman · Diunggah pada{' '}
                    {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 justify-end">
                {!doc.isPrimary && (
                  <button
                    onClick={() => onSetPrimary(doc.id)}
                    className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[36px]"
                  >
                    Jadikan CV Utama
                  </button>
                )}

                <button
                  onClick={() => setSelectedDocText(doc)}
                  title="Lihat Teks Terekstraksi"
                  aria-label={`Lihat teks terekstraksi dari ${doc.displayName}`}
                  className="p-2 text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Eye size={16} />
                </button>

                {documents.length > 1 && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    title="Hapus Dokumen"
                    aria-label={`Hapus dokumen ${doc.displayName}`}
                    className="p-2 text-gray-400 hover:text-danger-600 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Text Inspector Modal */}
      {selectedDocText && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#161B22] rounded-xl max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-surface-1 dark:bg-[#0D1117]">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Teks Terekstraksi
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedDocText.displayName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocText(null)}
                aria-label="Tutup inspeksi teks"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-success-700 dark:text-success-300 font-semibold mb-2">
                <CheckCircle size={14} />
                <span>Teks ini digunakan sistem sebagai dasar bukti grounding AI.</span>
              </div>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg border border-gray-200 dark:border-gray-800 whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
                {selectedDocText.extractedText || 'Tidak ada teks terekstraksi.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
