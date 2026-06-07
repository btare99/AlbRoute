'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BUS_SHAPES } from '../../store/busShapes';
import { translations } from '../../store/translations';
import useStore, { BUS_ROUTES, BUS_STOPS } from '../../store/useStore';
import SwipeDismissView from '../layout/SwipeDismissView';
import { WalkingEngine } from '../../lib/engines/walkingEngine';
import { IonIcon } from '@/app/components/common/IonIcon';
import {
  walkOutline, busOutline, syncOutline, cashOutline, chevronDownOutline,
  chevronUpOutline, chevronBackOutline, chevronForwardOutline, closeOutline,
  locateOutline, pinOutline, navigateOutline, moonOutline, sunnyOutline,
  globeOutline, addOutline, removeOutline, compassOutline, arrowForwardOutline,
  timeOutline, homeOutline, briefcaseOutline, restaurantOutline, schoolOutline,
  businessOutline, flameOutline, bagOutline, leafOutline
} from 'ionicons/icons';

interface Leg {
  isWalking: boolean;
  route?: { id: string; name: string };
  stops: string[];
  boardAt: string;
  alightAt: string;
  walkingDist?: number;
  walkingTime?: number;
}


// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];
const DEFAULT_ZOOM = 14;
const STOP_NAMES = Array.from(new Set(BUS_STOPS.map((s: any) => s.name))).sort() as string[];

// Helper to validate coordinates
const isValidCoords = (coords: any): boolean => {
  return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && !isNaN(coords.lat) && !isNaN(coords.lng);
};

// Helper to get a stable, deterministic pseudo-random arrival time (2-7 mins) based on bus ID
const getStableArrivalTime = (bus: any): string => {
  if (!bus) return '5';
  const idStr = String(bus.busId || bus.id || bus.routeId || 'default');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const mins = Math.max(2, (Math.abs(hash) % 6) + 2); // 2 to 7 minutes
  return mins.toString();
};

// Snaps a [lat, lng] point to the closest point along a polyline's segments
const findClosestPointOnPolyline = (point: [number, number], polyline: [number, number][]): [number, number] => {
  if (polyline.length === 0) return point;
  if (polyline.length === 1) return polyline[0];

  let minD2 = Infinity;
  let closestPoint: [number, number] = polyline[0];
  const [px, py] = point;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;

    let t = 0;
    if (len2 > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;

    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) {
      minD2 = dist2;
      closestPoint = [cx, cy];
    }
  }

  return closestPoint;
};



// Retrieves the detailed coordinates of a route leg
const getLegCoords = (leg: any): [number, number][] => {
  if (leg.isWalking) return [];

  const route = leg.route;
  if (!route) return [];

  let boardStopId = leg.stopIds ? leg.stopIds[0] : null;
  let alightStopId = leg.stopIds ? leg.stopIds[leg.stopIds.length - 1] : null;

  const boardStop = boardStopId ? BUS_STOPS.find((s: any) => s.id === boardStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
  const alightStop = alightStopId ? BUS_STOPS.find((s: any) => s.id === alightStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());

  let legCoords: [number, number][] = [];
  let sliced = false;

  // Try to slice the shape from the start stop to end stop
  if (boardStop && alightStop) {
    const dirs = ['0', '1'];
    for (const dir of dirs) {
      const shapeKey = `${route.id}_${dir}`;
      let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
      if (shapeCoords.length === 0 && dir === '0') shapeCoords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];

      if (shapeCoords.length > 0) {
        let boardIdx = 0, alightIdx = 0;
        let minDistBoard = Infinity, minDistAlight = Infinity;

        shapeCoords.forEach((pt, idx) => {
          const db = Math.pow(pt[0] - boardStop.lat, 2) + Math.pow(pt[1] - boardStop.lng, 2);
          if (db < minDistBoard) { minDistBoard = db; boardIdx = idx; }

          const da = Math.pow(pt[0] - alightStop.lat, 2) + Math.pow(pt[1] - alightStop.lng, 2);
          if (da < minDistAlight) { minDistAlight = da; alightIdx = idx; }
        });

        // If direction makes sense
        if (boardIdx <= alightIdx) {
          legCoords = shapeCoords.slice(boardIdx, alightIdx + 1);
          sliced = true;
          break;
        } else if (Math.abs(boardIdx - alightIdx) > 0) {
          // If it's reverse on this shape but we don't have the reverse shape, slice and reverse
          legCoords = shapeCoords.slice(alightIdx, boardIdx + 1).reverse();
          sliced = true;
        }
      }
    }
  }

  // Fallback to direct lines between stops using exact IDs
  if (!sliced || legCoords.length < 2) {
    if (leg.stopIds) {
      legCoords = leg.stopIds.map((id: string) => {
        const st = BUS_STOPS.find((s: any) => s.id === id);
        return st ? [st.lat, st.lng] : null;
      }).filter(Boolean) as [number, number][];
    } else {
      legCoords = leg.stops.map((name: string) => {
        const st = BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === name?.toLowerCase().trim());
        return st ? [st.lat, st.lng] : null;
      }).filter(Boolean) as [number, number][];
    }
  }

  return legCoords;
};

const animateMarker = (
  marker: any,
  startLatLng: [number, number],
  endLatLng: [number, number],
  duration: number
) => {
  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const lat = startLatLng[0] + (endLatLng[0] - startLatLng[0]) * progress;
    const lng = startLatLng[1] + (endLatLng[1] - startLatLng[1]) * progress;

    marker.setLatLng([lat, lng]);

    if (progress < 1) {
      marker._animationFrameId = requestAnimationFrame(step);
    }
  };

  if (marker._animationFrameId) {
    cancelAnimationFrame(marker._animationFrameId);
  }
  marker._animationFrameId = requestAnimationFrame(step);
};

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkersRef = useRef<Record<string, any>>({});
  const stopMarkersMapRef = useRef<Record<string, any>>({}); // id -> marker
  const renderedStopIdsRef = useRef<Set<string>>(new Set());
  const renderedBusIdsRef = useRef<Set<string>>(new Set());
  const routeLinesRef = useRef<any[]>([]);
  const LRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeScrollerRef = useRef<HTMLDivElement>(null);
  const originPinMarkerRef = useRef<any>(null);
  const destPinMarkerRef = useRef<any>(null);
  const prevActiveTripRef = useRef<any>(null);
  const boundsTimerRef = useRef<number | null>(null);
  const isFittingBoundsRef = useRef(false);

  const language = useStore((s: any) => s.language);
  const t = translations[language] || translations.al;

  const [mapReady, setMapReady] = useState(false);
  const [infoPanel, setInfoPanel] = useState<any>(null);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null); // Lazy loading: viewport bounds

  const buses = useStore((s: any) => s.buses);
  const busesLoading = useStore((s: any) => s.busesLoading);
  const userLocation = useStore((s: any) => s.userLocation);
  const setSelectedBus = useStore((s: any) => s.setSelectedBus);
  const setView = useStore((s: any) => s.setView);
  const selectedStop = useStore((s: any) => s.selectedStop);
  const activeTrip = useStore((s: any) => s.activeTrip);
  const tripOriginCoords = useStore((s: any) => s.tripOriginCoords);
  const tripDestCoords = useStore((s: any) => s.tripDestCoords);
  const fetchUserLocation = useStore((s: any) => s.fetchUserLocation);
  const startTracking = useStore((s: any) => s.startTracking);
  const stopTracking = useStore((s: any) => s.stopTracking);
  const addNotification = useStore((s: any) => s.addNotification);

  const tripFrom = useStore((s: any) => s.tripFrom);
  const setTripFrom = useStore((s: any) => s.setTripFrom);
  const tripTo = useStore((s: any) => s.tripTo);
  const setTripTo = useStore((s: any) => s.setTripTo);
  const planTrip = useStore((s: any) => s.planTrip);
  const tripOriginName = useStore((s: any) => s.tripOriginName);
  const tripDestName = useStore((s: any) => s.tripDestName);
  const setActiveTrip = useStore((s: any) => s.setActiveTrip);
  const setTripOriginCoords = useStore((s: any) => s.setTripOriginCoords);
  const setTripDestCoords = useStore((s: any) => s.setTripDestCoords);

  const isUserLocation = useCallback((name: string, coords: any) => {
    if (!coords || !userLocation) return false;
    const cleanName = name ? name.toLowerCase() : '';
    const isNameMatch = cleanName.includes('vendndodhja') ||
      cleanName.includes('location') ||
      cleanName.includes('posizione');
    const isCoordsMatch = Math.abs(coords.lat - userLocation.lat) < 0.0002 &&
      Math.abs(coords.lng - userLocation.lng) < 0.0002;
    return isNameMatch || isCoordsMatch;
  }, [userLocation]);

  const [walkingShapes, setWalkingShapes] = useState<Record<string, [number, number][]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const selectingOnMap = useStore((s: any) => s.selectingOnMap);
  const setSelectingOnMap = useStore((s: any) => s.setSelectingOnMap);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const tripFromInputRef = useRef<HTMLInputElement>(null);

  const user = useStore((s: any) => s.user);
  const homeLocation = user?.savedLocations?.home;
  const workLocation = user?.savedLocations?.work;

  // Filter saved locations based on input search values in MapView
  const mapShowHomeDest = homeLocation && (!tripTo || homeLocation.toLowerCase().includes(tripTo.toLowerCase()));
  const mapShowWorkDest = workLocation && (!tripTo || workLocation.toLowerCase().includes(tripTo.toLowerCase()));

  const mapShowHomeOrig = homeLocation && (!tripFrom || homeLocation.toLowerCase().includes(tripFrom.toLowerCase()));
  const mapShowWorkOrig = workLocation && (!tripFrom || workLocation.toLowerCase().includes(tripFrom.toLowerCase()));

  useEffect(() => {
    if (isSearching && tripFromInputRef.current) {
      tripFromInputRef.current.focus();
    }
  }, [isSearching]);

  interface AutocompleteItem {
    name: string;
    address: string;
    type: string;
    lat: number;
    lng: number;
    placeClass?: string;
    placeType?: string;
  }

  const [fromSuggestions, setFromSuggestions] = useState<AutocompleteItem[]>([]);
  const [toSuggestions, setToSuggestions] = useState<AutocompleteItem[]>([]);

  // Ndihmës për të formatuar dhe klasifikuar një rezultat nga Nominatim
  const parsePlaceItem = (item: any): AutocompleteItem => {
    const nameParts = item.display_name.split(',');
    const title = nameParts[0].trim();
    const subtitle = nameParts.slice(1, 3).map((p: string) => p.trim()).join(', ');

    let typeLabel = '';
    const placeClass = item.class;
    const placeType = item.type;

    if (placeClass === 'amenity') {
      if (placeType === 'restaurant') typeLabel = t.place_type_restaurant;
      else if (placeType === 'cafe') typeLabel = t.place_type_cafe;
      else if (placeType === 'bar' || placeType === 'pub') typeLabel = t.place_type_bar_pub;
      else if (placeType === 'fast_food') typeLabel = t.place_type_fast_food;
      else if (placeType === 'bank' || placeType === 'atm') typeLabel = t.place_type_bank;
      else if (placeType === 'hospital' || placeType === 'clinic' || placeType === 'pharmacy') typeLabel = t.place_type_medical;
      else if (placeType === 'school' || placeType === 'university' || placeType === 'college' || placeType === 'kindergarten') typeLabel = t.place_type_education;
      else if (placeType === 'place_of_worship') typeLabel = t.place_type_worship;
      else if (placeType === 'fuel') typeLabel = t.place_type_fuel;
      else typeLabel = t.place_type_place;
    } else if (placeClass === 'shop') {
      typeLabel = t.place_type_shop;
    } else if (placeClass === 'tourism') {
      if (placeType === 'hotel' || placeType === 'hostel' || placeType === 'motel' || placeType === 'guest_house') typeLabel = t.place_type_hotel;
      else typeLabel = t.place_type_tourism;
    } else if (placeClass === 'historic') {
      typeLabel = t.place_type_historic;
    } else if (placeClass === 'leisure') {
      if (placeType === 'park' || placeType === 'playground' || placeType === 'garden') typeLabel = t.place_type_park;
      else typeLabel = t.place_type_recreation;
    } else if (placeClass === 'highway') {
      typeLabel = t.place_type_street;
    } else {
      typeLabel = t.place_type_address;
    }

    return {
      name: title,
      address: subtitle,
      type: typeLabel,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      placeClass,
      placeType
    };
  };

  const getPlaceIcon = (item: AutocompleteItem) => {
    const cls = item.placeClass;
    const type = item.placeType;
    if (cls === 'amenity') {
      if (type === 'restaurant' || type === 'cafe' || type === 'bar' || type === 'pub' || type === 'fast_food') {
        return { icon: restaurantOutline, color: '#f59e0b' };
      }
      if (type === 'school' || type === 'university' || type === 'college') {
        return { icon: schoolOutline, color: '#06b6d4' };
      }
      if (type === 'hospital' || type === 'clinic' || type === 'pharmacy') {
        return { icon: businessOutline, color: '#ef4444' };
      }
      if (type === 'fuel') {
        return { icon: flameOutline, color: '#ef4444' };
      }
    }
    if (cls === 'shop' || type === 'mall') {
      return { icon: bagOutline, color: '#a855f7' };
    }
    if (cls === 'tourism') {
      return { icon: businessOutline, color: '#6366f1' };
    }
    if (cls === 'leisure' && (type === 'park' || type === 'garden')) {
      return { icon: leafOutline, color: '#22c55e' };
    }
    return { icon: pinOutline, color: '#10b981' };
  };

  // Kërkim Autocomplete me Debounce për Pikën e Nisjes (Tirana)
  useEffect(() => {
    if (tripFrom.length < 3) {
      setFromSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const delayDebounce = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tripFrom + ', Tirana')}&format=json&limit=12&addressdetails=1&countrycodes=al`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'UrbaniIm/1.0' }
        });
        const data = await res.json();
        if (data && Array.isArray(data)) {
          const parsed = data.map((item: any) => parsePlaceItem(item));
          setFromSuggestions(parsed);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Autocomplete fetch error:', err);
      }
    }, 350);

    return () => {
      window.clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [tripFrom]);

  // Kërkim Autocomplete me Debounce për Destinacionin (Tirana)
  useEffect(() => {
    if (tripTo.length < 3) {
      setToSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const delayDebounce = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tripTo + ', Tirana')}&format=json&limit=12&addressdetails=1&countrycodes=al`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'UrbaniIm/1.0' }
        });
        const data = await res.json();
        if (data && Array.isArray(data)) {
          const parsed = data.map((item: any) => parsePlaceItem(item));
          setToSuggestions(parsed);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Autocomplete fetch error:', err);
      }
    }, 350);

    return () => {
      window.clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [tripTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearching(false);
        setTripFrom('');
        setTripTo('');
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };
    if (isSearching) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearching, setTripFrom, setTripTo]);



  useEffect(() => {
    if (!activeTrip) {
      setWalkingShapes({});
      return;
    }

    // Zoom to route
    if (activeTrip && mapInstanceRef.current) {
      const allStops = activeTrip.legs?.flatMap((l: any) => l.stops || []) || [];
      const coords = allStops.map((name: string) => {
        const s = BUS_STOPS.find((st: any) => st.name?.toLowerCase().trim() === name?.toLowerCase().trim());
        return s ? [s.lat, s.lng] : null;
      }).filter(Boolean) as [number, number][];

      if (coords.length > 1) {
        const L = LRef.current;
        if (L) {
          const bounds = L.latLngBounds(coords);
          isFittingBoundsRef.current = true;
          mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], duration: 1.5 });
        }
      }
    }

    let active = true;
    const fetchWalkShapes = async () => {
      const L = LRef.current;
      if (!L) return;

      const engine = new WalkingEngine();
      const newShapes: Record<string, [number, number][]> = {};

      for (let idx = 0; idx < activeTrip.legs.length; idx++) {
        const leg = activeTrip.legs[idx];
        if (leg.isWalking) {
          if (leg.waypoints && leg.waypoints.length >= 2) {
            newShapes[`walk_${idx}`] = leg.waypoints;
            continue;
          }

          const bStop = leg.boardNodeId ? BUS_STOPS.find((s: any) => s.id === leg.boardNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
          const aStop = leg.alightNodeId ? BUS_STOPS.find((s: any) => s.id === leg.alightNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());

          let startLat = bStop ? bStop.lat : null;
          let startLng = bStop ? bStop.lng : null;
          let destLat = aStop ? aStop.lat : null;
          let destLng = aStop ? aStop.lng : null;

          if (idx === 0 && tripOriginCoords) {
            startLat = tripOriginCoords.lat;
            startLng = tripOriginCoords.lng;
          }
          if (idx === activeTrip.legs.length - 1 && tripDestCoords) {
            destLat = tripDestCoords.lat;
            destLng = tripDestCoords.lng;
          }

          if (startLat !== null && startLng !== null && destLat !== null && destLng !== null) {
            try {
              const res = await engine.calculateWalkingRoute(
                { lat: startLat, lng: startLng },
                { lat: destLat, lng: destLng }
              );
              if (active && res && res.waypoints && res.waypoints.length >= 2) {
                newShapes[`walk_${idx}`] = res.waypoints;
              }
            } catch (err) {
              console.error(`Error fetching walking shape for leg ${idx}:`, err);
            }
          }
        }
      }

      if (active) {
        setWalkingShapes(newShapes);
      }
    };

    fetchWalkShapes();

    return () => {
      active = false;
    };
  }, [activeTrip, tripOriginCoords, tripDestCoords]);


  useEffect(() => {
    startTracking();

    const handleOrientation = (e: any) => {
      let heading = null;

      if (e.webkitCompassHeading) {
        // iOS device
        heading = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha !== null) {
        // Android / Modern standard
        heading = 360 - e.alpha;
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
      }

      if (heading !== null) setDeviceHeading(heading);
    };

    const initOrientation = () => {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if ('ondeviceorientationabsolute' in win) {
          win.addEventListener('deviceorientationabsolute', handleOrientation);
        } else {
          win.addEventListener('deviceorientation', handleOrientation);
        }
      }
    };

    initOrientation();

    // Default layers for tablet/mobile: Only stations
    if (typeof window !== 'undefined' && window.innerWidth <= 1180) {
      setShowRoutes(false);
      setShowBuses(false);
      setShowStops(true);
    }

    // Fix: remove both orientation listeners using the same callback reference on cleanup
    return () => {
      stopTracking();
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
      }
    };
  }, []);

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          addNotification(t.compass_activated, 'success');
        }
      } catch (err) {
        console.error('Compass permission error:', err);
      }
    }
  };

  const showStops = useStore((s: any) => s.showStops);
  const showRoutes = useStore((s: any) => s.showRoutes);
  const showBuses = useStore((s: any) => s.showBuses);
  const setShowStops = useStore((s: any) => s.setShowStops);
  const setShowRoutes = useStore((s: any) => s.setShowRoutes);
  const setShowBuses = useStore((s: any) => s.setShowBuses);
  const setSelectedStop = useStore((s: any) => s.setSelectedStop);
  const highlightMarkerRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const debugLayersRef = useRef<any[]>([]);

  const [debugMode, setDebugMode] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [sheetHeight, setSheetHeight] = useState<'peek' | 'half' | 'full'>('peek');
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripSheetHeight, setTripSheetHeight] = useState<'peek' | 'full'>('peek');
  const [isPlanning, setIsPlanning] = useState(false);
  const [showAllStops, setShowAllStops] = useState<{ [key: number]: boolean }>({});

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = e.touches[0].clientY - touchStartY;
    setTouchCurrentY(diff);
  };

  const handleTouchEnd = () => {
    if (touchCurrentY !== null) {
      if (touchCurrentY < -100) {
        if (sheetHeight === 'peek') setSheetHeight('half');
        else if (sheetHeight === 'half') setSheetHeight('full');
      } else if (touchCurrentY > 100) {
        if (sheetHeight === 'full') setSheetHeight('half');
        else if (sheetHeight === 'half') setSheetHeight('peek');
        else if (sheetHeight === 'peek') {
          setSelectedStop(null);
          setInfoPanel(null);
        }
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  const getClosestBusForStop = (stop: any) => {
    if (!stop || !buses.length) return null;
    const stopLines = BUS_ROUTES.filter((r: any) => r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id))).map((r: any) => r.id);

    let closestBus = null;
    let minDist = Infinity;

    buses.forEach((bus: any) => {
      if (stopLines.includes(bus.routeId)) {
        const dist = Math.sqrt(Math.pow(bus.lat - stop.lat, 2) + Math.pow(bus.lng - stop.lng, 2));
        if (dist < minDist) {
          minDist = dist;
          closestBus = bus;
        }
      }
    });

    return closestBus;
  };

  const closestBus = useMemo<any>(() => getClosestBusForStop(selectedStop), [selectedStop, buses]);


  const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const getLayerOptions = (style: 'dark' | 'light' | 'satellite') => {
    return {
      maxZoom: 20,
      subdomains: style === 'dark' || style === 'light' ? ['a', 'b', 'c', 'd'] : ['mt0', 'mt1', 'mt2', 'mt3'],
      className: ''
    };
  };

  // ─── EFFECTS ───────────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (mapInstanceRef.current || !mapContainerRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        // @ts-ignore
        await import('leaflet.markercluster');
        await import('leaflet.markercluster/dist/MarkerCluster.css');
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
        if (!isMounted) return;
        LRef.current = L;

        // Pastro instancën e vjetër nëse ekziston në element
        const container = mapContainerRef.current;
        if (container && (container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }

        const map = L.map(container, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true
        }).setView(TIRANA_CENTER, DEFAULT_ZOOM);

        if (!isMounted) {
          map.remove();
          return;
        }

        // Fix: debounce bounds updates to avoid expensive rerender cascades during rapid pan/zoom
        map.on('moveend zoomend', () => {
          isFittingBoundsRef.current = false;
          if (boundsTimerRef.current) window.clearTimeout(boundsTimerRef.current);
          boundsTimerRef.current = window.setTimeout(() => {
            setMapBounds(map.getBounds());
          }, 150);
        });

        const tileLayer = L.tileLayer(TILES.dark, getLayerOptions('dark'));
        tileLayer.addTo(map);
        (map as any)._tileLayer = tileLayer;
        mapInstanceRef.current = map;
        setMapReady(true);
        setMapBounds(map.getBounds());
      } catch (e) { console.error('Error init map:', e); }
    };
    init();
    return () => {
      isMounted = false;
      if (boundsTimerRef.current) {
        window.clearTimeout(boundsTimerRef.current);
        boundsTimerRef.current = null;
      }
      if (mapInstanceRef.current) {
        // Cancel all active marker animations
        Object.values(busMarkersRef.current).forEach((marker: any) => {
          if (marker._animationFrameId) {
            cancelAnimationFrame(marker._animationFrameId);
          }
        });
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } else if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    const existing = (map as any)._tileLayer;
    if (existing) map.removeLayer(existing);
    const newTile = L.tileLayer(TILES[mapStyle], getLayerOptions(mapStyle));
    newTile.addTo(map);
    (map as any)._tileLayer = newTile;
  }, [mapStyle]);

  // Cleanup selected stop and info panel on unmount (changing pages)
  useEffect(() => {
    return () => {
      setSelectedStop(null);
      setInfoPanel(null);
    };
  }, [setSelectedStop, setInfoPanel]);

  // ── MAP CLICK HANDLER ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const onMapClick = async (e: any) => {
      if (selectingOnMap) {
        return; // Selection handled by Confirm button now
      }

      setSelectedStop(null);
      setInfoPanel(null);
    };

    map.on('click', onMapClick);
    return () => { map.off('click', onMapClick); };
  }, [mapReady, setSelectedStop, selectingOnMap, language, setTripFrom, setTripTo, setIsSearching]);

  // ── CUSTOM PIN MARKERS FOR SELECTED LOCATION (WHEN NO ACTIVE TRIP IS SHOWN) ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    // 1. Manage Origin Pin (Only if no activeTrip is present, because activeTrip renders its own pin)
    if (originPinMarkerRef.current) {
      map.removeLayer(originPinMarkerRef.current);
      originPinMarkerRef.current = null;
    }
    const isFromUserLoc = isUserLocation(tripFrom || tripOriginName, tripOriginCoords);
    if (tripOriginCoords && !activeTrip && !isFromUserLoc) {
      const fromHtml = `
        <div class="marker-enter" style="display: flex; filter: drop-shadow(0 2px 6px rgba(249,115,22,0.35));">
          <svg viewBox="0 0 24 34" width="22" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="#f97316"/>
            <circle cx="12" cy="12" r="5.5" fill="rgba(255,255,255,0.95)"/>
            <circle cx="12" cy="12" r="2.5" fill="#f97316"/>
          </svg>
        </div>`;
      originPinMarkerRef.current = L.marker([tripOriginCoords.lat, tripOriginCoords.lng], {
        icon: L.divIcon({ html: fromHtml, className: '', iconSize: [22, 32], iconAnchor: [11, 32] }),
        zIndexOffset: 1000
      }).addTo(map);
    }

    // 2. Manage Destination Pin (Only if no activeTrip is present, because activeTrip renders its own pin)
    if (destPinMarkerRef.current) {
      map.removeLayer(destPinMarkerRef.current);
      destPinMarkerRef.current = null;
    }
    const isToUserLoc = isUserLocation(tripTo || tripDestName, tripDestCoords);
    if (tripDestCoords && !activeTrip && !isToUserLoc) {
      const toHtml = `
        <div class="marker-enter" style="display: flex; filter: drop-shadow(0 2px 6px rgba(234,67,53,0.35));">
          <svg viewBox="0 0 24 34" width="22" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="#EA4335"/>
            <circle cx="12" cy="12" r="5.5" fill="rgba(255,255,255,0.95)"/>
            <circle cx="12" cy="12" r="2.5" fill="#EA4335"/>
          </svg>
        </div>`;
      destPinMarkerRef.current = L.marker([tripDestCoords.lat, tripDestCoords.lng], {
        icon: L.divIcon({ html: toHtml, className: '', iconSize: [22, 32], iconAnchor: [11, 32] }),
        zIndexOffset: 1000
      }).addTo(map);
    }

    return () => {
      if (originPinMarkerRef.current) {
        map.removeLayer(originPinMarkerRef.current);
      }
      if (destPinMarkerRef.current) {
        map.removeLayer(destPinMarkerRef.current);
      }
    };
  }, [mapReady, tripOriginCoords, tripDestCoords, activeTrip, tripFrom, tripTo, tripOriginName, tripDestName, isUserLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    // Ensure cluster group exists
    if (!clusterGroupRef.current) {
      // @ts-ignore
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 40,
      }).addTo(map);
    }

    if (!showStops) {
      clusterGroupRef.current.clearLayers();
      renderedStopIdsRef.current.clear();
      stopMarkersMapRef.current = {};
      return;
    }

    const activeTripStopIds = activeTrip ? activeTrip.legs.flatMap((l: any) => l.stopIds || []) : [];

    // Wipe all stops from Leaflet layers when transitioning activeTrip state
    const activeTripChanged = prevActiveTripRef.current !== activeTrip;
    prevActiveTripRef.current = activeTrip;

    if (activeTripChanged) {
      if (activeTrip) {
        isFittingBoundsRef.current = true;
      }
      renderedStopIdsRef.current.forEach(id => {
        const marker = stopMarkersMapRef.current[id];
        if (marker) {
          const el = marker.getElement();
          if (el) {
            const innerEl = el.querySelector('.marker-enter');
            if (innerEl) {
              innerEl.classList.remove('marker-enter');
              innerEl.classList.add('marker-exit');
              setTimeout(() => {
                map.removeLayer(marker);
              }, 250);
            } else {
              el.classList.add('marker-exit');
              setTimeout(() => {
                map.removeLayer(marker);
              }, 250);
            }
          } else {
            map.removeLayer(marker);
          }
        }
      });
      clusterGroupRef.current.clearLayers();
      renderedStopIdsRef.current.clear();
      stopMarkersMapRef.current = {};
    }

    const currentZoom = map.getZoom();
    const showRouteStops = !activeTrip || (currentZoom >= 16 && !isFittingBoundsRef.current);

    let displayedStops = activeTrip
      ? (showRouteStops ? BUS_STOPS.filter((s: any) => activeTripStopIds.includes(s.id)) : [])
      : BUS_STOPS;

    // LAZY LOADING: filter to viewport only (skip for active trip — show all trip stops)
    if (!activeTrip && mapBounds) {
      const expanded = mapBounds.pad(0.15); // slight padding so markers don't pop at edge
      displayedStops = displayedStops.filter((s: any) => expanded.contains([s.lat, s.lng]));
    }

    const nextIds = new Set(displayedStops.map((s: any) => s.id as string));

    // 1. Remove stops that left the viewport or are no longer displayed
    renderedStopIdsRef.current.forEach(id => {
      if (!nextIds.has(id)) {
        const marker = stopMarkersMapRef.current[id];
        if (marker) {
          const el = marker.getElement();
          if (el) {
            const innerEl = el.querySelector('.marker-enter');
            if (innerEl) {
              innerEl.classList.remove('marker-enter');
              innerEl.classList.add('marker-exit');
              setTimeout(() => {
                map.removeLayer(marker);
                clusterGroupRef.current.removeLayer(marker);
              }, 250);
            } else {
              el.classList.add('marker-exit');
              setTimeout(() => {
                map.removeLayer(marker);
                clusterGroupRef.current.removeLayer(marker);
              }, 250);
            }
          } else {
            map.removeLayer(marker);
            clusterGroupRef.current.removeLayer(marker);
          }
          delete stopMarkersMapRef.current[id];
        }
      }
    });

    // 2. Add only NEW stops with reveal animation
    displayedStops.forEach((stop: any) => {
      if (renderedStopIdsRef.current.has(stop.id)) return; // already rendered

      // Find route color and coordinates for this stop in the active trip
      let borderClr = '#1e293b';
      let stopCoords: [number, number] = [stop.lat, stop.lng];
      const isTripStop = !!activeTrip;
      if (isTripStop) {
        const leg = activeTrip.legs.find((l: any) => l.stopIds?.includes(stop.id) || l.stops?.includes(stop.name));
        if (leg && leg.route) {
          borderClr = leg.route.color;
          const legCoords = getLegCoords(leg);
          if (legCoords.length >= 2) {
            stopCoords = findClosestPointOnPolyline([stop.lat, stop.lng], legCoords);
          }
        }
      }

      const stopHtml = isTripStop ? `
        <div class="marker-enter" style="display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.4)'" onmouseout="this.style.transform='scale(1)'">
          <div style="
            background: #ffffff;
            width: 8px; height: 8px;
            border-radius: 50%;
            border: 2px solid ${borderClr};
            box-shadow: 0 0 0 1px #ffffff, 0 1px 3px rgba(0,0,0,0.4);
            cursor: pointer;
          "></div>
        </div>` : `
        <div class="marker-enter" style="display: flex; flex-direction: column; align-items: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          <div style="
            background: #1e293b;
            width: 28px; height: 28px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            border: 2px solid #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            cursor: pointer;
          ">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          <div style="
            width: 0; height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #fff;
            margin-top: -1px;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
          "></div>
        </div>`;

      const iconSize: [number, number] = isTripStop ? [12, 12] : [28, 34];
      const iconAnchor: [number, number] = isTripStop ? [6, 6] : [14, 34];

      const marker = L.marker(stopCoords, {
        icon: L.divIcon({ html: stopHtml, className: '', iconSize, iconAnchor }),
        zIndexOffset: isTripStop ? 1100 : 100
      });

      const stoppingLines = BUS_ROUTES.filter((r: any) => r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id)));
      const linesHtml = stoppingLines.map((l: any) => `<span style="background:${l.color};color:white;padding:3px;font-size:10px;font-weight:800;text-align:center;width:100%;display:block;">${l.name}</span>`).join('');

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1180;
      if (!isMobile) {
        marker.bindTooltip(`
          <div style="padding:4px; border-radius:0; min-width:120px;">
            <div style="font-weight:800;margin-bottom:6px;font-size:13px;color:#000;border-bottom:1px solid #eee;padding-bottom:2px;">${stop.name}</div>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:2px;width:100%;">${linesHtml}</div>
          </div>`, { direction: 'top', offset: [0, -8], className: 'square-tooltip' });
      }

      marker.on('click', () => setSelectedStop(stop));
      if (isTripStop) {
        marker.addTo(map);
      } else {
        clusterGroupRef.current.addLayer(marker);
      }
      stopMarkersMapRef.current[stop.id] = marker;
    });

    renderedStopIdsRef.current = nextIds;
  }, [showStops, mapReady, activeTrip, mapBounds]);


  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;
    routeLinesRef.current.forEach(r => { map.removeLayer(r.line); });
    routeLinesRef.current = [];
    if (!showRoutes) return;

    if (activeTrip) {
      // 1. Draw Custom Address/Street Pin Markers (Nisja & Destinacioni)
      const isCustomFrom = !BUS_STOPS.some((s: any) => s.name?.toLowerCase().trim() === activeTrip.from?.toLowerCase().trim());
      const isFromUserLoc = isUserLocation(activeTrip.from, tripOriginCoords);
      const shouldDrawFrom = isCustomFrom || activeTrip.legs[0]?.isWalking;
      if (shouldDrawFrom && tripOriginCoords && !isFromUserLoc) {
        const fromHtml = `
          <div class="marker-enter" style="display: flex; filter: drop-shadow(0 2px 6px rgba(249,115,22,0.35));">
            <svg viewBox="0 0 24 34" width="22" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="#f97316"/>
              <circle cx="12" cy="12" r="5.5" fill="rgba(255,255,255,0.95)"/>
              <circle cx="12" cy="12" r="2.5" fill="#f97316"/>
            </svg>
          </div>`;
        const fromMarker = L.marker([tripOriginCoords.lat, tripOriginCoords.lng], {
          icon: L.divIcon({ html: fromHtml, className: '', iconSize: [22, 32], iconAnchor: [11, 32] }),
          zIndexOffset: 1000
        }).addTo(map);
        routeLinesRef.current.push({ line: fromMarker, routeId: 'custom_origin_pin' });
      }

      const isCustomTo = !BUS_STOPS.some((s: any) => s.name?.toLowerCase().trim() === activeTrip.to?.toLowerCase().trim());
      const isToUserLoc = isUserLocation(activeTrip.to, tripDestCoords);
      const shouldDrawTo = isCustomTo || activeTrip.legs[activeTrip.legs.length - 1]?.isWalking;
      if (shouldDrawTo && tripDestCoords && !isToUserLoc) {
        const toHtml = `
          <div class="marker-enter" style="display: flex; filter: drop-shadow(0 2px 6px rgba(234,67,53,0.35));">
            <svg viewBox="0 0 24 34" width="22" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="#EA4335"/>
              <circle cx="12" cy="12" r="5.5" fill="rgba(255,255,255,0.95)"/>
              <circle cx="12" cy="12" r="2.5" fill="#EA4335"/>
            </svg>
          </div>`;
        const toMarker = L.marker([tripDestCoords.lat, tripDestCoords.lng], {
          icon: L.divIcon({ html: toHtml, className: '', iconSize: [22, 32], iconAnchor: [11, 32] }),
          zIndexOffset: 1000
        }).addTo(map);
        routeLinesRef.current.push({ line: toMarker, routeId: 'custom_dest_pin' });
      }

      // Draw Legs
      activeTrip.legs.forEach((leg: any, idx: number) => {
        if (leg.isWalking) {
          const bStop = leg.boardNodeId ? BUS_STOPS.find((s: any) => s.id === leg.boardNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
          const aStop = leg.alightNodeId ? BUS_STOPS.find((s: any) => s.id === leg.alightNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());

          let startLat = bStop ? bStop.lat : null;
          let startLng = bStop ? bStop.lng : null;
          let destLat = aStop ? aStop.lat : null;
          let destLng = aStop ? aStop.lng : null;

          // Leg-u i parë: fillon tek tripOriginCoords nëse është ecje
          if (idx === 0 && tripOriginCoords) {
            startLat = tripOriginCoords.lat;
            startLng = tripOriginCoords.lng;
          }

          // Leg-u i fundit: mbaron tek tripDestCoords nëse është ecje
          if (idx === activeTrip.legs.length - 1 && tripDestCoords) {
            destLat = tripDestCoords.lat;
            destLng = tripDestCoords.lng;
          }

          if (startLat !== null && startLng !== null && destLat !== null && destLng !== null) {
            const walkCoords = walkingShapes[`walk_${idx}`] || [
              [startLat, startLng],
              [destLat, destLng]
            ];

            // 1. Premium glowing background track
            const walkLineGlow = L.polyline(walkCoords, {
              color: '#10b981',
              weight: 10,
              opacity: 0.22,
              lineCap: 'round',
              lineJoin: 'round',
              interactive: false
            }).addTo(map);
            routeLinesRef.current.push({ line: walkLineGlow, routeId: `walk_glow_${idx}` });

            // 2. High-fidelity circular dots representing pedestrian footsteps
            const walkLine = L.polyline(walkCoords, {
              color: '#10b981',
              weight: 5,
              dashArray: '1, 12',
              lineCap: 'round',
              lineJoin: 'round',
              opacity: 0.95,
              interactive: false
            }).addTo(map);
            routeLinesRef.current.push({ line: walkLine, routeId: `walk_${idx}` });
          }
          return;
        }

        const route = leg.route;
        if (!route) return;

        let boardStopId = leg.stopIds ? leg.stopIds[0] : null;
        let alightStopId = leg.stopIds ? leg.stopIds[leg.stopIds.length - 1] : null;

        const boardStop = boardStopId ? BUS_STOPS.find((s: any) => s.id === boardStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
        const alightStop = alightStopId ? BUS_STOPS.find((s: any) => s.id === alightStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());

        let legCoords: [number, number][] = [];
        let sliced = false;

        // Try to slice the shape from the start stop to end stop
        if (boardStop && alightStop) {
          const dirs = ['0', '1'];
          for (const dir of dirs) {
            const shapeKey = `${route.id}_${dir}`;
            let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
            if (shapeCoords.length === 0 && dir === '0') shapeCoords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];

            if (shapeCoords.length > 0) {
              let boardIdx = 0, alightIdx = 0;
              let minDistBoard = Infinity, minDistAlight = Infinity;

              shapeCoords.forEach((pt, idx) => {
                const db = Math.pow(pt[0] - boardStop.lat, 2) + Math.pow(pt[1] - boardStop.lng, 2);
                if (db < minDistBoard) { minDistBoard = db; boardIdx = idx; }

                const da = Math.pow(pt[0] - alightStop.lat, 2) + Math.pow(pt[1] - alightStop.lng, 2);
                if (da < minDistAlight) { minDistAlight = da; alightIdx = idx; }
              });

              // If direction makes sense
              if (boardIdx <= alightIdx) {
                legCoords = shapeCoords.slice(boardIdx, alightIdx + 1);
                sliced = true;
                break;
              } else if (Math.abs(boardIdx - alightIdx) > 0) {
                // If it's reverse on this shape but we don't have the reverse shape, slice and reverse
                legCoords = shapeCoords.slice(alightIdx, boardIdx + 1).reverse();
                sliced = true;
              }
            }
          }
        }

        // Fallback to direct lines between stops using exact IDs
        if (!sliced || legCoords.length < 2) {
          if (leg.stopIds) {
            legCoords = leg.stopIds.map((id: string) => {
              const st = BUS_STOPS.find((s: any) => s.id === id);
              return st ? [st.lat, st.lng] : null;
            }).filter(Boolean) as [number, number][];
          } else {
            legCoords = leg.stops.map((name: string) => {
              const st = BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === name?.toLowerCase().trim());
              return st ? [st.lat, st.lng] : null;
            }).filter(Boolean) as [number, number][];
          }
        }

        if (legCoords.length >= 2) {
          // Glow background
          const glow = L.polyline(legCoords, {
            color: route.color,
            weight: 12,
            opacity: 0.2,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false
          }).addTo(map);
          routeLinesRef.current.push({ line: glow, routeId: `${route.id}_glow` });

          const line = L.polyline(legCoords, {
            color: route.color,
            weight: 6,
            opacity: 1,
            interactive: false
          }).addTo(map);
          routeLinesRef.current.push({ line, routeId: route.id });


        }
      });

    } else {
      // Draw All Routes (Default)
      BUS_ROUTES.forEach((route: any) => {
        const dirs = ['0', '1'];
        dirs.forEach((dir: any) => {
          const shapeKey = `${route.id}_${dir}`;
          let coords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
          if (coords.length === 0 && dir === '0') coords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];
          if (coords.length < 2) return;
          const isActive = !activeRouteFilter || route.id === activeRouteFilter;
          const line = L.polyline(coords, { color: route.color, weight: isActive ? 4 : 2, opacity: isActive ? 0.9 : 0.2, interactive: false }).addTo(map);
          routeLinesRef.current.push({ line, routeId: route.id });


        });
      });
    }
  }, [activeTrip, tripOriginCoords, tripDestCoords, activeRouteFilter, showRoutes, mapReady, walkingShapes, isUserLocation]);

  // ── USER LOCATION MARKER ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    const currentHeading = userLocation.heading ?? deviceHeading ?? 0;
    const showArrow = userLocation.heading !== null || deviceHeading !== null;

    const html = `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
      <!-- Outer Halo/Pulse -->
      <div style="
        position:absolute;width:100%;height:100%;border-radius:50%;
        background:rgba(59,130,246,0.22);
        animation:pulse-ring 3s ease-out infinite
      "></div>
      
      <!-- Directional Compass Arrow -->
      ${showArrow ? `
      <div style="
        position:absolute;inset:0;
        display:flex;justify-content:center;
        transform: rotate(${currentHeading}deg);
        transition: transform 0.2s cubic-bezier(0.1, 0, 0.3, 1);
        z-index: 5;
      ">
        <div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 9px solid #3b82f6;
          margin-top: 7px;
          filter: drop-shadow(0 0 1px #fff);
        "></div>
      </div>
      ` : ''}

      <!-- Core Location Dot -->
      <div style="
        position:relative;width:16px;height:16px;border-radius:50%;
        background:#3b82f6;
        border:3px solid #fff;
        box-shadow: 0 0 15px rgba(59,130,246,0.6);
        z-index:10
      "></div>
    </div>
  `;

    // Validate coordinates before creating/updating marker
    if (userLocation.lat === undefined || userLocation.lng === undefined) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(L.divIcon({ html, className: '', iconSize: [44, 44], iconAnchor: [22, 22] }));
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({ html, className: '', iconSize: [44, 44], iconAnchor: [22, 22] }),
        zIndexOffset: 999,
      }).addTo(map);
    }
  }, [userLocation, deviceHeading, mapReady]);


  // ── BUS MARKERS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    // 1. Cleanup removed buses or if showBuses is false
    const currentBusIds = new Set(buses.filter((b: any) => b?.id).map((b: any) => b.id.toString()));
    Object.keys(busMarkersRef.current).forEach(id => {
      if (!showBuses || !currentBusIds.has(id)) {
        const marker = busMarkersRef.current[id];
        if (marker._animationFrameId) {
          cancelAnimationFrame(marker._animationFrameId);
        }
        map.removeLayer(marker);
        delete busMarkersRef.current[id];
      }
    });

    if (!showBuses) return;

    buses.forEach((bus: any) => {
      if (!bus.id || !bus.lat || !bus.lng) return;

      // LAZY LOADING: skip buses outside the viewport
      if (mapBounds && !mapBounds.pad(0.1).contains([bus.lat, bus.lng])) {
        // If it had a marker and went off screen, remove it
        if (busMarkersRef.current[bus.id]) {
          const marker = busMarkersRef.current[bus.id];
          if (marker._animationFrameId) {
            cancelAnimationFrame(marker._animationFrameId);
          }
          map.removeLayer(marker);
          delete busMarkersRef.current[bus.id];
          renderedBusIdsRef.current.delete(bus.id.toString());
        }
        return;
      }

      let isActive = true;
      if (activeTrip) {
        isActive = activeTrip.legs.some((leg: any) => leg.route?.id === bus.routeId);
      } else if (activeRouteFilter) {
        isActive = bus.routeId === activeRouteFilter;
      }

      const load = bus.passengerLoad ?? 0;
      const loadPct = Math.min(100, Math.round((load / 50) * 100));
      const loadColor = load > 40 ? '#ef4444' : load > 25 ? '#f59e0b' : '#22c55e';
      const opacity = isActive ? 1 : 0.18;
      const label = (bus.routeName || bus.routeId?.replace('L', '') || 'Bus').toString();

      const isNew = !renderedBusIdsRef.current.has(bus.id.toString());
      const animClass = isNew ? 'marker-enter' : '';

      // Marker pill
      const markerHtml = `
      <div style="
        display:inline-flex;flex-direction:column;align-items:center;
        opacity:${opacity};transition:opacity 0.3s;
      ">
        <div class="${animClass}" style="
          background:${bus.routeColor};color:#fff;
          padding:5px 9px;border-radius:8px;
          font-size:11px;font-weight:700;letter-spacing:0.04em;
          white-space:nowrap;line-height:1;
          box-shadow:0 2px 8px rgba(0,0,0,0.35),0 0 0 1.5px rgba(255,255,255,0.25) inset;
          position:relative;
        ">
          ${label}
          <div style="
            position:absolute;bottom:0;left:6px;right:6px;height:2.5px;
            background:rgba(0,0,0,0.18);border-radius:0 0 6px 6px;overflow:hidden;
          ">
            <div style="height:100%;width:${loadPct}%;background:${loadColor};border-radius:inherit;transition:width 0.4s"></div>
          </div>
        </div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:5px solid ${bus.routeColor};
          margin-top:-1px;
          filter:drop-shadow(0 1px 1px rgba(0,0,0,0.25));
        "></div>
      </div>
    `;

      // Tooltip card
      const loadLabel = load > 40 ? t.full : load > 25 ? t.medium : t.empty;
      const loadBadgeBg = load > 40 ? '#fef2f2' : load > 25 ? '#fffbeb' : '#f0fdf4';
      const loadBadgeColor = load > 40 ? '#dc2626' : load > 25 ? '#d97706' : '#16a34a';

      const tooltipHtml = `
      <div style="
        min-width:180px;padding:12px;
        font-family:system-ui,sans-serif;
        background:#fff;border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,0.12);
        border:1px solid rgba(0,0,0,0.06);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:7px">
            <div style="
              width:10px;height:10px;border-radius:50%;
              background:${bus.routeColor};flex-shrink:0
            "></div>
            <span style="font-size:13px;font-weight:700;color:#0f172a">${t.route_label} ${bus.routeName}</span>
          </div>
          <span style="
            font-size:9px;font-weight:700;letter-spacing:0.08em;
            background:#ecfdf5;color:#059669;
            padding:3px 7px;border-radius:20px;
          ">● ${t.live.toUpperCase()}</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">${t.nextStop}</span>
            <span style="font-size:11px;font-weight:600;color:#0f172a">${bus.nextStop || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">${t.speed}</span>
            <span style="font-size:11px;font-weight:600;color:#0f172a">${Math.round(bus.speed)} km/h</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">${t.load}</span>
            <span style="
              font-size:10px;font-weight:700;
              background:${loadBadgeBg};color:${loadBadgeColor};
              padding:2px 8px;border-radius:20px;
            ">${load}/50 · ${loadLabel}</span>
          </div>
        </div>

        <div style="margin-top:10px;height:4px;background:#f1f5f9;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${loadPct}%;background:${loadColor};border-radius:4px;transition:width 0.4s"></div>
        </div>
      </div>
    `;

      if (busMarkersRef.current[bus.id]) {
        const marker = busMarkersRef.current[bus.id];
        const currentPos = marker.getLatLng();
        animateMarker(marker, [currentPos.lat, currentPos.lng], [bus.lat, bus.lng], 2800);
        marker.setIcon(L.divIcon({ html: markerHtml, className: '', iconSize: [44, 36], iconAnchor: [22, 36] }));
        marker.setTooltipContent(tooltipHtml);
        marker.setZIndexOffset(isActive ? 1000 : 500);
        // Update click listener with fresh bus data
        marker.off('click').on('click', () => { setInfoPanel(bus); setSelectedBus(bus); });
      } else {
        const marker = L.marker([bus.lat, bus.lng], {
          icon: L.divIcon({ html: markerHtml, className: '', iconSize: [44, 36], iconAnchor: [22, 36] }),
          zIndexOffset: isActive ? 1000 : 500,
        });
        marker.bindTooltip(tooltipHtml, {
          direction: 'top', offset: [0, -38],
          className: 'bus-tooltip-clean', opacity: 1,
        });
        marker.on('click', () => { setInfoPanel(bus); setSelectedBus(bus); });
        marker.addTo(map);
        busMarkersRef.current[bus.id] = marker;
        renderedBusIdsRef.current.add(bus.id.toString());
      }
    });
  }, [buses, mapReady, activeRouteFilter, showBuses, activeTrip, mapBounds]);


  // ── SELECTED STOP HIGHLIGHT ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!selectedStop || !map || !L || !isValidCoords(selectedStop)) return;

    map.flyTo([selectedStop.lat, selectedStop.lng], 17, { duration: 1.2, easeLinearity: 0.35 });

    if (highlightMarkerRef.current) map.removeLayer(highlightMarkerRef.current);

    const pulseHtml = `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;pointer-events:none;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(99,102,241,0.12);
        animation:pulse-ring 1.8s ease-out infinite
      "></div>
      <div style="
        position:absolute;inset:8px;border-radius:50%;
        background:rgba(99,102,241,0.18);
        animation:pulse-ring 1.8s ease-out 0.4s infinite
      "></div>
    </div>
  `;

    highlightMarkerRef.current = L.marker([selectedStop.lat, selectedStop.lng], {
      icon: L.divIcon({ html: pulseHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] }),
      zIndexOffset: 1000,
    }).addTo(map);

    // Keep pulse and panel visible until manually dismissed
  }, [selectedStop]);

  const scrollRoutes = (direction: 'left' | 'right') => {
    if (routeScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      routeScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const routeMap = useMemo(
    () => Object.fromEntries(BUS_ROUTES.map(r => [r.id, r])),
    []
  );

  return (
    <div className="full-screen-map">
      <div ref={mapContainerRef} className="map-container" />

      {/* Glassmorphic Map Loading Spinner */}
      {busesLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'rgba(10, 14, 24, 0.75)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '22px 28px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}>
          {/* Custom self-contained SVG spinner */}
          <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              .spinner_aj1M{transform-origin:center;animation:spinner_mw72 .75s linear infinite}
              @keyframes spinner_mw72{100%{transform:rotate(360deg)}}
            `}</style>
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" fill="#3b82f6" />
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" className="spinner_aj1M" fill="#3b82f6" />
          </svg>
          <span style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.02em',
          }}>
            Duke ngarkuar autobusët...
          </span>
        </div>
      )}

      {/* (Top Banner for Map Selection moved to center-map UI below) */}

      {/* ── TOP OVERLAY: BRANDING ── */}
      <div className="overlay-top-left desktop-only">
        <div className="glass-panel main-brand-panel">
          <div className="brand-dot animate-pulse" />
          <div className="brand-info">
            <h1>Urbani Im</h1>
            <p>{t.tirana_live_map}</p>
          </div>
        </div>
      </div>
      {/* ── TOP OVERLAY: MOBILE SEARCH BAR ── */}
      {!selectingOnMap && (
        <div
          ref={searchContainerRef}
          className="overlay-top-mobile mobile-only"
          style={{
            position: 'absolute', top: 'calc(16px + env(safe-area-inset-top, 0px))', left: '16px', right: '16px', zIndex: 2002,
            display: 'flex', flexDirection: 'column', overflow: 'visible'
          }}
        >
          {/* Main Bar */}
          <div className="glass-panel" style={{
            display: 'flex', alignItems: 'center', padding: '6px',
            borderRadius: isSearching ? '22px 22px 0 0' : '22px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(10, 14, 24, 0.82)',
            backdropFilter: 'blur(20px) saturate(160%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            height: '62px',
            zIndex: 10, transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <button
              onClick={() => setIsSearching(!isSearching)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
                background: 'transparent', border: 'none', color: '#fff',
                textAlign: 'left', cursor: 'pointer', height: '100%'
              }}
            >
              <IonIcon icon={navigateOutline} style={{ fontSize: 20, color: isSearching ? '#fff' : '#94a3b8', transition: 'color 0.3s' }} />
              <input
                ref={tripFromInputRef}
                value={tripFrom}
                onChange={(e) => {
                  setTripFrom(e.target.value);
                  setShowFromDropdown(true);
                }}
                placeholder={t.select_departure}
                onClick={(e) => { e.stopPropagation(); setIsSearching(true); }}
                onFocus={() => {
                  setShowFromDropdown(true);
                  setShowToDropdown(false);
                  setSelectedStop(null);
                  setInfoPanel(null);
                }}
                onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff', fontSize: '15px',
                  fontWeight: '700', width: '100%', outline: 'none', boxShadow: 'none'
                }}
                readOnly={!isSearching}
              />
            </button>

            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', margin: '0 4px', opacity: 1, transition: 'opacity 0.3s' }} />

            {activeTrip ? (
              <button
                onClick={() => {
                  setActiveTrip(null);
                  setWalkingShapes({});
                  setShowTripDetails(false);
                  setTripFrom('');
                  setTripTo('');
                  setShowRoutes(false);
                  setShowStops(true);
                  setActiveRouteFilter(null);
                  mapInstanceRef.current?.flyTo(TIRANA_CENTER, DEFAULT_ZOOM);
                }}
                style={{
                  width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: isSearching ? '18px 18px 0 0' : '18px', border: 'none',
                  background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.4s'
                }}
                title={t.close}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 22 }} />
              </button>
            ) : (
              <button
                onClick={async () => {
                  requestCompassPermission();
                  await fetchUserLocation(true);
                  // Update trip origin coords whenever user location is requested for planning
                  const currentUserLocation = userLocation;
                  if (currentUserLocation && isValidCoords(currentUserLocation)) {
                    const myLocStr = t.my_location;
                    setTripOriginCoords(currentUserLocation, myLocStr);
                    if (isSearching) {
                      setTripFrom(myLocStr);
                    }
                    mapInstanceRef.current?.flyTo([currentUserLocation.lat, currentUserLocation.lng], 17);
                  }
                }}
                style={{
                  width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: isSearching ? '18px 18px 0 0' : '18px', border: 'none',
                  background: 'transparent', color: '#fff', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <IonIcon icon={locateOutline} style={{ fontSize: 22 }} />
              </button>
            )}
          </div>

          {/* Second Bar (Joined with Transition) */}
          <div className="glass-panel" style={{
            display: 'flex', alignItems: 'center', padding: '6px',
            borderRadius: '0 0 22px 22px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            background: 'rgba(10, 14, 24, 0.82)',
            backdropFilter: 'blur(20px) saturate(160%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            height: isSearching ? '62px' : '0px',
            opacity: isSearching ? 1 : 0,
            transform: isSearching ? 'translateY(0)' : 'translateY(-10px)',
            overflow: 'hidden',
            pointerEvents: isSearching ? 'auto' : 'none',
            zIndex: 5,
            transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', height: '100%' }}>
              <IonIcon icon={pinOutline} style={{ fontSize: 20, color: '#94a3b8' }} />
              <input
                id="trip-to-input"
                value={tripTo}
                onChange={(e) => {
                  setTripTo(e.target.value);
                  setShowToDropdown(true);
                }}
                placeholder={t.select_destination}
                onFocus={() => {
                  setShowToDropdown(true);
                  setShowFromDropdown(false);
                  setSelectedStop(null);
                  setInfoPanel(null);
                }}
                onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff', fontSize: '15px',
                  fontWeight: '700', width: '100%', outline: 'none', boxShadow: 'none'
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    if (tripFrom.trim().toLowerCase() === tripTo.trim().toLowerCase()) {
                      addNotification(t.trip_different_stations, 'error');
                    } else {
                      await planTrip(tripFrom, tripTo);
                      setIsSearching(false);
                    }
                  }
                }}
              />
            </div>

            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

            <button
              onClick={async () => {
                if (tripFrom && tripTo) {
                  if (tripFrom.trim().toLowerCase() === tripTo.trim().toLowerCase()) {
                    addNotification(t.trip_different_stations, 'error');
                  } else {
                    setIsPlanning(true);
                    setShowTripDetails(true);
                    setTripSheetHeight('peek');
                    await planTrip(tripFrom, tripTo);
                    setIsPlanning(false);
                    setIsSearching(false);
                  }
                }
              }}

              style={{
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '0 0 18px 0', border: 'none',
                background: 'transparent', color: '#f59e0b', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <IonIcon
                icon={arrowForwardOutline}
                style={{ fontSize: 22, filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' }}
              />
            </button>
          </div>

          {/* ── AUTOCOMPLETE DROPDOWNS ── */}
          {showFromDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '0',
              right: '0',
              zIndex: 3000,
              background: 'rgba(10, 14, 24, 0.98)',
              backdropFilter: 'blur(30px) saturate(180%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
              maxHeight: '320px',
              overflowY: 'auto',
              animation: 'slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              padding: '10px'
            }} className="station-dropdown-map">
              <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
                {t.departure_suggestions}
              </div>


              {/* Choose on Map Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectingOnMap('from');
                  setShowFromDropdown(false);
                  setIsSearching(false);
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px 14px 14px', borderRadius: '0px',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#f59e0b',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{
                  width: '24px', height: '24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IonIcon icon={pinOutline} style={{ fontSize: 18, color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>
                  {t.choose_on_map}
                </span>
              </button>

              {/* Saved Places (Home & Work) Shortcuts inside the dropdown */}
              {(mapShowHomeOrig || mapShowWorkOrig) && (
                <div style={{
                  display: 'flex', gap: '8px', padding: '6px 14px 10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px'
                }}>
                  {mapShowHomeOrig && (
                    <button
                      type="button"
                      onClick={() => {
                        setTripFrom(homeLocation);
                        setShowFromDropdown(false);
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.2s', overflow: 'hidden'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <IonIcon icon={homeOutline} style={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>Shtëpia</span>
                    </button>
                  )}
                  {mapShowWorkOrig && (
                    <button
                      type="button"
                      onClick={() => {
                        setTripFrom(workLocation);
                        setShowFromDropdown(false);
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.2s', overflow: 'hidden'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <IonIcon icon={briefcaseOutline} style={{ fontSize: 13, color: '#3b82f6', flexShrink: 0 }} />
                      <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>Puna</span>
                    </button>
                  )}
                </div>
              )}

              {/* A. STACIONET E AUTOBUSIT */}
              {tripFrom.trim().length > 0 && STOP_NAMES.filter(name => name.toLowerCase().includes(tripFrom.toLowerCase())).length > 0 && (
                <>
                  <div style={{ padding: '6px 14px 2px', fontSize: '10px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t.bus_stations}
                  </div>
                  {STOP_NAMES.filter(name => name.toLowerCase().includes(tripFrom.toLowerCase())).slice(0, 5).map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setTripFrom(name);
                        setShowFromDropdown(false);
                      }}
                      style={{
                        width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.85)', textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px',
                        borderRadius: '16px', transition: 'all 0.2s', marginBottom: '2px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', color: '#3b82f6', flexShrink: 0,
                        justifyContent: 'center'
                      }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ alignSelf: 'center' }}>
                          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                        </svg>
                      </div>
                      <span style={{ flex: 1, fontWeight: '600' }}>{name}</span>
                      <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14, opacity: 0.2 }} />
                    </button>
                  ))}
                </>
              )}

              {/* B. ADRESAT DHE ATRAKSIONET */}
              {tripFrom.trim().length > 0 && fromSuggestions.length > 0 && (
                <>
                  <div style={{ padding: '10px 14px 2px', fontSize: '10px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                    {t.addresses_attractions}
                  </div>
                  {fromSuggestions.map((item, idx) => {
                    const itemType = String(item.type || '');
                    let badgeBg = 'rgba(100, 116, 139, 0.1)';
                    let badgeColor = '#64748b';
                    if (itemType.includes('Restorant') || itemType.includes('Kafe') || itemType.includes('Bar') || itemType.includes('Food') || itemType.includes('Cafe') || itemType.includes('Restaurant')) {
                      badgeBg = 'rgba(245, 158, 11, 0.15)';
                      badgeColor = '#f59e0b';
                    } else if (itemType.includes('Dyqan') || itemType.includes('Shop') || itemType.includes('Mall')) {
                      badgeBg = 'rgba(168, 85, 247, 0.15)';
                      badgeColor = '#a855f7';
                    } else if (itemType.includes('Arsim') || itemType.includes('Shkollë') || itemType.includes('Education')) {
                      badgeBg = 'rgba(6, 182, 212, 0.15)';
                      badgeColor = '#06b6d4';
                    } else if (itemType.includes('Shëndetësi') || itemType.includes('Medical')) {
                      badgeBg = 'rgba(239, 68, 68, 0.15)';
                      badgeColor = '#ef4444';
                    } else if (itemType.includes('Hotel')) {
                      badgeBg = 'rgba(99, 102, 241, 0.15)';
                      badgeColor = '#6366f1';
                    } else if (itemType.includes('Historik') || itemType.includes('Turizëm') || itemType.includes('Tourism')) {
                      badgeBg = 'rgba(236, 72, 153, 0.15)';
                      badgeColor = '#ec4899';
                    } else if (itemType.includes('Park')) {
                      badgeBg = 'rgba(34, 197, 94, 0.15)';
                      badgeColor = '#22c55e';
                    } else if (itemType.includes('Karburant') || itemType.includes('Gas Station') || itemType.includes('Fuel')) {
                      badgeBg = 'rgba(239, 68, 68, 0.15)';
                      badgeColor = '#ef4444';
                    }

                    const placeIcon = getPlaceIcon(item);
                    const IconComp = placeIcon.icon;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isValidCoords({ lat: item.lat, lng: item.lng })) return;
                          const fullText = item.name + (item.address ? ', ' + item.address : '');
                          // Fix: use a bound action instead of useStore.getState() inside JSX event handlers
                          setTripOriginCoords({ lat: item.lat, lng: item.lng }, fullText);
                          setTripFrom(fullText);
                          setShowFromDropdown(false);
                        }}
                        style={{
                          width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                          color: 'rgba(255,255,255,0.85)', textAlign: 'left', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px',
                          borderRadius: '16px', transition: 'all 0.2s', marginBottom: '2px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                      >
                        <div style={{
                          width: '24px', height: '24px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <IonIcon icon={IconComp} style={{ fontSize: 16, color: placeIcon.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          {item.address && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{item.address}</span>}
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                          padding: '4px 8px', borderRadius: '8px', background: badgeBg, color: badgeColor, flexShrink: 0
                        }}>
                          {itemType || ''}
                        </span>
                        <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14, opacity: 0.2 }} />
                      </button>
                    );
                  })}
                </>
              )}

              {STOP_NAMES.filter(name => name.toLowerCase().includes(tripFrom.toLowerCase())).length === 0 && fromSuggestions.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  {t.searching_addresses}
                </div>
              )}
            </div>
          )}

          {showToDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '0',
              right: '0',
              zIndex: 3000,
              background: 'rgba(10, 14, 24, 0.98)',
              backdropFilter: 'blur(30px) saturate(180%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
              maxHeight: '320px',
              overflowY: 'auto',
              animation: 'slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              padding: '10px'
            }} className="station-dropdown-map">
              <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
                {t.destination_suggestions}
              </div>


              {/* Choose on Map Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectingOnMap('to');
                  setShowToDropdown(false);
                  setIsSearching(false);
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px 14px 14px', borderRadius: '0px',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#f59e0b',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{
                  width: '24px', height: '24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IonIcon icon={pinOutline} style={{ fontSize: 18, color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>
                  {t.choose_on_map}
                </span>
              </button>

              {/* Saved Places (Home & Work) Shortcuts inside the dropdown */}
              {(mapShowHomeDest || mapShowWorkDest) && (
                <div style={{
                  display: 'flex', gap: '8px', padding: '6px 14px 10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px'
                }}>
                  {mapShowHomeDest && (
                    <button
                      type="button"
                      onClick={() => {
                        setTripTo(homeLocation);
                        setShowToDropdown(false);
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.2s', overflow: 'hidden'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <IonIcon icon={homeOutline} style={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>Shtëpia</span>
                    </button>
                  )}
                  {mapShowWorkDest && (
                    <button
                      type="button"
                      onClick={() => {
                        setTripTo(workLocation);
                        setShowToDropdown(false);
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.2s', overflow: 'hidden'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <IonIcon icon={briefcaseOutline} style={{ fontSize: 13, color: '#3b82f6', flexShrink: 0 }} />
                      <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>Puna</span>
                    </button>
                  )}
                </div>
              )}

              {/* A. STACIONET E AUTOBUSIT */}
              {tripTo.trim().length > 0 && STOP_NAMES.filter(name => name.toLowerCase().includes(tripTo.toLowerCase())).length > 0 && (
                <>
                  <div style={{ padding: '6px 14px 2px', fontSize: '10px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t.bus_stations}
                  </div>
                  {STOP_NAMES.filter(name => name.toLowerCase().includes(tripTo.toLowerCase())).slice(0, 5).map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setTripTo(name);
                        setShowToDropdown(false);
                      }}
                      style={{
                        width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.85)', textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px',
                        borderRadius: '16px', transition: 'all 0.2s', marginBottom: '2px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', color: '#3b82f6', flexShrink: 0,
                        justifyContent: 'center'
                      }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ alignSelf: 'center' }}>
                          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                        </svg>
                      </div>
                      <span style={{ flex: 1, fontWeight: '600' }}>{name}</span>
                      <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14, opacity: 0.2 }} />
                    </button>
                  ))}
                </>
              )}

              {/* B. ADRESAT DHE ATRAKSIONET */}
              {tripTo.trim().length > 0 && toSuggestions.length > 0 && (
                <>
                  <div style={{ padding: '10px 14px 2px', fontSize: '10px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                    {t.addresses_attractions}
                  </div>
                  {toSuggestions.map((item, idx) => {
                    const itemType = String(item.type || '');
                    let badgeBg = 'rgba(100, 116, 139, 0.1)';
                    let badgeColor = '#64748b';
                    if (itemType.includes('Restorant') || itemType.includes('Kafe') || itemType.includes('Bar') || itemType.includes('Food') || itemType.includes('Cafe') || itemType.includes('Restaurant')) {
                      badgeBg = 'rgba(245, 158, 11, 0.15)';
                      badgeColor = '#f59e0b';
                    } else if (itemType.includes('Dyqan') || itemType.includes('Shop') || itemType.includes('Mall')) {
                      badgeBg = 'rgba(168, 85, 247, 0.15)';
                      badgeColor = '#a855f7';
                    } else if (itemType.includes('Arsim') || itemType.includes('Shkollë') || itemType.includes('Education')) {
                      badgeBg = 'rgba(6, 182, 212, 0.15)';
                      badgeColor = '#06b6d4';
                    } else if (itemType.includes('Shëndetësi') || itemType.includes('Medical')) {
                      badgeBg = 'rgba(239, 68, 68, 0.15)';
                      badgeColor = '#ef4444';
                    } else if (itemType.includes('Hotel')) {
                      badgeBg = 'rgba(99, 102, 241, 0.15)';
                      badgeColor = '#6366f1';
                    } else if (itemType.includes('Historik') || itemType.includes('Turizëm') || itemType.includes('Tourism')) {
                      badgeBg = 'rgba(236, 72, 153, 0.15)';
                      badgeColor = '#ec4899';
                    } else if (itemType.includes('Park')) {
                      badgeBg = 'rgba(34, 197, 94, 0.15)';
                      badgeColor = '#22c55e';
                    } else if (itemType.includes('Karburant') || itemType.includes('Gas Station') || itemType.includes('Fuel')) {
                      badgeBg = 'rgba(239, 68, 68, 0.15)';
                      badgeColor = '#ef4444';
                    }

                    const placeIcon = getPlaceIcon(item);
                    const IconComp = placeIcon.icon;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isValidCoords({ lat: item.lat, lng: item.lng })) return;
                          const fullText = item.name + (item.address ? ', ' + item.address : '');
                          // Fix: use a bound action instead of useStore.getState() inside JSX event handlers
                          setTripDestCoords({ lat: item.lat, lng: item.lng }, fullText);
                          setTripTo(fullText);
                          setShowToDropdown(false);
                        }}
                        style={{
                          width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                          color: 'rgba(255,255,255,0.85)', textAlign: 'left', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '14px', fontSize: '14px',
                          borderRadius: '16px', transition: 'all 0.2s', marginBottom: '2px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                      >
                        <div style={{
                          width: '24px', height: '24px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <IonIcon icon={IconComp} style={{ fontSize: 16, color: placeIcon.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          {item.address && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{item.address}</span>}
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                          padding: '4px 8px', borderRadius: '8px', background: badgeBg, color: badgeColor, flexShrink: 0
                        }}>
                          {itemType || ''}
                        </span>
                        <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14, opacity: 0.2 }} />
                      </button>
                    );
                  })}
                </>
              )}

              {STOP_NAMES.filter(name => name.toLowerCase().includes(tripTo.toLowerCase())).length === 0 && toSuggestions.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  {t.searching_addresses}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

      `}</style>

      {/* ── RIGHT OVERLAY: ALL CONTROLS IN ONE COLUMN ── */}
      <div className="overlay-right-center">
        <div className="controls-column">
          {/* Layer Selector - Vertical */}
          <div className="glass-panel vertical-group desktop-only">
            <button className={mapStyle === 'dark' ? 'active' : ''} onClick={() => setMapStyle('dark')} title={t.dark_mode}><IonIcon icon={moonOutline} style={{ fontSize: 20 }} /></button>
            <button className={mapStyle === 'light' ? 'active' : ''} onClick={() => setMapStyle('light')} title={t.light_mode}><IonIcon icon={sunnyOutline} style={{ fontSize: 20 }} /></button>
            <button className={mapStyle === 'satellite' ? 'active' : ''} onClick={() => setMapStyle('satellite')} title={t.satellite}><IonIcon icon={globeOutline} style={{ fontSize: 20 }} /></button>
          </div>

          <div className="v-spacer desktop-only" />

          {/* Zoom Controls */}
          <div className="glass-panel vertical-group desktop-only">
            <button onClick={() => mapInstanceRef.current?.zoomIn()} title={t.zoom_in}><IonIcon icon={addOutline} style={{ fontSize: 20 }} /></button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()} title={t.zoom_out}><IonIcon icon={removeOutline} style={{ fontSize: 20 }} /></button>
          </div>

          <div className="v-spacer" />

          {/* Locate Button */}
          <button
            className="glass-panel action-btn locate-btn"
            onClick={async () => {
              requestCompassPermission();
              await fetchUserLocation(true);
              // Fix: use reactive userLocation from hook instead of stale getState() access
              const currentUserLocation = userLocation;
              if (currentUserLocation && isValidCoords(currentUserLocation)) {
                mapInstanceRef.current?.flyTo([currentUserLocation.lat, currentUserLocation.lng], 17);
              }
            }}
            title={t.locate_me}
          >
            <IonIcon icon={locateOutline} style={{ fontSize: 22 }} />
          </button>

          <div className="v-spacer desktop-only" />

          {/* Visibility Toggles */}
          <div className="glass-panel vertical-group toggles desktop-only">
            <button className={showStops ? 'active' : ''} onClick={() => setShowStops(!showStops)} title={t.toggle_stops}><IonIcon icon={pinOutline} style={{ fontSize: 20 }} /></button>
            <button className={showBuses ? 'active' : ''} onClick={() => setShowBuses(!showBuses)} title={t.toggle_buses}><IonIcon icon={busOutline} style={{ fontSize: 20 }} /></button>
            <button className={showRoutes ? 'active' : ''} onClick={() => setShowRoutes(!showRoutes)} title={t.toggle_routes}><IonIcon icon={compassOutline} style={{ fontSize: 20 }} /></button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM OVERLAY: ROUTE SELECTOR WITH ARROWS ── */}
      <div className="overlay-bottom-center desktop-only">
        {activeTrip ? (
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IonIcon icon={navigateOutline} style={{ fontSize: 20, color: 'var(--primary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.active_trip_label}
                </span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>
                  {activeTrip.from} ➔ {activeTrip.to}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setShowTripDetails(true); setTripSheetHeight('peek'); }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {t.continue_btn || 'Continue'} <IonIcon icon={arrowForwardOutline} style={{ fontSize: 14 }} />
              </button>
              <button
                onClick={() => {
                  setActiveTrip(null);
                  setWalkingShapes({});
                  setShowTripDetails(false);
                }}
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 16 }} /> {t.close}
              </button>
            </div>
          </div>
        ) : (
          <div className="scroller-wrapper">
            <button className="nav-arrow left" onClick={() => scrollRoutes('left')}><IonIcon icon={chevronBackOutline} style={{ fontSize: 24 }} /></button>

            <div className="route-scroller-container">
              <div ref={routeScrollerRef} className="glass-panel route-scroller route-scrollbar">
                <button
                  className={`route-item all ${!activeRouteFilter ? 'active' : ''}`}
                  onClick={() => setActiveRouteFilter(null)}
                >
                  {t.all}
                </button>
                {BUS_ROUTES.map((route: any) => (
                  <button
                    key={route.id}
                    className={`route-item ${activeRouteFilter === route.id ? 'active' : ''}`}
                    style={{ '--route-color': route.color } as any}
                    onClick={() => setActiveRouteFilter(activeRouteFilter === route.id ? null : route.id)}
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="nav-arrow right" onClick={() => scrollRoutes('right')}><IonIcon icon={chevronForwardOutline} style={{ fontSize: 24 }} /></button>
          </div>
        )}
      </div>

      {/* ── TRIP DETAILS PANEL ── */}
      {showTripDetails && (isPlanning || activeTrip) && (
        <SwipeDismissView
          direction="vertical"
          isFixed={false}
          onDismiss={() => { setShowTripDetails(false); setTripSheetHeight('peek'); }}
          onSwipeUp={() => setTripSheetHeight('full')}
          onSwipeDown={tripSheetHeight === 'full' ? () => setTripSheetHeight('peek') : undefined}
          threshold={100}
          dragHandleClass="mobile-drag-handle"
        >
          <div
            className={`stop-info-card sheet-${tripSheetHeight}`}
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              background: 'rgba(15, 20, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              maxHeight: tripSheetHeight === 'full' ? 'calc(100vh - 90px - env(safe-area-inset-top, 0px))' : '40vh',
              minHeight: '200px',
              overflowY: tripSheetHeight === 'full' ? 'auto' : 'hidden',
              overflowX: 'hidden',
              zIndex: 1001,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(16px)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="mobile-drag-handle" style={{ position: 'relative' }}>
                <div className="drag-indicator" />
                {tripSheetHeight === 'peek' && (
                  <div style={{
                    position: 'absolute', top: '2px', left: '50%',
                    transform: 'translateX(-50%)',
                    animation: 'bounce 2s infinite',
                    color: 'rgba(255,255,255,0.5)',
                    pointerEvents: 'none'
                  }}>
                    <IonIcon icon={chevronUpOutline} style={{ fontSize: 16 }} />
                  </div>
                )}
              </div>
              <div className="card-header" style={{ background: 'transparent', padding: '10px 20px 15px 20px' }}>
                <div className="header-main">
                  <span className="route-num" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
                    <IonIcon icon={navigateOutline} style={{ fontSize: 26, color: '#f59e0b', filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.5))' }} />
                  </span>
                  <div className="route-texts">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>
                      {isPlanning ? t.calculating : t.step_by_step}
                    </h3>
                    {!isPlanning && activeTrip ? (
                      <p style={{ margin: 0 }}>{activeTrip.from} → {activeTrip.to}</p>
                    ) : (
                      <p style={{ margin: 0 }}>{t.finding_optimal_route}</p>
                    )}
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowTripDetails(false)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.5 }}>
                  <IonIcon icon={closeOutline} style={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            {isPlanning ? (
              /* Skeleton Loader */
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                        <div className="skeleton" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Content */
              <div className="route-scrollbar" style={{ padding: '0 16px 100px 16px', overflowX: 'hidden' }}>

                {/* Summary card (Identical to Trip Planner) */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  margin: '16px 0',
                }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', letterSpacing: '0.04em' }}>{t.best_route}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Urbani Im AI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', width: '100%' }}>
                    {[
                      { icon: <IonIcon icon={timeOutline} style={{ fontSize: 14 }} />, value: `${activeTrip.travelTime}m`, label: t.time_label, color: '#3b82f6' },
                      { icon: <IonIcon icon={pinOutline} style={{ fontSize: 14 }} />, value: activeTrip.totalStops, label: t.stations, color: '#8b5cf6' },
                      { icon: <IonIcon icon={cashOutline} style={{ fontSize: 14 }} />, value: `${activeTrip.totalPrice}L`, label: t.cost_label, color: '#10b981' },
                    ].map(({ icon, value, label, color }, idx) => (
                      <div key={label} style={{
                        padding: '10px 4px',
                        borderRight: idx < 2 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                        minWidth: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                      }}>
                        <span style={{ color }}>{icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>{value}</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }}>
                  {t.step_by_step}
                </div>

                <div style={{ position: 'relative', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
                  {/* Timeline Background Line */}
                  <div style={{
                    position: 'absolute',
                    left: '23px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
                    zIndex: 1
                  }} />

                  {activeTrip.legs?.map((leg: Leg, i: number) => {
                    const prevLeg = i > 0 ? (activeTrip.legs[i - 1] as Leg) : null;
                    const isDirectTransfer = prevLeg && !prevLeg.isWalking && !leg.isWalking;
                    const r = leg.route?.id ? routeMap[leg.route.id] : undefined;
                    const color = r?.color || '#888';
                    const allShown = showAllStops[i];
                    const stops = leg.stops || [];
                    const stopsToShow = allShown
                      ? stops
                      : stops.length <= 3
                        ? stops
                        : [stops[0], stops[stops.length - 1]];
                    const hiddenCount = Math.max(0, stops.length - 2);

                    return (
                      <div key={leg.route?.id ?? `leg-${i}`} style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                        {isDirectTransfer && (
                          <div style={{
                            marginLeft: '48px',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            borderRadius: '10px',
                            marginBottom: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <IonIcon icon={syncOutline} style={{ fontSize: '14px', animation: 'spin 4s linear infinite' }} />
                            <span>{t.transfer_at} <strong style={{ color: '#fff' }}>{leg.boardAt}</strong></span>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '16px' }}>
                          {/* Timeline Node Icon */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: leg.isWalking ? 'rgba(16, 185, 129, 0.12)' : `${color}18`,
                            border: `2.5px solid ${leg.isWalking ? '#10b981' : color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 0 12px ${leg.isWalking ? 'rgba(16, 185, 129, 0.3)' : `${color}30`}`,
                            zIndex: 3
                          }}>
                            {leg.isWalking ? (
                              <IonIcon icon={walkOutline} style={{ fontSize: '14px', color: '#10b981' }} />
                            ) : (
                              <IonIcon icon={busOutline} style={{ fontSize: '14px', color }} />
                            )}
                          </div>

                          {/* Content Card */}
                          <div style={{
                            flex: 1,
                            background: leg.isWalking
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: leg.isWalking
                              ? '1px solid rgba(16, 185, 129, 0.15)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                          className="step-card-hover"
                          >
                            {leg.isWalking ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {t.walk_transfer}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px', borderRadius: '8px' }}>
                                    {leg.walkingTime} min
                                  </span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                                  {leg.boardAt} → {leg.alightAt}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>
                                  {t.walking_notice.replace('{dist}', leg.walkingDist?.toString() || '0').replace('{time}', leg.walkingTime?.toString() || '0')}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                  <div style={{
                                    background: color,
                                    color: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: `0 2px 8px ${color}35`
                                  }}>
                                    <IonIcon icon={busOutline} style={{ fontSize: '11px', color: '#fff' }} /> {leg.route?.name ?? '—'}
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                    {r?.name}
                                  </span>
                                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <IonIcon icon={cashOutline} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }} />
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>{t.ticket_40}</span>
                                  </div>
                                </div>

                                {/* Stops Timeline */}
                                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '2px' }}>
                                  {/* Inner dashed line */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '5px',
                                    top: '12px',
                                    bottom: '12px',
                                    width: '1px',
                                    borderLeft: `1px dashed ${color}45`,
                                  }} />

                                  {stopsToShow.map((stop: string, j: number) => {
                                    const isFirst = j === 0;
                                    const isLast = j === stopsToShow.length - 1;
                                    const isTerminal = isFirst || isLast;
                                    return (
                                      <div key={`${leg.route?.id ?? i}-stop-${j}`} style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '28px', flexShrink: 0 }}>
                                          <div style={{
                                            width: isTerminal ? '10px' : '6px',
                                            height: isTerminal ? '10px' : '6px',
                                            borderRadius: '50%',
                                            background: isTerminal ? color : 'rgba(255,255,255,0.15)',
                                            border: isTerminal ? `2px solid ${color}` : 'none',
                                            boxShadow: isTerminal ? `0 0 8px ${color}80` : 'none',
                                            transition: 'transform 0.2s',
                                          }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px', minWidth: 0, flex: 1 }}>
                                          <span style={{
                                            fontSize: '12px',
                                            fontWeight: isTerminal ? '700' : '500',
                                            color: isTerminal ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {stop}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {stops.length > 3 && (
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                      <div style={{ width: '12px' }} />
                                      <button
                                        onClick={() => setShowAllStops(prev => ({ ...prev, [i]: !prev[i] }))}
                                        style={{
                                          padding: '4px 12px',
                                          background: 'rgba(255, 255, 255, 0.03)',
                                          border: '1px solid rgba(255,255,255,0.06)',
                                          borderRadius: '20px',
                                          cursor: 'pointer',
                                          color: color,
                                          fontSize: '11px',
                                          fontWeight: '700',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                      >
                                        <IonIcon icon={chevronDownOutline} style={{ fontSize: '12px', transform: allShown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                        {allShown ? t.hide_stations : `+ ${hiddenCount} ${t.stations.toLowerCase()} ${t.other_stations}`}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>
        </SwipeDismissView>
      )}

      {infoPanel && (
        <SwipeDismissView
          direction="vertical"
          isFixed={false}
          onDismiss={() => setInfoPanel(null)}
          threshold={80}
          dragHandleClass="mobile-drag-handle"
        >
          <div
            className="bus-info-card animate-slide-up"
            style={{ position: 'relative' }}
          >
            {/* Filler background */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '100vh',
              background: '#1e293b',
              zIndex: -1
            }} />
            <div className="mobile-drag-handle">
              <div className="drag-indicator" />
            </div>
            <div className="card-header" style={{ background: infoPanel.routeColor }}>
              <div className="header-main">
                <span className="route-num">{infoPanel.routeName}</span>
                <div className="route-texts">
                  <h3>{infoPanel.routeLabel}</h3>
                  <p>{t.on_move} • {t.live}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setInfoPanel(null)}><IonIcon icon={closeOutline} style={{ fontSize: 20 }} /></button>
            </div>
            <div className="card-body">
              <div className="data-grid">
                <div className="data-item">
                  <label>{t.nextStop}</label>
                  <b>{infoPanel.nextStop || t.calculating}</b>
                </div>
                <div className="data-item">
                  <label>{t.passengers}</label>
                  <div className="load-bar">
                    <div className="load-fill" style={{ width: `${(infoPanel.passengerLoad / 50) * 100}%`, background: infoPanel.passengerLoad > 40 ? 'var(--danger)' : 'var(--success)' }} />
                  </div>
                  <b>{infoPanel.passengerLoad} / 50</b>
                </div>
                <div className="data-item">
                  <label>{t.speed}</label>
                  <b>{Math.round(infoPanel.speed)} km/h</b>
                </div>
              </div>
              <button className="view-details-btn" onClick={() => setView('tracker')}>
                {t.view_details} <IonIcon icon={chevronForwardOutline} style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </SwipeDismissView>
      )}


      {/* ── STOP INFO PANEL (DRAGGABLE SHEET) ── */}
      {selectedStop && (
        <SwipeDismissView
          direction="vertical"
          isFixed={false}
          onDismiss={() => { setSelectedStop(null); setSheetHeight('peek'); }}
          onSwipeUp={() => {
            if (sheetHeight === 'peek') setSheetHeight('half');
            else if (sheetHeight === 'half') setSheetHeight('full');
          }}
          onSwipeDown={sheetHeight !== 'peek' ? () => {
            if (sheetHeight === 'full') setSheetHeight('half');
            else if (sheetHeight === 'half') setSheetHeight('peek');
          } : undefined}
          threshold={120}
          dragHandleClass="mobile-drag-handle"
        >
          <div
            className={`stop-info-card sheet-${sheetHeight}`}
            style={{
              height: sheetHeight === 'peek' ? '350px' : sheetHeight === 'half' ? '50vh' : 'calc(100vh - 90px - env(safe-area-inset-top, 0px))',
              maxHeight: 'calc(100vh - 90px - env(safe-area-inset-top, 0px))',
              borderRadius: sheetHeight === 'full' ? '0' : '28px 28px 0 0',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              background: '#040712',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: 'none',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)'
            }}
          >
            {/* Filler background to prevent map showing below during swipe-up */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              height: '100vh',
              background: '#040712',
              zIndex: -1
            }} />

            <div className="mobile-drag-handle">
              <div className="drag-indicator" style={{ background: 'rgba(255,255,255,0.25)' }} />
            </div>
            <div className="card-header" style={{ background: '#040712', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '20px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="header-main">
                <span className="route-num" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>
                  <IonIcon icon={pinOutline} style={{ fontSize: 28, color: '#f59e0b', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' }} />
                </span>
                <div className="route-texts">
                  <h3 style={{ maxWidth: 'calc(100vw - 140px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff', fontSize: '16px', fontWeight: 800 }}>{selectedStop.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '3px 0 0' }}>{t.station} • ID {selectedStop.id}</p>
                </div>
              </div>
              <button
                className="close-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                onClick={() => { setSelectedStop(null); setSheetHeight('peek'); }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 16 }} />
              </button>
            </div>

            <div className="card-body" style={{ overflowY: 'auto', paddingBottom: 100 }}>
              {/* Peek Content: Lines */}
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontWeight: 800 }}>
                {t.passing_routes}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 24 }}>
                {BUS_ROUTES.filter((r: any) => r.stops.includes(selectedStop.id) || (r.returnStops && r.returnStops.includes(selectedStop.id))).map((line: any) => (
                  <div key={line.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: line.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{line.name}</span>
                  </div>
                ))}
              </div>

              {/* Half Content: Closest Bus */}
              {(sheetHeight === 'half' || sheetHeight === 'full') && (
                <div style={{ animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.05)', borderRadius: 20, padding: 20, border: '1px solid rgba(56, 189, 248, 0.1)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>{t.closest_bus}</span>
                      <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>LIVE</span>
                    </div>
                    {closestBus ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, background: (closestBus as any).routeColor || '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                          <IonIcon icon={busOutline} style={{ fontSize: 22, color: '#fff' }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(closestBus as any).routeName || (closestBus as any).routeId}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                            {t.arrival_time.replace('{count}', getStableArrivalTime(closestBus))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '10px 0' }}>
                        {t.no_active_buses_for_station}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Content: Next 5 Buses */}
              {sheetHeight === 'full' && (
                <div style={{ animation: 'fadeIn 0.4s ease' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px', fontWeight: 800 }}>
                    5 Autobusat e rradhës
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const randomRoute = BUS_ROUTES[i % BUS_ROUTES.length];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)', gap: '10px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: randomRoute.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13, flexShrink: 0 }}>
                              {randomRoute.name}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Drejt Qendrës</div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>ID: TR-{1000 + i}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', whiteSpace: 'nowrap' }}>{i * 4 + 2} min</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{Math.round(400 * i)}m larg</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sheetHeight !== 'half' && (
                <button
                  className="view-details-btn"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    border: 'none',
                    marginTop: '24px',
                    borderRadius: 16,
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    width: '100%',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    height: '52px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.45)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
                  }}
                  onClick={() => {
                    // Fix: use a bound action instead of useStore.getState() inside JSX event handlers
                    setTripFrom(selectedStop.name);
                    setIsSearching(true);
                    setInfoPanel(null);
                    setSelectedStop(null);
                    setTimeout(() => {
                      document.getElementById('trip-to-input')?.focus();
                    }, 100);
                  }}
                >
                  {t.depart_from_here} <IonIcon icon={chevronForwardOutline} style={{ fontSize: 18 }} />
                </button>
              )}
            </div>
          </div>
        </SwipeDismissView>
      )}

      {/* NEW: Map Selection Crosshair, Header, and Bottom Confirm Button */}
      {selectingOnMap && (
        <>
          {/* ── TOP HEADER BAR: IOS 18 STYLE ── */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '16px',
              right: '16px',
              zIndex: 4000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '20px',
              background: 'rgba(10, 14, 24, 0.82)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Back Arrow to Cancel */}
            <button
              onClick={() => {
                setSelectingOnMap(null);
                setIsSearching(true);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
            >
              <IonIcon icon={chevronBackOutline} style={{ fontSize: 24 }} />
            </button>

            {/* Center Info Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                {selectingOnMap === 'from' ? t.choose_departure_point : t.choose_destination}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600, marginTop: '2px' }}>
                {t.pan_zoom_adjust}
              </span>
            </div>

            {/* Hidden spacer to perfectly center the text */}
            <div style={{ width: '40px' }} />
          </div>

          {/* ── ABSOLUTE CENTER TARGET MARKER ── */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Fine Location Pin floating above */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: 'translateY(-6px)',
                animation: 'floatPin 2s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))'
              }}
            >
              <IonIcon icon={pinOutline} style={{ fontSize: 28, color: '#f59e0b' }} />
              <div
                style={{
                  width: '1.5px',
                  height: '10px',
                  background: 'linear-gradient(to bottom, #f59e0b, rgba(245, 158, 11, 0))',
                  marginTop: '-2px'
                }}
              />
            </div>
            {/* Small orange X at the exact map center */}
            <IonIcon icon={closeOutline} style={{ fontSize: 16, color: '#f59e0b', marginTop: '-4px', fontWeight: 'bold' }} />
          </div>

          {/* ── BOTTOM SELECTION PILL (OK BUTTON) ── */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '12px',
              right: '12px',
              height: '64px',
              padding: '0 10px',
              background: 'rgba(10, 14, 24, 0.82)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255,255,255,0.05) inset',
              zIndex: 4000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={async () => {
                const map = mapInstanceRef.current;
                if (!map) return;
                const center = map.getCenter();
                const lat = center.lat;
                const lng = center.lng;

                const tempName = t.point_on_map;
                if (selectingOnMap === 'from') {
                  // Fix: use bound Zustand actions for map selection instead of useStore.getState()
                  setTripOriginCoords({ lat, lng }, tempName);
                  setTripFrom(tempName);
                } else {
                  setTripDestCoords({ lat, lng }, tempName);
                  setTripTo(tempName);
                }

                const previousSelection = selectingOnMap; // Keep reference before nulling it
                setSelectingOnMap(null);
                setIsSearching(true);

                try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${language === 'al' ? 'sq' : language === 'it' ? 'it' : 'en'}`, {
                    headers: { 'User-Agent': 'UrbaniIm/1.0' }
                  });
                  const data = await res.json();
                  if (data && data.display_name) {
                    const nameParts = data.display_name.split(',');
                    const title = nameParts[0].trim();
                    const niceName = title;
                    if (previousSelection === 'from') {
                      // Fix: use bound Zustand actions for reverse geocoding result updates
                      setTripOriginCoords({ lat, lng }, niceName);
                      setTripFrom(niceName);
                    } else {
                      setTripDestCoords({ lat, lng }, niceName);
                      setTripTo(niceName);
                    }
                  }
                } catch (err) {
                  console.error('Reverse geocoding error:', err);
                }
              }}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(10, 14, 24, 0.82)',
                backdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(10, 14, 24, 0.82)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              OK
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .full-screen-map {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #0d1929;
        }
        .map-container { width: 100%; height: 100%; }

        .overlay-top-left { position: absolute; top: 20px; left: 20px; z-index: 1000; }
        .overlay-right-center { position: absolute; top: 50%; right: 20px; transform: translateY(-50%); z-index: 1000; }
        .overlay-bottom-center { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; width: 95%; max-width: 900px; }

        .mobile-only { display: none !important; }

        @media (max-width: 1180px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .overlay-right-center { top: auto; bottom: 20px; transform: none; right: 20px; }
        }

        .glass-panel {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
        }

        /* ── BRANDING ── */
        .main-brand-panel { align-items: center; gap: 12px; padding: 12px 24px; display: flex; }
        .brand-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 12px #10b981; }
        .brand-info h1 { font-size: 18px; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.5px; }
        .brand-info p { font-size: 11px; color: #94a3b8; margin: 2px 0 0; font-weight: 600; }

        /* ── CONTROLS COLUMN ── */
        .controls-column { display: flex; flex-direction: column; align-items: center; }
        .vertical-group { display: flex; flex-direction: column; padding: 6px; gap: 4px; }
        .vertical-group button { 
          width: 44px; height: 44px; border-radius: 14px; 
          display: flex; align-items: center; justify-content: center; 
          color: #cbd5e1; font-size: 20px; transition: 0.2s;
        }
        .vertical-group button:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .vertical-group button.active { background: var(--primary); color: #fff; box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
        .v-spacer { height: 12px; }
        .action-btn { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .toggles button { font-size: 22px; opacity: 0.4; filter: grayscale(1); }
        .toggles button.active { opacity: 1; filter: grayscale(0); background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); }

        /* ── BOTTOM SCROLLER ── */
        .scroller-wrapper { display: flex; align-items: center; gap: 10px; }
        .nav-arrow {
          width: 44px; height: 44px; border-radius: 50%; 
          background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s; z-index: 2;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .nav-arrow:hover { background: var(--primary); transform: scale(1.1); }
        .route-scroller-container { flex: 1; overflow: hidden; position: relative; }
        .route-scroller {
          display: flex; gap: 10px; padding: 12px; 
          overflow-x: auto; scrollbar-width: none;
          scroll-behavior: smooth;
        }
        .route-item {
          padding: 10px 20px; border-radius: 14px; 
          font-size: 14px; font-weight: 800; color: #94a3b8;
          white-space: nowrap; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.04); transition: 0.3s;
        }
        .route-item.active {
          background: var(--route-color, #475569); color: #fff;
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .route-item.all.active { background: #1e293b; }

        /* ── BUS INFO PANEL ── */
        .bus-info-card {
          position: absolute; bottom: 120px; right: 20px; width: 320px;
          background: #040712; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.8);
          z-index: 1000; overflow: hidden;
        }

        /* ── STOP INFO PANEL ── */
        .stop-info-card {
          position: absolute; top: 120px; left: 20px; width: 320px;
          background: #040712; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.8);
          z-index: 1000; overflow: hidden;
        }

        .card-header { padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
        .header-main { display: flex; align-items: center; gap: 14px; }
        .route-num { 
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; 
          font-weight: 900; font-size: 22px; background: none; border: none;
        }
        .route-texts h3 { font-size: 15px; margin: 0; font-weight: 800; }
        .route-texts p { font-size: 11px; opacity: 0.8; margin: 3px 0 0; }
        .card-body { padding: 22px; }
        .data-grid { display: flex; flex-direction: column; gap: 16px; }
        .data-item label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; font-weight: 800; }
        .data-item b { font-size: 16px; color: #f8fafc; }
        .load-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; margin: 6px 0; overflow: hidden; }
        .load-fill { height: 100%; border-radius: 3px; }
        .view-details-btn { 
          width: 100%; margin-top: 24px; padding: 14px; 
          background: #1e293b; border-radius: 14px; color: #fff; 
          font-size: 14px; font-weight: 700; display: flex; 
          align-items: center; justify-content: center; gap: 10px; transition: 0.2s;
        }
        .view-details-btn:hover { background: #334155; transform: scale(1.02); }

        .marker-highlight {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          border: 3px solid #fff;
          box-shadow: 0 0 20px #475569;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes floatPin {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes pin-pulse-ring {
          0%   { transform: translateX(-50%) scale(1); opacity: 0.6; }
          70%  { transform: translateX(-50%) scale(3); opacity: 0; }
          100% { transform: translateX(-50%) scale(3); opacity: 0; }
        }
        @keyframes slide-up { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* ── GOOGLE MAPS DARK INVERSION FILTER ── */
        :global(.google-dark-tiles) {
          filter: invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(1.2) saturate(1.2) !important;
        }

        /* ── LAZY LOADING: REVEAL ANIMATION (only new markers) ── */
        :global(.marker-enter) {
          animation: premiumReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center;
        }
        @keyframes premiumReveal {
          0%   { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        :global(.marker-exit) {
          animation: premiumExit 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
          transform-origin: center;
          pointer-events: none;
        }
        @keyframes premiumExit {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }

        .mobile-drag-handle { display: none; }

        @media (max-width: 900px) {
          .overlay-top-left { top: 15px; left: 15px; }
          .overlay-right-center { right: 15px; bottom: 180px; top: auto; transform: none; }
          .locate-btn { display: none !important; }
          .overlay-bottom-center { bottom: 20px; width: 98%; }
          .nav-arrow { display: none; }
          .close-btn { display: none !important; }
          
          @keyframes sheet-slide-up {
            from { transform: translateY(100%); opacity: 1; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.5s infinite linear;
          }

          .bus-info-card, .stop-info-card { 
            top: auto !important; 
            bottom: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            width: 100% !important; 
            border-bottom-left-radius: 0; 
            border-bottom-right-radius: 0;
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 150px) !important;
            animation: sheet-slide-up 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
            overflow-x: hidden !important;
          }

          /* Responsive inner content for mobile panels */
          .card-body {
            padding: 16px !important;
            overflow-x: hidden !important;
          }
          .card-header {
            padding: 24px 16px 14px !important;
          }
          .header-main {
            gap: 10px !important;
            min-width: 0 !important;
            flex: 1 !important;
          }
          .route-texts {
            min-width: 0 !important;
            flex: 1 !important;
          }
          .route-texts h3 {
            font-size: 14px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .route-texts p {
            font-size: 10px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .data-grid {
            gap: 12px !important;
          }
          .view-details-btn {
            font-size: 13px !important;
            padding: 12px 16px !important;
          }

          .mobile-drag-handle {
            display: flex; align-items: center; justify-content: center;
            width: 100%; height: 24px; position: absolute; top: 0; left: 0;
            z-index: 10; cursor: grab; background: transparent;
            touch-action: none;
          }
          .mobile-drag-handle:active { cursor: grabbing; }
          .drag-indicator {
            width: 40px; height: 5px; background: rgba(255,255,255,0.3);
            border-radius: 3px; margin-top: 4px;
          }
          .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
            background-color: rgba(30, 41, 59, 0.4) !important;
          }
          .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
            background-color: rgba(30, 41, 59, 0.95) !important;
            color: #fff !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            border: 2px solid #fff;
          }

        }

        /* ═══ SMALL PHONES (< 380px) ═══ */
        @media (max-width: 380px) {
          .route-num {
            width: 36px !important;
            height: 36px !important;
            font-size: 18px !important;
          }
          .route-texts h3 {
            font-size: 13px !important;
          }
          .card-header {
            padding: 24px 12px 12px !important;
          }
          .card-body {
            padding: 12px !important;
          }
        }

        /* ═══ TABLET MAP OVERRIDES (iPad) ═══ */
        @media (min-width: 901px) and (max-width: 1180px) {
          /* Right controls: bigger touch targets on iPad */
          .vertical-group button {
            width: 52px !important;
            height: 52px !important;
          }

          /* Mobile search bar: centered + max-width on iPad */
          .overlay-top-mobile {
            left: 50% !important;
            right: auto !important;
            width: calc(100% - 64px) !important;
            max-width: 680px !important;
            transform: translateX(-50%) !important;
          }

          /* Bus/stop info panels: side sheet on iPad instead of full-width */
          .bus-info-card, .stop-info-card {
            left: auto !important;
            right: 0 !important;
            width: min(440px, 100%) !important;
            bottom: 0 !important;
            top: auto !important;
            border-top-left-radius: 28px !important;
            border-top-right-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 100px) !important;
          }

          /* Bottom route scroller: centered with max-width */
          .overlay-bottom-center {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            width: calc(100% - 64px) !important;
            max-width: 740px !important;
          }

          /* Map controls column: move up to avoid bottom nav */
          .overlay-right-center { bottom: 130px !important; }

          /* Location pin OK button: centered + max-width */
          .map-selection-ok-bar {
            left: 50% !important;
            right: auto !important;
            width: calc(100% - 64px) !important;
            max-width: 680px !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
    </div>
  );
}