import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email dhe kodi janë të detyrueshëm.' },
        { status: 400 }
      );
    }

    const User = getUserModel();
    const emailStr = email.toLowerCase().trim();

    // Kërko përdoruesin me kodin e verifikimit të emailit
    const user = await User.findOne({
      email: emailStr,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kodi është i pasaktë ose ka skaduar.' },
        { status: 400 }
      );
    }

    // Përditëso përdoruesin — markoje si i verifikuar
    await User.findByIdAndUpdate(
      user._id,
      {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Email-i u verifikua me sukses!',
      verified: true,
    });
  } catch (error: any) {
    console.error('Email Verification Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë verifikimit të email-it.' },
      { status: 500 }
    );
  }
}
