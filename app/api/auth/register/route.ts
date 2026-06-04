import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';
import { sendEmailVerificationCode } from '@/app/lib/mail';

// ─── Helper: generate 6-digit verification code ────────────────────────────────

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      console.log('Registration failed: Missing fields', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Ju lutem plotësoni të gjitha fushat.' },
        { status: 400 }
      );
    }

    const User = getUserModel();
    const emailStr = email.toLowerCase().trim();

    // Kontrollo nëse përdoruesi ekziston
    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      console.log('Registration failed: User already exists', emailStr);
      return NextResponse.json(
        { error: 'Ky email është i regjistruar më parë.' },
        { status: 400 }
      );
    }

    // Hash fjalëkalimin
    const hashedPassword = await bcrypt.hash(password, 12);

    // ─── FIX #1: Generate verification code dhe set expiry (15 min) ─────────────
    const verificationCode = generateVerificationCode();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Krijo përdoruesin e ri - BASHKA me email verification fields
    const newUser = await User.create({
      name,
      email: emailStr,
      password: hashedPassword,
      phone: phone || '',
      savedLocations: { home: '', work: '' },
      travelHistory: [],
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires,
      isEmailVerified: false,  // FIX #1: përdoruesi nuk është i verifikuar ende
    });

    // ─── FIX #2: Dërgim i kodit të verifikimit në email ─────────────────────────
    const emailSent = await sendEmailVerificationCode(emailStr, name, verificationCode);

    if (!emailSent) {
      console.warn(`[Register] Failed to send verification email to ${emailStr}`);
      // I lejojmë përdoruesin të regjistrohet edhe pse email nuk u dërgua
      // (user mund të kërkojë të dërgojë kodin sërish)
    }

    return NextResponse.json({
      message: 'Llogara u krijua! Ju lutem verifikoni email-in tuaj.',
      requiresVerification: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë regjistrimit.' },
      { status: 500 }
    );
  }
}
