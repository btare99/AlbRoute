import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getBusModel } from '@/app/lib/dynamicDb';
import { BUS_SHAPES } from '@/app/store/busShapes';

export async function GET() {
  try {
    await connectDB();
    const Bus = getBusModel();
    
    // Fetch all active buses from the Global database
    const rawBuses = await Bus.find({ status: 'Aktiv' }).lean();
    
    const simulatedBuses = rawBuses.map((bus: any) => {
      const routeCode = bus.routeId || '';
      
      // Determine the shape key
      const isReturn = bus.direction === 'return';
      const shapeKey = isReturn ? `L${routeCode}_1` : `L${routeCode}_0`;
      const fallbackShapeKey = `L${routeCode}`;
      
      const shape = BUS_SHAPES[shapeKey] || BUS_SHAPES[fallbackShapeKey] || BUS_SHAPES[`${routeCode}_0`] || BUS_SHAPES[`${routeCode}_1`] || BUS_SHAPES[routeCode] || [];
      
      if (shape && shape.length > 0) {
        // Deterministic movement based on current timestamp
        // Spread different buses on the same route by generating a hash offset from the ID
        let idHash = 0;
        const busIdStr = String(bus.id || '');
        for (let i = 0; i < busIdStr.length; i++) {
          idHash += busIdStr.charCodeAt(i);
        }
        
        const speedFactor = 3000; // time in ms to move to the next coordinate point (e.g. 3 seconds)
        const ticks = Math.floor((Date.now() + idHash * 12345) / speedFactor);
        const currentIdx = ticks % shape.length;
        
        const currentCoord = shape[currentIdx];
        if (currentCoord && currentCoord.length === 2) {
          return {
            ...bus,
            lat: currentCoord[0],
            lng: currentCoord[1],
            currentPointIdx: currentIdx,
          };
        }
      }
      
      return bus;
    });
    
    return NextResponse.json(simulatedBuses);
  } catch (error) {
    console.error('Error fetching buses from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}
