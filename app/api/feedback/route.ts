import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mesazhi nuk mund të jetë i zbrazët' },
        { status: 400 }
      );
    }

    // Këtu mund të ruani feedback-un në bazën e të dhënave
    // Për shembull:
    // const feedback = await db.feedback.create({
    //   message: message.trim(),
    //   createdAt: new Date(),
    //   userAgent: request.headers.get('user-agent'),
    //   ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    // });

    console.log('Feedback mori:', {
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    // Këtu mund të dërgoni një email ose të bëni diçka tjetër
    // await sendFeedbackEmail(message.trim());

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback-u u dërgua me sukses' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gabim në dërgimin e feedback-ut:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë dërgimit të feedback-ut' },
      { status: 500 }
    );
  }
}
