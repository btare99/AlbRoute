import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import bcrypt from 'bcryptjs';
import { sendEmailVerificationCode } from '@/app/lib/mail';

// ─── Helper: generate 6-digit verification code ────────────────────────────────

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      console.log('Registration failed: Missing fields', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Ju lutem plotësoni të gjitha fushat.' },
        { status: 400 }
      );
    }

    const emailStr = email.toLowerCase().trim();
    const usersRef = db.collection('users');

    // Kontrollo nëse përdoruesi ekziston
    const snapshot = await usersRef.where('email', '==', emailStr).limit(1).get();
    if (!snapshot.empty) {
      console.log('Registration failed: User already exists', emailStr);
      return NextResponse.json(
        { error: 'Ky email është i regjistruar më parë.' },
        { status: 400 }
      );
    }

    // Hash fjalëkalimin
    const hashedPassword = await bcrypt.hash(password, 12);

    // ─── Generate verification code dhe set expiry (15 min) ─────────────
    const verificationCode = generateVerificationCode();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const userDocRef = usersRef.doc();
    const newUser = {
      name,
      email: emailStr,
      password: hashedPassword,
      phone: phone || '',
      savedLocations: { home: '', work: '' },
      travelHistory: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires,
      isEmailVerified: false,
    };

    await userDocRef.set(newUser);

    // ─── Dërgim i kodit të verifikimit në email ─────────────────────────
    const emailSent = await sendEmailVerificationCode(emailStr, name, verificationCode);

    if (!emailSent) {
      console.warn(`[Register] Failed to send verification email to ${emailStr}`);
    }

    return NextResponse.json({
      message: 'Llogara u krijua! Ju lutem verifikoni email-in tuaj.',
      requiresVerification: true,
      user: {
        id: userDocRef.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë regjistrimit.' },
      { status: 500 }
    );
  }
}

