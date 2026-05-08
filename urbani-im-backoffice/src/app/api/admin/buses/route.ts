import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/mongodb';
import { getBusModel, getRouteModel } from '../../../../lib/dynamicDb';

function normalizeRouteId(raw: string | null | undefined): string {
  const r = (raw || '').toString().trim();
  return r.startsWith('L') ? r.substring(1) : r;
}

function buildIdQuery(id: string) {
  const queries: any[] = [{ id }, { plate: id }];
  if (mongoose.isValidObjectId(id)) {
    queries.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: queries };
}

async function syncStaffWithBus(busDoc: any, oldStaffIds?: { driverId?: string, inspectorId?: string }) {
  try {
    const routeId = normalizeRouteId(busDoc.routeId);
    const busPlate = busDoc.plate || busDoc.id;
    const busId = busDoc.id || busDoc._id?.toString();

    const DriverModel = getRouteModel(routeId, 'Shoferet');
    const InspectorModel = getRouteModel(routeId, 'Faturinot');

    if (oldStaffIds?.driverId && oldStaffIds.driverId !== busDoc.driverId) {
      await DriverModel.updateMany(
        { id: oldStaffIds.driverId },
        { $set: { bussAssigned: '', assignedBusId: '', assignedBusPlate: '' } }
      );
    }
    if (oldStaffIds?.inspectorId && oldStaffIds.inspectorId !== busDoc.inspectorId) {
      await InspectorModel.updateMany(
        { id: oldStaffIds.inspectorId },
        { $set: { bussAssigned: '', assignedBusId: '', assignedBusPlate: '' } }
      );
    }

    if (busDoc.driverId) {
      await DriverModel.updateMany(
        { assignedBusId: busId, id: { $ne: busDoc.driverId } },
        { $set: { bussAssigned: '', assignedBusId: '', assignedBusPlate: '' } }
      );
      await DriverModel.updateMany(
        { id: busDoc.driverId },
        { $set: { bussAssigned: busPlate, assignedBusId: busId, assignedBusPlate: busPlate } }
      );
    }

    if (busDoc.inspectorId) {
      await InspectorModel.updateMany(
        { assignedBusId: busId, id: { $ne: busDoc.inspectorId } },
        { $set: { bussAssigned: '', assignedBusId: '', assignedBusPlate: '' } }
      );
      await InspectorModel.updateMany(
        { id: busDoc.inspectorId },
        { $set: { bussAssigned: busPlate, assignedBusId: busId, assignedBusPlate: busPlate } }
      );
    }
  } catch (err) {
    console.error('[syncStaffWithBus Error]:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const rawRouteId = searchParams.get('routeId');
    const id = searchParams.get('id');
    const Model = getBusModel();
    if (id) {
      const bus = await Model.findOne(buildIdQuery(id)).lean();
      return NextResponse.json(bus);
    }
    if (rawRouteId) {
      const norm = normalizeRouteId(rawRouteId);
      const buses = await Model.find({ $or: [{ routeId: norm }, { routeId: `L${norm}` }] }).lean();
      return NextResponse.json(buses || []);
    }
    const allBuses = await Model.find({}).lean();
    return NextResponse.json(allBuses || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const routeId = normalizeRouteId(body.routeId);
    const id = body.id || body.plate || `bus_${Date.now()}`;
    const Model = getBusModel();
    const newBus = new Model({ ...body, id, routeId });
    await newBus.save();
    await syncStaffWithBus(newBus.toObject());
    return NextResponse.json(newBus.toObject(), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'ID req' }, { status: 400 });
    if (updateData.routeId) updateData.routeId = normalizeRouteId(updateData.routeId);
    const Model = getBusModel();
    const idQuery = buildIdQuery(id);
    const oldBus = await Model.findOne(idQuery).lean() as any;
    const updated = await Model.findOneAndUpdate(idQuery, { $set: updateData }, { new: true, upsert: true });
    if (updated) {
      await syncStaffWithBus(updated.toObject(), {
        driverId: oldBus?.driverId,
        inspectorId: oldBus?.inspectorId,
      });
    }
    return NextResponse.json(updated!.toObject());
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const Model = getBusModel();
    const busToDelete = await Model.findOne(buildIdQuery(id!)).lean() as any;
    await Model.findOneAndDelete(buildIdQuery(id!));
    if (busToDelete) {
      await syncStaffWithBus({ ...busToDelete, driverId: null, inspectorId: null }, {
        driverId: busToDelete.driverId,
        inspectorId: busToDelete.inspectorId,
      });
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
