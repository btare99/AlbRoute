'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import { BUS_SHAPES } from '../../store/busShapes';
import { X, Layers, ZoomIn, ZoomOut, Locate, Filter, Navigation, ArrowRight, MoreVertical, Eye, EyeOff, Map as MapIcon, Info, Search, Settings, ChevronRight, ChevronLeft, ChevronUp, Moon, Sun, Globe, Bus, Route, MapPin, Clock, Banknote, ChevronDown, RefreshCcw } from 'lucide-react';
import { translations } from '../../store/translations';
import SwipeDismissView from '../layout/SwipeDismissView';


// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];
const DEFAULT_ZOOM = 14;
const STOP_NAMES = Array.from(new Set(BUS_STOPS.map((s: any) => s.name))).sort() as string[];

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

  const language = useStore((s: any) => s.language);
  const t = translations[language] || translations.al;

  const [mapReady, setMapReady] = useState(false);
  const [infoPanel, setInfoPanel] = useState<any>(null);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null); // Lazy loading: viewport bounds

  const buses = useStore((s: any) => s.buses);
  const userLocation = useStore((s: any) => s.userLocation);
  const setSelectedBus = useStore((s: any) => s.setSelectedBus);
  const setView = useStore((s: any) => s.setView);
  const selectedStop = useStore((s: any) => s.selectedStop);
  const activeTrip = useStore((s: any) => s.activeTrip);
  const tripOriginCoords = useStore((s: any) => s.tripOriginCoords);
  const fetchUserLocation = useStore((s: any) => s.fetchUserLocation);
  const startTracking = useStore((s: any) => s.startTracking);
  const stopTracking = useStore((s: any) => s.stopTracking);
  const addNotification = useStore((s: any) => s.addNotification);

  const tripFrom = useStore((s: any) => s.tripFrom);
  const setTripFrom = useStore((s: any) => s.setTripFrom);
  const tripTo = useStore((s: any) => s.tripTo);
  const setTripTo = useStore((s: any) => s.setTripTo);
  const planTrip = useStore((s: any) => s.planTrip);

  const [walkingShapes, setWalkingShapes] = useState<Record<string, [number, number][]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const tripFromInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching && tripFromInputRef.current) {
      tripFromInputRef.current.focus();
    }
  }, [isSearching]);

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

    const fetchShapes = async () => {
      const newShapes: Record<string, [number, number][]> = {};

      // Helper: merr rrugën pedestrian nga OSRM foot (trotuare, jo rrugë makinash)
      const fetchFootRoute = async (fromLng: number, fromLat: number, toLng: number, toLat: number): Promise<[number, number][] | null> => {
        try {
          // /foot/ profili ne OSRM ndjek trotuaret dhe shtigjet pedestrian, jo rruget e makinave
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            return data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          }
        } catch (err) {
          console.error('OSRM foot routing error:', err);
        }
        return null;
      };

      // 1. Ecja nga pika e nisjes deri tek stacioni i pare
      if (activeTrip.walkingDist > 0 && tripOriginCoords) {
        const firstStop = BUS_STOPS.find((s: any) =>
          s.id === activeTrip.legs?.[0]?.boardNodeId || s.name === activeTrip.actualFrom
        );
        if (firstStop) {
          const coords = await fetchFootRoute(
            tripOriginCoords.lng, tripOriginCoords.lat,
            firstStop.lng, firstStop.lat
          );
          if (coords) newShapes['origin'] = coords;
        }
      }

      // 2. Ecja ndermjet ndërimeve të linjave
      if (activeTrip.legs) {
        for (let i = 0; i < activeTrip.legs.length; i++) {
          const leg = activeTrip.legs[i];
          if (leg.isWalking) {
            const bStop = leg.boardNodeId
              ? BUS_STOPS.find((s: any) => s.id === leg.boardNodeId)
              : BUS_STOPS.find((s: any) => s.name === leg.boardAt);
            const aStop = leg.alightNodeId
              ? BUS_STOPS.find((s: any) => s.id === leg.alightNodeId)
              : BUS_STOPS.find((s: any) => s.name === leg.alightAt);

            if (bStop && aStop) {
              const coords = await fetchFootRoute(bStop.lng, bStop.lat, aStop.lng, aStop.lat);
              if (coords) newShapes[`walk_${i}`] = coords;
            }
          }
        }
      }

      setWalkingShapes(newShapes);
    };


    fetchShapes();

    // Zoom to route
    if (activeTrip && mapInstanceRef.current) {
      const allStops = activeTrip.legs?.flatMap((l: any) => l.stops || []) || [];
      const coords = allStops.map((name: string) => {
        const s = BUS_STOPS.find((st: any) => st.name === name);
        return s ? [s.lat, s.lng] : null;
      }).filter(Boolean) as [number, number][];

      if (coords.length > 1) {
        const L = LRef.current;
        if (L) {
          const bounds = L.latLngBounds(coords);
          mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], duration: 1.5 });
        }
      }
    }
  }, [activeTrip]);


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

    // Default layers for mobile: Only stations
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const store = useStore.getState();
      store.setShowRoutes(false);
      store.setShowBuses(false);
      store.setShowStops(true);
    }

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
          addNotification(language === 'al' ? 'Busulla u aktivizua! 🧭' : language === 'en' ? 'Compass activated! 🧭' : 'Bussola attivata! 🧭', 'success');
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
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
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

        // LAZY LOADING: Update bounds on every map move/zoom
        map.on('moveend zoomend', () => setMapBounds(map.getBounds()));

        const tileLayer = L.tileLayer(TILES.dark, { maxZoom: 19 });
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
      if (mapInstanceRef.current) {
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
    const newTile = L.tileLayer(TILES[mapStyle], { maxZoom: 19 });
    newTile.addTo(map);
    (map as any)._tileLayer = newTile;
  }, [mapStyle]);

  // ── MAP CLICK HANDLER ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const onMapClick = () => {
      setSelectedStop(null);
      setInfoPanel(null);
    };

    map.on('click', onMapClick);
    return () => { map.off('click', onMapClick); };
  }, [mapReady, setSelectedStop]);

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
    let displayedStops = activeTrip
      ? BUS_STOPS.filter((s: any) => activeTripStopIds.includes(s.id))
      : BUS_STOPS;

    // LAZY LOADING: filter to viewport only (skip for active trip — show all trip stops)
    if (!activeTrip && mapBounds) {
      const expanded = mapBounds.pad(0.15); // slight padding so markers don't pop at edge
      displayedStops = displayedStops.filter((s: any) => expanded.contains([s.lat, s.lng]));
    }

    const nextIds = new Set(displayedStops.map((s: any) => s.id as string));

    // 1. Remove stops that left the viewport
    renderedStopIdsRef.current.forEach(id => {
      if (!nextIds.has(id)) {
        clusterGroupRef.current.removeLayer(stopMarkersMapRef.current[id]);
        delete stopMarkersMapRef.current[id];
      }
    });

    // 2. Add only NEW stops with reveal animation
    displayedStops.forEach((stop: any) => {
      if (renderedStopIdsRef.current.has(stop.id)) return; // already rendered

      const stopHtml = `
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

      const marker = L.marker([stop.lat, stop.lng], {
        icon: L.divIcon({ html: stopHtml, className: '', iconSize: [28, 34], iconAnchor: [14, 34] }),
        zIndexOffset: 100
      });

      const stoppingLines = BUS_ROUTES.filter((r: any) => r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id)));
      const linesHtml = stoppingLines.map((l: any) => `<span style="background:${l.color};color:white;padding:3px;font-size:10px;font-weight:800;text-align:center;width:100%;display:block;">${l.name}</span>`).join('');

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
      if (!isMobile) {
        marker.bindTooltip(`
          <div style="padding:4px; border-radius:0; min-width:120px;">
            <div style="font-weight:800;margin-bottom:6px;font-size:13px;color:#000;border-bottom:1px solid #eee;padding-bottom:2px;">${stop.name}</div>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:2px;width:100%;">${linesHtml}</div>
          </div>`, { direction: 'top', offset: [0, -8], className: 'square-tooltip' });
      }

      marker.on('click', () => setSelectedStop(stop));
      clusterGroupRef.current.addLayer(marker);
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
      // 1. Draw Walking Path
      const tripOriginCoords = useStore.getState().tripOriginCoords;
      if (activeTrip.walkingDist > 0 && tripOriginCoords) {
        const firstStop = BUS_STOPS.find((s: any) => s.name === activeTrip.actualFrom);
        if (firstStop) {
          const walkCoords: [number, number][] = walkingShapes['origin'] || [
            [tripOriginCoords.lat, tripOriginCoords.lng],
            [firstStop.lat, firstStop.lng]
          ];
          const walkLine = L.polyline(walkCoords, {
            color: '#10b981', // green for walking
            weight: 5,
            dashArray: '8, 8', // dashed/dotted line
            opacity: 0.9
          }).addTo(map);
          routeLinesRef.current.push({ line: walkLine, routeId: 'walk' });
        }
      }

      // 2. Draw Legs
      activeTrip.legs.forEach((leg: any, idx: number) => {
        if (leg.isWalking) {
          const bStop = leg.boardNodeId ? BUS_STOPS.find((s: any) => s.id === leg.boardNodeId) : BUS_STOPS.find((s: any) => s.name === leg.boardAt);
          const aStop = leg.alightNodeId ? BUS_STOPS.find((s: any) => s.id === leg.alightNodeId) : BUS_STOPS.find((s: any) => s.name === leg.alightAt);
          if (bStop && aStop) {
            const walkCoords = walkingShapes[`walk_${idx}`] || [
              [bStop.lat, bStop.lng],
              [aStop.lat, aStop.lng]
            ];
            const transferLine = L.polyline(walkCoords, {
              color: '#10b981',
              weight: 5,
              dashArray: '8, 8',
              opacity: 0.9
            }).addTo(map);
            routeLinesRef.current.push({ line: transferLine, routeId: `transfer_walk_${idx}` });
          }
          return;
        }

        const route = leg.route;
        if (!route) return;

        let boardStopId = leg.stopIds ? leg.stopIds[0] : null;
        let alightStopId = leg.stopIds ? leg.stopIds[leg.stopIds.length - 1] : null;

        const boardStop = boardStopId ? BUS_STOPS.find((s: any) => s.id === boardStopId) : BUS_STOPS.find((s: any) => s.name === leg.boardAt);
        const alightStop = alightStopId ? BUS_STOPS.find((s: any) => s.id === alightStopId) : BUS_STOPS.find((s: any) => s.name === leg.alightAt);

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
              const st = BUS_STOPS.find((s: any) => s.name === name);
              return st ? [st.lat, st.lng] : null;
            }).filter(Boolean) as [number, number][];
          }
        }

        if (legCoords.length >= 2) {
          const line = L.polyline(legCoords, {
            color: route.color,
            weight: 6,
            opacity: 1
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
          const line = L.polyline(coords, { color: route.color, weight: isActive ? 4 : 2, opacity: isActive ? 0.9 : 0.2 }).addTo(map);
          routeLinesRef.current.push({ line, routeId: route.id });
        });
      });
    }
  }, [activeTrip, tripOriginCoords, activeRouteFilter, showRoutes, mapReady, walkingShapes]);

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
        background:rgba(255,255,255,0.05);
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
          border-bottom: 9px solid #475569;
          margin-top: 7px;
          filter: drop-shadow(0 0 1px #fff);
        "></div>
      </div>
      ` : ''}

      <!-- Core Location Dot -->
      <div style="
        position:relative;width:16px;height:16px;border-radius:50%;
        background:#475569;
        border:3px solid #fff;
        box-shadow: 0 0 15px rgba(0,0,0,0.4);
        z-index:10
      "></div>
    </div>
  `;

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
        map.removeLayer(busMarkersRef.current[id]);
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
          map.removeLayer(busMarkersRef.current[bus.id]);
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
            <span style="font-size:13px;font-weight:700;color:#0f172a">${language === 'it' ? 'Linea' : language === 'en' ? 'Route' : 'Linja'} ${bus.routeName}</span>
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
        marker.setLatLng([bus.lat, bus.lng]);
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
    if (!selectedStop || !map || !L) return;

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

  return (
    <div className="full-screen-map">
      <div ref={mapContainerRef} className="map-container" />

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
      <div
        ref={searchContainerRef}
        className="overlay-top-mobile mobile-only"
        style={{
          position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 2002,
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
            <Navigation size={20} style={{ color: isSearching ? '#fff' : '#94a3b8', transition: 'color 0.3s' }} />
            <input
              ref={tripFromInputRef}
              value={tripFrom}
              onChange={(e) => {
                setTripFrom(e.target.value);
                setShowFromDropdown(true);
              }}
              placeholder={t.select_departure}
              onClick={(e) => { e.stopPropagation(); setIsSearching(true); }}
              onFocus={() => { setShowFromDropdown(true); setShowToDropdown(false); }}
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
                useStore.getState().setActiveTrip(null);
                setWalkingShapes({});
                setShowTripDetails(false);
                setTripFrom('');
                setTripTo('');
                useStore.getState().setShowRoutes(false);
                useStore.getState().setShowStops(true);
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
              <X size={22} />
            </button>
          ) : (
            <button
              onClick={() => {
                requestCompassPermission();
                fetchUserLocation();
                // Update trip origin coords whenever user location is requested for planning
                if (userLocation) {
                  useStore.getState().setTripOriginCoords(userLocation);
                }
                mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], 17);
                if (isSearching) {
                  const myLocStr = language === 'al' ? '📍 Vendndodhja Ime' : '📍 My Location';
                  setTripFrom(myLocStr);
                }
              }}
              style={{
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: isSearching ? '18px 18px 0 0' : '18px', border: 'none',
                background: 'transparent', color: '#fff', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <Locate size={22} />
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
            <MapPin size={20} style={{ color: '#94a3b8' }} />
            <input
              id="trip-to-input"
              value={tripTo}
              onChange={(e) => {
                setTripTo(e.target.value);
                setShowToDropdown(true);
              }}
              placeholder={t.select_destination}
              onFocus={() => { setShowToDropdown(true); setShowFromDropdown(false); }}
              style={{
                background: 'transparent', border: 'none', color: '#fff', fontSize: '15px',
                fontWeight: '700', width: '100%', outline: 'none', boxShadow: 'none'
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  await planTrip(tripFrom, tripTo);
                  setIsSearching(false);
                }
              }}
            />
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          <button
            onClick={async () => {
              if (tripFrom && tripTo) {
                setIsPlanning(true);
                setShowTripDetails(true);
                setTripSheetHeight('peek');
                await planTrip(tripFrom, tripTo);
                setIsPlanning(false);
                setIsSearching(false);
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
            <ArrowRight
              size={22}
              style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' }}
            />
          </button>
        </div>

        {/* ── AUTOCOMPLETE DROPDOWNS ── */}
        {showFromDropdown && tripFrom.length > 0 && STOP_NAMES.filter(name => name.toLowerCase().includes(tripFrom.toLowerCase())).length > 0 && (


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
            <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
              {tripFrom ? t.results : (language === 'al' ? 'Zgjidh Stacionin' : 'Select Station')}
            </div>
            {(tripFrom
              ? STOP_NAMES.filter(name => name.toLowerCase().includes(tripFrom.toLowerCase()))
              : STOP_NAMES
            ).slice(0, 15).map(name => (
              <button
                key={name}
                onClick={() => {
                  setTripFrom(name);
                  setShowFromDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.85)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '15px',
                  borderRadius: '16px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '2px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                  </svg>


                </div>
                <span style={{ flex: 1, fontWeight: '600' }}>{name}</span>
                <ChevronRight size={16} style={{ opacity: 0.2 }} />
              </button>
            ))}
          </div>
        )}

        {showToDropdown && tripTo.length > 0 && STOP_NAMES.filter((name: string) => name.toLowerCase().includes(tripTo.toLowerCase())).length > 0 && (


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
            <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
              {tripTo ? t.results : (language === 'al' ? 'Zgjidh Destinacionin' : 'Select Destination')}
            </div>
            {(tripTo
              ? STOP_NAMES.filter((name: string) => name.toLowerCase().includes(tripTo.toLowerCase()))
              : STOP_NAMES
            ).slice(0, 15).map((name: string) => (
              <button
                key={name}
                onClick={() => {
                  setTripTo(name);
                  setShowToDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.85)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '15px',
                  borderRadius: '16px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '2px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#cbd5e1', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                  </svg>


                </div>
                <span style={{ flex: 1, fontWeight: '600' }}>{name}</span>
                <ChevronRight size={16} style={{ opacity: 0.2 }} />
              </button>
            ))}
          </div>
        )}
      </div>

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
            <button className={mapStyle === 'dark' ? 'active' : ''} onClick={() => setMapStyle('dark')} title={t.dark_mode}><Moon size={20} /></button>
            <button className={mapStyle === 'light' ? 'active' : ''} onClick={() => setMapStyle('light')} title={t.light_mode}><Sun size={20} /></button>
            <button className={mapStyle === 'satellite' ? 'active' : ''} onClick={() => setMapStyle('satellite')} title={t.satellite}><Globe size={20} /></button>
          </div>

          <div className="v-spacer desktop-only" />

          {/* Zoom Controls */}
          <div className="glass-panel vertical-group desktop-only">
            <button onClick={() => mapInstanceRef.current?.zoomIn()} title={t.zoom_in}><ZoomIn size={20} /></button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()} title={t.zoom_out}><ZoomOut size={20} /></button>
          </div>

          <div className="v-spacer" />

          {/* Locate Button */}
          <button
            className="glass-panel action-btn locate-btn"
            onClick={() => {
              requestCompassPermission();
              fetchUserLocation();
              mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], 17);
            }}
            title={t.locate_me}
          >
            <Locate size={22} />
          </button>

          <div className="v-spacer desktop-only" />

          {/* Visibility Toggles */}
          <div className="glass-panel vertical-group toggles desktop-only">
            <button className={showStops ? 'active' : ''} onClick={() => setShowStops(!showStops)} title={t.toggle_stops}><MapPin size={20} /></button>
            <button className={showBuses ? 'active' : ''} onClick={() => setShowBuses(!showBuses)} title={t.toggle_buses}><Bus size={20} /></button>
            <button className={showRoutes ? 'active' : ''} onClick={() => setShowRoutes(!showRoutes)} title={t.toggle_routes}><Route size={20} /></button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM OVERLAY: ROUTE SELECTOR WITH ARROWS ── */}
      <div className="overlay-bottom-center desktop-only">
        {activeTrip ? (
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Navigation size={20} style={{ color: 'var(--primary)' }} />
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
                {t.continue_btn || 'Continue'} <ArrowRight size={14} />
              </button>
              <button
                onClick={() => {
                  useStore.getState().setActiveTrip(null);
                  setWalkingShapes({});
                  setShowTripDetails(false);
                }}
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
              >
                <X size={16} /> {t.close}
              </button>
            </div>
          </div>
        ) : (
          <div className="scroller-wrapper">
            <button className="nav-arrow left" onClick={() => scrollRoutes('left')}><ChevronLeft size={24} /></button>

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

            <button className="nav-arrow right" onClick={() => scrollRoutes('right')}><ChevronRight size={24} /></button>
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
              maxHeight: tripSheetHeight === 'full' ? 'calc(100vh - 90px)' : '40vh',
              minHeight: '200px',
              overflowY: tripSheetHeight === 'full' ? 'auto' : 'hidden',
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
                    <ChevronUp size={16} />
                  </div>
                )}
              </div>
              <div className="card-header" style={{ background: 'transparent', padding: '10px 20px 15px 20px' }}>
                <div className="header-main">
                  <span className="route-num" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
                    <Navigation size={26} color="#f59e0b" style={{ filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.5))' }} />
                  </span>
                  <div className="route-texts">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>
                      {isPlanning ? (language === 'al' ? 'Duke përpunuar...' : 'Calculating...') : (t.step_by_step || 'Step by Step')}
                    </h3>
                    {!isPlanning && activeTrip ? (
                      <p style={{ margin: 0 }}>{activeTrip.from} → {activeTrip.to}</p>
                    ) : (
                      <p style={{ margin: 0 }}>{language === 'al' ? 'Gjetja e rrugës optimale' : 'Finding optimal route'}</p>
                    )}
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowTripDetails(false)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.5 }}>
                  <X size={20} />
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
              <div className="route-scrollbar" style={{ padding: '0 20px 100px 20px' }}>

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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {[
                      { icon: <Clock size={14} />, value: `${activeTrip.travelTime}m`, label: t.time_label, color: '#3b82f6' },
                      { icon: <MapPin size={14} />, value: activeTrip.totalStops, label: t.stations, color: '#8b5cf6' },
                      { icon: <Banknote size={14} />, value: `${activeTrip.totalPrice}L`, label: t.cost_label, color: '#10b981' },
                    ].map(({ icon, value, label, color }, idx) => (
                      <div key={label} style={{
                        padding: '12px 8px',
                        borderRight: idx < 2 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                      }}>
                        <span style={{ color }}>{icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{value}</span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }}>
                  {t.step_by_step}
                </div>

                {activeTrip.legs?.map((leg: any, i: number) => {
                  const prevLeg = i > 0 ? activeTrip.legs[i - 1] : null;
                  const isDirectTransfer = prevLeg && !prevLeg.isWalking && !leg.isWalking;

                  if (leg.isWalking) {
                    return (
                      <div key={i} style={{
                        background: 'rgba(16,185,129,0.04)',
                        border: '0.5px solid rgba(16,185,129,0.15)',
                        borderLeft: '2px solid #10b981',
                        borderRadius: '0 10px 10px 0',
                        padding: '12px 14px',
                        marginBottom: '8px',
                        display: 'flex', gap: '12px', alignItems: 'center',
                      }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Locate size={15} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: 'rgba(16,185,129,0.6)', letterSpacing: '0.08em', marginBottom: '2px' }}>{t.walk_transfer}</div>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{leg.boardAt} → {leg.alightAt}</div>
                          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '3px', fontWeight: '600' }}>
                            {t.walking_notice.replace('{dist}', leg.walkingDist?.toString()).replace('{time}', leg.walkingTime?.toString())}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const r = BUS_ROUTES.find(x => x.id === leg.route?.id);
                  const color = r?.color || '#888';
                  const allShown = showAllStops[i];
                  const stops = leg.stops || [];
                  const stopsToShow = allShown
                    ? stops
                    : [stops[0], ...(stops.length > 3 ? [] : stops.slice(1, -1)), stops[stops.length - 1]].filter(Boolean);
                  const hiddenCount = Math.max(0, stops.length - 2);

                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                      {isDirectTransfer && (
                        <div style={{
                          padding: '10px 14px',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          borderRadius: '10px',
                          marginBottom: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <RefreshCcw size={16} /> {t.transfer_at} <span style={{ color: '#fff' }}>{leg.boardAt}</span>
                        </div>
                      )}
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '0.5px solid rgba(255,255,255,0.06)',
                        borderLeft: `2px solid ${color}`,
                        borderRadius: '0 10px 10px 0',
                        padding: '14px',
                        marginBottom: '8px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                          <div style={{ background: color, color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Bus size={10} /> {leg.route?.name}
                          </div>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{r?.name}</span>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Banknote size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '600' }}>{t.ticket_40}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {stopsToShow.map((stop: string, j: number) => {
                            const isFirst = j === 0;
                            const isLast = j === stopsToShow.length - 1;
                            const isTerminal = isFirst || isLast;
                            return (
                              <div key={j} style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14px', flexShrink: 0 }}>
                                  {!isFirst && <div style={{ width: '1.5px', height: '14px', background: `${color}30` }} />}
                                  <div style={{ width: isTerminal ? '11px' : '6px', height: isTerminal ? '11px' : '6px', borderRadius: '50%', background: isTerminal ? color : 'rgba(255,255,255,0.08)', border: isTerminal ? `2px solid ${color}` : 'none', flexShrink: 0 }} />
                                  {!isLast && <div style={{ width: '1.5px', height: '14px', background: `${color}30` }} />}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', minHeight: '30px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: isTerminal ? '600' : '400', color: isTerminal ? '#fff' : 'rgba(255,255,255,0.3)' }}>{stop}</span>
                                </div>
                              </div>
                            );
                          })}

                          {stops.length > 3 && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '14px', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '1.5px', flex: 1, background: `${color}30` }} />
                              </div>
                              <button
                                onClick={() => setShowAllStops(prev => ({ ...prev, [i]: !prev[i] }))}
                                style={{ padding: '5px 0', background: 'none', border: 'none', cursor: 'pointer', color: color, fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                <ChevronDown size={13} style={{ transform: allShown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                {allShown ? (language === 'al' ? 'Fshih stacionet' : 'Hide stations') : `+ ${hiddenCount - 1} ${t.stations.toLowerCase()} ${language === 'al' ? 'të tjera' : 'others'}`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              <button className="close-btn" onClick={() => setInfoPanel(null)}><X size={20} /></button>
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
                {t.view_details} <ChevronRight size={16} />
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
              height: sheetHeight === 'peek' ? '350px' : sheetHeight === 'half' ? '50vh' : 'calc(100vh - 90px)',
              maxHeight: 'calc(100vh - 90px)',
              borderRadius: sheetHeight === 'full' ? '0' : '28px 28px 0 0',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
          >
            {/* Filler background to prevent map showing below during swipe-up */}
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
            <div className="card-header" style={{ background: '#1e293b', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
              <div className="header-main">
                <span className="route-num" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>
                  <MapPin size={28} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' }} />
                </span>
                <div className="route-texts">
                  <h3 style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedStop.name}</h3>
                  <p>{language === 'al' ? 'Stacioni' : language === 'en' ? 'Station' : 'Stazione'} • ID {selectedStop.id}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => { setSelectedStop(null); setSheetHeight('peek'); }}><X size={20} /></button>
            </div>

            <div className="card-body" style={{ overflowY: 'auto', paddingBottom: 100 }}>
              {/* Peek Content: Lines */}
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontWeight: 800 }}>
                {language === 'al' ? 'Linjat që kalojnë këtu' : 'Passing routes'}
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
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>{language === 'al' ? 'Autobusi më i afërt' : 'Closest Bus'}</span>
                      <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>LIVE</span>
                    </div>
                    {closestBus ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ width: 44, height: 44, background: (closestBus as any).routeColor || '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Bus size={22} color="#fff" />
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{(closestBus as any).routeName || (closestBus as any).routeId}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                            {language === 'al' ? `Mbërrin për ~${Math.max(2, Math.round(Math.random() * 5 + 2))} minuta` : `Arrives in ~${Math.max(2, Math.round(Math.random() * 5 + 2))} mins`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '10px 0' }}>
                        {language === 'al' ? 'Nuk ka autobusë aktivë për këtë stacion.' : 'No active buses for this station.'}
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
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: randomRoute.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14 }}>
                              {randomRoute.name}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Drejt Qendrës</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>ID: TR-{1000 + i}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{i * 4 + 2} min</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{Math.round(400 * i)}m larg</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                className="view-details-btn"
                style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '24px', borderRadius: 16 }}
                onClick={() => {
                  useStore.getState().setTripFrom(selectedStop.name);
                  setIsSearching(true);
                  setInfoPanel(null);
                  setSelectedStop(null);
                  setTimeout(() => {
                    document.getElementById('trip-to-input')?.focus();
                  }, 100);
                }}
              >
                {language === 'al' ? 'Nisu nga këtu' : 'Depart from here'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </SwipeDismissView>
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

        @media (max-width: 900px) {
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
          background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.7);
          z-index: 1000; overflow: hidden;
        }

        /* ── STOP INFO PANEL ── */
        .stop-info-card {
          position: absolute; top: 120px; left: 20px; width: 320px;
          background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.7);
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
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes slide-up { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* ── LAZY LOADING: REVEAL ANIMATION (only new markers) ── */
        :global(.marker-enter) {
          animation: premiumReveal 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
        }
        @keyframes premiumReveal {
          0%   { opacity: 0; transform: translateY(20px) scale(0.5) rotateX(-40deg); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0)   scale(1)   rotateX(0deg);   filter: blur(0px); }
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
            /* Hapësirë shtesë që AppShell mos ta mbulojë përmbajtjen poshtë (butoni Nisu/Detajet) */
            padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 150px) !important;
            animation: sheet-slide-up 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
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
          .card-header { padding-top: 24px !important; }
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
      `}</style>
    </div>
  );
}