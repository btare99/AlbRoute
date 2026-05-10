import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Email ose fjalëkalimi është i gabuar.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Hyrje e suksesshme',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        savedLocations: user.savedLocations,
        travelHistory: user.travelHistory
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë hyrjes.' },
      { status: 500 }
    );
  }
}
