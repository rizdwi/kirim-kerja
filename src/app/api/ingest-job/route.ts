import { NextRequest, NextResponse } from 'next/server';
import { ApplyType, JobPost } from '@/types';

// Helper to check SSRF
function isPrivateIpOrHost(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();

    // Check localhost & local domains
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return true;
    }

    // Check private IPv4 ranges (10.x, 192.168.x, 172.16-31.x, 169.254.x)
    const ipv4Match = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4Match) {
      const b1 = parseInt(ipv4Match[1], 10);
      const b2 = parseInt(ipv4Match[2], 10);
      if (b1 === 10) return true;
      if (b1 === 192 && b2 === 168) return true;
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return true;
      if (b1 === 169 && b2 === 254) return true;
      if (b1 === 0 || b1 === 127) return true;
    }

    return false;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, rawText } = body;

    // Handle Manual Text Paste
    if (rawText && (!url || url.trim() === '')) {
      const text = String(rawText).trim();
      const firstLine = text.split('\n')[0] || 'Posisi Pekerjaan';
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

      const job: JobPost = {
        id: 'job_' + Date.now(),
        title: firstLine.slice(0, 80),
        company: 'Perusahaan Terkait',
        location: 'Indonesia',
        description: text,
        applyType: emailMatch ? 'email' : 'manual',
        contactEmail: emailMatch ? emailMatch[0] : undefined,
        extractionStatus: 'berhasil',
        confidenceLabel: 'Perlu dicek',
        fetchedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, job });
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Tautan lowongan wajib diisi.' }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // Check protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Tautan harus diawali dengan http:// atau https://' },
        { status: 400 }
      );
    }

    // SSRF Check
    if (isPrivateIpOrHost(cleanUrl)) {
      return NextResponse.json(
        { error: 'Alamat IP privat atau lokal tidak diperbolehkan.' },
        { status: 403 }
      );
    }

    // Excluded sources rule (AFD 7: Glint & KitaLulus diblokir)
    const lowerUrl = cleanUrl.toLowerCase();
    if (
      lowerUrl.includes('glints.com') ||
      lowerUrl.includes('glint') ||
      lowerUrl.includes('kitalulus.com') ||
      lowerUrl.includes('kitalulus')
    ) {
      return NextResponse.json(
        { error: 'Sumber ini tidak didukung dan telah diblokir dari sistem.' },
        { status: 400 }
      );
    }

    // Attempt Fetching
    let html = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      html = await res.text();
    } catch {
      // If blocked or fetch failed, fallback to asking user or creating manual draft
      const urlObj = new URL(cleanUrl);
      const companyGuess = urlObj.hostname.replace('www.', '').split('.')[0];
      const job: JobPost = {
        id: 'job_' + Date.now(),
        sourceUrl: cleanUrl,
        title: 'Posisi di ' + companyGuess.toUpperCase(),
        company: companyGuess.charAt(0).toUpperCase() + companyGuess.slice(1),
        location: 'Indonesia',
        description: `Halaman ${cleanUrl} memerlukan verifikasi atau input manual. Silakan lengkapi detail lowongan.`,
        applyType: 'manual',
        extractionStatus: 'butuh_input_manual',
        confidenceLabel: 'Perlu dicek',
        fetchedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, job, warning: 'Halaman tidak bisa dibuka secara langsung. Detail dapat diedit.' });
    }

    // Parse Title & Company
    let title = 'Posisi Pekerjaan';
    let company = 'Perusahaan Terkait';
    let location = 'Indonesia';
    let description = '';
    let applyType: ApplyType = 'email';
    let contactEmail: string | undefined;
    let applyUrl: string | undefined;

    // Check JSON-LD
    const jsonLdMatch = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch && jsonLdMatch[1]) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        const jobData = parsed['@type'] === 'JobPosting' ? parsed : Array.isArray(parsed) ? parsed.find((p: { '@type': string }) => p['@type'] === 'JobPosting') : null;
        if (jobData) {
          if (jobData.title) title = jobData.title;
          if (jobData.hiringOrganization?.name) company = jobData.hiringOrganization.name;
          if (jobData.jobLocation?.address?.addressLocality) location = jobData.jobLocation.address.addressLocality;
          if (jobData.description) description = jobData.description.replace(/<[^>]+>/g, ' ').slice(0, 1000);
        }
      } catch {
        // continue to heuristics
      }
    }

    // Heuristics fallback
    if (title === 'Posisi Pekerjaan') {
      const titleTagMatch = html.match(/<title>([^<]*)<\/title>/i);
      if (titleTagMatch && titleTagMatch[1]) {
        const rawTitle = titleTagMatch[1].trim();
        const parts = rawTitle.split(/[-–|]/);
        title = parts[0]?.trim() || rawTitle;
        if (parts[1]) company = parts[1].trim();
      }
    }

    // Detect Email
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches && emailMatches.length > 0) {
      // Find candidate recruiter email, filter out common webmaster/support
      const recruiterCandidate = emailMatches.find((e) =>
        /recruiter|hr|karir|career|jobs|recruitment|talent/i.test(e)
      ) || emailMatches[0];
      contactEmail = recruiterCandidate;
      applyType = 'email';
    } else {
      // Form apply
      applyType = 'form';
      applyUrl = cleanUrl;
    }

    if (!description) {
      const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      description = metaDesc ? metaDesc[1] : `Lowongan untuk posisi ${title} di ${company}.`;
    }

    const job: JobPost = {
      id: 'job_' + Date.now(),
      sourceUrl: cleanUrl,
      title: title.slice(0, 100),
      company: company.slice(0, 100),
      location: location.slice(0, 80),
      description: description.slice(0, 1500),
      applyType,
      contactEmail,
      applyUrl,
      extractionStatus: 'berhasil',
      confidenceLabel: contactEmail ? 'Terdeteksi otomatis' : 'Perlu dicek',
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Job ingestion error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses tautan lowongan. Coba tempel teks lowongannya.' },
      { status: 500 }
    );
  }
}
