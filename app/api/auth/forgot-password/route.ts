import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';

const SECURITY_MESSAGE = 'Nëse kjo llogari ekziston, një kod është dërguar.';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Ju lutem jepni email-in.' },
        { status: 400 }
      );
    }

    const User = getUserModel();
    const Operator = getOperatorModel();

    // Gjej userin dhe identifiko tipin
    let user = await User.findOne({ email });
    let isOperator = false;

    if (!user) {
      user = await Operator.findOne({ email });
      if (user) isOperator = true; // ✅ Fix: vendoset vetëm nëse u gjet
    }

    if (!user) {
      return NextResponse.json({ message: SECURITY_MESSAGE });
    }

    // Gjenero kod të sigurt
    const resetCode = crypto.randomInt(100000, 999999).toString(); // ✅ crypto
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Përditëso në mënyrë konsistente
    const model = isOperator ? Operator : User;
    await model.updateOne(
      { _id: user._id },
      { $set: { resetCode, resetCodeExpires } }
    );

    // Dërgo email
    const { sendResetCodeEmail } = await import('@/app/lib/mail');
    const emailSent = await sendResetCodeEmail(user.email, user.name, resetCode);

    if (!emailSent) {
      // Pastro kodin nëse emaili dështoi
      await model.updateOne(
        { _id: user._id },
        { $unset: { resetCode: '', resetCodeExpires: '' } }
      );
      return NextResponse.json(
        { error: 'Ndodhi një gabim gjatë dërgimit të email-it.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Kodi u dërgua me sukses!' });

  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim i brendshëm.' },
      { status: 500 }
    );
  }
}