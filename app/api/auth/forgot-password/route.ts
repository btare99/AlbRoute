import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getUserModel, getOperatorModel } from '@/app/lib/dynamicDb';
import nodemailer from 'nodemailer';

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


    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    const mailOptions = {
      from: `"Urbani Im" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Kodi i Rivendosjes së Fjalëkalimit - Urbani Im',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f59e0b; text-align: center;">Urbani Im</h2>
          <p>Përshëndetje <strong>${user.name}</strong>,</p>
          <p>Keni kërkuar rivendosjen e fjalëkalimit. Përdorni kodin e mëposhtëm për të vazhduar:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #111; border-radius: 8px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p style="color: #666; font-size: 14px;">Ky kod është i vlefshëm për 10 minuta. Nëse nuk e keni kërkuar ju këtë, ju lutem injoroni këtë email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Urbani Im - Tirana Public Transport</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Kodi u dërgua me sukses!' });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Ndodhi një gabim gjatë dërgimit të email-it.' }, { status: 500 });
  }
}
