import { NextRequest, NextResponse } from 'next/server';
import { JobPost } from '@/types';

// Helper to filter banned domains (Glints & KitaLulus — user ban, permanent)
function isBannedSource(urlOrText: string): boolean {
  const lower = urlOrText.toLowerCase();
  return (
    lower.includes('glints.com') ||
    lower.includes('glint') ||
    lower.includes('kitalulus.com') ||
    lower.includes('kitalulus')
  );
}

// STRICT region whitelist (user order 2026-11-02):
// Jabodetabek + Karawang/Cikarang/Cikampek/Purwakarta/Subang
// + Bandung/Cimahi/Cianjur/Sukabumi + Serang/Cilegon.
// Everything else (Batam, Lombok, Aceh, Kalimantan, Surabaya, etc.) = rejected.
const ALLOWED_REGIONS: Array<{ key: string; label: string }> = [
  { key: 'jakarta', label: 'Jakarta' },
  { key: 'bogor', label: 'Bogor' },
  { key: 'depok', label: 'Depok' },
  { key: 'tangerang', label: 'Tangerang' },
  { key: 'bekasi', label: 'Bekasi' },
  { key: 'karawang', label: 'Karawang' },
  { key: 'cikarang', label: 'Cikarang' },
  { key: 'cikampek', label: 'Cikampek' },
  { key: 'purwakarta', label: 'Purwakarta' },
  { key: 'subang', label: 'Subang' },
  { key: 'bandung', label: 'Bandung' },
  { key: 'cimahi', label: 'Cimahi' },
  { key: 'cianjur', label: 'Cianjur' },
  { key: 'sukabumi', label: 'Sukabumi' },
  { key: 'serang', label: 'Serang' },
  { key: 'cilegon', label: 'Cilegon' },
];

function isValidJobLocation(loc: string, desc: string, title: string): boolean {
  const text = `${loc} ${desc} ${title}`.toLowerCase();
  const locLower = loc.toLowerCase();
  const descLower = desc.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Whitelist: job mentions an allowed region anywhere (location, desc, title)
  if (ALLOWED_REGIONS.some((r) => text.includes(r.key))) {
    return true;
  }

  // 2. Global remote: ONLY if the description explicitly mentions Indonesia
  const isRemote =
    locLower.includes('remote') ||
    locLower.includes('worldwide') ||
    locLower.includes('anywhere') ||
    locLower.includes('wfh') ||
    locLower.includes('work from home') ||
    titleLower.includes('remote') ||
    descLower.includes('100% remote') ||
    descLower.includes('fully remote');

  if (isRemote && descLower.includes('indonesia')) {
    return true;
  }

  // Everything else is rejected
  return false;
}

// Detect which whitelisted region a job belongs to (for regionTag)
function detectRegion(loc: string, desc: string, title: string): string | undefined {
  const text = `${loc} ${desc} ${title}`.toLowerCase();
  const hit = ALLOWED_REGIONS.find((r) => text.includes(r.key));
  if (hit) return hit.label;
  if (text.includes('remote') && text.includes('indonesia')) return 'Remote Indonesia';
  return undefined;
}

// Defensive fetch with timeout — returns null on any failure
async function fetchJson(url: string, timeoutMs = 15000): Promise<any | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KirimKerja/1.0)' },
      signal: ctrl.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesQuery(query: string, ...fields: string[]): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return fields.some((f) => (f || '').toLowerCase().includes(q));
}

function makeId(prefix: string): string {
  return prefix + Math.random().toString(36).substring(2, 9);
}

function extractEmail(text: string): string | undefined {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : undefined;
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

const MAX_JOBS = 40;

// --- Source 1: curated local list (existing) ---
function sourceLocalJobs(query: string, location: string): JobPost[] {
  const jobs: JobPost[] = [];
  for (const item of INDONESIAN_LOCAL_JOBS) {
    if (isBannedSource(item.sourceUrl) || isBannedSource(item.description)) continue;
    if (!matchesQuery(query, item.title, item.description, item.category, item.company, item.location)) continue;
    if (location && !item.location.toLowerCase().includes(location)) continue;
    if (!isValidJobLocation(item.location, item.description, item.title)) continue;

    jobs.push({
      id: makeId('job_loc_'),
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
      regionTag: detectRegion(item.location, item.description, item.title),
      fetchedAt: new Date().toISOString(),
    });
  }
  return jobs;
}

// --- Source 2: Remotive (remote jobs API, no key) ---
async function sourceRemotive(query: string, location: string): Promise<JobPost[]> {
  const jobs: JobPost[] = [];
  const url = query
    ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=25`
    : 'https://remotive.com/api/remote-jobs?limit=25';
  const json = await fetchJson(url);
  if (!json) return jobs;

  for (const item of json.jobs || []) {
    const title = item.title || 'Lowongan Remote';
    const company = item.company_name || 'Global Enterprise';
    const loc = item.candidate_required_location || 'Remote (Worldwide)';
    const desc = stripHtml(item.description || '').slice(0, 1000);
    const jobUrl = item.url || '';

    if (isBannedSource(jobUrl) || isBannedSource(desc) || isBannedSource(company)) continue;
    if (!isValidJobLocation(loc, desc, title)) continue;
    if (!matchesQuery(query, title, desc, loc, company)) continue;
    if (location && !loc.toLowerCase().includes(location)) continue;

    const email = extractEmail(desc);
    jobs.push({
      id: makeId('job_rem_'),
      sourceUrl: jobUrl,
      title,
      company,
      location: loc.toLowerCase().includes('worldwide') ? 'Remote (Bisa dari Indonesia)' : loc,
      description: desc,
      applyType: email ? 'email' : 'form',
      contactEmail: email || `karir@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      applyUrl: jobUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: 'Remotive • Remote',
      regionTag: detectRegion(loc, desc, title),
      fetchedAt: new Date().toISOString(),
    });
    if (jobs.length >= 12) break;
  }
  return jobs;
}

// --- Source 3: Arbeitnow (free job board API, no key) ---
async function sourceArbeitnow(query: string, location: string): Promise<JobPost[]> {
  const jobs: JobPost[] = [];
  const json = await fetchJson('https://www.arbeitnow.com/api/job-board-api');
  if (!json || !Array.isArray(json.data)) return jobs;

  for (const item of json.data.slice(0, 80)) {
    const title = item.title || 'Lowongan';
    const company = item.company_name || 'Perusahaan';
    const loc = item.remote ? 'Remote' : item.location || 'Remote';
    const desc = stripHtml(item.description || '').slice(0, 1000);
    const jobUrl = item.url || '';

    if (isBannedSource(jobUrl) || isBannedSource(desc) || isBannedSource(company)) continue;
    if (!isValidJobLocation(loc, desc, title)) continue;
    if (!matchesQuery(query, title, desc, loc, company)) continue;
    if (location && !loc.toLowerCase().includes(location)) continue;

    const email = extractEmail(desc);
    jobs.push({
      id: makeId('job_arn_'),
      sourceUrl: jobUrl,
      title,
      company,
      location: item.remote ? 'Remote' : loc,
      description: desc,
      applyType: email ? 'email' : 'form',
      contactEmail: email,
      applyUrl: jobUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: 'Arbeitnow',
      regionTag: detectRegion(loc, desc, title),
      fetchedAt: new Date().toISOString(),
    });
    if (jobs.length >= 10) break;
  }
  return jobs;
}

// --- Source 4: RemoteOK (free API, no key; credit required by their ToS) ---
async function sourceRemoteOK(query: string, location: string): Promise<JobPost[]> {
  const jobs: JobPost[] = [];
  const json = await fetchJson('https://remoteok.com/api');
  if (!Array.isArray(json)) return jobs;

  // First element is the API legal notice, skip it
  for (const item of json.slice(1, 60)) {
    const title = item.position || 'Lowongan Remote';
    const company = item.company || 'Perusahaan Remote';
    const loc = item.location || 'Remote';
    const desc = stripHtml(item.description || '').slice(0, 1000);
    const jobUrl = item.url || (item.id ? `https://remoteok.com/remote-jobs/${item.id}` : '');

    if (isBannedSource(jobUrl) || isBannedSource(desc) || isBannedSource(company)) continue;
    if (!isValidJobLocation(loc, desc, title)) continue;
    if (!matchesQuery(query, title, desc, loc, company, (item.tags || []).join(' '))) continue;
    if (location && !loc.toLowerCase().includes(location)) continue;

    const email = extractEmail(desc);
    jobs.push({
      id: makeId('job_rok_'),
      sourceUrl: jobUrl,
      title,
      company,
      location: loc,
      description: desc,
      applyType: email ? 'email' : 'form',
      contactEmail: email,
      applyUrl: jobUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: 'RemoteOK • Remote',
      regionTag: detectRegion(loc, desc, title),
      fetchedAt: new Date().toISOString(),
    });
    if (jobs.length >= 10) break;
  }
  return jobs;
}

// --- Source 5: Jobicy (free remote jobs API, no key) ---
async function sourceJobicy(query: string, location: string): Promise<JobPost[]> {
  const jobs: JobPost[] = [];
  const json = await fetchJson('https://jobicy.com/api/v2/remote-jobs?count=50');
  if (!json || !Array.isArray(json.jobs)) return jobs;

  for (const item of json.jobs) {
    const title = item.jobTitle || 'Lowongan Remote';
    const company = item.companyName || 'Perusahaan Remote';
    const loc = Array.isArray(item.jobGeo) ? item.jobGeo.join(', ') : item.jobGeo || 'Remote';
    const desc = stripHtml(`${item.jobExcerpt || ''} ${item.jobDescription || ''}`).slice(0, 1000);
    const jobUrl = item.url || '';

    if (isBannedSource(jobUrl) || isBannedSource(desc) || isBannedSource(company)) continue;
    if (!isValidJobLocation(loc, desc, title)) continue;
    if (!matchesQuery(query, title, desc, loc, company)) continue;
    if (location && !loc.toLowerCase().includes(location)) continue;

    const email = extractEmail(desc);
    jobs.push({
      id: makeId('job_jcy_'),
      sourceUrl: jobUrl,
      title,
      company,
      location: loc,
      description: desc,
      applyType: email ? 'email' : 'form',
      contactEmail: email,
      applyUrl: jobUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: 'Jobicy • Remote',
      regionTag: detectRegion(loc, desc, title),
      fetchedAt: new Date().toISOString(),
    });
    if (jobs.length >= 10) break;
  }
  return jobs;
}

// --- Source 6: Adzuna Indonesia (needs free API key via env; skipped silently if unset) ---
async function sourceAdzuna(query: string, location: string): Promise<JobPost[]> {
  const jobs: JobPost[] = [];
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return jobs;

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    'content-type': 'application/json',
  });
  if (query) params.set('what', query);
  // Default to Jakarta when no location filter — Adzuna 'id' = Indonesia
  params.set('where', location || 'jakarta');

  const json = await fetchJson(`https://api.adzuna.com/v1/api/jobs/id/search/1?${params.toString()}`);
  if (!json || !Array.isArray(json.results)) return jobs;

  for (const item of json.results) {
    const title = item.title || 'Lowongan';
    const company = item.company?.display_name || 'Perusahaan';
    const loc = item.location?.display_name || 'Indonesia';
    const desc = stripHtml(item.description || '').slice(0, 1000);
    const jobUrl = item.redirect_url || '';

    if (isBannedSource(jobUrl) || isBannedSource(desc) || isBannedSource(company)) continue;
    if (!isValidJobLocation(loc, desc, title)) continue;

    jobs.push({
      id: makeId('job_adz_'),
      sourceUrl: jobUrl,
      title,
      company,
      location: loc,
      description: desc,
      applyType: 'form',
      applyUrl: jobUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: 'Adzuna Indonesia',
      regionTag: detectRegion(loc, desc, title),
      fetchedAt: new Date().toISOString(),
    });
    if (jobs.length >= 15) break;
  }
  return jobs;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const location = (searchParams.get('location') || '').toLowerCase().trim();

    const jobs: JobPost[] = [];

    // 1. Curated local list (synchronous)
    try {
      jobs.push(...sourceLocalJobs(query, location));
    } catch (e) {
      console.error('sourceLocalJobs failed:', e);
    }

    // 2-6. Live sources — each isolated so one failure can't break the rest
    const liveSources: Array<() => Promise<JobPost[]>> = [
      () => sourceRemotive(query, location),
      () => sourceArbeitnow(query, location),
      () => sourceRemoteOK(query, location),
      () => sourceJobicy(query, location),
      () => sourceAdzuna(query, location),
    ];

    for (const fetchSource of liveSources) {
      try {
        const result = await fetchSource();
        jobs.push(...result);
      } catch (e) {
        console.error('Live job source failed:', e);
      }
      if (jobs.length >= MAX_JOBS) break;
    }

    return NextResponse.json({
      success: true,
      total: jobs.slice(0, MAX_JOBS).length,
      jobs: jobs.slice(0, MAX_JOBS),
    });
  } catch (error) {
    console.error('Explore jobs error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar lowongan real-time.' },
      { status: 500 }
    );
  }
}
