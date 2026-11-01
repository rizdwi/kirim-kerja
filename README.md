# KirimKerja

> **Asisten Lamaran Kerja Semi-Otomatis**
> Melamar kerja lebih relevan, cepat, dan tetap dalam kendalimu.

Aplikasi web modern yang membantu pencari kerja menyiapkan CV dan surat lamaran yang diselaraskan untuk tiap lowongan, dengan jaminan **persetujuan manual sebelum setiap pengiriman**.

---

## Nilai Inti & Prinsip

1. **Kendali Penuh di Tangan Pelamar**: Tidak ada email yang dikirim secara otomatis tanpa persetujuan eksplisit kamu di Layar Review.
2. **Grounding Guard (Anti-Halusinasi AI)**: AI hanya menyelaraskan kata kunci berdasarkan pengalaman yang ada di CV asli kamu. Jika ada klaim baru (misalnya keahlian atau metrik yang tidak ada di CV), sistem menandainya dan mengunci tombol kirim sampai kamu mengonfirmasi atau menghapusnya.
3. **Penyuntingan Humanis**: Bahasa surat lamaran santai namun sopan, tanpa jargon berlebihan atau kata klise.
4. **Kepatuhan Privasi (UU PDP No. 27/2022)**: Data tersimpan secara privat, dapat diekspor lengkap dalam format JSON, atau dihapus bersih kapan saja.

---

## Fitur Utama

- **Layar Review & Approval (Prioritas #1)**:
  - Antarmuka 2 kolom: Dokumen surat lamaran (tipografi serif) dan Panel Penyelarasan Bukti CV.
  - Peringatan klaim baru berwarna kuning dengan tombol "Benar, ini pengalamanku" atau "Hapus".
  - Tombol persetujuan terkunci sampai semua klaim diselesaikan.
  - Dialog konfirmasi sebelum pengiriman email ke rekruter.
  - Fallback 1-klik untuk membuka langsung di Web Gmail dengan penerima, subjek, dan body otomatis terisi.

- **Ingestion Lowongan Cerdas**:
  - Tempel tautan lowongan atau tempel teks manual.
  - Ekstraksi otomatis posisi, perusahaan, lokasi, dan alamat email kontak HRD.
  - Perlindungan SSRF (memblokir IP lokal/privat) dan penolakan sumber yang dikecualikan (Glint).

- **Kompilasi Dokumen (PDF Merge)**:
  - Menggabungkan beberapa dokumen (CV, Sertifikat, Transkrip, Portofolio) menjadi satu file PDF terpadu menggunakan `pdf-lib` langsung di peramban.

- **Pelacakan Lamaran Terintegrasi**:
  - Filter status: Draf, Menunggu Persetujuan, Terkirim, Dibalas, Wawancara, Diterima, Ditolak.
  - Pencatatan waktu kirim dan riwayat persetujuan.
  - Batas kuota harian (maksimal 20 email per hari) untuk menjaga reputasi akun Gmail.

- **Dukungan Mode Gelap**:
  - Desain responsif di desktop dan mobile dengan palet warna terverifikasi WCAG AA.

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Engine**: `pdf-lib`
- **Ikonografi**: `lucide-react`
- **Deployment**: Vercel

---

## Menjalankan Secara Lokal

```bash
# Masuk ke direktori
cd kirim-kerja

# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

Buka peramban di `http://localhost:3000`.

---

## Verifikasi & Test Mandiri

Jalankan skrip pemeriksaan mandiri untuk memastikan perlindungan SSRF, penolakan sumber terlarang, dan aturan copywriting:

```bash
python scripts/verify.py
```
