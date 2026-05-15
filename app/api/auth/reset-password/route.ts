import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Të gjitha fushat janë të detyrueshme.' }, { status: 400 });
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
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
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
    }

    return NextResponse.json({ message: 'Fjalëkalimi u ndryshua me sukses!' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim në server.' }, { status: 500 });
  }
}
