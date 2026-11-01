# TRD: Aplikasi Lamaran Kerja Semi-Otomatis

Versi: 1.0
Status: Draft
Acuan: PRD v1.0

---

## 1. Tujuan Dokumen

Dokumen ini menjelaskan arsitektur teknis, pilihan teknologi, komponen, alur data, dan batasan teknis untuk Rilis 1 (MVP).

## 2. Arsitektur Tingkat Tinggi

```
┌──────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│ Web App      │────▶│ API Gateway        │────▶│ Core API            │
│ (SPA/SSR)    │     │ (rate limit, CSRF, │     │ (auth, profil, CV,  │
└──────────────┘     │  Turnstile verify) │     │  lowongan, lamaran) │
                     └────────────────────┘     └──────────┬──────────┘
                                                           │
          ┌────────────────────────────────────────────────┼──────────────────┐
          ▼                    ▼                           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  ┌──────────────┐
│ PostgreSQL       │  │ Object Storage   │  │ Job Queue (Redis)    │  │ Gmail API    │
│ (metadata, data) │  │ (PDF, terenkrip) │  │ worker: ekstraksi,   │  │ (kirim email │
└──────────────────┘  └──────────────────┘  │ AI, kirim, bersihkan │  │  dari akun   │
                                             └──────────┬───────────┘  │  user)       │
                                                        ▼              └──────────────┘
                                             ┌──────────────────────┐
                                             │ Layanan AI           │
                                             │ (LLM + pipeline      │
                                             │  humanizer)          │
                                             └──────────────────────┘
```

## 3. Pilihan Teknologi (Rekomendasi)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | Next.js (TypeScript) dengan Tailwind CSS | SSR untuk halaman publik, ekosistem komponen matang |
| Backend | Node.js (NestJS atau Fastify) dengan TypeScript | Satu bahasa dengan frontend, mudah dirawat |
| Database | PostgreSQL 16 | Relasional, dukungan JSONB, enkripsi di level kolom |
| Cache dan antrean | Redis dengan BullMQ | Antrean job yang andal, retry, dan jadwal |
| Object storage | Cloudflare R2 atau AWS S3 | Penyimpanan PDF terenkripsi, biaya rendah |
| Ekstraksi PDF | pdf-parse atau Apache Tika (service terpisah) | Mengambil teks dari CV |
| Konversi dokumen | LibreOffice headless untuk DOCX, Sharp untuk gambar, pdf-lib untuk penggabungan | Fitur kompilasi |
| Ekstraksi lowongan | Cheerio dan parser JSON-LD (schema.org JobPosting) | Lebih andal daripada parsing HTML bebas |
| Email | Gmail API (users.messages.send) | Pengiriman dari akun pengguna |
| AI | LLM melalui API (provider dapat diganti lewat adapter) | Personalisasi CV dan surat |
| Keamanan form | Cloudflare Turnstile, token CSRF, rate limit | Melindungi form di aplikasi sendiri |
| Observabilitas | OpenTelemetry, Sentry, dan log terstruktur | Pelacakan error dan kinerja |

## 4. Komponen

### 4.1 Auth Service
- Login email dan password (hash Argon2id) serta Google OAuth 2.0 (scope: openid, email, profile).
- Sesi memakai cookie HttpOnly, Secure, SameSite=Lax. Token refresh dirotasi.
- Verifikasi email dengan token sekali pakai (berlaku 24 jam).
- Turnstile diverifikasi di server pada form daftar, login, dan reset password.

### 4.2 Profile Service
- CRUD profil dan preferensi.
- Validasi nomor HP dengan format E.164.

### 4.3 Document Service
- Menerima upload PDF. Validasi MIME lewat pemeriksaan magic bytes, bukan hanya ekstensi.
- Batas ukuran per file 10 MB. Batas total kompilasi 25 MB.
- Pemindaian malware (ClamAV atau layanan setara) sebelum file tersedia untuk diproses.
- Kompilasi: urutan halaman disimpan, lalu pdf-lib menggabungkan file dan menghasilkan satu PDF. Output ZIP dibuat bila pengguna memilih ZIP.
- Setiap file diberi nama acak di storage. Nama asli hanya disimpan di DB.
- Unduhan memakai URL bertanda tangan (signed URL) dengan masa berlaku pendek (5 menit).
- Teks hasil ekstraksi disimpan di kolom terpisah untuk dipakai AI.

### 4.4 Job Ingestion Service
Mengambil satu halaman lowongan per permintaan pengguna.

Urutan proses:
1. Validasi URL (hanya http dan https, tolak IP privat dan localhost untuk mencegah SSRF).
2. Periksa `robots.txt` domain. Jika tidak mengizinkan, hentikan dan minta pengguna menempel teks.
3. Ambil halaman dengan timeout 10 detik, maksimal 2 redirect, dan batas ukuran respons 2 MB.
4. Cari data terstruktur `JobPosting` (JSON-LD). Jika ada, gunakan sebagai sumber utama.
5. Jika tidak ada, gunakan heuristik teks dan tandai hasilnya "perlu dikonfirmasi".
6. Deteksi cara melamar:
   - Ada alamat email di teks lowongan, dan tidak ada tombol "Lamar" ke tautan eksternal: `apply_type = email`.
   - Ada tautan form: `apply_type = form`.
   - Halaman meminta login atau memblokir akses: `apply_type = manual`, dan pengguna diminta menempel teks.
7. Simpan hasil ke `job_posts` dengan `fetched_at`.

Batas: 30 permintaan per pengguna per hari. Rate limit per domain tujuan: 1 permintaan per 5 detik.

Sistem tidak menjalankan browser otomatis untuk melewati pembatasan, tidak menyimpan cookie pihak ketiga, dan tidak mencoba login ke situs lain.

### 4.5 Application Service
- Membuat draf lamaran dari kombinasi CV utama, lowongan, dan profil.
- Mengelola status (lihat state machine di bagian 6).
- Mencegah duplikasi: unique constraint pada `(user_id, job_post_id)`.

### 4.6 AI Personalization Service
Pipeline bertahap:

1. **Analisis lowongan**: ekstrak kata kunci wajib, kata kunci disukai, tanggung jawab, dan kualifikasi.
2. **Pemetaan CV**: cocokkan pengalaman dan keahlian asli pengguna dengan kata kunci. Hasilnya berupa daftar bukti dengan referensi ke bagian CV.
3. **Penyusunan**: LLM menyusun ringkasan dan poin pengalaman yang disusun ulang dari bukti, bukan dari imajinasi model. Prompt melarang penambahan fakta.
4. **Pemeriksaan grounding**: setiap angka, nama perusahaan, gelar, dan jabatan di hasil dibandingkan dengan CV asli. Yang tidak ditemukan ditandai sebagai "klaim baru".
5. **Humanizer**: tahap penyuntingan gaya bahasa. Tujuannya mengurangi pola teks yang kaku dan berulang, seperti pembuka generik, frasa klise, dan struktur kalimat yang seragam, tanpa mengubah fakta. Tahap ini hanya mengubah gaya, bukan isi. Pemeriksaan grounding dijalankan ulang setelah humanizer.
6. **Surat lamaran**: dibuat dengan kerangka yang sama dan dipersonalisasi dari nama perusahaan, posisi, dan poin lowongan.

Setiap output menyimpan versi prompt, model, dan referensi bukti, agar hasil bisa ditelusuri.

Keamanan AI:
- Input yang dikirim ke LLM hanya data yang diperlukan. Nomor KTP, nomor rekening, dan data sensitif lain dihapus sebelum dikirim.
- Teks dari halaman lowongan diperlakukan sebagai data, bukan instruksi. Prompt memisahkan instruksi sistem dari konten eksternal.
- Hasil LLM divalidasi dengan skema JSON sebelum disimpan.

### 4.7 Review and Approval Service
- Menyimpan setiap lamaran dalam keadaan terkunci setelah persetujuan. Jika pengguna mengedit, versi baru dibuat dan persetujuan harus diulang.
- Setiap tindakan persetujuan menulis baris di `approvals` berisi `application_id`, `version_hash` isi surat dan lampiran, `ip_address` (dihash), `user_agent`, dan waktu.
- Persetujuan dengan token sekali pakai untuk tindakan kirim (mencegah klik ganda).

### 4.8 Sending Service (Worker)
- Hanya mengambil lamaran dengan status `disetujui`.
- Menyusun pesan MIME (subjek, badan, lampiran PDF).
- Memanggil `users.messages.send` dengan token pengguna.
- Jeda acak 45 sampai 120 detik antar pengiriman dari akun yang sama.
- Batas harian 20 email per akun pengguna dan batas per jam 5 email.
- Retry eksponensial untuk error sementara (429, 5xx). Error permanen (401 karena token dicabut, alamat tidak valid) langsung ditandai `gagal`.
- Setelah berhasil, simpan `gmail_message_id`, `gmail_thread_id`, dan `sent_at`.
- Jika token dicabut, semua lamaran dalam antrean akun tersebut dibatalkan dan pengguna diberi tahu.

### 4.9 Gmail Connection Service
- OAuth dengan scope minimum: `gmail.send`. Scope lain tidak diminta.
- Token terenkripsi dengan AES-256-GCM. Kunci disimpan di KMS, bukan di kode atau environment biasa.
- Pencabutan memanggil endpoint revoke Google dan menghapus token lokal.

### 4.10 Admin dan Kill Switch
- Panel admin untuk menghentikan seluruh pengiriman (global) atau per pengguna.
- Flag `sending_enabled` dibaca oleh worker sebelum setiap pengiriman.
- Dashboard menampilkan jumlah pengiriman, error, dan lonjakan tidak wajar.

## 5. Keamanan

| Area | Kontrol |
|---|---|
| CSRF | Token sinkron per sesi pada setiap request yang mengubah data. SameSite=Lax sebagai lapisan tambahan |
| Bot | Turnstile pada daftar, login, reset password, dan submit lamaran pertama per sesi |
| Brute force | Rate limit login: 5 percobaan per 15 menit per akun dan per IP |
| Injeksi | Parameterized query melalui ORM. Output HTML dari AI disanitasi |
| SSRF | Validasi URL, pemblokiran IP privat, dan batas redirect pada ingestion |
| XSS | Content Security Policy ketat. Tidak ada render HTML mentah dari lowongan |
| Data at rest | Enkripsi database dan storage. Kolom sensitif (token, nomor HP) dienkripsi di level aplikasi |
| Audit | Log akses ke CV dan persetujuan disimpan minimal 2 tahun |
| Secrets | Tidak ada secret di repositori. Rotasi kunci setiap 90 hari |

## 6. Mesin Status Lamaran

```
draf ──▶ menunggu_persetujuan ──▶ disetujui ──▶ terkirim ──▶ dibalas ──▶ wawancara ──▶ diterima / ditolak
  │               │                    │              │
  ▼               ▼                    ▼              ▼
dibatalkan    dibatalkan           gagal          gagal (bounce)
                                   │
                                   ▼
                              menunggu_persetujuan (coba ulang setelah user setuju lagi)
```

Aturan transisi:
- `disetujui` hanya bisa dicapai dari `menunggu_persetujuan` melalui tindakan pengguna.
- `terkirim` hanya bisa dicapai dari `disetujui` oleh worker.
- Perubahan isi pada status `disetujui` mengembalikan lamaran ke `menunggu_persetujuan`.

## 7. Alur Data Utama

**Kirim lamaran (email):**
1. Pengguna menekan "Setujui dan kirim" pada satu lamaran.
2. Application Service memverifikasi status, token sekali pakai, dan batas harian.
3. Status diubah ke `disetujui`, lalu job masuk ke antrean.
4. Worker mengambil job, menyusun MIME, dan memanggil Gmail API.
5. Berhasil: status `terkirim`, simpan ID pesan. Gagal sementara: retry. Gagal permanen: status `gagal` dan notifikasi.

**Ekstraksi lowongan:**
1. Pengguna menempel URL.
2. Validasi dan pemeriksaan robots.txt dilakukan sinkron (cepat).
3. Pengambilan halaman dan ekstraksi dijalankan sebagai job agar tidak memblokir UI.
4. UI menampilkan hasil dan meminta konfirmasi jika ada field yang tidak pasti.

## 8. Kebutuhan Non-Fungsional Teknis

- **Latensi API** p95 di bawah 300 ms, kecuali endpoint AI dan ekstraksi yang bersifat asinkron.
- **Throughput worker**: sengaja dibatasi oleh aturan pengiriman, bukan oleh kapasitas server.
- **Backup**: database backup harian dengan retensi 30 hari. Uji pemulihan setiap bulan.
- **Skalabilitas awal**: satu region, dua instance API, satu instance worker yang bisa dinaikkan.
- **Lingkungan**: dev, staging, dan production. Data pribadi nyata tidak boleh dipakai di staging.

## 9. Pengujian

- Unit test untuk parser lowongan (dengan kumpulan sampel HTML dari berbagai format).
- Integration test untuk alur approval dan pengiriman (dengan Gmail sandbox atau mock).
- Test grounding: memastikan AI tidak menambahkan fakta yang tidak ada di CV pada kumpulan kasus uji.
- Test keamanan: CSRF, SSRF, upload file berbahaya, dan brute force.
- Test beban untuk antrean pengiriman dengan batas aktif.

## 10. Ketergantungan Eksternal

| Layanan | Catatan |
|---|---|
| Google (OAuth dan Gmail API) | Gmail `restricted scope`. Rilis awal dengan test user. Verifikasi dan audit keamanan diurus sebelum rilis publik |
| Cloudflare Turnstile | Gratis untuk penggunaan standar |
| Penyedia LLM | Pilih satu penyedia utama dan siapkan adapter untuk cadangan |
| Penyimpanan | Cloudflare R2 atau S3 |

## 11. Keputusan Teknis yang Perlu Disetujui

1. Penyedia LLM utama dan kebijakan retensi datanya.
2. Apakah ekstraksi PDF cukup dengan pdf-parse atau perlu OCR untuk CV hasil scan.
3. Lokasi server (Indonesia atau Singapura) dengan mempertimbangkan UU PDP dan latensi.
