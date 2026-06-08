import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getBusModel } from '@/app/lib/dynamicDb';
import { BUS_SHAPES } from '@/app/store/busShapes';

const ALL_ROUTES = [
  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C',
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];

export async function GET() {
  try {
    await connectDB();
    const Bus = getBusModel();

    // 1. Delete existing buses
    await Bus.deleteMany({});

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
        lastUpdate: new Date()
      };

      const newBus = new Bus(busDoc);
      await newBus.save();
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
          lastUpdate: new Date()
        };
        const newReturnBus = new Bus(returnBusDoc);
        await newReturnBus.save();
        seededBuses.push(returnBusDoc);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seededBuses.length} buses successfully.`,
      buses: seededBuses
    });
  } catch (error: any) {
    console.error('Error seeding buses:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to seed buses' }, { status: 500 });
  }
}
