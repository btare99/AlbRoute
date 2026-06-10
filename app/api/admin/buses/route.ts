import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const routeId = searchParams.get('routeId');

    const busesRef = db.collection('buses');

    if (id) {
      const doc = await busesRef.doc(id).get();
      if (!doc.exists) {
        return NextResponse.json(null);
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    if (routeId) {
      // Normalize routeId for query
      const norm = routeId.startsWith('L') ? routeId.substring(1) : routeId;
      const snapshot = await busesRef.where('routeId', 'in', [norm, `L${norm}`]).get();
      const data: Record<string, unknown>[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return NextResponse.json(data);
    }

    const snapshot = await busesRef.get();
    const allBuses: Record<string, unknown>[] = [];
    snapshot.forEach(doc => {
      allBuses.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(allBuses);
  } catch (error) {
    console.error('Failed to fetch buses:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const busesRef = db.collection('buses');
    const id = body.id || busesRef.doc().id;
    const newBus = { ...body, id };
    await busesRef.doc(id).set(newBus);
    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error('Failed to create bus:', error);
    return NextResponse.json({ error: 'Failed to create bus' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    const docRef = db.collection('buses').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return NextResponse.json({ id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Failed to update bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await db.collection('buses').doc(id).delete();
    return NextResponse.json({ message: 'Bus deleted' });
  } catch (error) {
    console.error('Failed to delete bus:', error);
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 });
  }
}