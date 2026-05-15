import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Ju lutem jepni email-in.' }, { status: 400 });
    }

    const User = getUserModel();
    const Operator = getOperatorModel();
    
    let user = await User.findOne({ email: email.toLowerCase() });
    let isOperator = false;

    if (!user) {
      user = await Operator.findOne({ email: email.toLowerCase() });
      isOperator = true;
    }

    if (!user) {
      // For security reasons, don't reveal if user exists or not
      return NextResponse.json({ message: 'Nëse kjo llogari ekziston, një kod është dërguar.' });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update the correct document
    if (isOperator) {
      await Operator.updateOne(
        { _id: user._id },
        { $set: { resetCode, resetCodeExpires } }
      );
    } else {
      user.resetCode = resetCode;
      user.resetCodeExpires = resetCodeExpires;
      await user.save();
    }


    // Send Email using centralized utility
    const { sendResetCodeEmail } = await import('@/app/lib/mail');
    const emailSent = await sendResetCodeEmail(user.email, user.name, resetCode);

    if (!emailSent) {
      return NextResponse.json({ error: 'Ndodhi një gabim gjatë dërgimit të email-it.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Kodi u dërgua me sukses!' });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim gjatë dërgimit të email-it.' }, { status: 500 });
  }
}
