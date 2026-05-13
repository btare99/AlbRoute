import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Ju lutem jepni email-in dhe fjalëkalimin.' },
        { status: 400 }
      );
    }

    const User = getUserModel();
    const Operator = getOperatorModel();

    // Gjej përdoruesin në Udhetaret ose Operatoret
    let user = await User.findOne({ email: email.toLowerCase() });
    let role = 'user';

    if (!user) {
      user = await Operator.findOne({ email: email.toLowerCase() });
      role = (user as any)?.role || 'operator';
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ose fjalëkalim i pasaktë.' },
        { status: 401 }
      );
    }

    // Krahaso fjalëkalimin e hash-uar
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Email ose fjalëkalim i pasaktë.' },
        { status: 401 }
      );
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({
      message: 'Hyrje e suksesshme',
      user: {
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
        selectedLine: user.selectedLine,
        role: role
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
