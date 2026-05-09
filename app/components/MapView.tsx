'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import { BUS_SHAPES } from '../store/busShapes';
import { X, Layers, ZoomIn, ZoomOut, Locate, Filter, Navigation, ArrowRight, MoreVertical, Eye, EyeOff, Map as MapIcon, Info, Search, Settings, ChevronRight, ChevronLeft, Moon, Sun, Globe, Bus, Route, MapPin } from 'lucide-react';
import { translations } from '../store/translations';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];
const DEFAULT_ZOOM = 14;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkersRef = useRef<Record<string, any>>({});
  const stopMarkersRef = useRef<any[]>([]);
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

  const buses = useStore((s: any) => s.buses);
  const userLocation = useStore((s: any) => s.userLocation);
  const setSelectedBus = useStore((s: any) => s.setSelectedBus);
  const setView = useStore((s: any) => s.setView);
  const selectedStop = useStore((s: any) => s.selectedStop);
  // language already defined above
  const activeTrip = useStore((s: any) => s.activeTrip);
  const fetchUserLocation = useStore((s: any) => s.fetchUserLocation);
  const startTracking = useStore((s: any) => s.startTracking);
  const stopTracking = useStore((s: any) => s.stopTracking);
  const addNotification = useStore((s: any) => s.addNotification);

  const [walkingShapes, setWalkingShapes] = useState<Record<string, [number, number][]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    if (isSearching) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearching]);

  const tripFrom = useStore((s: any) => s.tripFrom);
  const setTripFrom = useStore((s: any) => s.setTripFrom);
  const tripTo = useStore((s: any) => s.tripTo);
  const setTripTo = useStore((s: any) => s.setTripTo);
  const planTrip = useStore((s: any) => s.planTrip);

  useEffect(() => {
    if (!activeTrip) {
      setWalkingShapes({});
      return;
    }

    const fetchShapes = async () => {
      const newShapes: Record<string, [number, number][]> = {};

      // 1. OSRM për ecjen nga pika e nisjes (nëse ka)
      const origin = useStore.getState().tripOriginCoords;
      if (activeTrip.walkingDist > 0 && origin) {
        const firstStop = BUS_STOPS.find(s => s.name === activeTrip.actualFrom);
        if (firstStop) {
          try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${firstStop.lng},${firstStop.lat}?overview=full&geometries=geojson`);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              newShapes['origin'] = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            }
          } catch (err) { console.error('OSRM origin fetch error:', err); }
        }
      }

      // 2. OSRM për ndërrimet me ecje midis linjave
      if (activeTrip.legs) {
        for (let i = 0; i < activeTrip.legs.length; i++) {
          const leg = activeTrip.legs[i];
          if (leg.isWalking) {
            const bStop = leg.boardNodeId ? BUS_STOPS.find(s => s.id === leg.boardNodeId) : BUS_STOPS.find(s => s.name === leg.boardAt);
            const aStop = leg.alightNodeId ? BUS_STOPS.find(s => s.id === leg.alightNodeId) : BUS_STOPS.find(s => s.name === leg.alightAt);
            if (bStop && aStop) {
              try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${bStop.lng},${bStop.lat};${aStop.lng},${aStop.lat}?overview=full&geometries=geojson`);
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                  newShapes[`walk_${i}`] = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                }
              } catch (err) { console.error(`OSRM walk_${i} fetch error:`, err); }
            }
          }
        }
      }

      setWalkingShapes(newShapes);
    };

    fetchShapes();
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = e.touches[0].clientY - touchStartY;
    if (diff > 0) {
      if (e.cancelable) e.preventDefault();
      setTouchCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchCurrentY !== null && touchCurrentY > 80) {
      setSelectedStop(null);
      setInfoPanel(null);
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

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

        const tileLayer = L.tileLayer(TILES.dark, { maxZoom: 19 });
        tileLayer.addTo(map);
        (map as any)._tileLayer = tileLayer;
        mapInstanceRef.current = map;
        setMapReady(true);
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

    // Pastrojmë markerat ekzistues dhe grupin e klasterave
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }
    stopMarkersRef.current.forEach(m => map.removeLayer(m));
    stopMarkersRef.current = [];

    if (!showStops) return;

    // Krijojmë grupin e ri të klasterave
    // @ts-ignore
    const clusters = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 40, // Sa më i vogël, aq më pak grupohen
    });

    BUS_STOPS.forEach(stop => {
      const stopHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
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

      const stoppingLines = BUS_ROUTES.filter(r => r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id)));
      const linesHtml = stoppingLines.map(l => `<span style="background:${l.color};color:white;padding:3px;font-size:10px;font-weight:800;text-align:center;width:100%;display:block;">${l.name}</span>`).join('');

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
      if (!isMobile) {
        marker.bindTooltip(`
          <div style="padding:4px; border-radius:0; min-width:120px;">
            <div style="font-weight:800;margin-bottom:6px;font-size:13px;color:#000;border-bottom:1px solid #eee;padding-bottom:2px;">${stop.name}</div>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:2px;width:100%;">${linesHtml}</div>
          </div>`, { direction: 'top', offset: [0, -8], className: 'square-tooltip' });
      }

      marker.on('click', () => {
        setSelectedStop(stop);
      });

      clusters.addLayer(marker);
      stopMarkersRef.current.push(marker);
    });

    clusters.addTo(map);
    clusterGroupRef.current = clusters;
  }, [showStops, mapReady]);

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
        const firstStop = BUS_STOPS.find(s => s.name === activeTrip.actualFrom);
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
          const bStop = leg.boardNodeId ? BUS_STOPS.find(s => s.id === leg.boardNodeId) : BUS_STOPS.find(s => s.name === leg.boardAt);
          const aStop = leg.alightNodeId ? BUS_STOPS.find(s => s.id === leg.alightNodeId) : BUS_STOPS.find(s => s.name === leg.alightAt);
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

        const boardStop = boardStopId ? BUS_STOPS.find(s => s.id === boardStopId) : BUS_STOPS.find(s => s.name === leg.boardAt);
        const alightStop = alightStopId ? BUS_STOPS.find(s => s.id === alightStopId) : BUS_STOPS.find(s => s.name === leg.alightAt);

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
              const st = BUS_STOPS.find(s => s.id === id);
              return st ? [st.lat, st.lng] : null;
            }).filter(Boolean) as [number, number][];
          } else {
            legCoords = leg.stops.map((name: string) => {
              const st = BUS_STOPS.find(s => s.name === name);
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
      BUS_ROUTES.forEach((route) => {
        const dirs = ['0', '1'];
        dirs.forEach(dir => {
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
  }, [activeTrip, activeRouteFilter, showRoutes, mapReady, walkingShapes]);

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

      // Marker pill
      const markerHtml = `
      <div style="
        display:inline-flex;flex-direction:column;align-items:center;
        opacity:${opacity};transition:opacity 0.3s;
      ">
        <div style="
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
      }
    });
  }, [buses, mapReady, activeRouteFilter, showBuses, activeTrip]);


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
          position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1001,
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Main Bar */}
        <div className="glass-panel" style={{
          display: 'flex', alignItems: 'center', padding: '6px',
          borderRadius: isSearching ? '22px 22px 0 0' : '22px', 
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: isSearching ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(40px)',
          boxShadow: isSearching ? '0 4px 20px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.6)', 
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
              value={tripFrom}
              onChange={(e) => setTripFrom(e.target.value)}
              placeholder={t.select_departure}
              onClick={(e) => { e.stopPropagation(); setIsSearching(true); }}
              style={{ 
                background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', 
                fontWeight: '700', width: '100%', outline: 'none', boxShadow: 'none' 
              }}
              readOnly={!isSearching}
            />
          </button>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', margin: '0 4px', opacity: 1, transition: 'opacity 0.3s' }} />

          <button
            onClick={() => {
              requestCompassPermission();
              fetchUserLocation();
              mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], 17);
              if (isSearching) {
                setTripFrom(t.my_location || (language === 'al' ? '📍 Vendndodhja Ime' : '📍 My Location'));
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
        </div>

        {/* Second Bar (Joined with Transition) */}
        <div className="glass-panel" style={{
          display: 'flex', alignItems: 'center', padding: '6px',
          borderRadius: '0 0 22px 22px', 
          border: '1px solid rgba(255,255,255,0.12)',
          borderTop: 'none',
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(40px)',
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
              value={tripTo}
              onChange={(e) => setTripTo(e.target.value)}
              placeholder={t.select_destination}
              autoFocus={isSearching}
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
              await planTrip(tripFrom, tripTo);
              setIsSearching(false);
            }}
            style={{
              width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', color: '#fff', border: 'none', borderRadius: '0 0 18px 0',
              cursor: 'pointer'
            }}
          >
            <ArrowRight size={22} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes searchSlideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
            <button
              onClick={() => {
                useStore.getState().setActiveTrip(null);
                setWalkingShapes({});
              }}
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
            >
              <X size={16} /> {t.close}
            </button>
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
                {BUS_ROUTES.map(route => (
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

      {/* ── BUS INFO PANEL ── */}
      {infoPanel && (
        <div
          className="bus-info-card animate-slide-up"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: touchCurrentY ? `translateY(${touchCurrentY}px)` : 'none', transition: touchStartY !== null ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
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
      )}

      {/* ── STOP INFO PANEL ── */}
      {selectedStop && (
        <div
          className="stop-info-card animate-slide-up"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: touchCurrentY ? `translateY(${touchCurrentY}px)` : 'none', transition: touchStartY !== null ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="mobile-drag-handle">
            <div className="drag-indicator" />
          </div>
          <div className="card-header" style={{ background: '#1e293b' }}>
            <div className="header-main">
              <span className="route-num" style={{ width: '40px', height: '40px', fontSize: '18px' }}><MapPin size={20} /></span>
              <div className="route-texts">
                <h3 style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedStop.name}</h3>
                <p>{language === 'al' ? 'Stacioni' : language === 'en' ? 'Station' : 'Stazione'} • {selectedStop.id}</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setSelectedStop(null)}><X size={20} /></button>
          </div>
          <div className="card-body">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontWeight: 800 }}>
              {language === 'al' ? 'Linjat që kalojnë këtu' : language === 'en' ? 'Passing routes' : 'Linee di passaggio'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BUS_ROUTES.filter(r => r.stops.includes(selectedStop.id) || (r.returnStops && r.returnStops.includes(selectedStop.id))).length > 0 ? (
                BUS_ROUTES.filter(r => r.stops.includes(selectedStop.id) || (r.returnStops && r.returnStops.includes(selectedStop.id))).map(line => (
                  <div key={line.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: line.color, boxShadow: `0 0 8px ${line.color}` }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{line.name}</span>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#64748b' }}>{t.no_data}</span>
              )}
            </div>

            <button
              className="view-details-btn"
              style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '20px' }}
              onClick={() => {
                useStore.getState().setTripFrom(selectedStop.name);
                setView('planner');
              }}
            >
              {language === 'al' ? 'Nisu nga ky stacion' : language === 'en' ? 'Depart from here' : 'Parti da qui'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
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
          width: 44px; height: 44px; background: rgba(255,255,255,0.2); 
          border-radius: 12px; display: flex; align-items: center; justify-content: center; 
          font-weight: 900; font-size: 18px; border: 1px solid rgba(255,255,255,0.3);
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
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

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
            /* Shtojmë 80px hapësirë që AppShell mos ta mbulojë përmbajtjen poshtë */
            padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 80px) !important;
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