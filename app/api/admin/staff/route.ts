import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { getRouteModel, getOperatorModel, ALL_ROUTES } from '../../../lib/dynamicDb';

type StaffCategory = 'Shoferet' | 'Faturinot';

function getCategoryFromRole(role: string): StaffCategory | 'operator' {
  if (role === 'driver') return 'Shoferet';
  if (role === 'inspector') return 'Faturinot';
  return 'operator';
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const routeId = searchParams.get('routeId');

    // Operators come from Global DB
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
    console.error('[Main Staff GET]', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const role = body.role;

    if (role === 'operator') {
      const Model = getOperatorModel();
      const newOp = new Model(body);
      await newOp.save();
      return NextResponse.json(newOp.toObject(), { status: 201 });
    }

    const routeId = body.routeId || '1A';
    const cat = getCategoryFromRole(role) as StaffCategory;
    const Model = getRouteModel(routeId, cat);
    const newStaff = new Model(body);
    await newStaff.save();
    return NextResponse.json(newStaff.toObject(), { status: 201 });
  } catch (error) {
    console.error('[Main Staff POST]', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, routeId, role, ...updateData } = body;

    if (role === 'operator') {
      const Model = getOperatorModel();
      const updated = await Model.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );
      if (!updated) return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
      return NextResponse.json(updated.toObject());
    }

    const cat = getCategoryFromRole(role) as StaffCategory;
    const Model = getRouteModel(routeId || '1A', cat);
    const updated = await Model.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    return NextResponse.json(updated.toObject());
  } catch (error) {
    console.error('[Main Staff PUT]', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const routeId = searchParams.get('routeId') || '1A';
    const role = searchParams.get('role') || 'driver';

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    if (role === 'operator') {
      const Model = getOperatorModel();
      await Model.findOneAndDelete({ id });
      return NextResponse.json({ message: 'Operator deleted' });
    }

    const cat = getCategoryFromRole(role) as StaffCategory;
    const Model = getRouteModel(routeId, cat);
    await Model.findOneAndDelete({ id });
    return NextResponse.json({ message: 'Staff deleted' });
  } catch (error) {
    console.error('[Main Staff DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}