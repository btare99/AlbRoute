import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';
import { sendEmail } from '../../../lib/mail';
import { auth } from '../../../auth';

const DELETION_GRACE_DAYS = 30;

function gracePeriodMs() {
  return DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log('[confirm-deletion] Session:', session?.user?.email);
    
    if (!session?.user) {
      console.log('[confirm-deletion] Not authenticated');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { email, code } = await req.json();
    console.log('[confirm-deletion] Received email:', email, 'code length:', code?.length);

    if (!email || !code) {
      console.log('[confirm-deletion] Missing email or code');
      return NextResponse.json(
        { message: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Validate email matches user's account email
    if (email.toLowerCase() !== session.user.email?.toLowerCase()) {
      console.log('[confirm-deletion] Email mismatch - received:', email, 'session:', session.user.email);
      return NextResponse.json(
        { message: 'Email does not match account email' },
        { status: 400 }
      );
    }

    const emailStr = email.toLowerCase().trim();
    const usersRef = db.collection('users');

    // Find user and verify code
    const userSnapshot = await usersRef
      .where('email', '==', emailStr)
      .where('deletionConfirmationCode', '==', code)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { message: 'Invalid or expired confirmation code' },
        { status: 400 }
      );
    }

    const doc = userSnapshot.docs[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = doc.data() as Record<string, any>;
    const nowIso = new Date().toISOString();

    if (!user.deletionConfirmationExpires || user.deletionConfirmationExpires <= nowIso) {
      return NextResponse.json(
        { message: 'Invalid or expired confirmation code' },
        { status: 400 }
      );
    }

    // Calculate deletion date
    const scheduledDeletion = new Date(Date.now() + gracePeriodMs());
    const scheduledDeletionLabel = scheduledDeletion.toLocaleDateString();

    // Mark user for deletion
    await doc.ref.update({
      isMarkedForDeletion: true,
      scheduledDeletionDate: scheduledDeletion.toISOString(),
      deletionConfirmationCode: null,
      deletionConfirmationExpires: null,
    });

    // Send confirmation email
    await sendEmail({
      to: emailStr,
      subject: 'Account Deletion Confirmed - Urbani',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmed</h2>
          <p>Your account deletion has been confirmed.</p>
          <p>Your account will be completely deleted on <strong>${scheduledDeletionLabel}</strong>.</p>
          <p style="color: #666; font-size: 12px;">
            During this ${DELETION_GRACE_DAYS}-day period, you can still log in if you change your mind.
            To cancel the deletion, contact our support team at support@albroute.al.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { 
        message: 'Account deletion confirmed. Your account will be deleted in 30 days.',
        scheduledDeletionDate: scheduledDeletion,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error confirming deletion:', error);
    return NextResponse.json(
      { message: 'Failed to confirm deletion' },
      { status: 500 }
    );
  }
}