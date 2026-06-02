import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getRouteModel, getOperatorModel, ALL_ROUTES } from '@/lib/dynamicDb';

const COLLECTION_TO_ROLE: Record<string, string> = {
  Shoferet: 'driver',
  Faturinot: 'inspector',
  Operatoret: 'operator',
};

/**
 * POST /api/admin/auth
 * Authenticates any staff member (operator, driver, inspector) by searching MongoDB.
 * - Operators → Global DB
 * - Drivers/Inspectors → per-route DBs
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return NextResponse.json(
        { error: 'Username dhe PIN janë të detyrueshme.' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedPin = pin.trim();

    // ── 1. Search Operators first (Global DB) ──────────────────────────────
    const OperatorModel = getOperatorModel();
    const operator = await OperatorModel.findOne({
      $or: [
        { username: trimmedUsername },
        { personalId: trimmedUsername },
      ],
      pin: trimmedPin,
    }).lean();

    if (operator) {
      const data = operator as any;
      return NextResponse.json({
        user: {
          id: data.id || data._id?.toString(),
          name: data.name,
          username: data.username || data.personalId,
          pin: data.pin,
          role: 'operator',
          routeId: data.routeId,
          weeklyProgram: data.weeklyProgram || null,
          status: data.status || 'Aktiv',
        },
      });
    }

    // ── 2. Search Drivers & Inspectors across all routes ───────────────────
    const staffCollections: Array<'Shoferet' | 'Faturinot'> = ['Shoferet', 'Faturinot'];

    for (const routeId of ALL_ROUTES) {
      for (const collection of staffCollections) {
        const Model = getRouteModel(routeId, collection);
        const user = await Model.findOne({
          $or: [
            { username: trimmedUsername },
            { personalId: trimmedUsername },
          ],
          pin: trimmedPin,
        }).lean();

        if (user) {
          const role = COLLECTION_TO_ROLE[collection];
          const data = user as any;
          return NextResponse.json({
            user: {
              id: data.id || data._id?.toString(),
              name: data.name,
              username: data.username || data.personalId,
              pin: data.pin,
              role,
              routeId,
              weeklyProgram: data.weeklyProgram || null,
              status: data.status || 'Aktiv',
            },
          });
        }
      }
    }

    return NextResponse.json(
      { error: 'Username ose PIN i pasaktë.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit.' },
      { status: 500 }
    );
  }
}
