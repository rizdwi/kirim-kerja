'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { QueueView } from '@/components/QueueView';
import { JobsView } from '@/components/JobsView';
import { TrackingView } from '@/components/TrackingView';
import { DocumentsView } from '@/components/DocumentsView';
import { SettingsView } from '@/components/SettingsView';
import { LandingView } from '@/components/LandingView';
import { ReviewModal } from '@/components/ReviewModal';
import { JobIngestModal } from '@/components/JobIngestModal';
import { CompileModal } from '@/components/CompileModal';

import { StorageService } from '@/lib/storage';
import {
  UserProfile,
  DocumentItem,
  JobPost,
  Application,
  EmailSettings,
  ApplicationStatus,
} from '@/types';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Core App States
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(StorageService.getEmailSettings());

  // Modal States
  const [reviewApp, setReviewApp] = useState<Application | null>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState<boolean>(false);
  const [isCompileOpen, setIsCompileOpen] = useState<boolean>(false);

  // Initialize from storage on client mount
  useEffect(() => {
    setProfile(StorageService.getProfile());
    setDocuments(StorageService.getDocuments());
    setJobs(StorageService.getJobs());
    setApplications(StorageService.getApplications());
    setEmailSettings(StorageService.getEmailSettings());
    setIsLoaded(true);

    // Read stored theme preference
    const savedTheme = localStorage.getItem('kirimkerja_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kirimkerja_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kirimkerja_theme', 'light');
    }
  };

  // Primary CV
  const primaryCv = documents.find((d) => d.isPrimary) || documents[0];

  // Handlers for Applications
  const handleApproveAndSend = async (
    appId: string,
    recipientEmail: string,
    subject: string,
    coverLetter: string,
    attachmentDocId: string
  ) => {
    const selectedDoc = documents.find((d) => d.id === attachmentDocId) || primaryCv || {
      displayName: 'CV.pdf',
    };

    // Call serverless API
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: appId,
        recipientEmail,
        subject,
        coverLetter,
        attachmentName: selectedDoc.displayName,
      }),
    });

    if (!res.ok) {
      throw new Error('Gagal mengirim email.');
    }

    const data = await res.json();

    // Increment daily quota
    StorageService.incrementDailySent();
    setEmailSettings(StorageService.getEmailSettings());

    // Update status to 'terkirim'
    StorageService.updateApplication(appId, {
      status: 'terkirim',
      recipientEmail,
      subject,
      coverLetter,
      attachmentDocId,
      attachmentName: selectedDoc.displayName,
      sentAt: data.sentAt,
      approvedAt: new Date().toISOString(),
    });

    setApplications(StorageService.getApplications());
  };

  const handleSaveDraft = (appId: string, updates: Partial<Application>) => {
    StorageService.updateApplication(appId, updates);
    setApplications(StorageService.getApplications());
  };

  const handleDeleteApplication = (appId: string) => {
    StorageService.deleteApplication(appId);
    setApplications(StorageService.getApplications());
    if (reviewApp?.id === appId) {
      setReviewApp(null);
    }
  };

  const handleConfirmClaim = (appId: string, claimId: string) => {
    StorageService.confirmClaim(appId, claimId);
    setApplications(StorageService.getApplications());
    if (reviewApp?.id === appId) {
      setReviewApp(StorageService.getApplicationById(appId) || null);
    }
  };

  const handleRemoveClaim = (appId: string, claimId: string) => {
    StorageService.removeClaim(appId, claimId);
    setApplications(StorageService.getApplications());
    if (reviewApp?.id === appId) {
      setReviewApp(StorageService.getApplicationById(appId) || null);
    }
  };

  const handleUpdateAppStatus = (
    id: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    StorageService.updateApplication(id, {
      status,
      ...(notes ? { notes } : {}),
    });
    setApplications(StorageService.getApplications());
  };

  // Handlers for Jobs
  const handleJobCreated = (
    job: JobPost,
    coverLetter: string,
    subject: string,
    adaptedSections: any[],
    claims: any[]
  ) => {
    // Save job
    StorageService.addJob(job);
    setJobs(StorageService.getJobs());

    // Create application in queue with status 'menunggu_persetujuan'
    const newApp: Application = {
      id: 'app_' + Date.now(),
      jobPostId: job.id,
      jobTitle: job.title,
      company: job.company,
      recipientEmail: job.contactEmail || 'hrd@' + job.company.toLowerCase().replace(/\s+/g, '') + '.com',
      subject,
      coverLetter,
      adaptedSections,
      claims,
      attachmentDocId: primaryCv.id,
      attachmentName: primaryCv.displayName,
      status: 'menunggu_persetujuan',
      createdAt: new Date().toISOString(),
    };

    StorageService.addApplication(newApp);
    setApplications(StorageService.getApplications());

    // Switch to queue tab to review right away
    setCurrentTab('queue');
  };

  const handleDeleteJob = (jobId: string) => {
    const updated = jobs.filter((j) => j.id !== jobId);
    StorageService.saveJobs(updated);
    setJobs(updated);
  };

  // Handlers for Documents
  const handleSetPrimaryCv = (id: string) => {
    StorageService.setPrimaryCV(id);
    setDocuments(StorageService.getDocuments());
  };

  const handleDeleteDocument = (id: string) => {
    StorageService.deleteDocument(id);
    setDocuments(StorageService.getDocuments());
  };

  const handleUploadDocument = (doc: DocumentItem) => {
    StorageService.addDocument(doc);
    setDocuments(StorageService.getDocuments());
  };

  const handleSaveCompiledDoc = (doc: DocumentItem) => {
    StorageService.addDocument(doc);
    setDocuments(StorageService.getDocuments());
  };

  // Handlers for Profile & Settings
  const handleSaveProfile = (p: UserProfile) => {
    StorageService.saveProfile(p);
    setProfile(p);
  };

  const handleSaveEmailSettings = (s: EmailSettings) => {
    StorageService.saveEmailSettings(s);
    setEmailSettings(s);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface-1 dark:bg-[#0D1117] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto animate-pulse">
            K
          </div>
          <p className="text-xs text-gray-500 font-medium">Memuat KirimKerja...</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingView onEnterApp={() => setShowLanding(false)} />;
  }

  const waitingCount = applications.filter((a) => a.status === 'menunggu_persetujuan').length;

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Beranda Kerja',
          subtitle: 'Ringkasan antrean lamaran dan status pengiriman.',
        };
      case 'jobs':
        return {
          title: 'Lowongan',
          subtitle: 'Daftar lowongan kerja yang telah kamu kumpulkan.',
        };
      case 'queue':
        return {
          title: 'Antrean Lamaran',
          subtitle: 'Tinjau dan setujui setiap surat sebelum dikirim.',
        };
      case 'tracking':
        return {
          title: 'Lamaran Saya',
          subtitle: 'Pelacakan status perkembangan lamaran kamu.',
        };
      case 'documents':
        return {
          title: 'CV & Berkas',
          subtitle: 'Kelola dokumen dan kompilasi PDF terpadu.',
        };
      case 'settings':
        return {
          title: 'Pengaturan',
          subtitle: 'Kelola profil pelamar, koneksi email, dan privasi.',
        };
      default:
        return {
          title: 'KirimKerja',
          subtitle: 'Asisten Lamaran Kerja Semi-Otomatis.',
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-surface-1 dark:bg-[#0D1117] flex flex-col md:flex-row text-gray-900 dark:text-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          waitingCount={waitingCount}
          emailSettings={emailSettings}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenLanding={() => setShowLanding(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header
          title={title}
          subtitle={subtitle}
          profile={profile}
          emailSettings={emailSettings}
          onOpenAddJob={() => setIsAddJobOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              primaryCv={primaryCv}
              applications={applications}
              emailSettings={emailSettings}
              onOpenAddJob={() => setIsAddJobOpen(true)}
              onOpenQueue={() => setCurrentTab('queue')}
              onOpenCompile={() => setIsCompileOpen(true)}
              onReviewApp={(app) => setReviewApp(app)}
            />
          )}

          {currentTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              profile={profile}
              primaryCv={primaryCv}
              onOpenAddJob={() => setIsAddJobOpen(true)}
              onDeleteJob={handleDeleteJob}
              onCreateApplication={handleJobCreated}
            />
          )}

          {currentTab === 'queue' && (
            <QueueView
              applications={applications}
              onReviewApp={(app) => setReviewApp(app)}
              onDeleteApp={handleDeleteApplication}
              onOpenAddJob={() => setIsAddJobOpen(true)}
            />
          )}

          {currentTab === 'tracking' && (
            <TrackingView
              applications={applications}
              onUpdateStatus={handleUpdateAppStatus}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onSetPrimary={handleSetPrimaryCv}
              onDeleteDocument={handleDeleteDocument}
              onUploadDocument={handleUploadDocument}
              onOpenCompile={() => setIsCompileOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              emailSettings={emailSettings}
              onSaveProfile={handleSaveProfile}
              onSaveEmailSettings={handleSaveEmailSettings}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        waitingCount={waitingCount}
      />

      {/* Modals */}
      <ReviewModal
        isOpen={Boolean(reviewApp)}
        application={reviewApp}
        documents={documents}
        emailSettings={emailSettings}
        onClose={() => setReviewApp(null)}
        onApproveAndSend={handleApproveAndSend}
        onSaveDraft={handleSaveDraft}
        onDeleteApplication={handleDeleteApplication}
        onConfirmClaim={handleConfirmClaim}
        onRemoveClaim={handleRemoveClaim}
      />

      <JobIngestModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        profile={profile}
        primaryCv={primaryCv}
        onJobCreated={handleJobCreated}
      />

      <CompileModal
        isOpen={isCompileOpen}
        onClose={() => setIsCompileOpen(false)}
        documents={documents}
        onCompiledSave={handleSaveCompiledDoc}
      />
    </div>
  );
}
