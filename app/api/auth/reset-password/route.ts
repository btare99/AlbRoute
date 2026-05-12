import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Ju lutem plotësoni të gjitha fushat.' }, { status: 400 });
    }

    const User = getUserModel();
    const Operator = getOperatorModel();

    let user = await User.findOne({ 
      email: email.toLowerCase(),
      resetCode: code,
      resetCodeExpires: { $gt: new Date() }
    });
    let isOperator = false;

    if (!user) {
      user = await Operator.findOne({
        email: email.toLowerCase(),
        resetCode: code,
        resetCodeExpires: { $gt: new Date() }
      });
      isOperator = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'Kodi është i pasaktë ose ka skaduar.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user
    if (isOperator) {
      await Operator.updateOne(
        { _id: user._id },
        { 
          $set: { password: hashedPassword },
          $unset: { resetCode: "", resetCodeExpires: "" }
        }
      );
    } else {
      user.password = hashedPassword;
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();
    }


    return NextResponse.json({ message: 'Fjalëkalimi u ndryshua me sukses!' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim gjatë ndryshimit të fjalëkalimit.' }, { status: 500 });
  }
}
