import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';
import { auth } from "../../../auth";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Ju duhet të jeni i loguar.' }, { status: 401 });
    }

    await connectDB();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Të gjitha fushat janë të detyrueshme.' }, { status: 400 });
    }

    const UserModel = getUserModel();
    const user = await UserModel.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ error: 'Përdoruesi nuk u gjet.' }, { status: 404 });
    }

    // Nëse përdoruesi është loguar me Google, mund të mos ketë fjalëkalim fillestar
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Fjalëkalimi aktual është i pasaktë.' }, { status: 400 });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Fjalëkalimi u përditësua me sukses!' });
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim në server.' }, { status: 500 });
  }
}
