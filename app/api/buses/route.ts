import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { getBusModel } from '@/app/lib/dynamicDb';

export async function GET() {
  try {
    await connectDB();
    const Bus = getBusModel();
    
    // Fetch all active buses from the Global database
    const buses = await Bus.find({ status: 'Aktiv' }).lean();
    
    return NextResponse.json(buses);
  } catch (error) {
    console.error('Error fetching buses from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}
