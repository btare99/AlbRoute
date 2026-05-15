import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID e përdoruesit mungon.' }, { status: 400 });
    }

    const User = getUserModel();
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'Përdoruesi nuk u gjet.' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      savedLocations: user.savedLocations,
      travelHistory: user.travelHistory,
      idNumber: user.idNumber,
      university: user.university,
      serialNumber: user.serialNumber,
      selectedLine: user.selectedLine,
      subscriptions: user.subscriptions
    });

  } catch (error: any) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json({ error: 'Gabim në server.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID e përdoruesit mungon.' },
        { status: 400 }
      );
    }

    const User = getUserModel();

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Përdoruesi nuk u gjet.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profili u përditësua me sukses!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        savedLocations: updatedUser.savedLocations,
        travelHistory: updatedUser.travelHistory,
        idNumber: updatedUser.idNumber,
        university: updatedUser.university,
        serialNumber: updatedUser.serialNumber,
        selectedLine: updatedUser.selectedLine
      }
    });

  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë përditësimit të profilit.' },
      { status: 500 }
    );
  }
}
