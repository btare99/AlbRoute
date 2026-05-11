import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { id, name, email, savedLocations, avatar } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID e përdoruesit mungon.' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          email,
          savedLocations,
          avatar
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Përdoruesi nuk u gjet.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profili u përditësua me sukses',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        savedLocations: updatedUser.savedLocations,
        avatar: updatedUser.avatar
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
