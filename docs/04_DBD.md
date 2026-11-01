# DBD: Design Brief

Versi: 1.0
Status: Draft
Acuan: PRD v1.0, AFD v1.0

---

## 1. Tujuan Desain

Membuat pengalaman yang membuat pencari kerja merasa dibantu, bukan diawasi atau dipaksa. Kepercayaan adalah hal utama, karena aplikasi ini mengirim email atas nama pengguna. Setiap elemen desain harus membuat pengguna merasa memegang kendali.

## 2. Arah Visual

**Kata kunci:** tenang, jelas, hangat, profesional.

**Hindari:** tampilan "startup agresif" dengan gradasi neon, animasi berlebihan, kesan gamifikasi, angka progres yang dibesar-besarkan, dan bahasa yang memaksa ("Lamar sekarang!", "Jangan lewatkan!").

**Referensi perasaan:** aplikasi keuangan yang sederhana atau aplikasi catatan. Pengguna harus merasa berada di ruang kerja yang rapi.

### 2.1 Warna

| Peran | Nama token | Nilai (terang) | Penggunaan |
|---|---|---|---|
| Primer | `brand-600` | #1F5F8B | Tombol utama, tautan, fokus |
| Primer hover | `brand-700` | #184B6E | Hover tombol utama |
| Latar | `surface-0` | #FFFFFF | Kartu dan panel |
| Latar halaman | `surface-1` | #F6F7F9 | Latar belakang aplikasi |
| Teks utama | `text-900` | #1B1F24 | Judul dan isi |
| Teks sekunder | `text-600` | #5B6470 | Keterangan |
| Sukses | `success-600` | #2E7D4F | Terkirim, terverifikasi |
| Peringatan | `warning-600` | #A56A00 | Perlu dicek, klaim baru |
| Bahaya | `danger-600` | #B3261E | Gagal, hapus |
| Penanda AI | `ai-100` | #EAF2FA | Latar penanda teks hasil AI |

Mode gelap disediakan sejak rilis pertama dengan pasangan token yang sama.

Kontras: semua teks memenuhi rasio minimal 4.5:1 untuk teks biasa dan 3:1 untuk teks besar.

### 2.2 Tipografi

- **Judul dan UI**: Inter (atau Plus Jakarta Sans sebagai alternatif yang lebih hangat).
- **Isi surat lamaran di layar review**: Source Serif 4 agar terasa seperti dokumen, bukan email otomatis.
- **Skala**: 14, 16, 18, 22, 28 px. Baris isi 16 px dengan line-height 1.6.
- **Bobot**: 400 untuk isi, 500 untuk label, 600 untuk judul.

### 2.3 Ikonografi dan bentuk

- Ikon garis (outline) dengan ketebalan 1.5 px. Pustaka yang disarankan: Lucide.
- Sudut membulat 12 px pada kartu, 8 px pada tombol dan input.
- Bayangan sangat tipis atau tidak ada. Pemisahan dilakukan dengan garis dan latar.
- Ilustrasi: gaya sederhana, satu warna aksen. Dipakai hanya pada landing, onboarding, dan halaman kosong.

## 3. Prinsip Komponen

1. **Satu tindakan utama per layar.** Tombol utama selalu jelas, tombol lain berwarna sekunder atau teks.
2. **Status selalu terlihat.** Setiap kartu lamaran menampilkan status dengan ikon dan teks, tidak hanya warna.
3. **Teks AI diberi tanda, bukan disembunyikan.** Penanda berupa latar `ai-100` dan garis kiri tipis. Tooltip menjelaskan: "Bagian ini disusun ulang oleh AI dari CV kamu."
4. **Klaim baru sangat terlihat.** Kotak konfirmasi berwarna `warning-600` dengan ikon peringatan.
5. **Tombol kirim berbeda dari tombol lain.** Tombol "Setujui dan kirim" lebar penuh pada mobile dan memakai `brand-600`. Tidak ada animasi terbang atau efek konfeti.

## 4. Layar Prioritas

Urutan prioritas desain mengikuti pentingnya layar untuk kepercayaan dan konversi:

1. **Layar review approval** (paling penting).
2. Tambah lowongan dan kartu hasil ekstraksi.
3. Onboarding upload CV dan compile.
4. Antrean dan daftar lamaran.
5. Landing dan daftar.
6. Pengaturan dan privasi.

### 4.1 Catatan khusus: layar review

Layar ini harus terasa seperti memeriksa dokumen sebelum ditandatangani.

- Layout dua kolom di desktop: kiri adalah isi email (dokumen), kanan adalah panel "Perubahan dari CV asli" dan daftar klaim.
- Di mobile, panel perubahan menjadi laci (drawer) yang bisa dibuka dari bawah.
- Penerima dan subjek di bagian atas, lampiran di bawah subjek, isi surat di tengah.
- Tombol aksi menempel di bawah layar (sticky) agar selalu terlihat.
- Navigasi antar lamaran ("Sebelumnya", "Berikutnya") dan indikator "3 dari 12".
- Perbedaan antara versi AI dan CV asli ditampilkan dengan penanda, dan pengguna bisa melihat versi asli dengan satu klik.

Pesan penting di layar ini ditulis dengan kalimat pendek dan jelas, misalnya: "Email ini akan dikirim dari Gmail kamu ke recruiter@contoh.co.id." Tidak ada kata seperti "otomatis" atau "sekali klik" di area persetujuan.

### 4.2 Catatan khusus: input tautan

- Kolom tautan besar dengan placeholder berupa contoh tautan.
- Saat membaca halaman, tampilkan tahapan yang jelas: "Membaca halaman", "Mengenali posisi", "Mencari cara melamar". Jangan memakai animasi acak.
- Hasil ditampilkan sebagai kartu dengan label "Terdeteksi otomatis" atau "Perlu dicek".

### 4.3 Catatan khusus: compile

- Daftar dokumen dengan pegangan (handle) untuk drag.
- Thumbnail halaman pertama setiap dokumen.
- Preview hasil gabungan di panel besar, dengan jumlah halaman dan ukuran file.

## 5. Tata Letak dan Responsif

- Breakpoint: 360 px (mobile kecil), 768 px (tablet), 1200 px (desktop).
- Konten utama maksimal 720 px untuk isi surat dan form, agar baris tetap nyaman dibaca.
- Target sentuh minimal 44 × 44 px.
- Mobile-first. Semua fitur inti harus berfungsi di layar 360 px.

## 6. Kondisi Khusus (Empty, Loading, Error)

| Kondisi | Tampilan |
|---|---|
| Belum ada CV | Ilustrasi sederhana, teks "Mulai dengan unggah CV kamu", tombol unggah |
| Belum ada lowongan | "Tempel tautan lowongan pertama kamu" dengan contoh |
| Antrean kosong | "Tidak ada lamaran yang menunggu. Tambah lowongan baru?" |
| Memuat | Skeleton, bukan spinner penuh layar |
| Personalisasi berjalan | Status per kartu, pengguna bisa meninggalkan halaman |
| Error jaringan | Pesan singkat, tombol coba lagi, data draf tidak hilang |
| Batas harian tercapai | Pesan dengan tanggal reset dan penjelasan alasan batas |

Pesan error ditulis tanpa menyalahkan pengguna dan tanpa istilah teknis.

## 7. Bahasa dan Nada (Copy)

- Bahasa Indonesia yang santai tetapi sopan. Sapaan "kamu".
- Kalimat aktif dan pendek. Hindari jargon seperti "payload", "token", atau "scope" di UI.
- Untuk izin Gmail: jelaskan apa yang dilakukan dan apa yang tidak dilakukan.
- Hindari kata "otomatis" di area persetujuan. Gunakan "disusun", "dibantu", atau "dipersiapkan".
- Hindari kalimat yang terdengar dibuat-buat. Lebih baik jujur daripada meyakinkan.

Contoh:
- Baik: "Kami menyusun ulang bagian pengalaman dari CV kamu agar sesuai dengan kebutuhan posisi ini."
- Hindari: "Lamaran sempurna dibuat untuk kamu dalam sekejap!"

## 8. Aksesibilitas

- Navigasi penuh dengan keyboard. Fokus terlihat dengan outline 2 px `brand-600`.
- Label form terhubung dengan input. Pesan error diumumkan ke pembaca layar.
- Kotak konfirmasi klaim baru dapat dioperasikan dengan spasi dan enter.
- Animasi dapat dimatikan melalui preferensi sistem (`prefers-reduced-motion`).
- Ukuran teks dapat diperbesar hingga 200 persen tanpa kehilangan fungsi.

## 9. Animasi dan Interaksi

- Transisi 150 sampai 200 ms untuk perubahan status.
- Tidak ada animasi pada tombol "Setujui dan kirim" selain perubahan warna saat ditekan dan indikator memuat.
- Notifikasi muncul dari bawah dan hilang otomatis setelah 5 detik, kecuali notifikasi kesalahan yang tetap sampai ditutup.

## 10. Halaman Publik

Landing page singkat berisi:
1. Pernyataan nilai satu kalimat.
2. Tiga langkah: unggah CV, tempel tautan, setujui dan kirim.
3. Penegasan: "Kamu yang memutuskan. Tidak ada lamaran yang dikirim tanpa persetujuanmu."
4. Penjelasan tentang privasi dan data.
5. Tombol daftar.

Tidak ada testimoni palsu. Jika belum ada testimoni nyata, bagian ini tidak ditampilkan.

## 11. Yang Perlu Diputuskan

1. Apakah logo dan nama produk sudah final.
2. Apakah menggunakan Plus Jakarta Sans atau Inter sebagai font utama.
3. Apakah ilustrasi akan dibuat khusus atau memakai pustaka ilustrasi berlisensi.
4. Apakah mode gelap wajib di rilis pertama.
