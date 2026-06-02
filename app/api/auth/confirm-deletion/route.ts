import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { sendEmail } from '../../../lib/mail';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const mongoose = require('mongoose');
    const db = mongoose.connection;

    // Find deletion request
    const deletionRequest = await db.collection('deletion_requests').findOne({
      token,
      status: 'pending',
    }) as any;

    if (!deletionRequest) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > new Date(deletionRequest.expiresAt)) {
      // Mark as expired
      await db.collection('deletion_requests').updateOne(
        { _id: deletionRequest._id },
        { $set: { status: 'expired' } }
      );

      return NextResponse.json(
        { message: 'Token has expired' },
        { status: 400 }
      );
    }

    // Mark deletion request as confirmed
    await db.collection('deletion_requests').updateOne(
      { _id: deletionRequest._id },
      {
        $set: {
          status: 'confirmed',
          confirmedAt: new Date(),
          scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      }
    );

    // Mark user as pending deletion
    await db.collection('users').updateOne(
      { _id: deletionRequest.userId },
      {
        $set: {
          deletionConfirmed: true,
          deletionScheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }
    );

    // Send confirmation email
    await sendEmail({
      to: deletionRequest.email,
      subject: 'Account Deletion Confirmed - Urbani',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmed</h2>
          <p>Your account deletion has been confirmed.</p>
          <p>Your account will be completely deleted on ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
          
          <p style="color: #666; font-size: 12px;">
            During this 30-day period, you can still log in if you change your mind.
            To cancel the deletion, contact our support team.
          </p>
        </div>
      `,
    });

    // Return HTML response with success message
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deletion Confirmed - Urbani</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center; }
            h1 { color: #22c55e; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; }
            .success { color: #22c55e; font-weight: bold; }
            .button { display: inline-block; margin-top: 20px; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Account Deletion Confirmed</h1>
            <p>Your account deletion request has been confirmed.</p>
            <p>Your account will be completely deleted on <strong>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              During this 30-day period, you can still log in if you change your mind.
              To cancel the deletion, contact our support team at support@albroute.al
            </p>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">Return to App</a>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error confirming deletion:', error);
    return NextResponse.json(
      { message: 'Failed to confirm deletion' },
      { status: 500 }
    );
  }
}
