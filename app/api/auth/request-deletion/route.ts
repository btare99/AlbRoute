import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { sendEmail } from '../../../lib/mail';
import { auth } from '../../../auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth() as any;
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { email } = await req.json();

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if email matches user's account email
    if (email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { message: 'Email does not match account email' },
        { status: 400 }
      );
    }

    await connectDB();
    const mongoose = require('mongoose');
    const db = mongoose.connection;

    // Create a deletion token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store deletion request in database
    await db.collection('deletion_requests').updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          email: session.user.email,
          token,
          expiresAt,
          status: 'pending',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Send confirmation email
    const confirmUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/confirm-deletion?token=${token}`;

    await sendEmail({
      to: session.user.email,
      subject: 'Confirm Account Deletion - Urbani',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmation</h2>
          <p>Hi ${session.user.name || 'User'},</p>
          <p>We received a request to delete your account. To confirm this action, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #ef4444; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold;">
              Confirm Account Deletion
            </a>
          </div>
          
          <p>Or paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
          
          <p style="color: #666; font-size: 12px;">
            This link expires in 24 hours. If you did not request this deletion, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">
            After confirmation, your account will be completely deleted within 30 days.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Confirmation email sent. Please check your inbox.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error requesting deletion:', error);
    return NextResponse.json(
      { message: 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}
