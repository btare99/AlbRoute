import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, name, image } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email është i nevojshëm.' },
        { status: 400 }
      );
    }

    const User = getUserModel();

    // Gjej ose krijo përdoruesin
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Krijo përdorues të ri nga Google
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: '', // Google users don't need password
        phone: '',
        savedLocations: { home: '', work: '' },
        travelHistory: [],
        subscriptionPhoto: image || '',
        idNumber: '',
        university: '',
        serialNumber: '',
        selectedLine: '',
        lastLogin: new Date(),
      });
      await user.save();
    } else {
      // Update lastLogin for existing user
      user.lastLogin = new Date();
      await user.save();
    }

    return NextResponse.json({
      message: 'Hyrje e suksesshme me Google',
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
        role: 'user'
      }
    });
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë hyrjes me Google.' },
      { status: 500 }
    );
  }
}