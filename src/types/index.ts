export type ApplicationStatus =
  | 'draf'
  | 'menunggu_persetujuan'
  | 'disetujui'
  | 'dalam_antrean_kirim'
  | 'terkirim'
  | 'gagal'
  | 'dibatalkan'
  | 'dibalas'
  | 'wawancara'
  | 'diterima'
  | 'ditolak';

export type ApplyType = 'email' | 'form' | 'manual';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interests: string[];
  salaryExpectation?: string;
  sendingEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface DocumentItem {
  id: string;
  displayName: string;
  label: 'CV' | 'Sertifikat' | 'Transkrip' | 'Portofolio' | 'Lainnya';
  kind: 'upload' | 'compiled';
  status: 'siap' | 'mengunggah' | 'memindai';
  sizeBytes: number;
  pageCount: number;
  extractedText: string;
  isPrimary: boolean;
  createdAt: string;
  fileData?: string; // Base64 data URL or mock binary
}

export interface JobPost {
  id: string;
  sourceUrl?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyType: ApplyType;
  contactEmail?: string;
  applyUrl?: string;
  extractionStatus: 'berhasil' | 'perlu_dicek' | 'gagal' | 'butuh_input_manual';
  confidenceLabel: 'Terdeteksi otomatis' | 'Perlu dicek';
  fetchedAt: string;
}

export interface ApplicationClaim {
  id: string;
  text: string;
  category: 'pengalaman' | 'keahlian' | 'metrik';
  status: 'unconfirmed' | 'confirmed' | 'removed';
}

export interface AdaptedSection {
  id: string;
  field: string;
  originalText: string;
  adaptedText: string;
  evidence: string;
}

export interface Application {
  id: string;
  jobPostId: string;
  jobTitle: string;
  company: string;
  recipientEmail: string;
  subject: string;
  coverLetter: string;
  adaptedSections: AdaptedSection[];
  claims: ApplicationClaim[];
  attachmentDocId: string;
  attachmentName: string;
  status: ApplicationStatus;
  createdAt: string;
  approvedAt?: string;
  sentAt?: string;
  notes?: string;
  interviewDate?: string;
}

export interface ApprovalLog {
  id: string;
  applicationId: string;
  action: 'setujui_kirim' | 'edit_isi' | 'konfirmasi_klaim' | 'hapus_klaim' | 'batalkan';
  versionHash: string;
  timestamp: string;
}

export interface EmailSettings {
  gmailConnected: boolean;
  gmailEmail: string;
  dailySentCount: number;
  dailyLimit: number;
  lastResetDate: string;
  sendingMode: 'web_compose' | 'direct_api';
}
