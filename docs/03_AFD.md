# AFD: Alur Aplikasi

Versi: 1.0
Status: Draft
Acuan: PRD v1.0, TRD v1.0

---

## 1. Prinsip Alur

1. **Sedikit langkah, jelas hasilnya.** Setiap layar punya satu tujuan utama.
2. **Tidak ada pengiriman tanpa persetujuan.** Tombol kirim hanya muncul di layar review.
3. **Pengguna selalu tahu apa yang terjadi.** Setiap status dan kegagalan dijelaskan dalam bahasa sederhana.
4. **Bantuan AI terlihat.** Bagian yang diubah AI ditandai agar pengguna bisa memeriksanya.

## 2. Peta Aplikasi

```
Landing
  ├── Daftar / Masuk
  │     └── Verifikasi email (jika daftar manual)
  │
  └── Onboarding (sekali)
        ├── 1. Profil dasar
        ├── 2. Upload dan compile CV
        ├── 3. Hubungkan Gmail (opsional)
        └── 4. Selesai
              │
              ▼
        Beranda
          ├── Lowongan
          │     ├── Tambah lowongan (tempel tautan / teks)
          │     └── Detail lowongan
          ├── Antrean Lamaran
          │     └── Layar Review & Approval
          ├── Lamaran Saya (pelacakan)
          ├── CV Saya
          │     ├── Upload
          │     └── Compile dokumen
          └── Pengaturan
                ├── Profil
                ├── Gmail
                ├── Privasi dan data
                └── Hapus akun
```

## 3. Navigasi

**Desktop:** sidebar kiri dengan Beranda, Lowongan, Antrean, Lamaran Saya, CV Saya, Pengaturan. Badge jumlah pada "Antrean" menunjukkan lamaran yang menunggu persetujuan.

**Mobile:** bottom navigation dengan empat tab: Beranda, Lowongan, Antrean, Lainnya (CV, Lamaran Saya, Pengaturan).

## 4. Alur Utama

### 4.1 Daftar atau masuk

1. Pengguna membuka halaman masuk.
2. Pilihan: "Lanjutkan dengan Google" atau "Daftar dengan email".
3. Untuk email: isi nama, email, dan password. Turnstile tampil di bawah form dan harus lolos sebelum tombol aktif.
4. Sistem mengirim email verifikasi. Layar menampilkan "Cek email kamu" dengan tombol kirim ulang (jeda 60 detik).
5. Setelah verifikasi, pengguna masuk ke onboarding.

Untuk Google: langsung ke onboarding. Email diambil dari akun Google. Jika email sudah pernah terdaftar dengan password, sistem menawarkan untuk menautkan akun setelah pengguna masuk dengan password.

Kondisi khusus:
- Turnstile gagal berulang kali: tampilkan pesan dan saran mencoba lagi beberapa menit kemudian.
- Lupa password: alur reset dengan tautan sekali pakai (berlaku 1 jam).

### 4.2 Onboarding

Ditampilkan sebagai wizard empat langkah dengan progress bar. Pengguna bisa melewati langkah opsional dan kembali ke langkah sebelumnya.

**Langkah 1, Profil dasar**
- Nama lengkap, nomor HP (format +62), kota domisili, bidang yang diminati (pilih hingga tiga).
- Ekspektasi gaji: opsional, dan hanya ditampilkan ke diri sendiri.
- Tombol: "Lanjut".

**Langkah 2, CV**
- Area drag-and-drop untuk PDF. Batas 10 MB per file.
- Setelah upload, sistem membaca teks dan menampilkan ringkasan: nama, pengalaman terakhir, dan keahlian yang terdeteksi.
- Jika teks tidak terbaca (CV hasil scan), sistem memberi tahu dan meminta file lain atau menawarkan input manual.
- Pengguna bisa menambah dokumen lain dan masuk ke fitur compile (lihat 4.7).
- Pengguna menentukan satu CV utama.

**Langkah 3, Gmail (opsional)**
- Penjelasan singkat: "Kami hanya meminta izin untuk mengirim email atas nama kamu. Kami tidak membaca kotak masuk kamu."
- Tombol "Hubungkan Gmail" dan tautan "Lewati dulu".
- Jika berhasil: tampil ikon centang dan alamat Gmail yang terhubung.

**Langkah 4, Selesai**
- Ringkasan profil dan CV. Tombol "Tambah lowongan pertama".

### 4.3 Menambah lowongan

Ini adalah titik masuk utama.

1. Pengguna menekan "Tambah lowongan".
2. Kolom utama: tempel tautan lowongan. Ada juga tab "Tempel teks" untuk lowongan yang tidak bisa dibaca sistem.
3. Setelah tautan dimasukkan, sistem menampilkan status "Membaca halaman..." (biasanya di bawah 15 detik).
4. Hasil ditampilkan sebagai kartu:
   - Judul posisi, nama perusahaan, lokasi, tanggal tayang (jika ada).
   - Cara melamar: **Email** (dengan alamat yang ditemukan), **Form** (dengan tombol "Buka halaman lamaran"), atau **Perlu input manual**.
   - Label kepercayaan: "Terdeteksi otomatis" atau "Perlu dicek".
5. Pengguna bisa mengedit judul, perusahaan, dan alamat email sebelum menyimpan.
6. Tombol "Simpan dan buat lamaran" membuat draf lamaran dan memulai personalisasi.

Bisa menambah banyak tautan sekaligus: tempel satu per baris, maksimal 10 per batch. Setiap tautan diproses terpisah dan hasilnya muncul sebagai daftar.

Kondisi khusus:
- Tautan tidak bisa diakses: "Halaman tidak bisa dibuka. Coba tempel teks lowongannya."
- Robots.txt melarang: pesan yang sama, dengan penjelasan singkat bahwa sistem menghormati aturan situs.
- Lowongan sudah ditutup (terdeteksi dari teks): tampilkan peringatan, pengguna tetap bisa memilih untuk melanjutkan.
- Lowongan sudah pernah ditambahkan: tampilkan "Kamu sudah pernah melamar ke posisi ini pada [tanggal]" dan blokir duplikasi.

### 4.4 Personalisasi

Setelah lowongan disimpan, status lamaran menjadi "Menyusun...". Pengguna bisa berpindah halaman. Saat selesai, muncul notifikasi dan lamaran masuk ke Antrean dengan status "Menunggu persetujuan".

Jika gagal: "Belum berhasil menyusun lamaran ini. Coba lagi" dengan tombol ulang.

### 4.5 Antrean dan layar review

Ini layar paling penting. Desainnya mengutamakan kejelasan dan kepercayaan.

**Daftar antrean** menampilkan kartu per lamaran: posisi, perusahaan, penerima, status, dan jumlah klaim baru yang perlu dicek.

**Detail review** (satu lamaran per layar, dengan navigasi "Sebelumnya" dan "Berikutnya"):

Bagian atas:
- Penerima: alamat email, bisa diedit.
- Subjek email: bisa diedit.
- Lampiran: CV yang akan dikirim (nama file, ukuran), bisa diganti.

Bagian tengah:
- Isi surat lamaran, ditampilkan seperti email. Kalimat yang diubah AI diberi penanda halus.
- Panel samping: "Perubahan dari CV asli" menampilkan ringkasan perbedaan dan bukti asal dari CV.

Klaim baru:
- Setiap klaim yang tidak ditemukan di CV asli ditandai dengan kotak konfirmasi: "Benar, ini pengalamanku" atau "Hapus dari lamaran".
- Tombol kirim tidak aktif sampai semua klaim baru dikonfirmasi atau dihapus.

Bagian bawah:
- "Setujui dan kirim" (utama).
- "Simpan perubahan" (sekunder).
- "Hapus dari antrean" (tersier).

Setelah menekan "Setujui dan kirim", muncul dialog konfirmasi singkat: "Email akan dikirim ke [alamat] dari [Gmail kamu]. Kirim sekarang?" Dengan tombol "Ya, kirim" dan "Batal".

Pengiriman massal: di daftar antrean, pengguna bisa memilih beberapa lamaran dan menekan "Setujui yang dipilih". Sistem tetap membuat persetujuan terpisah untuk setiap item, dan menampilkan daftar item yang disetujui sebelum konfirmasi akhir. Item yang punya klaim baru belum dikonfirmasi tidak bisa ikut.

### 4.6 Pengiriman dan status

Setelah disetujui, lamaran tampil dengan status "Dalam antrean kirim". Worker mengirim dengan jeda, sehingga beberapa email bisa menunggu beberapa menit.

Status yang tampil ke pengguna:
- **Dalam antrean kirim**: menunggu jadwal kirim.
- **Terkirim**: email sudah diterima Gmail. Tampil waktu kirim dan tautan ke pesan di Gmail.
- **Gagal**: ada penjelasan dan saran tindakan (lihat 4.8).
- **Dibalas, Wawancara, Diterima, Ditolak**: diatur manual oleh pengguna.

Batas harian: jika pengguna sudah mencapai 20 email hari itu, tombol "Setujui" menampilkan "Batas harian tercapai. Lamaran ini akan dikirim besok" dan lamaran tetap di antrean dengan status yang jelas.

### 4.7 Upload dan compile CV

**Upload:** drag-and-drop atau tombol pilih file. Setiap file menampilkan nama, ukuran, dan indikator "Memindai...", lalu "Siap".

**Compile:**
1. Pengguna memilih dua file atau lebih dari daftar dokumen yang sudah diunggah (atau langsung mengunggah beberapa file).
2. Pengguna mengatur urutan dengan drag-and-drop. Tersedia thumbnail halaman pertama.
3. Pilihan output: PDF satu file (default) atau ZIP berisi file asli.
4. Preview hasil gabungan, lalu "Simpan sebagai dokumen baru".
5. Pengguna bisa memberi nama dan menandai dokumen (misalnya "Sertifikat", "Transkrip", "Portofolio").

Kondisi khusus:
- File terlalu besar: tampilkan batas dan saran mengecilkan file.
- File tidak terbaca atau rusak: tampilkan nama file dan minta unggah ulang.
- File berisi kode berbahaya: file ditolak dan pengguna diberi tahu secara umum tanpa detail teknis.

### 4.8 Penanganan kegagalan

| Kondisi | Pesan kepada pengguna | Tindakan yang ditawarkan |
|---|---|---|
| Email bounce | "Alamat email tidak valid atau tidak aktif" | Edit alamat, lalu kirim ulang (butuh persetujuan baru) |
| Gmail tidak lagi terhubung | "Akses Gmail dicabut. Hubungkan ulang untuk mengirim" | Tombol hubungkan ulang. Lamaran tetap tersimpan |
| Batas Gmail tercapai | "Gmail membatasi pengiriman sementara" | Lamaran dijadwalkan ulang otomatis |
| Lowongan butuh form | "Lowongan ini melamar lewat halaman perusahaan" | Buka halaman lamaran dan salin data kontak |
| Halaman butuh login | "Halaman ini perlu akun untuk dibuka" | Tempel teks lowongan |
| AI gagal | "Lamaran belum selesai disusun" | Coba lagi, atau lamaran dibuat dari CV asli tanpa personalisasi (diberi label) |

### 4.9 Lamaran saya (pelacakan)

Tabel atau daftar dengan filter status, perusahaan, dan rentang tanggal. Setiap baris dapat dibuka untuk melihat isi lamaran yang terkirim (read-only), riwayat persetujuan, dan catatan pribadi.

Pengguna dapat mengubah status secara manual dan menambahkan tanggal wawancara.

Pencegahan duplikasi: jika pengguna mencoba melamar ke posisi yang sudah pernah dilamar ke perusahaan yang sama dalam 30 hari, sistem menampilkan peringatan dan pilihan "Lewati" atau "Tetap kirim".

### 4.10 CV saya

Menampilkan daftar dokumen, CV utama (dengan label), dan tombol unggah atau compile. Setiap dokumen bisa diunduh, diganti nama, atau dihapus. Menghapus CV utama memerlukan pemilihan CV pengganti.

Jika CV berubah, lamaran yang masih "Menunggu persetujuan" menampilkan peringatan: "CV utama berubah. Susun ulang lamaran ini?" Lamaran yang sudah terkirim tidak terpengaruh.

### 4.11 Pengaturan

- **Profil**: edit data.
- **Gmail**: status koneksi, izin yang diberikan, tombol cabut akses. Penjelasan tentang apa yang dan tidak dilakukan sistem dengan akun Gmail.
- **Privasi dan data**: kebijakan privasi, riwayat persetujuan AI (pengguna setuju CV-nya diproses AI pada tanggal tertentu), unduh seluruh data (ZIP berisi JSON dan file CV), hapus akun.
- **Hapus akun**: konfirmasi dua langkah. Semua lamaran dalam antrean dibatalkan. Data dihapus dalam 30 hari, kecuali log persetujuan yang disimpan sesuai kewajiban hukum, dengan identitas dianonimkan.

## 5. Alur Keluar dan Masuk Kembali

- Sesi berakhir setelah 30 hari tidak aktif. Pengguna diminta masuk ulang tanpa kehilangan draf.
- Draf lamaran yang belum disetujui tetap tersimpan.
- Jika pengguna keluar saat pengiriman sedang berjalan, pengiriman tetap berjalan di server.

## 6. Pesan dan Notifikasi

| Peristiwa | Kanal | Isi |
|---|---|---|
| Verifikasi email | Email | Tautan verifikasi |
| Personalisasi selesai | Dalam aplikasi | "3 lamaran siap ditinjau" |
| Email terkirim | Dalam aplikasi | Hanya jika pengguna mengaktifkan |
| Lamaran gagal | Dalam aplikasi dan email | Penjelasan dan tindakan |
| Gmail dicabut | Email | Pemberitahuan dan cara menghubungkan ulang |
| Akun dihapus | Email | Konfirmasi |

Notifikasi tidak boleh bersifat promosi kecuali pengguna setuju secara terpisah.

## 7. Catatan Sumber Lowongan

Aplikasi tidak menampilkan daftar lowongan dari situs pihak ketiga. Lowongan masuk hanya lewat tautan atau teks yang pengguna berikan sendiri. Sumber Glint dikecualikan. Jika pengguna memasukkan tautan Glint, sistem menolak dengan pesan: "Sumber ini belum didukung."
