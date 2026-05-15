import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

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

    // Krijo përdoruesin e ri
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      savedLocations: { home: '', work: '' },
      travelHistory: [],
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return NextResponse.json({
      message: 'Llogaria u krijua me sukses!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        savedLocations: newUser.savedLocations,
        travelHistory: newUser.travelHistory
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
