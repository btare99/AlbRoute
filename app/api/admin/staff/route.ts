import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const routeId = searchParams.get('routeId');

    // Operators come from 'operators' collection
    if (role === 'operator') {
      const snapshot = await db.collection('operators').get();
      const operators: Record<string, unknown>[] = [];
      snapshot.forEach(doc => {
        operators.push({ id: doc.id, ...doc.data() });
      });
      return NextResponse.json(operators);
    }

    // Drivers and Conductor/Inspectors come from 'staff' collection
    let query: FirebaseFirestore.Query = db.collection('staff');
    if (routeId) {
      query = query.where('routeId', '==', routeId);
    }
    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    const allStaff: Record<string, unknown>[] = [];
    snapshot.forEach(doc => {
      allStaff.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(allStaff);
  } catch (error) {
    console.error('[Main Staff GET]', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const role = body.role;

    if (role === 'operator') {
      const opId = body.id || db.collection('operators').doc().id;
      const newOp = { ...body, id: opId };
      await db.collection('operators').doc(opId).set(newOp);
      return NextResponse.json(newOp, { status: 201 });
    }

    const staffId = body.id || db.collection('staff').doc().id;
    const newStaff = { ...body, id: staffId };
    await db.collection('staff').doc(staffId).set(newStaff);
    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error('[Main Staff POST]', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (role === 'operator') {
      const docRef = db.collection('operators').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
      }
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return NextResponse.json({ id, ...updatedDoc.data() });
    }

    const docRef = db.collection('staff').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return NextResponse.json({ id, ...updatedDoc.data() });
  } catch (error) {
    console.error('[Main Staff PUT]', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role') || 'driver';

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (role === 'operator') {
      await db.collection('operators').doc(id).delete();
      return NextResponse.json({ message: 'Operator deleted' });
    }

    await db.collection('staff').doc(id).delete();
    return NextResponse.json({ message: 'Staff deleted' });
  } catch (error) {
    console.error('[Main Staff DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}