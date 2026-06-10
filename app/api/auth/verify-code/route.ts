import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email dhe kodi janë të detyrueshëm.' }, { status: 400 });
    }

    const emailStr = email.toLowerCase().trim();
    const usersRef = db.collection('users');
    const operatorsRef = db.collection('operators');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userDoc: Record<string, any> | null = null;
    const nowIso = new Date().toISOString();

    const userSnapshot = await usersRef.where('email', '==', emailStr).where('resetCode', '==', code).limit(1).get();
    if (!userSnapshot.empty) {
      const data = userSnapshot.docs[0].data();
      if (data.resetCodeExpires && data.resetCodeExpires > nowIso) {
        userDoc = data;
      }
    }

    if (!userDoc) {
      const opSnapshot = await operatorsRef.where('email', '==', emailStr).where('resetCode', '==', code).limit(1).get();
      if (!opSnapshot.empty) {
        const data = opSnapshot.docs[0].data();
        if (data.resetCodeExpires && data.resetCodeExpires > nowIso) {
          userDoc = data;
        }
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: 'Kodi është i pasaktë ose ka skaduar.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Kodi u verifikua me sukses.' });
  } catch (error: unknown) {
    console.error('Verify Code Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim në server.' }, { status: 500 });
  }
}

