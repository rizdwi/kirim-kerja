import { UserProfile, DocumentItem, JobPost, ApplicationClaim, AdaptedSection } from '@/types';

export interface PersonalizeResult {
  subject: string;
  coverLetter: string;
  adaptedSections: AdaptedSection[];
  claims: ApplicationClaim[];
}

async function generateText(prompt: string): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI generation gagal');
  return data.text as string;
}

// Humanizer rules baked into every prompt: no em-dashes, no buzzwords,
// warm professional Indonesian, grounded ONLY in CV facts.
const HUMANIZER = `Aturan bahasa (W AJIB dipatuhi):
- Bahasa Indonesia profesional yang hangat dan natural, seperti ditulis manusia.
- JANGAN pakai em dash (—). JANGAN pakai buzzword kosong ("cutting-edge", "ninja", "rockstar", "passionate" berlebihan).
- Hanya tulis fakta yang ada di CV. JANGAN mengarang pengalaman, angka, atau keahlian baru.`;

export const AiPersonalizationService = {
  async personalize(
    profile: UserProfile,
    primaryCv: DocumentItem,
    job: JobPost
  ): Promise<PersonalizeResult> {
    const cvText = (primaryCv.extractedText || '').slice(0, 6000);
    const jobDesc = (job.description || '').slice(0, 3000);
    const company = job.company || 'Perusahaan';
    const position = job.title || 'Posisi';

    const prompt = `Kamu asisten lamaran kerja. Buatkan surat lamaran kerja personal.

DATA PELAMAR (CV):
${cvText || '(CV kosong)'}
Nama: ${profile.fullName}
Email: ${profile.email} | Telp: ${profile.phone}

LOWONGAN:
Posisi: ${position}
Perusahaan: ${company}
Deskripsi: ${jobDesc || '(tidak ada deskripsi)'}

${HUMANIZER}

Tugas:
1. Subject email lamaran (1 baris).
2. Surat lamaran lengkap: salam pembuka "Yth. Tim Rekrutmen ${company}," — perkenalan singkat — 1 paragraf relevansi (kaitkan 2-3 keahlian/pengalaman NYATA dari CV dengan kebutuhan lowongan) — 1 paragraf nilai tambah — penutup dengan ajakan wawancara — tanda tangan (nama, telp, email).
3. Daftar klaim yang perlu konfirmasi user: bila surat menyebut hal yang TIDAK jelas ada di CV (mis. pengalaman memimpin, metrik), tulis sebagai daftar terpisah.

Format jawaban PERSIS seperti ini:
SUBJECT: <subject>
---
SURAT:
<isi surat>
---
KLAIM_PERLU_KONFIRMASI:
- <klaim 1> | kategori: <pengalaman/keahlian/metrik>
- <klaim 2> | kategori: <...>
(jika tidak ada, tulis: TIDAK ADA)`;

    const raw = await generateText(prompt);

    // Parse structured response
    const subjectMatch = raw.match(/SUBJECT:\s*(.+)/);
    const letterMatch = raw.match(/SURAT:\s*([\s\S]*?)\n---\s*KLAIM_PERLU_KONFIRMASI:/);
    const claimsMatch = raw.match(/KLAIM_PERLU_KONFIRMASI:\s*([\s\S]*)$/);

    const subject =
      subjectMatch?.[1]?.trim() ||
      `Lamaran Pekerjaan: ${position} - ${profile.fullName}`;
    const coverLetter =
      letterMatch?.[1]?.trim() ||
      raw.slice(0, 3000);

    const claims: ApplicationClaim[] = [];
    const claimsRaw = claimsMatch?.[1]?.trim() || '';
    if (claimsRaw && !/TIDAK ADA/i.test(claimsRaw)) {
      claimsRaw
        .split('\n')
        .map((l) => l.replace(/^-\s*/, '').trim())
        .filter(Boolean)
        .forEach((line, i) => {
          const [text, cat] = line.split('|').map((s) => s.trim());
          claims.push({
            id: `clm_${Date.now()}_${i}`,
            text: text || line,
            category: (cat?.replace('kategori:', '').trim() ||
              'pengalaman') as ApplicationClaim['category'],
            status: 'unconfirmed',
          });
        });
    }

    const adaptedSections: AdaptedSection[] = [
      {
        id: 'adp_ai_personalize',
        field: 'Personalisasi AI',
        originalText: 'Template generik surat lamaran.',
        adaptedText:
          'Surat disusun AI berdasarkan isi CV dan deskripsi lowongan, mengikuti aturan grounding (tanpa fakta karangan).',
        evidence: `CV: ${primaryCv.displayName} | Lowongan: ${position} @ ${company}`,
      },
    ];

    return { subject, coverLetter, adaptedSections, claims };
  },
};
