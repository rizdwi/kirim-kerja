# BSD: Skema Backend

Versi: 1.0
Status: Draft
Database: PostgreSQL 16
Acuan: TRD v1.0

---

## 1. Konvensi

- Nama tabel dan kolom memakai `snake_case` dalam bahasa Inggris. Istilah bisnis yang sudah umum di UI boleh tetap dalam Bahasa Indonesia di nilai enum.
- Primary key: `uuid` (versi 7, urut waktu) bernama `id`.
- Setiap tabel memiliki `created_at` dan `updated_at` (`timestamptz`, default `now()`).
- Penghapusan data pengguna menggunakan proses terjadwal. Kolom `deleted_at` dipakai di tabel tertentu saja.
- Kolom sensitif dienkripsi di level aplikasi dengan AES-256-GCM. Nama kolomnya diberi akhiran `_enc` dan berisi `bytea`.
- Semua foreign key memiliki indeks.

## 2. Diagram Relasi

```
users ─┬─< user_identities          (login Google dan email)
       ├─< email_verifications
       ├─< password_resets
       ├─< documents ─< document_versions
       │                    │
       │                    └─< document_pages (untuk compile)
       ├─< cv_profiles ───────────── (CV utama dan teks hasil ekstraksi)
       ├─< job_posts   (lowongan milik user, lewat job_submissions)
       ├─< applications ─┬─< application_versions
       │                 └─< approvals
       ├─< gmail_connections
       ├─< email_sends
       ├─< daily_usage
       └─< audit_logs

job_posts ──< applications
```

Catatan: `job_posts` bersifat milik bersama bila lowongan yang sama dimasukkan lebih dari satu pengguna. Relasi pengguna ke lowongan dicatat di `job_submissions`.

## 3. Tipe Enum

```sql
CREATE TYPE apply_type AS ENUM ('email', 'form', 'manual');

CREATE TYPE application_status AS ENUM (
  'draf',
  'menunggu_persetujuan',
  'disetujui',
  'dalam_antrean_kirim',
  'terkirim',
  'gagal',
  'dibatalkan',
  'dibalas',
  'wawancara',
  'diterima',
  'ditolak'
);

CREATE TYPE approval_action AS ENUM (
  'setujui_kirim',
  'edit_isi',
  'ganti_lampiran',
  'konfirmasi_klaim',
  'hapus_klaim',
  'batalkan'
);

CREATE TYPE document_status AS ENUM ('mengunggah', 'memindai', 'siap', 'ditolak', 'dihapus');

CREATE TYPE job_extraction_status AS ENUM ('berhasil', 'perlu_dicek', 'gagal', 'butuh_input_manual');

CREATE TYPE email_send_status AS ENUM ('antre', 'terkirim', 'gagal_sementara', 'gagal_permanen');
```

## 4. Tabel

### 4.1 `users`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| email | citext | tidak | Unik, huruf kecil |
| full_name | varchar(120) | tidak | |
| phone_enc | bytea | ya | Nomor HP terenkripsi |
| phone_hash | bytea | ya | Hash untuk pencarian dan cek duplikat |
| city | varchar(80) | ya | |
| interests | varchar(64)[] | ya | Maksimal 3 |
| salary_expectation_enc | bytea | ya | Opsional, terenkripsi |
| email_verified_at | timestamptz | ya | |
| status | varchar(20) | tidak | `aktif`, `dibekukan`, `dihapus_terjadwal` |
| sending_enabled | boolean | tidak | Kill switch per pengguna, default true |
| deletion_requested_at | timestamptz | ya | |
| created_at | timestamptz | tidak | |
| updated_at | timestamptz | tidak | |

Indeks: unik pada `email`. Indeks pada `status`.

### 4.2 `user_identities`

Menyimpan metode login. Satu pengguna bisa punya beberapa identitas.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK ke users, `ON DELETE CASCADE` |
| provider | varchar(20) | tidak | `password`, `google` |
| provider_subject | varchar(255) | ya | Subject dari Google. Null untuk password |
| password_hash | varchar(255) | ya | Argon2id. Null untuk Google |
| last_login_at | timestamptz | ya | |
| created_at | timestamptz | tidak | |

Constraint: unik `(provider, provider_subject)` bila `provider_subject` tidak null. Unik `(user_id, provider)`.

### 4.3 `email_verifications` dan `password_resets`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| token_hash | bytea | Hash SHA-256 dari token. Token asli tidak disimpan |
| expires_at | timestamptz | Verifikasi 24 jam, reset 1 jam |
| used_at | timestamptz | Null jika belum dipakai |
| created_at | timestamptz | |

### 4.4 `documents`

Dokumen mentah yang diunggah atau hasil compile. Satu baris mewakili satu dokumen logis.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK |
| display_name | varchar(160) | tidak | Nama yang diberikan pengguna |
| label | varchar(40) | ya | Misalnya "Sertifikat", "Transkrip" |
| kind | varchar(20) | tidak | `upload`, `compiled` |
| status | document_status | tidak | |
| current_version_id | uuid | ya | FK ke document_versions (ditambahkan setelah tabel dibuat) |
| created_at | timestamptz | tidak | |
| updated_at | timestamptz | tidak | |
| deleted_at | timestamptz | ya | Soft delete |

Indeks: `(user_id, deleted_at)`.

### 4.5 `document_versions`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| document_id | uuid | tidak | FK |
| storage_key | varchar(255) | tidak | Nama acak di object storage |
| original_filename_enc | bytea | ya | Nama asli, terenkripsi |
| mime_type | varchar(80) | tidak | Hasil deteksi magic bytes |
| size_bytes | bigint | tidak | |
| sha256 | char(64) | tidak | Untuk deduplikasi dan integritas |
| page_count | int | ya | |
| extracted_text | text | ya | Teks untuk AI. Disimpan di DB, bukan di storage |
| extraction_status | varchar(20) | tidak | `belum`, `berhasil`, `kosong`, `gagal` |
| malware_scan_status | varchar(20) | tidak | `menunggu`, `bersih`, `terinfeksi` |
| created_at | timestamptz | tidak | |

Constraint: unik `(document_id, sha256)`. Batas ukuran dicek di aplikasi (10 MB per file, 25 MB untuk hasil compile).

### 4.6 `document_pages`

Dipakai untuk compile agar urutan halaman tersimpan dan bisa diubah.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| compiled_version_id | uuid | tidak | FK ke document_versions |
| source_version_id | uuid | tidak | FK ke document_versions (file asal) |
| source_page_number | int | tidak | Nomor halaman di file asal, mulai dari 1 |
| position | int | tidak | Urutan di hasil compile |

Constraint: unik `(compiled_version_id, position)`.

### 4.7 `cv_profiles`

Satu CV utama per pengguna. Versi CV yang dipakai untuk personalisasi disimpan sebagai snapshot.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK |
| source_version_id | uuid | tidak | FK ke document_versions |
| structured_json | jsonb | ya | Hasil ekstraksi terstruktur: pengalaman, pendidikan, keahlian |
| skills | varchar(80)[] | ya | Keahlian yang terdeteksi |
| is_primary | boolean | tidak | Hanya satu true per pengguna (partial unique index) |
| created_at | timestamptz | tidak | |

Indeks unik parsial: `(user_id) WHERE is_primary = true`.

Catatan: `structured_json` berisi bukti asal dengan format `{ "pengalaman": [{ "id": "exp_1", "perusahaan": "...", "jabatan": "...", "poin": [...] }] }`. ID bukti dipakai untuk pemeriksaan grounding.

### 4.8 `job_posts`

Data lowongan yang diekstrak. Bisa dipakai bersama oleh banyak pengguna lewat URL yang sama.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| source_url | varchar(2048) | ya | URL asal (null jika input teks) |
| source_url_hash | bytea | ya | Hash untuk deduplikasi |
| source_domain | varchar(255) | ya | Untuk statistik dan robots cache |
| title | varchar(200) | tidak | |
| company | varchar(200) | tidak | |
| location | varchar(200) | ya | |
| description | text | ya | Teks lowongan yang sudah dibersihkan |
| apply_type | apply_type | tidak | |
| apply_email | citext | ya | Wajib jika apply_type = email |
| apply_form_url | varchar(2048) | ya | Wajib jika apply_type = form |
| posted_at | date | ya | Tanggal tayang bila terdeteksi |
| extraction_status | job_extraction_status | tidak | |
| extraction_method | varchar(20) | tidak | `json_ld`, `heuristik`, `manual` |
| fetched_at | timestamptz | ya | |
| is_active | boolean | tidak | Default true |
| created_at | timestamptz | tidak | |
| updated_at | timestamptz | tidak | |

Constraint: `CHECK ((apply_type = 'email') = (apply_email IS NOT NULL))`. `CHECK (apply_type <> 'form' OR apply_form_url IS NOT NULL)`.
Indeks: unik `source_url_hash` (bila tidak null). Indeks pada `company`.

Catatan: `job_posts` tidak menyimpan data pribadi pengguna.

### 4.9 `job_submissions`

Hubungan pengguna dengan lowongan, termasuk teks yang ditempel manual.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK |
| job_post_id | uuid | tidak | FK |
| input_mode | varchar(10) | tidak | `tautan`, `teks` |
| raw_input_enc | bytea | ya | Teks mentah yang ditempel, terenkripsi, dihapus setelah 30 hari |
| created_at | timestamptz | tidak | |

Constraint: unik `(user_id, job_post_id)`.

### 4.10 `applications`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK |
| job_post_id | uuid | tidak | FK |
| cv_profile_id | uuid | tidak | FK, CV yang dipakai |
| current_version_id | uuid | ya | FK ke application_versions |
| approved_version_id | uuid | ya | Versi yang disetujui terakhir |
| status | application_status | tidak | |
| recipient_email | citext | ya | Bisa diubah pengguna sebelum kirim |
| status_note | varchar(255) | ya | Pesan ringkas, misalnya alasan gagal |
| approved_at | timestamptz | ya | |
| sent_at | timestamptz | ya | |
| created_at | timestamptz | tidak | |
| updated_at | timestamptz | tidak | |

Constraint: unik `(user_id, job_post_id)` sebagai pencegahan duplikasi.
Indeks: `(user_id, status)`, `(status, approved_at)` untuk worker.

Catatan: pencegahan lamaran ke perusahaan yang sama dalam 30 hari ditangani di layanan dengan query pada `(user_id, company)` dan `sent_at`.

### 4.11 `application_versions`

Isi lamaran yang bisa diedit. Setiap perubahan membuat versi baru dan membuat persetujuan sebelumnya tidak berlaku.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| application_id | uuid | tidak | FK |
| version_number | int | tidak | Mulai dari 1 |
| subject | varchar(255) | tidak | |
| body_text | text | tidak | Isi surat (plain text) |
| body_html | text | ya | Untuk tampilan dan email HTML bila dipakai |
| cv_document_version_id | uuid | tidak | FK ke document_versions, file CV yang dilampirkan |
| prompt_version | varchar(40) | ya | Versi prompt yang dipakai AI |
| model_name | varchar(80) | ya | Model yang dipakai |
| humanizer_version | varchar(40) | ya | Versi tahap penyuntingan gaya |
| content_hash | char(64) | tidak | SHA-256 dari subject, body_text, dan cv_document_version_id |
| generated_by | varchar(10) | tidak | `ai`, `pengguna`, `ai_diedit` |
| created_at | timestamptz | tidak | |

Constraint: unik `(application_id, version_number)`.

### 4.12 `application_claims`

Klaim baru yang muncul dari hasil AI dan wajib dikonfirmasi.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| application_version_id | uuid | tidak | FK |
| claim_text | varchar(500) | tidak | Kalimat klaim |
| claim_type | varchar(20) | tidak | `angka`, `jabatan`, `perusahaan`, `gelar`, `keahlian`, `lainnya` |
| source_evidence_id | varchar(40) | ya | ID bukti terdekat di structured_json. Null jika tidak ditemukan |
| confirmed_at | timestamptz | ya | Diisi saat pengguna mengonfirmasi |
| removed_at | timestamptz | ya | Diisi saat pengguna menghapus klaim |
| created_at | timestamptz | tidak | |

Constraint: `CHECK (NOT (confirmed_at IS NOT NULL AND removed_at IS NOT NULL))`.

### 4.13 `approvals`

Log bukti persetujuan. Tabel ini bersifat append-only: tidak ada UPDATE atau DELETE dari aplikasi.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| application_id | uuid | tidak | FK |
| application_version_id | uuid | tidak | FK. Versi yang disetujui |
| user_id | uuid | tidak | FK |
| action | approval_action | tidak | |
| content_hash | char(64) | tidak | Salinan hash versi saat disetujui |
| recipient_email | citext | ya | Alamat tujuan saat disetujui |
| ip_hash | bytea | ya | Hash IP, bukan IP mentah |
| user_agent | varchar(255) | ya | |
| idempotency_key | uuid | ya | Mencegah klik ganda |
| created_at | timestamptz | tidak | |

Constraint: unik `idempotency_key` bila tidak null.
Aturan database: trigger yang menolak UPDATE dan DELETE pada tabel ini.

### 4.14 `email_sends`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| application_id | uuid | tidak | FK |
| approval_id | uuid | tidak | FK ke approvals, wajib ada |
| user_id | uuid | tidak | FK |
| status | email_send_status | tidak | |
| attempt_count | int | tidak | Default 0 |
| next_attempt_at | timestamptz | ya | Untuk retry |
| gmail_message_id | varchar(64) | ya | Dari respons Gmail API |
| gmail_thread_id | varchar(64) | ya | |
| last_error_code | varchar(40) | ya | Kode error, bukan pesan mentah |
| sent_at | timestamptz | ya | |
| created_at | timestamptz | tidak | |

Constraint: unik `approval_id` (satu persetujuan, satu pengiriman).
Indeks: `(status, next_attempt_at)` untuk worker.

### 4.15 `gmail_connections`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | uuid | tidak | PK |
| user_id | uuid | tidak | FK |
| gmail_address | citext | tidak | |
| refresh_token_enc | bytea | tidak | Terenkripsi, KMS |
| access_token_enc | bytea | ya | Opsional, cache singkat |
| access_token_expires_at | timestamptz | ya | |
| scopes | varchar(255)[] | tidak | Harus berisi `gmail.send` |
| is_active | boolean | tidak | |
| revoked_at | timestamptz | ya | |
| created_at | timestamptz | tidak | |
| updated_at | timestamptz | tidak | |

Constraint: unik `(user_id)` untuk satu Gmail aktif per pengguna pada rilis pertama.

### 4.16 `daily_usage`

Penghitung batas harian. Dipisahkan agar pengecekan batas cepat dan atomik.

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| user_id | uuid | tidak | FK |
| usage_date | date | tidak | Zona waktu Asia/Jakarta |
| emails_sent | int | tidak | Default 0 |
| job_fetches | int | tidak | Default 0 |
| ai_generations | int | tidak | Default 0 |

Primary key: `(user_id, usage_date)`.
Pembaruan dilakukan dengan `INSERT ... ON CONFLICT ... DO UPDATE` dan kondisi `emails_sent < limit`.

### 4.17 `audit_logs`

| Kolom | Tipe | Null | Keterangan |
|---|---|---|---|
| id | bigserial | tidak | PK |
| user_id | uuid | ya | Null untuk peristiwa sistem |
| actor | varchar(20) | tidak | `pengguna`, `sistem`, `admin` |
| event | varchar(60) | tidak | Misalnya `cv_diakses`, `kill_switch_aktif` |
| target_type | varchar(40) | ya | |
| target_id | uuid | ya | |
| metadata | jsonb | ya | Tanpa data pribadi mentah |
| created_at | timestamptz | tidak | |

Indeks: `(user_id, created_at)`, `(event, created_at)`. Partisi bulanan bila volume besar. Retensi minimal 2 tahun.

### 4.18 `robots_cache`

| Kolom | Tipe | Keterangan |
|---|---|---|
| domain | varchar(255) | PK |
| robots_txt | text | Isi terakhir |
| allowed_paths_hash | bytea | |
| fetched_at | timestamptz | |
| expires_at | timestamptz | Biasanya 24 jam |

## 5. Keamanan Data

| Data | Perlakuan |
|---|---|
| Password | Argon2id, tidak pernah disimpan dalam bentuk asli |
| Nomor HP | Dienkripsi (`phone_enc`) dan di-hash untuk pencarian (`phone_hash`) |
| Token Gmail | Dienkripsi dengan kunci dari KMS. Kunci dirotasi setiap 90 hari |
| CV (file) | Object storage privat, nama acak, akses lewat signed URL 5 menit |
| Teks CV (`extracted_text`) | Dienkripsi di level kolom bila kebijakan mensyaratkan. Tetap dihapus saat akun dihapus |
| Teks lowongan mentah | Dihapus setelah 30 hari |
| IP | Hanya hash di `approvals` |
| Log persetujuan | Tidak boleh diubah atau dihapus selama masa retensi. Identitas dianonimkan saat akun dihapus, isi hash tetap ada |

## 6. Penghapusan Akun

Proses terjadwal (harian) untuk akun dengan `deletion_requested_at` lebih dari 30 hari:

1. Batalkan semua lamaran berstatus `menunggu_persetujuan`, `disetujui`, dan `dalam_antrean_kirim`.
2. Cabut dan hapus `gmail_connections` (panggil revoke Google).
3. Hapus `documents`, `document_versions`, dan file di storage.
4. Hapus `cv_profiles`, `job_submissions`, `raw_input_enc`, `email_verifications`, `password_resets`, dan `user_identities`.
5. Pada `applications`, `application_versions`, dan `email_sends` yang sudah terkirim: hapus isi (`body_text`, `body_html`, `subject`), pertahankan metadata dan ID agar integritas `approvals` tetap ada.
6. Anonimkan `users`: ganti `email` dengan `hapus_<uuid>@anon.local`, kosongkan kolom pribadi.
7. Catat di `audit_logs`.

## 7. Migrasi dan Versi

- Migrasi dikelola dengan alat migrasi (misalnya Prisma Migrate atau Drizzle Kit) dan disimpan di repositori.
- Setiap perubahan skema yang memengaruhi `approvals` atau `application_versions` wajib ditinjau dua orang.
- Tidak ada migrasi destruktif di produksi tanpa cadangan yang sudah diuji.

## 8. Contoh Query Penting

**Antrean worker:**
```sql
SELECT es.id
FROM email_sends es
JOIN gmail_connections gc ON gc.user_id = es.user_id AND gc.is_active
WHERE es.status IN ('antre', 'gagal_sementara')
  AND (es.next_attempt_at IS NULL OR es.next_attempt_at <= now())
ORDER BY es.next_attempt_at NULLS FIRST
LIMIT 50
FOR UPDATE OF es SKIP LOCKED;
```

**Pengecekan batas harian dan penambahan atomik:**
```sql
INSERT INTO daily_usage (user_id, usage_date, emails_sent)
VALUES ($1, $2, 1)
ON CONFLICT (user_id, usage_date)
DO UPDATE SET emails_sent = daily_usage.emails_sent + 1
WHERE daily_usage.emails_sent < $3
RETURNING emails_sent;
```
Jika tidak ada baris yang dikembalikan, batas sudah tercapai.

**Pencegahan lamaran berulang ke perusahaan yang sama dalam 30 hari:**
```sql
SELECT a.id
FROM applications a
JOIN job_posts jp ON jp.id = a.job_post_id
WHERE a.user_id = $1
  AND lower(jp.company) = lower($2)
  AND a.sent_at > now() - interval '30 days';
```

## 9. Pengisian Data Awal

- Tipe enum dan kode status dibuat sebagai seed.
- Tidak ada data pribadi di seed. Data uji dibuat dengan generator dan nama palsu.
- Robots cache diisi saat dibutuhkan, tidak perlu seed.
