import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { getRouteModel, getOperatorModel, ALL_ROUTES } from '../../../lib/dynamicDb';

/**
 * POST /api/auth/staff
 * Public-facing staff authentication (used by the main app login).
 * Checks operators in Global DB first, then drivers/inspectors per-route.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return NextResponse.json({ error: 'Username dhe PIN janë të detyrueshme.' }, { status: 400 });
    }

    const trimmed = username.trim();
    const trimmedPin = pin.trim();

    // ── 1. Operators → Global DB ──────────────────────────────────────────
    const OperatorModel = getOperatorModel();
    const operator = await OperatorModel.findOne({
      $or: [{ username: trimmed }, { personalId: trimmed }],
      pin: trimmedPin,
    }).lean();

    if (operator) {
      const d = operator as any;
      return NextResponse.json({
        user: {
          id: d.id || d._id?.toString(),
          name: d.name,
          username: d.username || d.personalId,
          pin: d.pin,
          role: 'operator',
          routeId: d.routeId,
          weeklyProgram: d.weeklyProgram || null,
          status: d.status || 'Aktiv',
        },
      });
    }

    // ── 2. Drivers & Inspectors → per-route DBs ───────────────────────────
    const staffCategories: Array<'Shoferet' | 'Faturinot'> = ['Shoferet', 'Faturinot'];

    for (const routeId of ALL_ROUTES) {
      for (const cat of staffCategories) {
        const Model = getRouteModel(routeId, cat);
        const user = await Model.findOne({
          $or: [{ username: trimmed }, { personalId: trimmed }],
          pin: trimmedPin,
        }).lean();

        if (user) {
          const d = user as any;
          const role = cat === 'Shoferet' ? 'driver' : 'inspector';
          return NextResponse.json({
            user: {
              id: d.id || d._id?.toString(),
              name: d.name,
              username: d.username || d.personalId,
              pin: d.pin,
              role,
              routeId,
              weeklyProgram: d.weeklyProgram || null,
              status: d.status || 'Aktiv',
            },
          });
        }
      }
    }

    return NextResponse.json({ error: 'Username ose PIN i pasaktë.' }, { status: 401 });
  } catch (error) {
    console.error('[Auth/Staff]', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit.' }, { status: 500 });
  }
}
