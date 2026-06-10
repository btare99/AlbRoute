import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import { BUS_SHAPES } from '@/app/store/busShapes';

const ALL_ROUTES = [
  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C',
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];

export async function GET() {
  try {
    const busesRef = db.collection('buses');

    // 1. Fetch existing buses to delete
    const snapshot = await busesRef.get();
    
    // We will use batches to perform deletes and sets. 
    // Firestore batch limit is 500 operations.
    let batch = db.batch();
    let opCount = 0;

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      opCount++;
    });

    const seededBuses = [];

    // 2. Loop through each route and create a bus at its start coordinate
    for (const routeCode of ALL_ROUTES) {
      // Look for the shape coordinate
      const shapeKey = `L${routeCode}_0`;
      const fallbackShapeKey = `L${routeCode}`;
      const shape = BUS_SHAPES[shapeKey] || BUS_SHAPES[fallbackShapeKey] || BUS_SHAPES[`${routeCode}_0`] || BUS_SHAPES[routeCode] || [];

      let lat = 41.3275;
      let lng = 19.8187;

      if (shape && shape.length > 0) {
        lat = shape[0][0];
        lng = shape[0][1];
      }

      // Generate a mock plate number
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randomLetters = () => letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
      const randomDigits = () => Math.floor(100 + Math.random() * 900);
      const plate = `AB ${randomDigits()} ${randomLetters()}`;

      const busDoc = {
        id: `B_${routeCode}_1`,
        routeId: routeCode, // e.g. "1A"
        lat,
        lng,
        currentPointIdx: 0,
        direction: 'forward',
        speed: 30 + Math.floor(Math.random() * 10),
        passengerLoad: 10 + Math.floor(Math.random() * 30),
        nextStop: 'Nisja',
        delay: 0,
        status: 'Aktiv',
        ticks: 0,
        plate,
        brand: 'Mercedes-Benz',
        capacity: 60,
        lastUpdate: new Date().toISOString()
      };

      if (opCount >= 400) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }

      const docRef = busesRef.doc(busDoc.id);
      batch.set(docRef, busDoc);
      opCount++;
      seededBuses.push(busDoc);

      // Create a second bus in the return direction (if we have shape coords and return points)
      const returnShapeKey = `L${routeCode}_1`;
      const returnShape = BUS_SHAPES[returnShapeKey] || [];
      if (returnShape && returnShape.length > 0) {
        const returnBusDoc = {
          id: `B_${routeCode}_2`,
          routeId: routeCode,
          lat: returnShape[0][0],
          lng: returnShape[0][1],
          currentPointIdx: 0,
          direction: 'return',
          speed: 30 + Math.floor(Math.random() * 10),
          passengerLoad: 10 + Math.floor(Math.random() * 30),
          nextStop: 'Kthimi',
          delay: 0,
          status: 'Aktiv',
          ticks: 0,
          plate: `AB ${randomDigits()} ${randomLetters()}`,
          brand: 'Mercedes-Benz',
          capacity: 60,
          lastUpdate: new Date().toISOString()
        };

        if (opCount >= 400) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }

        const returnDocRef = busesRef.doc(returnBusDoc.id);
        batch.set(returnDocRef, returnBusDoc);
        opCount++;
        seededBuses.push(returnBusDoc);
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seededBuses.length} buses successfully in Firestore.`,
      buses: seededBuses
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to seed buses';
    console.error('Error seeding buses in Firestore:', error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

