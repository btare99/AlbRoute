import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseAdmin';
import { BUS_SHAPES } from '@/app/store/busShapes';
import { BUS_ROUTES, BUS_STOPS } from '@/app/constants/busData';

interface BusDocument {
  id: string;
  routeId?: string;
  direction?: 'forward' | 'return';
  lat?: number;
  lng?: number;
  speed?: number;
  status?: string;
  isRealGPS?: boolean;
  [key: string]: unknown;
}

// ─── IN-MEMORY SERVER CACHE ──────────────────────────────────────────────────
let cachedBuses: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2500; // Cache for 2.5 seconds

// ─── GEOMETRY HELPERS FOR REAL-TIME STOP MATCHING ────────────────────────────

const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function distanceToSegment(pLat: number, pLng: number, aLat: number, aLng: number, bLat: number, bLng: number) {
  const dx = bLng - aLng;
  const dy = bLat - aLat;
  const len2 = dx * dx + dy * dy;
  
  let t = 0;
  if (len2 > 0) {
    t = ((pLng - aLng) * dx + (pLat - aLat) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
  }
  
  const cLat = aLat + t * dy;
  const cLng = aLng + t * dx;
  
  return {
    distance: haversineMeters(pLat, pLng, cLat, cLng),
    t: t
  };
}

function getStopMatchingForRealGPS(bus: BusDocument) {
  const routeCode = bus.routeId || '';
  
  // Find the route in constants (e.g. L1A)
  const route = BUS_ROUTES.find((r: any) => r.id === routeCode || r.id === `L${routeCode}`);
  if (!route) {
    return {
      currentStop: '',
      nextStop: '',
      status: bus.speed && bus.speed > 3 ? 'moving' : 'stopped'
    };
  }

  const isReturn = bus.direction === 'return';
  const sIds = isReturn ? (route.returnStops || [...route.stops].reverse()) : route.stops;
  if (!sIds || sIds.length === 0) {
    return {
      currentStop: '',
      nextStop: '',
      status: bus.speed && bus.speed > 3 ? 'moving' : 'stopped'
    };
  }

  // Find stop configurations with coordinates
  const stops = sIds.map((id: string) => BUS_STOPS.find((s: any) => s.id === id)).filter(Boolean) as any[];
  if (stops.length === 0) {
    return {
      currentStop: '',
      nextStop: '',
      status: bus.speed && bus.speed > 3 ? 'moving' : 'stopped'
    };
  }

  const busLat = bus.lat || 0;
  const busLng = bus.lng || 0;
  const busSpeed = typeof bus.speed === 'number' ? bus.speed : 0;

  // Watchdog offline check: 60 seconds threshold
  let lastUpdateMs = Date.now();
  if (bus.lastUpdate) {
    if (typeof (bus.lastUpdate as any).toDate === 'function') {
      lastUpdateMs = (bus.lastUpdate as any).toDate().getTime();
    } else {
      lastUpdateMs = new Date(bus.lastUpdate as any).getTime();
    }
  }
  const isOffline = (Date.now() - lastUpdateMs) > 60000;

  let minSegmentDist = Infinity;
  let bestSegmentIdx = -1;
  let bestSegmentT = 0;

  // Project bus onto the segments between consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    const sA = stops[i];
    const sB = stops[i + 1];
    const { distance, t } = distanceToSegment(busLat, busLng, sA.lat, sA.lng, sB.lat, sB.lng);
    if (distance < minSegmentDist) {
      minSegmentDist = distance;
      bestSegmentIdx = i;
      bestSegmentT = t;
    }
  }

  let currentStop = '';
  let nextStop = '';

  if (stops.length === 1) {
    const dist = haversineMeters(busLat, busLng, stops[0].lat, stops[0].lng);
    if (dist < 45) {
      currentStop = stops[0].name;
    }
    nextStop = '';
  } else if (bestSegmentIdx !== -1) {
    const sA = stops[bestSegmentIdx];
    const sB = stops[bestSegmentIdx + 1];
    
    const distA = haversineMeters(busLat, busLng, sA.lat, sA.lng);
    const distB = haversineMeters(busLat, busLng, sB.lat, sB.lng);

    if (distB < 45) {
      currentStop = sB.name;
      nextStop = bestSegmentIdx + 2 < stops.length ? stops[bestSegmentIdx + 2].name : '';
    } else if (distA < 45) {
      currentStop = sA.name;
      nextStop = sB.name;
    } else {
      currentStop = '';
      nextStop = sB.name;
    }
  } else {
    // Fallback if projection fails: check simple closest stops
    let closestStop = stops[0];
    let minD = haversineMeters(busLat, busLng, closestStop.lat, closestStop.lng);
    let closestIdx = 0;
    
    for (let i = 1; i < stops.length; i++) {
      const d = haversineMeters(busLat, busLng, stops[i].lat, stops[i].lng);
      if (d < minD) {
        minD = d;
        closestStop = stops[i];
        closestIdx = i;
      }
    }
    
    if (minD < 45) {
      currentStop = closestStop.name;
      nextStop = closestIdx + 1 < stops.length ? stops[closestIdx + 1].name : '';
    } else {
      currentStop = '';
      nextStop = closestIdx < stops.length ? stops[closestIdx].name : '';
    }
  }

  // Determine stopped vs moving vs offline status
  let status = 'moving';
  if (isOffline) {
    status = 'offline';
  } else if (busSpeed === 0 || (busSpeed < 5 && currentStop !== '')) {
    status = 'stopped';
  }

  return {
    currentStop,
    nextStop,
    status
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (cachedBuses && (now - lastCacheTime < CACHE_TTL_MS)) {
      return NextResponse.json(cachedBuses);
    }

    const snapshot = await db.collection('buses').where('status', '==', 'Aktiv').get();
    const rawBuses: BusDocument[] = [];
    snapshot.forEach(doc => {
      rawBuses.push({ id: doc.id, _id: doc.id, ...doc.data() } as BusDocument);
    });
    
    const simulatedBuses = rawBuses.map((bus: BusDocument) => {
      if (bus.isRealGPS) {
        const stopMatching = getStopMatchingForRealGPS(bus);
        return {
          ...bus,
          ...stopMatching
        };
      }
      
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
    
    // Save to cache
    cachedBuses = simulatedBuses;
    lastCacheTime = Date.now();

    return NextResponse.json(simulatedBuses);
  } catch (error) {
    console.error('Error fetching buses from Firestore:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

