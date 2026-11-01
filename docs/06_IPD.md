# IPD: Rencana Implementasi

Versi: 1.0
Status: Draft
Acuan: PRD v1.0, TRD v1.0, AFD v1.0, DBD v1.0, BSD v1.0

---

## 1. Ringkasan

Dokumen ini membagi pengembangan Rilis 1 (MVP) menjadi fase, epik, dan tugas, lengkap dengan urutan kerja, kriteria selesai, dan titik keputusan. Estimasi awal untuk tim kecil (2 backend, 1 frontend, 1 fullstack, 1 desainer paruh waktu, 1 QA paruh waktu) adalah sekitar 14 sampai 16 minggu hingga rilis tertutup.

## 2. Prinsip Implementasi

1. **Jalur approval dibangun lebih dulu.** Fitur pengiriman tidak boleh berjalan sebelum alur persetujuan teruji penuh.
2. **Gmail dipasang sejak awal dengan test user.** Proses verifikasi Google dimulai sebelum rilis publik karena butuh waktu.
3. **Grounding AI diuji sebelum personalisasi dibuka ke pengguna.**
4. **Fitur yang tidak masuk PRD tidak dibangun**, termasuk scraping dan pengisian form pihak ketiga.
5. **Setiap fase punya gerbang keluar** (exit gate) yang harus dilewati sebelum fase berikutnya dimulai.

## 3. Fase dan Jadwal

| Fase | Durasi | Fokus | Gerbang keluar |
|---|---|---|---|
| 0. Persiapan | 1 minggu | Repositori, CI/CD, lingkungan, keputusan teknis | Lingkungan dev dan staging berjalan |
| 1. Fondasi | 2 minggu | Auth, skema DB, profil, Turnstile, CSRF | Login, daftar, verifikasi email lolos QA |
| 2. CV | 2 minggu | Upload, pemindaian, ekstraksi teks, compile, storage | Upload dan compile lolos uji keamanan dasar |
| 3. Lowongan | 2 minggu | Ingestion tautan, robots, deteksi cara melamar, input manual | Ekstraksi lolos set uji 50 tautan nyata (lihat 6) |
| 4. AI dan grounding | 3 minggu | Pipeline personalisasi, pemeriksaan klaim, humanizer | Tingkat klaim tidak terverifikasi di bawah target (lihat 6) |
| 5. Approval dan pengiriman | 3 minggu | Layar review, persetujuan, Gmail, worker, kill switch | Uji end-to-end lolos tanpa pengiriman tanpa persetujuan |
| 6. Pelacakan dan pengaturan | 1 minggu | Status, riwayat, pengaturan, hapus akun | Semua alur AFD tercakup |
| 7. Hardening dan beta | 2 minggu | Pen test, audit privasi, beta 20 sampai 50 pengguna | Tidak ada bug severity tinggi terbuka |

Total: sekitar 16 minggu. Fase 1 sampai 3 bisa berjalan paralel sebagian setelah fondasi selesai.

## 4. Rincian Epik

### Epik 0: Persiapan

- [ ] Inisialisasi monorepo (frontend, backend, worker, bersama)
- [ ] Setup linting, formatting, dan pre-commit hook
- [ ] Setup CI: test, build, scan dependensi, scan secret
- [ ] Setup lingkungan dev, staging, production (infrastruktur sebagai kode)
- [ ] Setup Sentry dan OpenTelemetry
- [ ] Ajukan proyek Google Cloud dan OAuth consent screen (mode testing)
- [ ] Daftarkan akun Cloudflare dan buat widget Turnstile per lingkungan
- [ ] Pilih penyedia LLM dan buat akun, siapkan kuota awal
- [ ] Siapkan kebijakan privasi dan syarat layanan (draf awal, ditinjau penasihat hukum)
- [ ] Keputusan: lokasi server dan penyedia penyimpanan

### Epik 1: Fondasi

- [ ] Skema awal: `users`, `user_identities`, `email_verifications`, `password_resets`
- [ ] Migrasi dan seed
- [ ] Register dengan email dan password (Argon2id)
- [ ] Verifikasi email (token hash, kedaluwarsa 24 jam, sekali pakai)
- [ ] Login email dan password, rate limit 5 per 15 menit
- [ ] Google OAuth untuk login (scope openid, email, profile)
- [ ] Penautan akun bila email sudah terdaftar
- [ ] Reset password
- [ ] Sesi dengan cookie HttpOnly, Secure, SameSite=Lax; rotasi refresh token
- [ ] Turnstile di register, login, reset password; verifikasi di server
- [ ] Token CSRF untuk semua request yang mengubah data
- [ ] Halaman Profil dasar dan validasi nomor HP (E.164)
- [ ] Wizard onboarding (kerangka, langkah 1 dan 4)

Gerbang: test otomatis untuk alur auth lolos, dan uji manual CSRF (request tanpa token ditolak) dan Turnstile (token palsu ditolak).

### Epik 2: CV dan dokumen

- [ ] Skema: `documents`, `document_versions`, `document_pages`, `cv_profiles`
- [ ] Upload ke storage privat dengan nama acak
- [ ] Validasi tipe file dengan magic bytes, batas ukuran 10 MB
- [ ] Integrasi pemindaian malware (ClamAV atau setara) sebagai job terpisah
- [ ] Status dokumen: mengunggah, memindai, siap, ditolak
- [ ] Ekstraksi teks PDF dan deteksi CV hasil scan
- [ ] Penyimpanan `extracted_text` dan ringkasan terstruktur (`structured_json`)
- [ ] Penetapan CV utama
- [ ] Compile: pengaturan urutan, penggabungan dengan pdf-lib, output PDF atau ZIP
- [ ] Preview hasil compile (thumbnail halaman pertama)
- [ ] Signed URL untuk unduhan
- [ ] Deduplikasi dengan SHA-256

Catatan: konversi DOCX ke PDF memakai LibreOffice headless. Ini ditandai sebagai risiko dan diuji dengan 30 file contoh. Jika tidak stabil, DOCX ditolak sementara dan hanya PDF yang diterima pada rilis awal.

### Epik 3: Lowongan

- [ ] Skema: `job_posts`, `job_submissions`, `robots_cache`
- [ ] Validasi URL dan pemblokiran IP privat (SSRF)
- [ ] Pengambilan halaman: timeout 10 detik, redirect maksimal 2, batas 2 MB
- [ ] Pemeriksaan robots.txt dengan cache 24 jam
- [ ] Parser JSON-LD `JobPosting`
- [ ] Heuristik ekstraksi sebagai cadangan, dengan label "perlu dicek"
- [ ] Deteksi cara melamar: email, form, manual
- [ ] Alur input teks manual untuk halaman yang tidak bisa dibaca
- [ ] Deteksi duplikasi lowongan (`source_url_hash`)
- [ ] Batas harian ambil halaman (30 per pengguna) dan rate limit per domain
- [ ] Penolakan sumber yang dikecualikan (Glint) dengan pesan jelas
- [ ] Tambah banyak tautan sekaligus (maksimal 10 per batch)
- [ ] Layar tambah lowongan dan kartu hasil

Gerbang: set uji 50 tautan dari berbagai sumber (dengan izin dan hanya halaman publik untuk pengujian). Target: minimal 80% judul dan perusahaan benar, dan tidak ada akses ke halaman yang melanggar robots.txt.

### Epik 4: AI dan grounding

- [ ] Skema: `application_versions`, `application_claims`, `applications` (dasar)
- [ ] Adapter LLM dengan dukungan cadangan
- [ ] Prompt analisis lowongan (ekstraksi kata kunci, tanggung jawab, kualifikasi), keluaran JSON tervalidasi
- [ ] Prompt pemetaan CV ke bukti (dengan ID bukti)
- [ ] Prompt penyusunan lamaran dan surat, dengan larangan menambah fakta
- [ ] Pemeriksaan grounding: angka, nama perusahaan, jabatan, gelar dibandingkan dengan `structured_json`
- [ ] Penandaan klaim tidak terverifikasi ke `application_claims`
- [ ] Tahap humanizer (lihat catatan di bawah)
- [ ] Pemeriksaan grounding ulang setelah humanizer
- [ ] Pencatatan versi prompt, model, dan humanizer di setiap versi
- [ ] Pembersihan data sensitif sebelum dikirim ke LLM (KTP, rekening, dan sejenisnya)
- [ ] Pemisahan konten lowongan sebagai data, bukan instruksi
- [ ] Set uji grounding: 100 kasus CV dan lowongan, termasuk kasus jebakan (CV yang tidak punya pengalaman yang diminta)

Gerbang: nol klaim tidak terverifikasi yang lolos ke layar review tanpa penandaan. Tingkat klaim yang salah (fakta palsu yang lolos grounding) di set uji di bawah 1%.

Catatan humanizer: skill humanizer tidak tersedia di lingkungan ini, jadi tim perlu memastikan implementasinya sendiri. Ada dua pilihan: (a) membangun modul penyuntingan gaya dengan daftar pola yang dihindari, aturan variasi struktur kalimat, dan larangan mengubah fakta; atau (b) memakai skill humanizer dari tim jika sudah tersedia dan memenuhi aturan yang sama. Apa pun pilihannya, tahap ini hanya boleh mengubah gaya, dan pemeriksaan grounding wajib dijalankan setelahnya.

### Epik 5: Approval dan pengiriman

- [ ] Skema: `approvals` (dengan trigger anti UPDATE dan DELETE), `email_sends`, `gmail_connections`, `daily_usage`
- [ ] OAuth Gmail dengan scope `gmail.send` saja
- [ ] Enkripsi token dengan KMS dan AES-256-GCM
- [ ] Pencabutan Gmail (panggil revoke Google dan hapus token)
- [ ] Layar antrean dan daftar lamaran
- [ ] Layar review: penerima, subjek, lampiran, isi, panel perubahan, klaim
- [ ] Kotak konfirmasi klaim dan penguncian tombol kirim sampai semua klaim dikonfirmasi
- [ ] Edit isi membuat versi baru dan membatalkan persetujuan sebelumnya
- [ ] Persetujuan dengan idempotency key
- [ ] Persetujuan massal: satu persetujuan per item
- [ ] Dialog konfirmasi kirim
- [ ] Worker pengiriman: SKIP LOCKED, jeda acak 45 sampai 120 detik, retry eksponensial
- [ ] Penyusunan MIME dengan lampiran PDF
- [ ] Batas harian 20 dan batas per jam 5
- [ ] Penanganan error: 429 dan 5xx (retry), 401 dan alamat tidak valid (gagal permanen)
- [ ] Token dicabut: batalkan antrean dan beri tahu pengguna
- [ ] Kill switch global dan per pengguna
- [ ] Penanganan batas harian di UI

Gerbang: uji end-to-end. Tidak ada `email_sends` yang berstatus `antre` tanpa baris `approvals` yang sesuai. Ini diperiksa dengan query otomatis di CI.

### Epik 6: Pelacakan dan pengaturan

- [ ] Halaman Lamaran Saya dengan filter status, perusahaan, tanggal
- [ ] Detail lamaran read-only dan riwayat persetujuan
- [ ] Ubah status manual dan tanggal wawancara
- [ ] Peringatan lamaran berulang ke perusahaan yang sama (30 hari)
- [ ] Halaman CV Saya: daftar, CV utama, ganti nama, hapus
- [ ] Peringatan saat CV utama berubah pada lamaran yang belum terkirim
- [ ] Pengaturan: profil, Gmail, privasi, unduh data (ZIP JSON dan CV)
- [ ] Hapus akun dengan konfirmasi dua langkah
- [ ] Job terjadwal penghapusan data (30 hari)
- [ ] Notifikasi dalam aplikasi dan email untuk peristiwa di bagian 6 AFD

### Epik 7: Hardening dan beta

- [ ] Penetrasi test (pihak ketiga) untuk auth, upload, SSRF, CSRF, dan IDOR
- [ ] Audit privasi: data yang dikirim ke LLM, log, dan retensi
- [ ] Uji pemulihan backup
- [ ] Uji beban antrean pengiriman
- [ ] Review aksesibilitas (WCAG 2.1 AA)
- [ ] Uji responsif pada perangkat Android dan iOS nyata
- [ ] Beta tertutup 20 sampai 50 pengguna, dengan Gmail sebagai test user
- [ ] Ringkasan umpan balik beta dan keputusan prioritas
- [ ] Pengajuan verifikasi Gmail restricted scope dan audit CASA (dimulai sejak epik 0, diselesaikan di sini)

## 5. Urutan Tugas Kritis

```
Epik 0 ─▶ Epik 1 ─▶ Epik 2 ─▶ Epik 3 ─┐
                                      ├─▶ Epik 4 ─▶ Epik 5 ─▶ Epik 6 ─▶ Epik 7
                    Gmail OAuth (0) ──┘
```

Jalur kritis: Fondasi, CV, Lowongan, AI, Approval, lalu hardening. Keterlambatan di Epik 4 (AI) akan langsung menggeser Epik 5. Karena itu, set uji grounding dibuat paralel mulai minggu ke-5.

## 6. Kriteria Keberhasilan Teknis

| Area | Target |
|---|---|
| Akurasi ekstraksi lowongan | Minimal 80% judul dan perusahaan benar pada set uji 50 tautan |
| Grounding | Klaim palsu lolos di bawah 1% pada set uji 100 kasus |
| Keamanan approval | 0 email terkirim tanpa persetujuan (diuji otomatis) |
| Keandalan pengiriman | Minimal 98% lamaran disetujui berhasil terkirim, di luar kegagalan dari pihak penerima |
| Waktu personalisasi | Median di bawah 60 detik per lamaran |
| Kinerja halaman | Muat utama di bawah 2 detik pada jaringan 4G |
| Uptime | 99,5% |

## 7. Strategi Pengujian

| Jenis | Cakupan | Alat yang disarankan |
|---|---|---|
| Unit | Logika bisnis, parser, validasi, state machine | Vitest atau Jest |
| Integrasi | API, database, worker, Gmail (mock dan sandbox) | Supertest, Testcontainers |
| End-to-end | Alur utama dari daftar sampai terkirim | Playwright |
| Keamanan | CSRF, SSRF, upload, IDOR, brute force | OWASP ZAP, uji manual |
| Grounding | Set uji AI | Skrip evaluasi dengan set emas |
| Beban | Antrean pengiriman dan API | k6 |
| Aksesibilitas | Halaman utama dan review | axe, uji manual dengan pembaca layar |

Setiap pull request wajib lulus unit dan integrasi. Alur end-to-end dijalankan sebelum merge ke branch rilis.

## 8. Lingkungan dan Rilis

- **Dev**: setiap pengembang. Data palsu.
- **Staging**: menyerupai production. Data uji. Gmail menggunakan akun uji dan kill switch aktif secara default.
- **Production**: rilis melalui tag. Migrasi dijalankan sebelum deploy aplikasi. Rollback disiapkan untuk setiap rilis.

Rilis tertutup pertama dilakukan dengan flag `sending_enabled = false` secara global, lalu dibuka bertahap per pengguna beta.

## 9. Operasional Setelah Rilis

- Dashboard pemantauan: pengiriman per jam, error per kode, batas harian yang tercapai, latensi AI, dan keberhasilan ekstraksi.
- Peringatan otomatis bila tingkat error pengiriman di atas 5% dalam 30 menit.
- Peringatan bila ada lonjakan pengiriman tidak wajar dari satu akun.
- Prosedur kill switch tertulis dan diuji sebulan sekali.
- Rotasi kunci enkripsi setiap 90 hari.
- Tinjauan kebijakan AI dan penyedia LLM setiap kuartal.

## 10. Risiko Implementasi

| Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|
| Verifikasi Gmail restricted scope lama | Tinggi | Tinggi | Mulai pengajuan di epik 0. Rilis awal dengan test user |
| Konversi DOCX tidak stabil | Sedang | Sedang | Batasi ke PDF pada rilis awal |
| Kualitas grounding AI kurang | Sedang | Tinggi | Set uji sejak awal, gerbang keluar yang ketat, review manusia |
| Struktur halaman lowongan berubah | Tinggi | Sedang | Prioritas JSON-LD, input manual sebagai cadangan |
| Gmail membatasi pengiriman | Sedang | Sedang | Batas konservatif, retry, pemberitahuan pengguna |
| Biaya LLM melebihi perkiraan | Sedang | Sedang | Batas pemakaian per pengguna, caching hasil analisis lowongan |
| Persyaratan hukum berubah atau butuh tinjauan lebih | Sedang | Tinggi | Tinjauan penasihat hukum sebelum beta, catatan privasi yang dapat diperbarui |
| Anggota tim keluar | Sedang | Sedang | Dokumentasi, pasangan review kode, akses bersama |

## 11. Keputusan yang Dibutuhkan Sebelum Epik 1

1. Stack final (NestJS atau Fastify, Next.js).
2. Penyedia LLM utama dan kebijakan retensi datanya.
3. Penyedia object storage dan lokasi server.
4. Siapa yang menjadi penanggung jawab kepatuhan dan privasi.
5. Anggaran untuk pemindaian malware, LLM, dan penasihat hukum.
6. Apakah rilis awal membatasi jumlah pengguna beta, dan berapa jumlahnya.
