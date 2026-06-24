import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import { sendEmailVerificationCode } from '@/app/lib/mail';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email-i është i detyrueshëm.' },
        { status: 400 }
      );
    }

    const emailStr = email.toLowerCase().trim();
    const usersRef = db.collection('users');

    // Kontrollo nëse përdoruesi ekziston
    const snapshot = await usersRef.where('email', '==', emailStr).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Nuk u gjet asnjë llogari me këtë email.' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const userData = doc.data();

    if (userData.isEmailVerified) {
      return NextResponse.json(
        { message: 'Ky email është verifikuar tashmë.', alreadyVerified: true },
        { status: 200 }
      );
    }

    // Gjenero kodin e ri dhe përditëso skadimin (15 minuta)
    const verificationCode = generateVerificationCode();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await doc.ref.update({
      emailVerificationCode: verificationCode,
      emailVerificationExpires,
    });

    // Dërgo kodin e ri
    const emailSent = await sendEmailVerificationCode(emailStr, userData.name || 'Udhëtar', verificationCode);

    if (!emailSent) {
      console.warn(`[Resend Verification] Failed to send email to ${emailStr}`);
      return NextResponse.json(
        { error: 'Dështoi dërgimi i email-it. Ju lutem provoni sërish.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kodi i ri i verifikimit u dërgua në email!',
    });

  } catch (error: unknown) {
    console.error('Resend Verification Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim në server.' },
      { status: 500 }
    );
  }
}
