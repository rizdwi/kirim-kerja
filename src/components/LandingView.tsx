'use client';

import React from 'react';
import {
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Shield,
  ArrowRight,
  Send,
  Lock,
  Sparkles,
  Eye,
  Zap,
} from 'lucide-react';

interface LandingViewProps {
  onEnterApp: () => void;
}

const steps = [
  {
    icon: FileText,
    title: 'Unggah CV Utama',
    desc: 'Satu CV jadi sumber kebenaran. AI hanya memakai fakta yang tertulis di sana — tanpa karangan.',
  },
  {
    icon: LinkIcon,
    title: 'Tempel Tautan Lowongan',
    desc: 'Sistem membaca posisi, perusahaan, dan kontak HRD otomatis dari halaman lowongan.',
  },
  {
    icon: Eye,
    title: 'Tinjau & Setujui',
    desc: 'Periksa surat dan klaim di layar review. Email terkirim hanya setelah kamu menekan setuju.',
  },
];

const assurances = [
  {
    icon: Lock,
    title: 'Persetujuan wajib',
    desc: 'Tidak ada email yang terkirim tanpa kamu menekan tombol setuju.',
  },
  {
    icon: Shield,
    title: 'Anti-halusinasi',
    desc: 'Klaim baru yang tak ada di CV ditandai dan dikunci sampai kamu konfirmasi.',
  },
  {
    icon: Zap,
    title: 'Tetap cepat',
    desc: 'Surat lamaran terpersonalisasi tersusun dalam hitungan detik, bukan jam.',
  },
];

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col antialiased">
      {/* Latar: glow halus, murni CSS */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-brand-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-brand-700/20 blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="relative border-b border-white/[0.07] bg-white/[0.02] backdrop-blur-sm px-5 sm:px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-extrabold text-lg shadow-pop">
              K
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block leading-none">
                KirimKerja
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">
                Asisten Lamaran Kerja Semi-Otomatis
              </span>
            </div>
          </div>
          <button
            onClick={onEnterApp}
            className="btn-primary btn-sm !min-h-[40px]"
          >
            <span>Buka Aplikasi</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <main className="relative flex-1 max-w-5xl mx-auto px-5 sm:px-6 w-full">
        {/* Hero */}
        <section className="py-14 sm:py-20 text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-brand-300 text-xs font-semibold border border-white/[0.09]">
            <Lock size={12} />
            <span>Persetujuan wajib untuk setiap lamaran</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Melamar kerja lebih{' '}
            <span className="text-gradient">relevan & cepat</span>,
            <br className="hidden sm:block" /> tetap dalam kendalimu.
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Simpan satu CV utama, tempel tautan lowongan, dan dapatkan surat lamaran
            yang dipersonalisasi — dengan pemeriksaan klaim anti-halusinasi sebelum
            kamu menyetujui pengiriman.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="btn-primary !px-7 !py-3.5 !text-base w-full sm:w-auto"
            >
              <span>Mulai Siapkan Lamaran</span>
              <ArrowRight size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 size={14} className="text-success-400" />
              <span>Gratis untuk pemakaian pribadi · Data tersimpan di perangkatmu</span>
            </div>
          </div>
        </section>

        {/* Langkah */}
        <section className="pb-14 sm:pb-16">
          <p className="eyebrow text-center mb-6 !text-gray-500">Cara kerja</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="card card-accent p-6 space-y-3 animate-slide-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-500/20 to-brand-500/5 border border-brand-400/20 text-brand-300 flex items-center justify-center">
                    <s.icon size={19} strokeWidth={2.2} />
                  </span>
                  <span className="text-4xl font-extrabold text-white/[0.07] select-none">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Jaminan */}
        <section className="pb-14 sm:pb-16">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-b from-success-500/20 to-success-500/5 border border-success-400/20 text-success-300 flex items-center justify-center">
                <Shield size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kenapa kamu bisa percaya
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {assurances.map((a) => (
                <div key={a.title} className="flex gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-brand-300 flex items-center justify-center shrink-0">
                    <a.icon size={16} />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/[0.07] flex items-start gap-2.5">
              <Sparkles size={15} className="text-brand-300 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-200">
                  “Kamu yang memutuskan.”
                </span>{' '}
                KirimKerja bukan bot massal. Seluruh data tersimpan lokal di perambanmu —
                unduh atau hapus kapan saja sesuai UU Pelindungan Data Pribadi No. 27/2022.
              </p>
            </div>
          </div>
        </section>

        {/* CTA akhir */}
        <section className="pb-16 sm:pb-20 text-center">
          <div className="card card-accent p-8 sm:p-10 relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-brand-500/15 blur-[80px]"
            />
            <h2 className="relative text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Siap melamar lebih cerdas malam ini?
            </h2>
            <p className="relative text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Unggah CV-mu sekali, lalu biarkan setiap lowongan mendapatkan surat
              lamaran yang relevan.
            </p>
            <button
              onClick={onEnterApp}
              className="relative btn-primary !px-7 !py-3 mt-6"
            >
              <Send size={16} />
              <span>Buka KirimKerja</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.07] py-6 px-6 text-center">
        <p className="text-[11px] text-gray-500">
          KirimKerja · Asisten Lamaran Kerja Semi-Otomatis · Untuk pemakaian pribadi
        </p>
      </footer>
    </div>
  );
};
