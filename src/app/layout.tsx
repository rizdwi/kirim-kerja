import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KirimKerja - Asisten Lamaran Kerja Semi-Otomatis',
  description:
    'Aplikasi yang membantu pencari kerja menyusun CV dan surat lamaran yang dipersonalisasi. Setiap lamaran wajib disetujui pengguna sebelum dikirim.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${serif.variable}`}>
      <body className="font-sans antialiased bg-surface-1 dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
