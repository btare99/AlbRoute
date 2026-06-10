import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, code, resetToken, newPassword } = await request.json();

    if (!newPassword || (!resetToken && !code)) {
      return NextResponse.json({ error: 'Të gjitha fushat janë të detyrueshme.' }, { status: 400 });
    }

    const usersRef = db.collection('users');
    const operatorsRef = db.collection('operators');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userDoc: Record<string, any> | null = null;
    let userId = "";
    let isOperator = false;

    const nowIso = new Date().toISOString();

    if (resetToken) {
      const userSnapshot = await usersRef.where('resetToken', '==', resetToken).limit(1).get();
      if (!userSnapshot.empty) {
        const doc = userSnapshot.docs[0];
        const data = doc.data();
        if (data.resetTokenExpires && data.resetTokenExpires > nowIso) {
          userId = doc.id;
          userDoc = data;
        }
      }

      if (!userDoc) {
        const opSnapshot = await operatorsRef.where('resetToken', '==', resetToken).limit(1).get();
        if (!opSnapshot.empty) {
          const doc = opSnapshot.docs[0];
          const data = doc.data();
          if (data.resetTokenExpires && data.resetTokenExpires > nowIso) {
            userId = doc.id;
            userDoc = data;
            isOperator = true;
          }
        }
      }
    } else {
      if (!email) {
        return NextResponse.json({ error: 'Email është i detyrueshëm për rivendosjen me kod.' }, { status: 400 });
      }

      const emailStr = email.toLowerCase().trim();
      const userSnapshot = await usersRef.where('email', '==', emailStr).where('resetCode', '==', code).limit(1).get();
      if (!userSnapshot.empty) {
        const doc = userSnapshot.docs[0];
        const data = doc.data();
        if (data.resetCodeExpires && data.resetCodeExpires > nowIso) {
          userId = doc.id;
          userDoc = data;
        }
      }

      if (!userDoc) {
        const opSnapshot = await operatorsRef.where('email', '==', emailStr).where('resetCode', '==', code).limit(1).get();
        if (!opSnapshot.empty) {
          const doc = opSnapshot.docs[0];
          const data = doc.data();
          if (data.resetCodeExpires && data.resetCodeExpires > nowIso) {
            userId = doc.id;
            userDoc = data;
            isOperator = true;
          }
        }
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: 'Lidhja ose kodi është i pasaktë ose ka skaduar.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const targetRef = db.collection(isOperator ? 'operators' : 'users').doc(userId);
    await targetRef.update({
      password: hashedPassword,
      resetCode: null,
      resetCodeExpires: null,
      resetToken: null,
      resetTokenExpires: null,
    });

    return NextResponse.json({ message: 'Fjalëkalimi u ndryshua me sukses!' });
  } catch (error: unknown) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim në server.' }, { status: 500 });
  }
}

