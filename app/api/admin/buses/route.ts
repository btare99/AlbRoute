import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { getRouteModel, ALL_ROUTES } from '../../../lib/dynamicDb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');

    if (routeId) {
      const Model = getRouteModel(routeId, 'Autobusat');
      const data = await Model.find({});
      return NextResponse.json(data);
    } else {
      let allBuses: any[] = [];
      for (const id of ALL_ROUTES) {
        const Model = getRouteModel(id, 'Autobusat');
        const buses = await Model.find({});
        allBuses = [...allBuses, ...buses];
      }
      return NextResponse.json(allBuses);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const routeId = body.routeId || 'Global';
    const Model = getRouteModel(routeId, 'Autobusat');
    const newBus = new Model(body);
    await newBus.save();
    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bus' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, routeId, ...updateData } = body;
    const Model = getRouteModel(routeId || 'Global', 'Autobusat');
    const updatedBus = await Model.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' });
    if (!updatedBus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBus);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const routeId = searchParams.get('routeId') || 'Global';
    const Model = getRouteModel(routeId, 'Autobusat');
    await Model.findOneAndDelete({ id });
    return NextResponse.json({ message: 'Bus deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 });
  }
}