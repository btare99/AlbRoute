import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Ju lutem plotësoni të gjitha fushat e detyrueshme.' },
        { status: 400 }
      );
    }

    const User = getUserModel();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Ky email është i regjistruar më parë.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      savedLocations: { home: '', work: '' },
      travelHistory: [],
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Përdoruesi u regjistrua me sukses!', userId: newUser._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Ndodhi një gabim gjatë regjistrimit.', error: error.message },
      { status: 500 }
    );
  }
}
