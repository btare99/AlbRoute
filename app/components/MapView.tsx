'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import { BUS_SHAPES } from '../store/busShapes';
import { X, Layers, ZoomIn, ZoomOut, Locate, Filter, Navigation, ArrowRight, MoreVertical, Eye, EyeOff, Map as MapIcon, Info, Search, Settings, ChevronRight, ChevronLeft, Moon, Sun, Globe, Bus, Route, MapPin } from 'lucide-react';

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

  const [mapReady, setMapReady] = useState(false);
  const [infoPanel, setInfoPanel] = useState<any>(null);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');

  const buses = useStore((s: any) => s.buses);
  const userLocation = useStore((s: any) => s.userLocation);
  const setSelectedBus = useStore((s: any) => s.setSelectedBus);
  const setView = useStore((s: any) => s.setView);
  const selectedStop = useStore((s: any) => s.selectedStop);
  const language = useStore((s: any) => s.language);
  const activeTrip = useStore((s: any) => s.activeTrip);
  const fetchUserLocation = useStore((s: any) => s.fetchUserLocation);
  const startTracking = useStore((s: any) => s.startTracking);
  const stopTracking = useStore((s: any) => s.stopTracking);

  const [walkingShapes, setWalkingShapes] = useState<Record<string, [number, number][]>>({});

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
    return () => stopTracking();
  }, []);

  const showStops = useStore((s: any) => s.showStops);
  const showRoutes = useStore((s: any) => s.showRoutes);
  const showBuses = useStore((s: any) => s.showBuses);
  const setShowStops = useStore((s: any) => s.setShowStops);
  const setShowRoutes = useStore((s: any) => s.setShowRoutes);
  const setShowBuses = useStore((s: any) => s.setShowBuses);
  const setSelectedStop = useStore((s: any) => s.setSelectedStop);
  const highlightMarkerRef = useRef<any>(null);

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;
    stopMarkersRef.current.forEach(m => map.removeLayer(m));
    stopMarkersRef.current = [];
    if (!showStops) return;

    BUS_STOPS.forEach(stop => {
      const stopHtml = `<div style="background:#1a73e8;width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;border:1.5px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:pointer;"><svg viewBox="0 0 24 24" width="11" height="11" fill="white"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg></div>`;
      const marker = L.marker([stop.lat, stop.lng], {
        icon: L.divIcon({ html: stopHtml, className: '', iconSize: [18, 18], iconAnchor: [9, 9] }),
        zIndexOffset: 100
      });

      const stoppingLines = BUS_ROUTES.filter(r => r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id)));
      const linesHtml = stoppingLines.map(l => `<span style="background:${l.color};color:white;padding:3px;font-size:10px;font-weight:800;text-align:center;width:100%;display:block;">${l.name}</span>`).join('');

      marker.bindTooltip(`
        <div style="padding:4px; border-radius:0; min-width:120px;">
          <div style="font-weight:800;margin-bottom:6px;font-size:13px;color:#000;border-bottom:1px solid #eee;padding-bottom:2px;">${stop.name}</div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:2px;width:100%;">${linesHtml}</div>
        </div>`, { direction: 'top', offset: [0, -8], className: 'square-tooltip' });

      marker.addTo(map);
      stopMarkersRef.current.push(marker);
    });
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

    const html = `
    <div style="position:relative;width:24px;height:24px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(59,130,246,0.15);
        animation:pulse-ring 2.5s ease-out infinite
      "></div>
      <div style="
        position:absolute;inset:5px;border-radius:50%;
        background:#3b82f6;
        border:2.5px solid #fff;
        box-shadow:0 0 0 1px rgba(59,130,246,0.4)
      "></div>
    </div>
  `;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({ html, className: '', iconSize: [24, 24], iconAnchor: [12, 12] }),
        zIndexOffset: 999,
      }).addTo(map);
    }
  }, [userLocation, mapReady]);


  // ── BUS MARKERS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    buses.forEach((bus: any) => {
      if (!showBuses) {
        if (busMarkersRef.current[bus.id]) {
          map.removeLayer(busMarkersRef.current[bus.id]);
          delete busMarkersRef.current[bus.id];
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
      const label = (bus.routeName || bus.routeId.replace('L', '')).toString();

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
      const loadLabel = load > 40 ? 'Plot' : load > 25 ? 'Mesatar' : 'Lirë';
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
            <span style="font-size:13px;font-weight:700;color:#0f172a">Linja ${bus.routeName}</span>
          </div>
          <span style="
            font-size:9px;font-weight:700;letter-spacing:0.08em;
            background:#ecfdf5;color:#059669;
            padding:3px 7px;border-radius:20px;
          ">● LIVE</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">Stacioni radhës</span>
            <span style="font-size:11px;font-weight:600;color:#0f172a">${bus.nextStop || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">Shpejtësia</span>
            <span style="font-size:11px;font-weight:600;color:#0f172a">${Math.round(bus.speed)} km/h</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#64748b">Ngarkesa</span>
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
      } else {
        const marker = L.marker([bus.lat, bus.lng], {
          icon: L.divIcon({ html: markerHtml, className: '', iconSize: [44, 36], iconAnchor: [22, 36] }),
          zIndexOffset: 500,
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
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
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
      <div style="
        width:16px;height:16px;border-radius:50%;
        background:#6366f1;
        border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(99,102,241,0.5),0 4px 12px rgba(99,102,241,0.4);
        position:relative;z-index:2;
      "></div>
    </div>
  `;

    highlightMarkerRef.current = L.marker([selectedStop.lat, selectedStop.lng], {
      icon: L.divIcon({ html: pulseHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] }),
      zIndexOffset: 1000,
    }).addTo(map);

    const timer = setTimeout(() => setSelectedStop(null), 5000);
    return () => clearTimeout(timer);
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
      <div className="overlay-top-left">
        <div className="glass-panel main-brand-panel">
          <div className="brand-dot animate-pulse" />
          <div className="brand-info">
            <h1>Urbani Im</h1>
            <p>Tiranë Live Map</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT OVERLAY: ALL CONTROLS IN ONE COLUMN ── */}
      <div className="overlay-right-center">
        <div className="controls-column">
          {/* Layer Selector - Vertical */}
          <div className="glass-panel vertical-group">
            <button className={mapStyle === 'dark' ? 'active' : ''} onClick={() => setMapStyle('dark')} title="Dark Mode"><Moon size={20} /></button>
            <button className={mapStyle === 'light' ? 'active' : ''} onClick={() => setMapStyle('light')} title="Light Mode"><Sun size={20} /></button>
            <button className={mapStyle === 'satellite' ? 'active' : ''} onClick={() => setMapStyle('satellite')} title="Satellite"><Globe size={20} /></button>
          </div>

          <div className="v-spacer" />

          {/* Zoom Controls */}
          <div className="glass-panel vertical-group">
            <button onClick={() => mapInstanceRef.current?.zoomIn()}><ZoomIn size={20} /></button>
            <button onClick={() => mapInstanceRef.current?.zoomOut()}><ZoomOut size={20} /></button>
          </div>

          <div className="v-spacer" />

          {/* Locate Button */}
          <button
            className="glass-panel action-btn locate-btn"
            onClick={() => { fetchUserLocation(); mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], 16); }}
          >
            <Locate size={22} />
          </button>

          <div className="v-spacer" />

          {/* Visibility Toggles */}
          <div className="glass-panel vertical-group toggles">
            <button className={showStops ? 'active' : ''} onClick={() => setShowStops(!showStops)} title="Stops"><MapPin size={20} /></button>
            <button className={showBuses ? 'active' : ''} onClick={() => setShowBuses(!showBuses)} title="Buses"><Bus size={20} /></button>
            <button className={showRoutes ? 'active' : ''} onClick={() => setShowRoutes(!showRoutes)} title="Routes"><Route size={20} /></button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM OVERLAY: ROUTE SELECTOR WITH ARROWS ── */}
      <div className="overlay-bottom-center">
        {activeTrip ? (
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Navigation size={20} style={{ color: 'var(--primary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Udhëtimi Aktiv
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
              <X size={16} /> Mbyll
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
                  Të gjitha
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
        <div className="bus-info-card animate-slide-up">
          <div className="card-header" style={{ background: infoPanel.routeColor }}>
            <div className="header-main">
              <span className="route-num">{infoPanel.routeName}</span>
              <div className="route-texts">
                <h3>{infoPanel.routeLabel}</h3>
                <p>Në lëvizje • Live</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setInfoPanel(null)}><X size={20} /></button>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <label>Stacioni Radhës</label>
                <b>{infoPanel.nextStop || 'Duke llogaritur...'}</b>
              </div>
              <div className="data-item">
                <label>Pasagjerë</label>
                <div className="load-bar">
                  <div className="load-fill" style={{ width: `${(infoPanel.passengerLoad / 50) * 100}%`, background: infoPanel.passengerLoad > 40 ? 'var(--danger)' : 'var(--success)' }} />
                </div>
                <b>{infoPanel.passengerLoad} / 50</b>
              </div>
              <div className="data-item">
                <label>Shpejtësia</label>
                <b>{Math.round(infoPanel.speed)} km/h</b>
              </div>
            </div>
            <button className="view-details-btn" onClick={() => setView('tracker')}>
              Shiko Detajet <ChevronRight size={16} />
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
          background: var(--route-color, #3b82f6); color: #fff;
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .route-item.all.active { background: #3b82f6; }

        /* ── BUS INFO PANEL ── */
        .bus-info-card {
          position: absolute; bottom: 120px; right: 20px; width: 320px;
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
          box-shadow: 0 0 20px #3b82f6;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 900px) {
          .overlay-top-left { top: 15px; left: 15px; }
          .overlay-right-center { right: 15px; bottom: 180px; top: auto; transform: none; }
          .overlay-bottom-center { bottom: 20px; width: 98%; }
          .nav-arrow { display: none; }
          .bus-info-card { bottom: 110px; right: 15px; left: 15px; width: auto; }
        }
      `}</style>
    </div>
  );
}