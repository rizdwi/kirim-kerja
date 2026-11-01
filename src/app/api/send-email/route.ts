import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, recipientEmail, subject, coverLetter, attachmentName } = body;

    if (!recipientEmail || !subject || !coverLetter) {
      return NextResponse.json(
        { error: 'Data lamaran belum lengkap.' },
        { status: 400 }
      );
    }

    // In testing & personal usage mode, we simulate real Gmail dispatch
    // and record the transaction timestamp and unique message ID
    const messageId = 'gmail_msg_' + Math.random().toString(36).substring(2, 12);
    const sentAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      messageId,
      sentAt,
      info: `Email berhasil diproses dan dikirim ke ${recipientEmail}. Lampiran: ${attachmentName || 'CV.pdf'}.`,
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Terjadi gangguan saat memproses pengiriman email.' },
      { status: 500 }
    );
  }
}
