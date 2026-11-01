import {
  UserProfile,
  DocumentItem,
  JobPost,
  Application,
  ApprovalLog,
  EmailSettings,
} from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'kirimkerja_profile',
  DOCUMENTS: 'kirimkerja_documents',
  JOBS: 'kirimkerja_jobs',
  APPLICATIONS: 'kirimkerja_applications',
  APPROVALS: 'kirimkerja_approvals',
  EMAIL_SETTINGS: 'kirimkerja_email_settings',
  THEME: 'kirimkerja_theme',
};

const INITIAL_PROFILE: UserProfile = {
  id: 'usr_01',
  fullName: 'Rizky Dwi',
  email: 'rizky.dwi@example.com',
  phone: '+6281234567890',
  city: 'Jakarta Selatan',
  interests: ['Frontend Developer', 'Fullstack Developer', 'Web Developer'],
  salaryExpectation: 'Rp 12.000.000 - Rp 15.000.000',
  sendingEnabled: true,
  onboardingCompleted: true,
};

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_cv_01',
    displayName: 'CV_RizkyDwi_SoftwareEngineer.pdf',
    label: 'CV',
    kind: 'upload',
    status: 'siap',
    sizeBytes: 420000,
    pageCount: 2,
    isPrimary: true,
    createdAt: '2026-10-25T10:00:00Z',
    extractedText: `Rizky Dwi
Email: rizky.dwi@example.com | No HP: +6281234567890 | Jakarta Selatan
Portofolio: github.com/rizdwi

RINGKASAN PROFESIONAL
Frontend & Fullstack Web Developer dengan pengalaman 3+ tahun membangun antarmuka web modern, cepat, dan responsif menggunakan Next.js, React, TypeScript, dan Tailwind CSS. Terbiasa mengintegrasikan REST API, merancang UI/UX yang humanis, dan memastikan standar performa tinggi.

PENGALAMAN KERJA
Software Engineer - PT Solusi Digital Pratama (2024 - Sekarang)
- Mengembangkan 5+ aplikasi web responsif berbasis Next.js dan Tailwind CSS dengan skor Lighthouse rata-rata 95+.
- Mengoptimalkan performa halaman dan mengurangi waktu muat awal sebesar 40%.
- Bekerja sama dengan tim UI/UX dan backend engineer untuk menyusun arsitektur frontend modular.

Junior Web Developer - Studio Kreatif Nusantara (2022 - 2024)
- Membangun antarmuka dashboard klien menggunakan React, TypeScript, dan REST API.
- Menangani perbaikan bug antarmuka dan memastikan kompatibilitas antar peramban.

KEAHLIAN
- Bahasa Pemrograman: TypeScript, JavaScript, HTML5, CSS3, SQL.
- Framework & Library: Next.js, React, Tailwind CSS, Node.js, Express.
- Tools: Git, GitHub, Vercel, Docker, VS Code.

PENDIDIKAN
S1 Teknik Informatika - Universitas Indonesia (2018 - 2022)`,
  },
  {
    id: 'doc_cert_01',
    displayName: 'Sertifikat_NextJS_Professional.pdf',
    label: 'Sertifikat',
    kind: 'upload',
    status: 'siap',
    sizeBytes: 245000,
    pageCount: 1,
    isPrimary: false,
    createdAt: '2026-10-26T14:30:00Z',
    extractedText: 'Sertifikat Kompetensi: Next.js & React Fullstack Development (2025).',
  },
  {
    id: 'doc_trans_01',
    displayName: 'Transkrip_Akademik_S1.pdf',
    label: 'Transkrip',
    kind: 'upload',
    status: 'siap',
    sizeBytes: 310000,
    pageCount: 2,
    isPrimary: false,
    createdAt: '2026-10-26T14:35:00Z',
    extractedText: 'Transkrip Nilai Akademik S1 Teknik Informatika. IPK 3.72.',
  },
];

const INITIAL_JOBS: JobPost[] = [
  {
    id: 'job_01',
    sourceUrl: 'https://karir.inovasidigital.co.id/posisi/frontend-engineer',
    title: 'Frontend Engineer',
    company: 'PT Inovasi Digital Nusantara',
    location: 'Jakarta (Hybrid)',
    description:
      'Kami mencari Frontend Engineer berbakat yang menguasai React, Next.js, dan Tailwind CSS untuk mengembangkan produk SaaS analitik kami. Kandidat diharapkan mampu merancang kode yang modular, memastikan aksesibilitas, dan berkolaborasi secara agile. Kirim lamaran dan CV kamu ke recruiter@inovasidigital.co.id.',
    applyType: 'email',
    contactEmail: 'recruiter@inovasidigital.co.id',
    extractionStatus: 'berhasil',
    confidenceLabel: 'Terdeteksi otomatis',
    fetchedAt: '2026-11-01T08:30:00Z',
  },
  {
    id: 'job_02',
    sourceUrl: 'https://merdekatech.id/jobs/fullstack-developer',
    title: 'Fullstack Web Developer',
    company: 'Studio Teknologi Merdeka',
    location: 'Bandung / Remote',
    description:
      'Mencari Fullstack Developer yang terbiasa membangun web app modern dengan TypeScript, React/Next.js di frontend dan Node.js/PostgreSQL di backend. Kirimkan surat lamaran dan portofolio ke karir@merdekatech.id dengan subjek: Lamaran Fullstack - [Nama].',
    applyType: 'email',
    contactEmail: 'karir@merdekatech.id',
    extractionStatus: 'berhasil',
    confidenceLabel: 'Terdeteksi otomatis',
    fetchedAt: '2026-11-01T09:15:00Z',
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_01',
    jobPostId: 'job_01',
    jobTitle: 'Frontend Engineer',
    company: 'PT Inovasi Digital Nusantara',
    recipientEmail: 'recruiter@inovasidigital.co.id',
    subject: 'Lamaran Pekerjaan: Frontend Engineer - Rizky Dwi',
    coverLetter: `Yth. Tim Rekrutmen PT Inovasi Digital Nusantara,

Perkenalkan, saya Rizky Dwi, seorang pengembang web dengan fokus pada ekosistem Next.js, React, dan TypeScript. Melalui surat ini, saya ingin menyampaikan ketertarikan saya untuk bergabung sebagai Frontend Engineer di PT Inovasi Digital Nusantara.

Berdasarkan deskripsi lowongan, saya melihat bahwa tim Anda sedang mengembangkan produk SaaS analitik yang membutuhkan antarmuka modular dan performa tinggi. Pada pengalaman kerja saya sebelumnya di PT Solusi Digital Pratama, saya bertanggung jawab membangun antarmuka web responsif dan berhasil mengoptimalkan waktu muat awal hingga 40% dengan skor Lighthouse 95+.

Pengalaman saya dalam merancang komponen UI yang bersih, memperhatikan aksesibilitas, serta integrasi REST API yang rapi sejalan dengan kebutuhan posisi ini. Saya terbiasa bekerja secara kolaboratif dalam tim dan selalu antusias mendiskusikan solusi teknis yang efisien.

Bersama surat ini, saya melampirkan CV terbaru untuk pertimbangan Bapak/Ibu. Saya sangat terbuka untuk kesempatan wawancara guna mendiskusikan bagaimana pengalaman saya dapat berkontribusi bagi produk PT Inovasi Digital Nusantara.

Terima kasih atas waktu dan perhatian Bapak/Ibu.

Hormat saya,
Rizky Dwi
+6281234567890 | rizky.dwi@example.com`,
    adaptedSections: [
      {
        id: 'adp_1',
        field: 'Kecocokan Pengalaman Utama',
        originalText: 'Mengembangkan 5+ aplikasi web responsif berbasis Next.js dan Tailwind CSS dengan skor Lighthouse rata-rata 95+.',
        adaptedText: 'Menyoroti optimasi performa 40% dan skor Lighthouse 95+ untuk relevansi kebutuhan produk SaaS analitik.',
        evidence: 'CV Pengalaman Kerja di PT Solusi Digital Pratama',
      },
      {
        id: 'adp_2',
        field: 'Fokus Keahlian',
        originalText: 'Next.js, React, Tailwind CSS, TypeScript, REST API.',
        adaptedText: 'Menyesuaikan kata kunci modularitas antarmuka dan aksesibilitas sesuai kualifikasi lowongan.',
        evidence: 'CV Bagian Keahlian Utama',
      },
    ],
    claims: [
      {
        id: 'clm_01',
        text: 'Memiliki pengalaman memimpin tim frontend beranggotakan 4 orang',
        category: 'pengalaman',
        status: 'unconfirmed',
      },
    ],
    attachmentDocId: 'doc_cv_01',
    attachmentName: 'CV_RizkyDwi_SoftwareEngineer.pdf',
    status: 'menunggu_persetujuan',
    createdAt: '2026-11-01T08:35:00Z',
    notes: 'Lowongan prioritas, lingkungan kerja hybrid Jakarta.',
  },
  {
    id: 'app_02',
    jobPostId: 'job_02',
    jobTitle: 'Fullstack Web Developer',
    company: 'Studio Teknologi Merdeka',
    recipientEmail: 'karir@merdekatech.id',
    subject: 'Lamaran Fullstack - Rizky Dwi',
    coverLetter: `Yth. Tim Rekrutmen Studio Teknologi Merdeka,

Saya menulis surat ini untuk mengajukan diri pada posisi Fullstack Web Developer di Studio Teknologi Merdeka. Dengan latar belakang pengembangan web selama lebih dari 3 tahun menggunakan TypeScript, React, Next.js, dan Node.js, saya yakin dapat memberikan kontribusi nyata bagi pengembangan produk Anda.

Di peran sebelumnya, saya menangani implementasi antarmuka interaktif dan integrasi basis data secara efisien. Saya mengedepankan kode yang mudah dirawat dan arsitektur yang modular.

Terlampir CV lengkap saya. Saya berharap dapat berdiskusi lebih lanjut dalam tahap wawancara.

Hormat saya,
Rizky Dwi`,
    adaptedSections: [],
    claims: [],
    attachmentDocId: 'doc_cv_01',
    attachmentName: 'CV_RizkyDwi_SoftwareEngineer.pdf',
    status: 'terkirim',
    createdAt: '2026-10-31T14:00:00Z',
    approvedAt: '2026-10-31T14:10:00Z',
    sentAt: '2026-10-31T14:12:00Z',
    notes: 'Email terkirim melalui akun Gmail terverifikasi.',
  },
];

const INITIAL_EMAIL_SETTINGS: EmailSettings = {
  gmailConnected: true,
  gmailEmail: 'rizky.dwi@example.com',
  dailySentCount: 1,
  dailyLimit: 20,
  lastResetDate: new Date().toISOString().split('T')[0],
  sendingMode: 'web_compose',
};

// Safe localStorage helper
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const StorageService = {
  // Profile
  getProfile(): UserProfile {
    return safeGet<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  },
  saveProfile(profile: UserProfile): void {
    safeSet(STORAGE_KEYS.PROFILE, profile);
  },

  // Documents
  getDocuments(): DocumentItem[] {
    return safeGet<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  },
  saveDocuments(docs: DocumentItem[]): void {
    safeSet(STORAGE_KEYS.DOCUMENTS, docs);
  },
  getPrimaryCV(): DocumentItem | undefined {
    const docs = this.getDocuments();
    return docs.find((d) => d.isPrimary) || docs[0];
  },
  setPrimaryCV(id: string): void {
    const docs = this.getDocuments().map((d) => ({
      ...d,
      isPrimary: d.id === id,
    }));
    this.saveDocuments(docs);
  },
  addDocument(doc: DocumentItem): void {
    const docs = this.getDocuments();
    this.saveDocuments([doc, ...docs]);
  },
  deleteDocument(id: string): void {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    this.saveDocuments(docs);
  },

  // Jobs
  getJobs(): JobPost[] {
    return safeGet<JobPost[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  },
  saveJobs(jobs: JobPost[]): void {
    safeSet(STORAGE_KEYS.JOBS, jobs);
  },
  addJob(job: JobPost): void {
    const jobs = this.getJobs();
    this.saveJobs([job, ...jobs]);
  },

  // Applications
  getApplications(): Application[] {
    return safeGet<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },
  saveApplications(apps: Application[]): void {
    safeSet(STORAGE_KEYS.APPLICATIONS, apps);
  },
  getApplicationById(id: string): Application | undefined {
    return this.getApplications().find((a) => a.id === id);
  },
  addApplication(app: Application): void {
    const apps = this.getApplications();
    this.saveApplications([app, ...apps]);
  },
  updateApplication(id: string, updates: Partial<Application>): Application | undefined {
    const apps = this.getApplications();
    let updatedApp: Application | undefined;
    const newApps = apps.map((a) => {
      if (a.id === id) {
        updatedApp = { ...a, ...updates };
        return updatedApp;
      }
      return a;
    });
    this.saveApplications(newApps);
    return updatedApp;
  },
  deleteApplication(id: string): void {
    const apps = this.getApplications().filter((a) => a.id !== id);
    this.saveApplications(apps);
  },

  // Approvals & Claim confirmations
  confirmClaim(appId: string, claimId: string): void {
    const app = this.getApplicationById(appId);
    if (!app) return;
    const claims = app.claims.map((c) => (c.id === claimId ? { ...c, status: 'confirmed' as const } : c));
    this.updateApplication(appId, { claims });
  },
  removeClaim(appId: string, claimId: string): void {
    const app = this.getApplicationById(appId);
    if (!app) return;
    const claims = app.claims.map((c) => (c.id === claimId ? { ...c, status: 'removed' as const } : c));
    this.updateApplication(appId, { claims });
  },
  addApprovalLog(log: ApprovalLog): void {
    const logs = safeGet<ApprovalLog[]>(STORAGE_KEYS.APPROVALS, []);
    safeSet(STORAGE_KEYS.APPROVALS, [log, ...logs]);
  },
  getApprovalLogs(): ApprovalLog[] {
    return safeGet<ApprovalLog[]>(STORAGE_KEYS.APPROVALS, []);
  },

  // Email Settings & Daily Quota
  getEmailSettings(): EmailSettings {
    const settings = safeGet<EmailSettings>(STORAGE_KEYS.EMAIL_SETTINGS, INITIAL_EMAIL_SETTINGS);
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastResetDate !== today) {
      settings.dailySentCount = 0;
      settings.lastResetDate = today;
      safeSet(STORAGE_KEYS.EMAIL_SETTINGS, settings);
    }
    return settings;
  },
  saveEmailSettings(settings: EmailSettings): void {
    safeSet(STORAGE_KEYS.EMAIL_SETTINGS, settings);
  },
  incrementDailySent(): boolean {
    const settings = this.getEmailSettings();
    if (settings.dailySentCount >= settings.dailyLimit) {
      return false; // Quota reached
    }
    settings.dailySentCount += 1;
    this.saveEmailSettings(settings);
    return true;
  },

  // Reset & Export (UU PDP)
  exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      documents: this.getDocuments(),
      jobs: this.getJobs(),
      applications: this.getApplications(),
      approvalLogs: this.getApprovalLogs(),
      emailSettings: this.getEmailSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
  resetSampleData(): void {
    safeSet(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    safeSet(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    safeSet(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    safeSet(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    safeSet(STORAGE_KEYS.EMAIL_SETTINGS, INITIAL_EMAIL_SETTINGS);
  },
};
