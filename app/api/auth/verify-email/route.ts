import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email dhe kodi janë të detyrueshëm.' },
        { status: 400 }
      );
    }

    const emailStr = email.toLowerCase().trim();
    const usersRef = db.collection('users');

    // Kërko përdoruesin me kodin e verifikimit të emailit
    const userSnapshot = await usersRef
      .where('email', '==', emailStr)
      .where('emailVerificationCode', '==', code)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'Kodi është i pasaktë ose ka skaduar.' },
        { status: 400 }
      );
    }

    const doc = userSnapshot.docs[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = doc.data() as Record<string, any>;
    const nowIso = new Date().toISOString();

    if (!user.emailVerificationExpires || user.emailVerificationExpires <= nowIso) {
      return NextResponse.json(
        { error: 'Kodi është i pasaktë ose ka skaduar.' },
        { status: 400 }
      );
    }

    // Përditëso përdoruesin — markoje si i verifikuar
    await doc.ref.update({
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Email-i u verifikua me sukses!',
      verified: true,
    });
  } catch (error: unknown) {
    console.error('Email Verification Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë verifikimit të email-it.' },
      { status: 500 }
    );
  }
}

