import { UserProfile, DocumentItem, JobPost, ApplicationClaim, AdaptedSection } from '@/types';

export interface PersonalizeResult {
  subject: string;
  coverLetter: string;
  adaptedSections: AdaptedSection[];
  claims: ApplicationClaim[];
}

export const AiPersonalizationService = {
  personalize(
    profile: UserProfile,
    primaryCv: DocumentItem,
    job: JobPost
  ): PersonalizeResult {
    const cvText = primaryCv.extractedText || '';
    const jobDesc = job.description || '';
    const company = job.company || 'Perusahaan';
    const position = job.title || 'Posisi';

    // Subject email: clean, professional
    const subject = `Lamaran Pekerjaan: ${position} - ${profile.fullName}`;

    // Extract key skills mentioned in CV
    const skillsInCv: string[] = [];
    ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL', 'SQL', 'Git', 'REST API', 'Figma', 'UI/UX'].forEach((sk) => {
      if (new RegExp(sk, 'i').test(cvText)) {
        skillsInCv.push(sk);
      }
    });

    // Check if job asks for leadership or metrics
    const asksLeadership = /lead|memimpin|lead developer|tech lead|senior|manage/i.test(jobDesc);
    const hasLeadershipInCv = /memimpin|lead|supervisor|kepala|manager/i.test(cvText);

    // Adapted sections (evidence grounding)
    const adaptedSections: AdaptedSection[] = [
      {
        id: 'adp_role_match',
        field: 'Kesesuaian Posisi',
        originalText: `Pengalaman web development dengan fokus ekosistem modern: ${skillsInCv.slice(0, 4).join(', ')}.`,
        adaptedText: `Menyesuaikan pembuka dan penekanan keahlian utama untuk relevansi langsung dengan peran ${position} di ${company}.`,
        evidence: `CV Bagian Ringkasan & Keahlian (${primaryCv.displayName})`,
      },
    ];

    // Grounding check for new claims
    const claims: ApplicationClaim[] = [];
    if (asksLeadership && !hasLeadershipInCv) {
      claims.push({
        id: 'clm_' + Date.now() + '_1',
        text: `Memiliki kesiapan dan pengalaman mengarahkan implementasi teknis tim untuk peran ${position}`,
        category: 'pengalaman',
        status: 'unconfirmed',
      });
    }

    // Cover letter generation following humanizer guidelines:
    // NO em dashes, warm and professional tone, zero buzzwords
    const coverLetter = `Yth. Tim Rekrutmen ${company},

Perkenalkan, saya ${profile.fullName}, seorang pengembang web dengan latar belakang di bidang ${profile.interests[0] || 'pengembangan perangkat lunak'}. Melalui surat ini, saya ingin menyampaikan ketertarikan saya untuk berkontribusi sebagai ${position} di ${company}.

Berdasarkan deskripsi lowongan yang disampaikan, ${company} membutuhkan tenaga profesional yang siap merancang solusi efisien dan dapat diandalkan. Mengacu pada pengalaman kerja saya sebelumnya, saya terbiasa membangun antarmuka web yang rapi, memastikan performa optimal, serta mengintegrasikan API dengan standar kode yang terstruktur.

Keahlian utama saya mencakup ${skillsInCv.length > 0 ? skillsInCv.join(', ') : 'pengembangan web modern'}, yang saya yakini dapat langsung mendukung kebutuhan operasional tim Anda. Saya terbiasa berkomunikasi aktif, cepat beradaptasi, dan mengedepankan kualitas hasil kerja.

Bersama surat ini, saya melampirkan berkas CV saya (${primaryCv.displayName}) untuk bahan pertimbangan lebih lanjut. Saya sangat terbuka untuk kesempatan wawancara agar dapat menjelaskan lebih mendalam mengenai bagaimana kompetensi saya dapat memberikan nilai tambah bagi ${company}.

Terima kasih atas waktu dan perhatian yang Bapak/Ibu berikan.

Hormat saya,
${profile.fullName}
${profile.phone} | ${profile.email}`;

    return {
      subject,
      coverLetter,
      adaptedSections,
      claims,
    };
  },
};
