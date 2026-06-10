import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID e përdoruesit mungon.' }, { status: 400 });
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Përdoruesi nuk u gjet.' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userDoc.data() as Record<string, any>;

    return NextResponse.json({
      id: userDoc.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      savedLocations: user.savedLocations,
      travelHistory: user.travelHistory,
      lastLocation: user.lastLocation
    });

  } catch (error: unknown) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json({ error: 'Gabim në server.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID e përdoruesit mungon.' },
        { status: 400 }
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Përdoruesi nuk u gjet.' },
        { status: 404 }
      );
    }

    // Update user in Firestore
    await userRef.update(updateData);
    const updatedUserSnapshot = await userRef.get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedUser = updatedUserSnapshot.data() as Record<string, any>;

    return NextResponse.json({
      message: 'Profili u përditësua me sukses!',
      user: {
        id: updatedUserSnapshot.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        savedLocations: updatedUser.savedLocations,
        travelHistory: updatedUser.travelHistory,
        idNumber: updatedUser.idNumber,
        university: updatedUser.university,
        serialNumber: updatedUser.serialNumber,
        selectedLine: updatedUser.selectedLine,
        lastLocation: updatedUser.lastLocation
      }
    });

  } catch (error: unknown) {
    console.error('Update Profile Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë përditësimit të profilit.' },
      { status: 500 }
    );
  }
}


