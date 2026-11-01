# PRD: Aplikasi Lamaran Kerja Semi-Otomatis

Versi: 1.0
Status: Draft
Tanggal: 1 November 2026

---

## 1. Ringkasan Produk

Aplikasi yang membantu pencari kerja melamar banyak posisi dengan lebih cepat. Pengguna menyimpan satu CV utama, menempelkan tautan lowongan yang ingin dilamar, lalu sistem menyusun CV dan surat lamaran yang dipersonalisasi untuk tiap posisi. Setiap lamaran wajib disetujui pengguna sebelum dikirim. Email dikirim langsung dari akun Gmail pengguna.

Produk ini bukan bot yang melamar atas nama pengguna tanpa sepengetahuannya, dan tidak mengambil lowongan secara massal dari situs pihak ketiga.

## 2. Masalah

- Melamar satu per satu memakan waktu. Setiap lowongan meminta CV dan surat lamaran yang disesuaikan.
- CV yang sama dikirim ke banyak posisi berbeda sering tidak relevan dengan kata kunci lowongan.
- Pencari kerja kesulitan melacak lamaran mana yang sudah dikirim, ke siapa, dan kapan.

## 3. Tujuan

| No | Tujuan | Indikator |
|---|---|---|
| T1 | Mengurangi waktu menyiapkan satu lamaran | Median waktu dari tautan ke lamaran siap kirim di bawah 3 menit |
| T2 | Lamaran lebih relevan dengan lowongan | Rasio lamaran yang direspons (balasan) naik dibanding lamaran manual pengguna |
| T3 | Pengguna mempercayai sistem | Tingkat pembatalan saat review di bawah 30% dan tidak ada keluhan lamaran tanpa persetujuan |
| T4 | Pengiriman andal | Lebih dari 98% email yang disetujui terkirim tanpa error teknis |

## 4. Di Luar Lingkup (Non-Goals)

- Mengambil daftar lowongan secara massal dari Facebook, LinkedIn, Indeed, JobStreet, Nyari Gawe, atau sumber lain.
- Mengisi atau mengirim form lamaran di situs pihak ketiga. Turnstile dan CSRF milik situs tersebut tetap diselesaikan pengguna sendiri.
- Login ke akun pengguna di platform pihak ketiga.
- Melamar otomatis tanpa persetujuan.
- Sumber lowongan dari Glint (dikecualikan atas keputusan produk).
- Fitur chat dengan HRD.
- Aplikasi mobile native pada rilis pertama (web responsif saja).

## 5. Persona

**Persona utama: Pencari kerja aktif.** Usia 22 sampai 35 tahun, sudah punya CV, sering melamar ke beberapa posisi per minggu, dan terbiasa memakai Gmail. Kurang nyaman dengan form yang panjang dan tidak punya banyak waktu.

**Persona sekunder: Fresh graduate.** Punya sedikit pengalaman, membutuhkan bantuan menyusun CV dari dokumen yang ada (sertifikat, transkrip, portofolio), dan perlu panduan untuk membuat surat lamaran.

## 6. Ruang Lingkup Rilis 1 (MVP)

### 6.1 Akun dan profil
- Daftar dengan email dan password, atau masuk dengan Google.
- Verifikasi email.
- Profil: nama, nomor HP, kota, bidang yang diminati, ekspektasi gaji (opsional).
- Turnstile dan CSRF untuk form daftar, login, dan submit.

### 6.2 CV
- Upload satu atau lebih file PDF.
- Fitur compile: menggabungkan beberapa dokumen (PDF, gambar, dan DOCX yang dikonversi) menjadi satu PDF. Hasil dapat diunduh sebagai PDF atau ZIP.
- Setiap CV tersimpan sebagai versi. Pengguna memilih satu CV utama.
- Ekstraksi teks dari CV untuk dasar personalisasi.

### 6.3 Lowongan
- Pengguna menempelkan tautan lowongan (satu atau banyak).
- Sistem membaca satu halaman per tautan, lalu mengekstrak judul, perusahaan, deskripsi, dan cara melamar.
- Cara melamar dibedakan menjadi: email, tautan form, dan manual (teks ditempel pengguna).
- Pengguna dapat mengoreksi hasil ekstraksi sebelum disimpan.

### 6.4 Personalisasi lamaran
- AI menyusun CV yang disesuaikan dan surat lamaran per lowongan.
- Aturan utama: AI hanya menyusun ulang dan menyesuaikan kata kunci dari data CV asli. AI tidak boleh menambah pengalaman, keahlian, gelar, atau angka yang tidak ada di CV.
- Klaim baru yang muncul dari hasil AI ditandai dan wajib dikonfirmasi pengguna.
- Hasil AI melewati tahap penyuntingan gaya bahasa (lihat TRD bagian humanizer) agar teks tidak terdengar generik.

### 6.5 Review dan persetujuan
- Layar review menampilkan setiap lamaran secara terpisah: penerima, subjek, isi surat, lampiran CV, dan bagian yang berubah dibanding CV asli.
- Pengguna dapat mengedit teks, mengganti lampiran, atau membatalkan lamaran.
- Setiap lamaran disetujui dengan tindakan terpisah ("Setujui dan kirim").
- Lamaran tanpa persetujuan tidak pernah dikirim.

### 6.6 Pengiriman
- Pengiriman email melalui Gmail API dari akun Gmail pengguna.
- Lamaran dengan cara form tidak dikirim oleh sistem. Sistem menyiapkan dokumen dan menyalin data kontak ke clipboard, lalu pengguna membuka tautan dan mengisi form sendiri.
- Pengiriman diberi jeda antar email.
- Batas harian 20 email per pengguna pada rilis pertama.
- Satu email per penerima per lowongan. Alamat yang sama tidak boleh dikirimi ulang dalam 30 hari.

### 6.7 Pelacakan
- Status lamaran: draf, menunggu persetujuan, disetujui, terkirim, gagal, dibatalkan, dibalas, wawancara, ditolak.
- Pengguna dapat memperbarui status secara manual.
- Riwayat persetujuan dan pengiriman dapat dilihat pengguna.

### 6.8 Pengaturan
- Cabut akses Gmail kapan saja.
- Hapus akun beserta seluruh data (CV, lamaran, token).
- Unduh data pribadi.

## 7. Kebutuhan Non-Fungsional

- **Keamanan**: enkripsi data saat transit (TLS) dan saat disimpan. Token OAuth dienkripsi. CV disimpan di object storage privat.
- **Privasi**: sesuai UU PDP (UU No. 27/2022). Persetujuan eksplisit untuk pemrosesan AI. Kebijakan privasi tersedia sebelum pengguna mendaftar.
- **Kinerja**: halaman utama memuat di bawah 2 detik. Ekstraksi satu tautan selesai di bawah 15 detik.
- **Ketersediaan**: 99,5% di luar jendela pemeliharaan.
- **Aksesibilitas**: memenuhi WCAG 2.1 level AA untuk kontras dan navigasi keyboard.
- **Bahasa**: Bahasa Indonesia sebagai utama. Bahasa Inggris untuk lamaran jika lowongan memakai bahasa Inggris.

## 8. Metrik Keberhasilan

- Jumlah pengguna aktif mingguan.
- Rata-rata lamaran disetujui per pengguna per minggu.
- Rasio persetujuan (disetujui dibanding dibuat).
- Tingkat keberhasilan pengiriman.
- Tingkat balasan dari penerima (diukur dari status yang diperbarui pengguna).
- Jumlah keluhan terkait lamaran tanpa persetujuan (target nol).

## 9. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Gmail membatasi atau memblokir pengiriman | Lamaran gagal | Batas harian, jeda antar email, deteksi error, pemberitahuan ke pengguna |
| Teks AI mengarang pengalaman | Pengguna dirugikan, reputasi rusak | Aturan grounding, penandaan klaim baru, review wajib |
| Situs lowongan mengubah struktur halaman | Ekstraksi gagal | Fallback ke input manual, parser berbasis data terstruktur (schema.org) |
| Gmail restricted scope | Pengguna umum belum bisa daftar | Rilis awal dengan test user, proses verifikasi dan audit dimulai sejak awal |
| Keluhan pelanggaran privasi | Hukum dan reputasi | Persetujuan jelas, enkripsi, opsi hapus data |

## 10. Pertanyaan Terbuka

1. Apakah rilis awal membatasi jumlah lamaran per bulan untuk paket gratis?
2. Apakah ada batas jumlah tautan lowongan yang bisa dimasukkan per hari?
3. Apakah fitur kompilasi dokumen juga perlu mengenali dokumen secara otomatis (misalnya memberi label "sertifikat" atau "transkrip")?
4. Siapa yang bertanggung jawab atas kepatuhan jika pengguna melamar ke lowongan yang bukan haknya (misalnya lowongan tertutup)?

## 11. Rencana Rilis

- **Fase 0**: prototipe alur approval dan personalisasi dengan 10 sampai 20 pengguna uji.
- **Fase 1 (MVP)**: fitur di bagian 6, dengan Gmail sebagai test user.
- **Fase 2**: verifikasi Gmail, paket berbayar, pelacakan balasan, dan template surat yang bisa diatur.
- **Fase 3**: aplikasi mobile dan integrasi tambahan.
