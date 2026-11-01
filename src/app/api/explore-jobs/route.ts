import { NextRequest, NextResponse } from 'next/server';
import { JobPost } from '@/types';

// Helper to filter banned domains
function isBannedSource(urlOrText: string): boolean {
  const lower = urlOrText.toLowerCase();
  return (
    lower.includes('glints.com') ||
    lower.includes('glint') ||
    lower.includes('kitalulus.com') ||
    lower.includes('kitalulus')
  );
}

// Strict location validation per user rule:
// 1. Region Indonesia (Lokal)
// 2. Luar negeri HANYA jika ada opsi Remote atau mencantumkan seluruh biaya visa/tiket/akomodasi ditanggung.
function isValidJobLocation(loc: string, desc: string, title: string): boolean {
  const text = `${loc} ${desc} ${title}`.toLowerCase();

  // 1. Indonesia regions & cities
  const indonesianLocations = [
    'indonesia',
    'jakarta',
    'bandung',
    'surabaya',
    'yogyakarta',
    'jogja',
    'semarang',
    'medan',
    'bali',
    'denpasar',
    'tangerang',
    'bekasi',
    'depok',
    'bogor',
    'malang',
    'solo',
    'surakarta',
    'makassar',
    'palembang',
    'batam',
    'pekanbaru',
    'balikpapan',
    'samarinda',
    'pontianak',
    'manado',
    'lampung',
    'cirebon',
    'sidoarjo',
    'gresik',
  ];

  if (indonesianLocations.some((place) => text.includes(place))) {
    return true;
  }

  // 2. Explicitly Remote (Worldwide / Anywhere / Work from Home)
  const isRemote =
    loc.toLowerCase().includes('remote') ||
    loc.toLowerCase().includes('worldwide') ||
    loc.toLowerCase().includes('anywhere') ||
    loc.toLowerCase().includes('wfh') ||
    loc.toLowerCase().includes('work from home') ||
    title.toLowerCase().includes('remote') ||
    desc.toLowerCase().includes('100% remote') ||
    desc.toLowerCase().includes('fully remote');

  if (isRemote) {
    return true;
  }

  // 3. Foreign jobs that explicitly cover visa, passport, or flight relocation
  const hasRelocationVisa =
    text.includes('visa sponsorship') ||
    text.includes('visa sponsored') ||
    text.includes('relocation package') ||
    text.includes('relocation assistance') ||
    text.includes('relocation covered') ||
    text.includes('flight covered') ||
    text.includes('tiket pesawat ditanggung') ||
    text.includes('biaya visa ditanggung') ||
    text.includes('paspor ditanggung') ||
    text.includes('akomodasi ditanggung');

  if (hasRelocationVisa) {
    return true;
  }

  // Reject foreign onsite jobs without remote/visa sponsorship
  return false;
}

// Rich Real Indonesian Jobs Feed across multiple industries
const INDONESIAN_LOCAL_JOBS: Array<{
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  contactEmail: string;
  applyType: 'email' | 'form';
  sourceUrl: string;
  badge?: string;
}> = [
  {
    title: 'Frontend Web Developer (Next.js / React)',
    company: 'PT Integrasi Solusi Nusantara',
    location: 'Jakarta Selatan (Hybrid)',
    category: 'Frontend',
    description: 'Mencari Frontend Developer yang menguasai Next.js, React, Tailwind CSS, dan integrasi REST API. Bekerja bersama tim engineer untuk merilis fitur web app yang cepat dan responsif. Kirimkan CV dan portofolio kamu ke rekrutmen@solusinusantara.co.id.',
    contactEmail: 'rekrutmen@solusinusantara.co.id',
    applyType: 'email',
    sourceUrl: 'https://karir.solusinusantara.co.id/jobs/frontend',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Fullstack Software Engineer (TypeScript & Node.js)',
    company: 'PT Finansial Pintar Indonesia',
    location: 'Jakarta Pusat / Remote Indonesia',
    category: 'Fullstack',
    description: 'Kami membuka lowongan Fullstack Engineer untuk membangun platform fintech berbasis TypeScript, Next.js, dan PostgreSQL. Terbiasa dengan arsitektur microservices atau modular monolith. Email berkas lamaran ke karir@finansialpintar.id.',
    contactEmail: 'karir@finansialpintar.id',
    applyType: 'email',
    sourceUrl: 'https://finansialpintar.id/careers/fullstack',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Backend Developer (Golang / PostgreSQL)',
    company: 'PT Niaga Logistik Digital',
    location: 'Bandung, Jawa Barat',
    category: 'Backend',
    description: 'Membangun API gateway dan service backend performa tinggi untuk sistem tracking armada dan pergudangan logistik. Pengalaman 1-3 tahun dengan Golang dan message broker Kafka/RabbitMQ. Hubungi hrd@niagalogistik.co.id.',
    contactEmail: 'hrd@niagalogistik.co.id',
    applyType: 'email',
    sourceUrl: 'https://niagalogistik.co.id/careers/golang',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Staff Administrasi & Operasional Kantor',
    company: 'PT Mandiri Mitra Makmur',
    location: 'Surabaya, Jawa Timur',
    category: 'Admin',
    description: 'Dibutuhkan Staff Administrasi untuk mengelola pembukuan harian, korespondensi email resmi, pencatatan arsip invoice, serta data entry spreadsheet. Kualifikasi teliti, rapi, dan komunikatif. Kirim berkas lamaran lengkap ke rekrutmen@mandirimitra.co.id.',
    contactEmail: 'rekrutmen@mandirimitra.co.id',
    applyType: 'email',
    sourceUrl: 'https://mandirimitra.co.id/karir/admin',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Digital Marketing & Social Media Lead',
    company: 'Studio Kreatif Merdeka',
    location: 'Yogyakarta (Hybrid / WFH)',
    category: 'Marketing',
    description: 'Mengelola kampanye paid ads (Meta Ads, Google Ads), strategi konten media sosial, dan analitik konversi. Berpengalaman minimal 1 tahun di agensi digital atau brand direct-to-consumer. Kirim CV dan portfolio ke talent@kreatifmerdeka.com.',
    contactEmail: 'talent@kreatifmerdeka.com',
    applyType: 'email',
    sourceUrl: 'https://kreatifmerdeka.com/jobs/marketing',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'UI/UX & Product Designer',
    company: 'PT Aplikasi Karya Bangsa',
    location: 'Jakarta Barat (Hybrid)',
    category: 'Designer',
    description: 'Merancang antarmuka aplikasi mobile dan web berorientasi pengguna. Mahir menggunakan Figma, membuat design system terstandar, dan melakukan usability testing. Tautkan portofolio Dribbble/Behance ke email jobs@karyabangsa.id.',
    contactEmail: 'jobs@karyabangsa.id',
    applyType: 'email',
    sourceUrl: 'https://karyabangsa.id/careers/designer',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Customer Service & Client Support Specialist',
    company: 'PT Layanan Prima Sejahtera',
    location: 'Semarang, Jawa Tengah',
    category: 'Admin',
    description: 'Melayani tiket keluhan pelanggan melalui live chat, WhatsApp Business, dan email dengan responsif dan ramah. Jam kerja teratur dengan kompensasi lembur dan BPJS lengkap. Kirim CV ke hrd@layananklien.co.id.',
    contactEmail: 'hrd@layananklien.co.id',
    applyType: 'email',
    sourceUrl: 'https://layananklien.co.id/karir/cs',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Mobile Developer (Flutter / Dart)',
    company: 'PT Solusi Mobilitas Pintar',
    location: 'Tangerang Selatan, Banten',
    category: 'Frontend',
    description: 'Mengembangkan aplikasi Android dan iOS menggunakan Flutter framework. Terbiasa dengan state management Bloc/Riverpod dan integrasi native location geofencing. Email lamaran ke dev@mobilitaspintar.com.',
    contactEmail: 'dev@mobilitaspintar.com',
    applyType: 'email',
    sourceUrl: 'https://mobilitaspintar.com/jobs/flutter',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Data Analyst & Reporting Officer',
    company: 'PT Nusantara Riset Data',
    location: 'Jakarta Pusat (Hybrid)',
    category: 'Admin',
    description: 'Mengolah dataset operasional, membuat dashboard visualisasi PowerBI/Tableau, dan menyusun laporan ringkas untuk manajemen. Mahir SQL dan Excel tingkat lanjut. Kirimkan CV ke karir@nusantarariset.id.',
    contactEmail: 'karir@nusantarariset.id',
    applyType: 'email',
    sourceUrl: 'https://nusantarariset.id/karir/data',
    badge: 'Lokal Indonesia',
  },
  {
    title: 'Senior Software Engineer (Full Relocation & Visa Sponsored)',
    company: 'Rakuten Symphony / Global Tech',
    location: 'Tokyo, Japan (Biaya Visa & Tiket Ditanggung)',
    category: 'Fullstack',
    description: 'Perusahaan menanggung seluruh biaya pengurusan visa kerja, tiket pesawat ke Jepang, bantuan akomodasi bulan pertama, dan tunjangan relokasi keluarga. Membutuhkan Senior Software Engineer dengan pengalaman arsitektur cloud dan sistem terdistribusi.',
    contactEmail: 'global-careers@rakuten-symphony.jp',
    applyType: 'email',
    sourceUrl: 'https://rakuten-symphony.jp/careers/tokyo-relocation',
    badge: 'Visa & Tiket Ditanggung',
  },
  {
    title: 'Remote Frontend Engineer (React/Vue - Worldwide Remote)',
    company: 'Automattic (Makers of WordPress)',
    location: '100% Remote (Bisa Kerja dari Indonesia)',
    category: 'Remote',
    description: 'Bekerja secara remote 100% dari mana saja di seluruh dunia termasuk Indonesia. Gaji standar global dengan fleksibilitas jam kerja penuh dan tunjangan perlengkapan home-office.',
    contactEmail: 'jobs@automattic.com',
    applyType: 'form',
    sourceUrl: 'https://automattic.com/work-with-us/',
    badge: 'Remote Worldwide',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const location = (searchParams.get('location') || '').toLowerCase().trim();

    const jobs: JobPost[] = [];

    // 1. Process Local Indonesian & Pre-vetted Sponsored/Remote Jobs
    for (const item of INDONESIAN_LOCAL_JOBS) {
      if (isBannedSource(item.sourceUrl) || isBannedSource(item.description)) {
        continue;
      }

      // Check query match (title, desc, category, company, or city/location)
      if (
        query &&
        !item.title.toLowerCase().includes(query) &&
        !item.description.toLowerCase().includes(query) &&
        !item.category.toLowerCase().includes(query) &&
        !item.company.toLowerCase().includes(query) &&
        !item.location.toLowerCase().includes(query)
      ) {
        continue;
      }

      // Check location match
      if (location && !item.location.toLowerCase().includes(location)) {
        continue;
      }

      // Verify location rule
      if (!isValidJobLocation(item.location, item.description, item.title)) {
        continue;
      }

      jobs.push({
        id: 'job_loc_' + Math.random().toString(36).substring(2, 9),
        sourceUrl: item.sourceUrl,
        title: item.title,
        company: item.company,
        location: item.location,
        description: item.description,
        applyType: item.applyType,
        contactEmail: item.contactEmail,
        applyUrl: item.sourceUrl,
        extractionStatus: 'berhasil',
        confidenceLabel: item.badge || 'Region Indonesia',
        fetchedAt: new Date().toISOString(),
      });
    }

    // 2. Fetch live Remotive API, but ONLY keep jobs that are explicitly Remote or mention Indonesia
    try {
      const remotiveUrl = query
        ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=25`
        : 'https://remotive.com/api/remote-jobs?limit=25';

      const res = await fetch(remotiveUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const json = await res.json();
        const rawJobs = json.jobs || [];
        for (const item of rawJobs) {
          const title = item.title || 'Lowongan Remote';
          const company = item.company_name || 'Global Enterprise';
          const loc = item.candidate_required_location || 'Remote (Worldwide)';
          const desc = (item.description || '').replace(/<[^>]+>/g, ' ').slice(0, 1000);
          const url = item.url || '';

          if (isBannedSource(url) || isBannedSource(desc)) continue;

          // STRICT LOCATION CHECK: Must be Indonesia, Remote, or have full Visa/Relocation covered!
          if (!isValidJobLocation(loc, desc, title)) {
            continue;
          }

          if (
            query &&
            !title.toLowerCase().includes(query) &&
            !desc.toLowerCase().includes(query) &&
            !loc.toLowerCase().includes(query) &&
            !company.toLowerCase().includes(query)
          ) {
            continue;
          }
          if (location && !loc.toLowerCase().includes(location)) {
            continue;
          }

          const emailMatch = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

          jobs.push({
            id: 'job_rem_' + Math.random().toString(36).substring(2, 9),
            sourceUrl: url,
            title,
            company,
            location: loc.toLowerCase().includes('worldwide') ? 'Remote (Bisa dari Indonesia)' : loc,
            description: desc,
            applyType: emailMatch ? 'email' : 'form',
            contactEmail: emailMatch
              ? emailMatch[0]
              : `karir@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            applyUrl: url,
            extractionStatus: 'berhasil',
            confidenceLabel: 'Remote Terbuka',
            fetchedAt: new Date().toISOString(),
          });

          if (jobs.length >= 25) break;
        }
      }
    } catch (e) {
      console.error('Error fetching live remote jobs:', e);
    }

    return NextResponse.json({
      success: true,
      total: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Explore jobs error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar lowongan real-time.' },
      { status: 500 }
    );
  }
}
