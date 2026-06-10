import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/app/lib/firebaseAdmin';

const SECURITY_MESSAGE = 'Nëse kjo llogari ekziston, një kod është dërguar.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Ju lutem jepni email-in.' },
        { status: 400 }
      );
    }

    const usersRef = db.collection('users');
    const operatorsRef = db.collection('operators');

    // Gjej userin dhe identifiko tipin
    const userSnapshot = await usersRef.where('email', '==', email).limit(1).get();
    let isOperator = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userDoc: Record<string, any> | null = null;
    let userId = "";

    if (!userSnapshot.empty) {
      const doc = userSnapshot.docs[0];
      userId = doc.id;
      userDoc = doc.data();
    } else {
      const opSnapshot = await operatorsRef.where('email', '==', email).limit(1).get();
      if (!opSnapshot.empty) {
        const doc = opSnapshot.docs[0];
        userId = doc.id;
        userDoc = doc.data();
        isOperator = true;
      }
    }

    if (!userDoc) {
      return NextResponse.json({ message: SECURITY_MESSAGE });
    }

    // Gjenero token të sigurt për lidhjen e rivendosjes
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const resetLink = `${origin}/?resetToken=${encodeURIComponent(resetToken)}`;

    // Përditëso në mënyrë konsistente
    const targetRef = db.collection(isOperator ? 'operators' : 'users').doc(userId);
    await targetRef.update({
      resetToken,
      resetTokenExpires,
      resetCode: null
    });

    // Dërgo email
    const { sendResetLinkEmail } = await import('@/app/lib/mail');
    const emailSent = await sendResetLinkEmail(userDoc.email, userDoc.name || '', resetLink);

    if (!emailSent) {
      console.error('[Forgot Password] Failed to send reset link for', userDoc.email);
      return NextResponse.json({ message: SECURITY_MESSAGE });
    }

    return NextResponse.json({ message: 'Nëse kjo llogari ekziston, një email me lidhjen për rivendosje u dërgua.' });

  } catch (error: unknown) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim i brendshëm.' },
      { status: 500 }
    );
  }
}