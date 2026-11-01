import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentItem } from '@/types';

export const PdfService = {
  // Generate a valid clean compiled PDF from multiple documents
  async compileDocuments(
    docs: DocumentItem[],
    compiledTitle: string
  ): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    // Cover / Index page
    const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
    const { width, height } = coverPage.getSize();

    // Header bar
    coverPage.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.12, 0.37, 0.55), // #1F5F8B brand-600
    });

    coverPage.drawText(compiledTitle, {
      x: 50,
      y: height - 70,
      size: 22,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    coverPage.drawText('Berkas Dokumen Terpadu Pelamar Kerja', {
      x: 50,
      y: height - 95,
      size: 13,
      font: font,
      color: rgb(0.9, 0.94, 0.98),
    });

    // Document Index list
    let currentY = height - 160;
    coverPage.drawText('Daftar Berkas Terlampir:', {
      x: 50,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0.11, 0.12, 0.14),
    });

    currentY -= 30;

    docs.forEach((doc, idx) => {
      coverPage.drawText(`${idx + 1}. [${doc.label}] ${doc.displayName}`, {
        x: 60,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0.2, 0.23, 0.26),
      });
      currentY -= 24;
    });

    // Content pages for each document
    for (const doc of docs) {
      const page = mergedPdf.addPage([595.28, 841.89]);
      const pHeight = page.getHeight();

      // Top title
      page.drawText(`Lampiran: [${doc.label}] ${doc.displayName}`, {
        x: 50,
        y: pHeight - 50,
        size: 12,
        font: fontBold,
        color: rgb(0.12, 0.37, 0.55),
      });

      page.drawLine({
        start: { x: 50, y: pHeight - 60 },
        end: { x: 545, y: pHeight - 60 },
        thickness: 1,
        color: rgb(0.85, 0.88, 0.91),
      });

      // Preview text excerpt
      const textLines = (doc.extractedText || 'Dokumen terverifikasi.').split('\n').slice(0, 35);
      let textY = pHeight - 90;

      for (const line of textLines) {
        if (textY < 60) break;
        const cleanLine = line.trim().slice(0, 85);
        if (cleanLine) {
          page.drawText(cleanLine, {
            x: 50,
            y: textY,
            size: 10,
            font: font,
            color: rgb(0.15, 0.17, 0.2),
          });
        }
        textY -= 18;
      }
    }

    const pdfBytes = await mergedPdf.save();
    return {
      pdfBytes,
      pageCount: mergedPdf.getPageCount(),
    };
  },

  downloadBlob(pdfBytes: Uint8Array, fileName: string): void {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
