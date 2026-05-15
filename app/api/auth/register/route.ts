import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { name, email, password, phone } = body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Name, email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const emailStr = email.toLowerCase().trim();

    // ── Connect and check for duplicate ──────────────────────────────────
    await connectDB();
    const User = getUserModel();

    const existing = await User.findOne({ email: emailStr }).lean();
    if (existing) {
      return NextResponse.json(
        { error: 'This email is already registered.' },
        { status: 400 }
      );
    }

    // ── Hash password and create user ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name:           name.trim(),
      email:          emailStr,
      password:       hashedPassword,
      phone:          phone?.trim() ?? '',
      savedLocations: { home: '', work: '' },
      travelHistory:  [],
    });

    console.log('✅ New user registered:', emailStr);

    return NextResponse.json(
      {
        message: 'Account created successfully!',
        user: {
          id:    newUser._id.toString(),
          name:  newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Server error during registration.' },
      { status: 500 }
    );
  }
}
