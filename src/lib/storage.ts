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
  id: 'usr_me',
  fullName: '',
  email: '',
  phone: '',
  city: '',
  interests: [],
  salaryExpectation: '',
  sendingEnabled: true,
  onboardingCompleted: false,
};

const INITIAL_DOCUMENTS: DocumentItem[] = [];

const INITIAL_JOBS: JobPost[] = [];

const INITIAL_APPLICATIONS: Application[] = [];

const INITIAL_EMAIL_SETTINGS: EmailSettings = {
  gmailConnected: false,
  gmailEmail: '',
  dailySentCount: 0,
  dailyLimit: 20,
  lastResetDate: new Date().toISOString().split('T')[0],
  sendingMode: 'web_compose',
};

// Safe localStorage helper with auto-cleanup of legacy mock data
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);

    // Auto-purge any stale mock data if present from earlier testing
    if (key === STORAGE_KEYS.PROFILE && parsed?.id === 'usr_01') {
      localStorage.removeItem(key);
      return fallback;
    }
    if (key === STORAGE_KEYS.DOCUMENTS && Array.isArray(parsed) && parsed[0]?.id === 'doc_cv_01') {
      localStorage.removeItem(key);
      return fallback;
    }
    if (key === STORAGE_KEYS.JOBS && Array.isArray(parsed) && parsed[0]?.id === 'job_01') {
      localStorage.removeItem(key);
      return fallback;
    }
    if (key === STORAGE_KEYS.APPLICATIONS && Array.isArray(parsed) && parsed[0]?.id === 'app_01') {
      localStorage.removeItem(key);
      return fallback;
    }

    return parsed;
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
};
