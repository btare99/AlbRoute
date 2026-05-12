import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Ju lutem plotësoni email-in dhe fjalëkalimin.' },
        { status: 400 }
      );
    }

    const User = getUserModel();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: 'Email ose fjalëkalim i pasaktë.' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email ose fjalëkalim i pasaktë.' },
        { status: 401 }
      );
    }

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      savedLocations: user.savedLocations || { home: '', work: '' },
      travelHistory: user.travelHistory || [],
      subscriptionPhoto: user.subscriptionPhoto,
      idNumber: user.idNumber,
      university: user.university,
      serialNumber: user.serialNumber,
      selectedLine: user.selectedLine
    };

    return NextResponse.json(
      { message: 'Login i suksesshëm!', user: userResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Ndodhi një gabim gjatë login-it.', error: error.message },
      { status: 500 }
    );
  }
}
