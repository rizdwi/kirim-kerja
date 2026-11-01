'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { DocumentItem } from '@/types';
import { PdfService } from '@/lib/pdf-service';

interface CompileModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onCompiledSave: (newDoc: DocumentItem) => void;
}

export const CompileModal: React.FC<CompileModalProps> = ({
  isOpen,
  onClose,
  documents,
  onCompiledSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [docOrder, setDocOrder] = useState<DocumentItem[]>([]);
  const [compiledTitle, setCompiledTitle] = useState('Berkas_Lamaran_Terpadu_RizkyDwi');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [lastPdfBytes, setLastPdfBytes] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (documents.length > 0) {
      setDocOrder(documents);
      setSelectedIds(documents.map((d) => d.id));
      setCompileSuccess(false);
      setLastPdfBytes(null);
    }
  }, [documents, isOpen]);

  // Handle ESC
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

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...docOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setDocOrder(newOrder);
  };

  const handleExecuteCompile = async () => {
    const activeDocs = docOrder.filter((d) => selectedIds.includes(d.id));
    if (activeDocs.length === 0) return;

    setIsCompiling(true);
    try {
      const { pdfBytes, pageCount } = await PdfService.compileDocuments(
        activeDocs,
        compiledTitle
      );
      setLastPdfBytes(pdfBytes);
      setCompileSuccess(true);

      // Save to library
      const newDoc: DocumentItem = {
        id: 'doc_comp_' + Date.now(),
        displayName: `${compiledTitle}.pdf`,
        label: 'Portofolio',
        kind: 'compiled',
        status: 'siap',
        sizeBytes: pdfBytes.byteLength,
        pageCount,
        extractedText: activeDocs.map((d) => d.extractedText).join('\n---\n'),
        isPrimary: false,
        createdAt: new Date().toISOString(),
      };
      onCompiledSave(newDoc);
    } catch (e) {
      console.error('Failed to compile PDF:', e);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!lastPdfBytes) return;
    PdfService.downloadBlob(lastPdfBytes, `${compiledTitle}.pdf`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compile-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#161B22] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-surface-1 dark:bg-[#0D1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h2
                id="compile-modal-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Kompilasi Berkas Dokumen
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gabungkan CV, sertifikat, dan transkrip menjadi satu PDF terpadu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label
              htmlFor="compile-filename"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Nama Berkas Hasil Kompilasi:
            </label>
            <input
              id="compile-filename"
              type="text"
              value={compiledTitle}
              onChange={(e) => setCompiledTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Pilih dan Atur Urutan Berkas:
            </span>
            <div className="space-y-2">
              {docOrder.map((doc, idx) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800'
                        : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="rounded text-brand-600 focus:ring-brand-600 w-4 h-4"
                      />
                      <FileText size={16} className="text-gray-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          [{doc.label}] {doc.displayName}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {Math.round(doc.sizeBytes / 1024)} KB · {doc.pageCount} halaman
                        </span>
                      </div>
                    </label>

                    <div className="flex items-center gap-1 pl-2">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        title="Geser ke atas"
                        aria-label={`Geser ${doc.displayName} ke atas`}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        disabled={idx === docOrder.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        title="Geser ke bawah"
                        aria-label={`Geser ${doc.displayName} ke bawah`}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {compileSuccess && (
            <div className="p-3 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-lg flex items-center justify-between text-xs text-success-800 dark:text-success-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-success-600" />
                <span>Dokumen PDF berhasil digabungkan dan disimpan ke pustaka.</span>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 bg-success-600 hover:bg-success-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
              >
                <Download size={14} />
                <span>Unduh PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-surface-1 dark:bg-[#0D1117] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg min-h-[44px]"
          >
            Tutup
          </button>
          <button
            disabled={isCompiling || selectedIds.length === 0}
            onClick={handleExecuteCompile}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
          >
            {isCompiling ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menggabungkan Dokumen...</span>
              </>
            ) : (
              <>
                <Layers size={14} />
                <span>Kompilasi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
