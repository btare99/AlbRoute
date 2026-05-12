import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';

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
        subscriptionPhoto: updatedUser.subscriptionPhoto,
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
