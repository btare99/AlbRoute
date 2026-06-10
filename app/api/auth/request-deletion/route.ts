import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';
import { sendDeletionConfirmationCode } from '../../../lib/mail';
import { auth } from '../../../auth';

// ─── Helper: generate 6-digit confirmation code ────────────────────────────────

function generateConfirmationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth() as { user?: { id?: string; email?: string | null; name?: string | null } } | null;
    
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

    if (!session.user.id) {
      return NextResponse.json(
        { message: 'User ID is missing from session' },
        { status: 400 }
      );
    }

    const userRef = db.collection('users').doc(session.user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const confirmationCode = generateConfirmationCode();
    const deletionConfirmationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Update user — save confirmation code
    await userRef.update({
      deletionConfirmationCode: confirmationCode,
      deletionConfirmationExpires,
      deletionRequestedAt: new Date().toISOString(),
    });

    // Send confirmation code email
    const emailSent = await sendDeletionConfirmationCode(
      email.toLowerCase(),
      session.user.name || 'Udhëtar',
      confirmationCode
    );

    if (!emailSent) {
      console.warn(`[RequestDeletion] Failed to send confirmation email to ${email}`);
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
