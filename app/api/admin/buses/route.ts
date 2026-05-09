import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { getRouteModel, ALL_ROUTES, getBusModel } from '../../../lib/dynamicDb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const routeId = searchParams.get('routeId');

    const Model = getBusModel();

    if (id) {
      const bus = await Model.findOne({ id });
      return NextResponse.json(bus);
    }

    if (routeId) {
      // Normalize routeId for query
      const norm = routeId.startsWith('L') ? routeId.substring(1) : routeId;
      const data = await Model.find({ $or: [{ routeId: norm }, { routeId: `L${norm}` }] });
      return NextResponse.json(data);
    }

    const allBuses = await Model.find({});
    return NextResponse.json(allBuses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const Model = getBusModel();
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
    const { id, ...updateData } = body;
    const Model = getBusModel();
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
    const Model = getBusModel();
    await Model.findOneAndDelete({ id });
    return NextResponse.json({ message: 'Bus deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 });
  }
}