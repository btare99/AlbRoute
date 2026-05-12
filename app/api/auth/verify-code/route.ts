import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Ju lutem plotësoni email-in dhe kodin.' }, { status: 400 });
    }

    const User = getUserModel();
    const Operator = getOperatorModel();

    let user = await User.findOne({ 
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
    }

    if (!user) {
      return NextResponse.json({ error: 'Kodi është i pasaktë ose ka skaduar.' }, { status: 400 });
    }


    return NextResponse.json({ message: 'Kodi u verifikua me sukses!' });
  } catch (error: any) {
    console.error('Verify Code Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim gjatë verifikimit.' }, { status: 500 });
  }
}
