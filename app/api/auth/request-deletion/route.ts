import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { sendDeletionConfirmationCode } from '../../../lib/mail';
import { auth } from '../../../auth';
import { getUserModel } from '../../../lib/dynamicDb';

// ─── Helper: generate 6-digit confirmation code ────────────────────────────────

function generateConfirmationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    const User = getUserModel();

    // ─── FIX #1: Generate 6-digit code dhe expiry (15 min) ──────────────────────
    const confirmationCode = generateConfirmationCode();
    const deletionConfirmationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user — save confirmation code
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        deletionConfirmationCode: confirmationCode,
        deletionConfirmationExpires,
        deletionRequestedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // ─── FIX #2: Send confirmation code email ──────────────────────────────────
    const emailSent = await sendDeletionConfirmationCode(
      email.toLowerCase(),
      session.user.name || 'Udhëtar',
      confirmationCode
    );

    if (!emailSent) {
      console.warn(`[RequestDeletion] Failed to send confirmation email to ${email}`);
      // Allow user to proceed even if email fails
    }

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
