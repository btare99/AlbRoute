import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/mongodb';
import { getRouteModel, getOperatorModel, ALL_ROUTES } from '../../../../lib/dynamicDb';

type StaffCategory = 'Shoferet' | 'Faturinot';

function getCategoryFromRole(role: string): StaffCategory | 'operator' {
  if (role === 'driver') return 'Shoferet';
  if (role === 'inspector') return 'Faturinot';
  return 'operator';
}

function normalizeRouteId(raw: string | null | undefined): string {
  const r = (raw || '').toString().trim();
  return r.startsWith('L') ? r.substring(1) : r;
}

// Build a flexible query that matches by custom 'id' field OR MongoDB '_id'
function buildIdQuery(id: string) {
  const queries: any[] = [{ id }];
  if (mongoose.isValidObjectId(id)) {
    queries.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: queries };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const routeId = normalizeRouteId(searchParams.get('routeId'));

    // Operators are stored globally
    if (role === 'operator') {
      const Model = getOperatorModel();
      const operators = await Model.find({}).lean();
      return NextResponse.json(operators);
    }

    const targetCategories: StaffCategory[] = role
      ? [getCategoryFromRole(role) as StaffCategory]
      : ['Shoferet', 'Faturinot'];

    let allStaff: any[] = [];

    if (routeId) {
      for (const cat of targetCategories) {
        const Model = getRouteModel(routeId, cat);
        const staff = await Model.find({}).lean();
        allStaff = [...allStaff, ...staff];
      }
    } else {
      for (const id of ALL_ROUTES) {
        for (const cat of targetCategories) {
          const Model = getRouteModel(id, cat);
          const staff = await Model.find({}).lean();
          allStaff = [...allStaff, ...staff];
        }
      }
    }

    return NextResponse.json(allStaff);
  } catch (error) {
    console.error('[Staff GET]', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const role = body.role;

    // Normalize routeId: strip leading 'L' (e.g. 'L1A' -> '1A')
    const routeId = normalizeRouteId(body.routeId) || '1A';

    // Ensure 'id' field is always stored explicitly
    const id = body.id || `${role === 'driver' ? 'd' : role === 'inspector' ? 'i' : 'op'}_${Date.now()}`;
    const docToSave = { ...body, id, routeId };

    // Operators go to Global DB
    if (role === 'operator') {
      const Model = getOperatorModel();
      const newOperator = new Model(docToSave);
      await newOperator.save();
      return NextResponse.json(newOperator.toObject(), { status: 201 });
    }

    const cat = getCategoryFromRole(role) as StaffCategory;
    const Model = getRouteModel(routeId, cat);
    const newStaff = new Model(docToSave);
    await newStaff.save();
    return NextResponse.json(newStaff.toObject(), { status: 201 });
  } catch (error) {
    console.error('[Staff POST]', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, role, ...updateData } = body;

    // Normalize routeId
    const routeId = normalizeRouteId(body.routeId || updateData.routeId) || '1A';
    delete updateData.routeId;

    const idQuery = buildIdQuery(id);

    // Operators in Global DB
    if (role === 'operator') {
      const Model = getOperatorModel();
      const updated = await Model.findOneAndUpdate(
        idQuery,
        { $set: { ...updateData, routeId } },
        { new: true, upsert: false }
      );
      if (!updated) return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
      return NextResponse.json(updated.toObject());
    }

    const cat = getCategoryFromRole(role) as StaffCategory;
    const Model = getRouteModel(routeId, cat);
    const updated = await Model.findOneAndUpdate(
      idQuery,
      { $set: { ...updateData, routeId } },
      { new: true, upsert: false }
    );
    if (!updated) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    return NextResponse.json(updated.toObject());
  } catch (error) {
    console.error('[Staff PUT]', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const routeId = normalizeRouteId(searchParams.get('routeId'));
    const role = searchParams.get('role') || 'driver';

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const idQuery = buildIdQuery(id);

    // ── Operators → Global DB ──────────────────────────────────────────────
    if (role === 'operator') {
      const Model = getOperatorModel();
      const result = await Model.findOneAndDelete(idQuery);
      if (!result) {
        return NextResponse.json({ error: 'Operator not found', id }, { status: 404 });
      }
      return NextResponse.json({ message: 'Operator deleted', id });
    }

    // ── Drivers / Inspectors → search exact route first, then all routes ──
    const cat = getCategoryFromRole(role) as StaffCategory;

    // Try exact routeId first (fast path)
    if (routeId) {
      const Model = getRouteModel(routeId, cat);
      const result = await Model.findOneAndDelete(idQuery);
      if (result) {
        return NextResponse.json({ message: 'Staff deleted', id, routeId });
      }
    }

    // Fallback: search through ALL routes (handles missing/wrong routeId)
    for (const rId of ALL_ROUTES) {
      if (rId === routeId) continue; // already tried
      const Model = getRouteModel(rId, cat);
      const result = await Model.findOneAndDelete(idQuery);
      if (result) {
        return NextResponse.json({ message: 'Staff deleted', id, routeId: rId });
      }
    }

    return NextResponse.json({ error: 'Staff not found in any route', id }, { status: 404 });
  } catch (error) {
    console.error('[Staff DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}