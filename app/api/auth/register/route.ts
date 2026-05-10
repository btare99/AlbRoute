import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    console.log('--- Fillon procesi i regjistrimit ---');
    await connectDB();
    const body = await request.json();
    console.log('Të dhënat e marra:', { ...body, password: '***' });
    
    const { name, email, password, phone } = body;

    // Kontrollo nëse përdoruesi ekziston
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { error: 'Ky email është i regjistruar.' },
        { status: 400 }
      );
    }

    // Krijo përdoruesin e ri
    const user = await User.create({
      name,
      email,
      password, // Shënim: Në një projekt real duhet të bëhet hashing (bcrypt)
      phone,
    });

    return NextResponse.json(
      { message: 'Përdoruesi u krijua me sukses', user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Dështoi regjistrimi. Provoni përsëri.' },
      { status: 500 }
    );
  }
}
