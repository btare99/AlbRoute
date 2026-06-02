import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongodb';
import { sendEmail } from '../../../lib/mail';

const DELETION_GRACE_DAYS = 30;

function gracePeriodMs() {
  return DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    const db = mongoose.connection;

    // ── Atomic find + update — eliminon race condition ─────────────────────
    const deletionRequest = await db
      .collection('deletion_requests')
      .findOneAndUpdate(
        { token, status: 'pending' },
        { $set: { status: 'confirmed', confirmedAt: new Date() } },
        { returnDocument: 'before' }
      ) as any;

    if (!deletionRequest) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // ── Kontrollo skadimin ─────────────────────────────────────────────────
    if (new Date() > new Date(deletionRequest.expiresAt)) {
      await db.collection('deletion_requests').updateOne(
        { _id: deletionRequest._id },
        { $set: { status: 'expired' } }
      );

      return NextResponse.json(
        { message: 'Token has expired' },
        { status: 400 }
      );
    }

    // ── Data e fshirjes — e llogaritur një herë, e njëjtë kudo ────────────
    const scheduledDeletion = new Date(Date.now() + gracePeriodMs());
    const scheduledDeletionLabel = scheduledDeletion.toLocaleDateString();

    // ── Shëno userin si pending deletion ──────────────────────────────────
    await db.collection('deletion_requests').updateOne(
      { _id: deletionRequest._id },
      { $set: { scheduledDeletionDate: scheduledDeletion } }
    );

    await db.collection('users').updateOne(
      { _id: deletionRequest.userId },
      {
        $set: {
          deletionConfirmed: true,
          deletionScheduledFor: scheduledDeletion,
        },
      }
    );

    // ── Email konfirmimi ───────────────────────────────────────────────────
    await sendEmail({
      to: deletionRequest.email,
      subject: 'Account Deletion Confirmed - Urbani',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmed</h2>
          <p>Your account deletion has been confirmed.</p>
          <p>Your account will be completely deleted on <strong>${scheduledDeletionLabel}</strong>.</p>
          <p style="color: #666; font-size: 12px;">
            During this ${DELETION_GRACE_DAYS}-day period, you can still log in if you change your mind.
            To cancel the deletion, contact our support team.
          </p>
        </div>
      `,
    });

    // ── Redirect to delete account page with confirmation status ──────────
    const appUrl = escapeHtml(process.env.NEXTAUTH_URL ?? 'http://localhost:3000');
    return NextResponse.redirect(`${appUrl}?deleteConfirmed=true&email=${encodeURIComponent(deletionRequest.email)}`, {
      status: 302,
    });
  } catch (error) {
    console.error('Error confirming deletion:', error);
    return NextResponse.json(
      { message: 'Failed to confirm deletion' },
      { status: 500 }
    );
  }
}