import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Të gjitha fushat janë të detyrueshme.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Fjalëkalimi i ri duhet të jetë të paktën 6 karaktere.' },
        { status: 400 }
      );
    }

    // Try finding in users collection first
    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();
    let targetCollection = 'users';

    if (!userDoc.exists) {
      // Try operators collection
      const opRef = db.collection('operators').doc(userId);
      userDoc = await opRef.get();
      targetCollection = 'operators';
    }

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Përdoruesi nuk u gjet.' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData || !userData.password) {
      return NextResponse.json(
        { error: 'Ky përdorues nuk ka një fjalëkalim të vendosur (p.sh. llogari Google).' },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Fjalëkalimi aktual është i pasaktë.' },
        { status: 400 }
      );
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection(targetCollection).doc(userId).update({
      password: hashedPassword
    });

    return NextResponse.json({
      message: 'Fjalëkalimi u ndryshua me sukses!'
    });

  } catch (error: unknown) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim në server gjatë ndryshimit të fjalëkalimit.' },
      { status: 500 }
    );
  }
}
