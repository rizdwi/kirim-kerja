'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
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
  const [compiledTitle, setCompiledTitle] = useState('Berkas_Lamaran_Terpadu');
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
      className="modal-backdrop"
      onClick={onClose}
    >
      <div className="modal-panel sm:!max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-500/15 to-brand-500/5 border border-brand-500/20 text-brand-500 dark:text-brand-300 flex items-center justify-center shrink-0">
              <Layers size={19} />
            </span>
            <div className="min-w-0">
              <h2 id="compile-modal-title" className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Kompilasi Berkas
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Gabungkan CV, sertifikat & transkrip jadi satu PDF.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="btn-icon text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] shrink-0"
          >
            <X size={19} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div>
            <label htmlFor="compile-filename" className="label">Nama berkas hasil</label>
            <input
              id="compile-filename"
              type="text"
              value={compiledTitle}
              onChange={(e) => setCompiledTitle(e.target.value)}
              className="input"
            />
          </div>

          <fieldset>
            <legend className="label">Pilih & urutkan berkas</legend>
            <div className="space-y-2">
              {docOrder.map((doc, idx) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-brand-500/[0.06] dark:bg-brand-400/[0.07] border-brand-500/30 dark:border-brand-400/30'
                        : 'card-flat opacity-55'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(doc.id)}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 shrink-0 accent-brand-600"
                        aria-label={`Pilih ${doc.displayName}`}
                      />
                      <FileText size={16} className="text-gray-400 shrink-0" />
                      <span className="min-w-0">
                        <span className="font-semibold text-xs text-gray-900 dark:text-white block truncate">
                          [{doc.label}] {doc.displayName}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {Math.round(doc.sizeBytes / 1024)} KB · {doc.pageCount} hlm
                        </span>
                      </span>
                    </label>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        title="Geser ke atas"
                        aria-label={`Geser ${doc.displayName} ke atas`}
                        className="btn-icon !min-h-[36px] !min-w-[36px] text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-25 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        disabled={idx === docOrder.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        title="Geser ke bawah"
                        aria-label={`Geser ${doc.displayName} ke bawah`}
                        className="btn-icon !min-h-[36px] !min-w-[36px] text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-25 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {compileSuccess && (
            <div role="status" className="card p-3.5 !border-success-500/40 dark:!border-success-400/30 flex items-center justify-between gap-3 animate-slide-up">
              <p className="flex items-center gap-2 text-xs font-semibold text-success-700 dark:text-success-300">
                <CheckCircle2 size={16} className="shrink-0" />
                PDF tersimpan ke pustaka berkas.
              </p>
              <button onClick={handleDownload} className="btn btn-sm bg-success-600 hover:bg-success-700 text-white shrink-0">
                <Download size={14} />
                <span>Unduh</span>
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer !justify-end">
          <button onClick={onClose} className="btn-ghost">
            Tutup
          </button>
          <button
            disabled={isCompiling || selectedIds.length === 0}
            onClick={handleExecuteCompile}
            className="btn-primary"
          >
            {isCompiling ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menggabungkan…</span>
              </>
            ) : (
              <>
                <Layers size={15} />
                <span>Kompilasi ({selectedIds.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
