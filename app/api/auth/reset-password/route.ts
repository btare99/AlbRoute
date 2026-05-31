import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, code, resetToken, newPassword } = await request.json();

    if (!newPassword || (!resetToken && !code)) {
      return NextResponse.json({ error: 'Të gjitha fushat janë të detyrueshme.' }, { status: 400 });
    }

    const User = getUserModel();
    const Operator = getOperatorModel();
    let user = null;
    let isOperator = false;

    if (resetToken) {
      user = await User.findOne({
        resetToken,
        resetTokenExpires: { $gt: new Date() }
      });

      if (!user) {
        user = await Operator.findOne({
          resetToken,
          resetTokenExpires: { $gt: new Date() }
        });
        isOperator = !!user;
      }
    } else {
      if (!email) {
        return NextResponse.json({ error: 'Email është i detyrueshëm për rivendosjen me kod.' }, { status: 400 });
      }

      user = await User.findOne({
        email: email.toLowerCase(),
        resetCode: code,
        resetCodeExpires: { $gt: new Date() }
      });

      if (!user) {
        user = await Operator.findOne({
          email: email.toLowerCase(),
          resetCode: code,
          resetCodeExpires: { $gt: new Date() }
        });
        isOperator = !!user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Lidhja ose kodi është i pasaktë ose ka skaduar.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isOperator) {
      await Operator.updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: { resetCode: '', resetCodeExpires: '', resetToken: '' }
        }
      );
    } else {
      user.password = hashedPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.resetToken = undefined;
      await user.save();
    }

    return NextResponse.json({ message: 'Fjalëkalimi u ndryshua me sukses!' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim në server.' }, { status: 500 });
  }
}
