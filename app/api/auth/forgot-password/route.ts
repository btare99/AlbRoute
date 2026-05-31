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

    // Gjenero token të sigurt për lidhjen e rivendosjes
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const resetLink = `${origin}/?resetToken=${encodeURIComponent(resetToken)}`;

    // Përditëso në mënyrë konsistente
    const model = isOperator ? Operator : User;
    await model.updateOne(
      { _id: user._id },
      {
        $set: { resetToken, resetTokenExpires },
        $unset: { resetCode: '' }
      }
    );

    // Dërgo email
    const { sendResetLinkEmail } = await import('@/app/lib/mail');
    const emailSent = await sendResetLinkEmail(user.email, user.name || '', resetLink);

    if (!emailSent) {
      // Log failure but do not reveal to client; return generic success for security
      console.error('[Forgot Password] Failed to send reset link for', user.email);
      // Keep the token in DB so admins can inspect, but do not expose failure to client
      return NextResponse.json({ message: SECURITY_MESSAGE });
    }

    return NextResponse.json({ message: 'Nëse kjo llogari ekziston, një email me lidhjen për rivendosje u dërgua.' });

  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Ndodhi një gabim i brendshëm.' },
      { status: 500 }
    );
  }
}