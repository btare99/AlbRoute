'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import useStore, { BUS_STOPS } from '../store/useStore';
import { BUS_ROUTES } from '@/next.config';
import { BUS_SHAPES } from '../store/busShapes';
import { X, Layers, ZoomIn, ZoomOut, Locate, Filter, Navigation, ArrowRight } from 'lucide-react';

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
  const userMarkerRef = useRef<any>(null); // U rikthye

  const [mapReady, setMapReady] = useState(false);
  const [infoPanel, setInfoPanel] = useState<any>(null);
  const [activeRouteFilter, setActiveRouteFilter] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  const buses = useStore((s: any) => s.buses);
  const userLocation = useStore((s: any) => s.userLocation);
  const setSelectedBus = useStore((s: any) => s.setSelectedBus);
  const setView = useStore((s: any) => s.setView);
  const selectedStop = useStore((s: any) => s.selectedStop);
  const language = useStore((s: any) => s.language);
  const activeTrip = useStore((s: any) => s.activeTrip);
  const setActiveTrip = useStore((s: any) => s.setActiveTrip);
  const fetchUserLocation = useStore((s: any) => s.fetchUserLocation);

  // Map Settings from Global Store
  const showStops = useStore((s: any) => s.showStops);
  const showRoutes = useStore((s: any) => s.showRoutes);
  const showBuses = useStore((s: any) => s.showBuses);
  const setShowStops = useStore((s: any) => s.setShowStops);
  const setShowRoutes = useStore((s: any) => s.setShowRoutes);
  const setShowBuses = useStore((s: any) => s.setShowBuses);

  const setSelectedStop = useStore((s: any) => s.setSelectedStop);
  const highlightMarkerRef = useRef<any>(null);

  // ── LOGJIKA E FILTRIMIT ───────────────────────────────────────────────────
  // Nëse kemi një trip aktiv, tregojmë vetëm linjat e përfshira në atë trip
  const filteredRoutes = activeTrip
    ? BUS_ROUTES.filter(r => activeTrip.legs.some((leg: any) => leg.route?.id === r.id))
    : BUS_ROUTES;

  // ── Fly to selected stop and highlight ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (selectedStop && map && L) {
      // Fly to stop
      map.flyTo([selectedStop.lat, selectedStop.lng], 17, {
        duration: 1.5,
        easeLinearity: 0.25
      });

      // Remove previous highlight
      if (highlightMarkerRef.current) {
        map.removeLayer(highlightMarkerRef.current);
      }

      // Create highlight marker
      const pulseHtml = `
        <div style="position:relative;width:40px;height:40px">
          <div style="position:absolute;inset:0;background:var(--primary);border-radius:50%;opacity:0.4;animation:pulse-ring 1.5s ease infinite"></div>
          <div style="position:absolute;inset:10px;background:var(--primary);border:3px solid #fff;border-radius:50%;box-shadow:0 0 15px var(--primary)"></div>
        </div>`;

      const highlightMarker = L.marker([selectedStop.lat, selectedStop.lng], {
        icon: L.divIcon({ html: pulseHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 20] }),
        zIndexOffset: 1000,
      }).addTo(map);

      highlightMarker.bindPopup(`
        <div style="text-align:center;padding:5px">
          <b style="font-size:14px;display:block;margin-bottom:4px">${selectedStop.name}</b>
          <span style="font-size:11px;color:var(--text-muted)">Stacion i përzgjedhur</span>
        </div>
      `, { closeButton: false, offset: [0, -10] }).openPopup();

      highlightMarkerRef.current = highlightMarker;

      // Auto-clear after some time
      const timer = setTimeout(() => {
        if (highlightMarkerRef.current) {
          map.removeLayer(highlightMarkerRef.current);
          highlightMarkerRef.current = null;
        }
        setSelectedStop(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedStop, setSelectedStop]);

  // ── Tile URLs ────────────────────────────────────────────────────────────────
  const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // ── Map init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (mapInstanceRef.current || !mapContainerRef.current) return;
      if ((mapContainerRef.current as any)._leaflet_id) return;

      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        LRef.current = L;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true, // Performancë më e mirë me shumë elementë
        }).setView(TIRANA_CENTER, DEFAULT_ZOOM);

        // Tile layer
        const tileLayer = L.tileLayer(TILES.dark, { maxZoom: 19 });
        tileLayer.addTo(map);
        (map as any)._tileLayer = tileLayer;

        L.control.attribution({ prefix: '© OpenStreetMap | Harta Urbane Tiranë' }).addTo(map);

        // ── Shto stacionet ──────────────────────────────────────────────────────
        BUS_STOPS.forEach(stop => {
          const stopHtml = `
            <div style="
              background: #1a73e8; 
              width: 18px; 
              height: 18px; 
              border-radius: 4px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              border: 1.5px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="white">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
          `;

          const marker = L.marker([stop.lat, stop.lng], {
            icon: L.divIcon({
              html: stopHtml,
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
            zIndexOffset: 100,
          });
          const stoppingLines = BUS_ROUTES.filter(r =>
            r.stops.includes(stop.id) || (r.returnStops && r.returnStops.includes(stop.id))
          );

          const linesHtml = stoppingLines.length > 0
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                ${stoppingLines.map(rl =>
              `<span style="background:${rl.color};color:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:800;box-shadow:0 1px 3px rgba(0,0,0,0.2)">${rl.name}</span>`
            ).join('')}
               </div>`
            : '';

          marker.bindTooltip(`
            <div style="padding:4px">
              <div style="font-weight:700;font-size:14px;color:#1e293b">${stop.name}</div>
              ${linesHtml}
            </div>`, {
            permanent: false,
            direction: 'top',
            offset: [0, -8],
            className: 'station-tooltip'
          });
          marker.addTo(map);
          stopMarkersRef.current.push(marker);
        });

        // ── Helper: Gjen pikën më të afërt në shape ──
        const findClosestIndex = (coords: [number, number][], point: [number, number]) => {
          let minIdx = 0;
          let minDist = Infinity;
          coords.forEach((coord, i) => {
            const d = Math.sqrt(Math.pow(coord[0] - point[0], 2) + Math.pow(coord[1] - point[1], 2));
            if (d < minDist) {
              minDist = d;
              minIdx = i;
            }
          });
          return minIdx;
        };

        // ── Shto linjat ─────────────────────────────────────────────────────────
        if (activeTrip) {
          activeTrip.legs.forEach((leg: any) => {
            const route = BUS_ROUTES.find(r => r.id === leg.route.id);
            if (!route) return;
            const startStop = BUS_STOPS.find(s => s.name === leg.boardAt);
            const endStop = BUS_STOPS.find(s => s.name === leg.alightAt);
            if (!startStop || !endStop) return;

            const dirs = ['0', '1'];
            let bestCoords: [number, number][] | null = null;
            let shortestDist = Infinity;

            dirs.forEach(dir => {
              const fullCoords = (BUS_SHAPES[`${route.id}_${dir}` as keyof typeof BUS_SHAPES] || []) as [number, number][];
              if (fullCoords.length === 0) return;
              const idx1 = findClosestIndex(fullCoords, [startStop.lat, startStop.lng]);
              const idx2 = findClosestIndex(fullCoords, [endStop.lat, endStop.lng]);
              let segment = idx1 <= idx2 ? fullCoords.slice(idx1, idx2 + 1) : fullCoords.slice(idx2, idx1 + 1).reverse();
              if (segment.length >= 2) {
                const d1 = Math.sqrt(Math.pow(segment[0][0] - startStop.lat, 2) + Math.pow(segment[0][1] - startStop.lng, 2));
                const d2 = Math.sqrt(Math.pow(segment[segment.length - 1][0] - endStop.lat, 2) + Math.pow(segment[segment.length - 1][1] - endStop.lng, 2));
                if (d1 + d2 < shortestDist) { shortestDist = d1 + d2; bestCoords = segment; }
              }
            });

            if (bestCoords) {
              const coords = bestCoords as [number, number][];
              const shadow = L.polyline(coords, { color: '#000', weight: 6, opacity: 0.15, interactive: false }).addTo(map);
              const line = L.polyline(coords, { color: route.color, weight: 4.5, opacity: 0.95, lineCap: 'round' }).addTo(map);
              for (let i = 0; i < coords.length - 1; i += 8) {
                const p1 = coords[i]; const p2 = coords[i + 1];
                const dLat = p2[0] - p1[0]; const dLng = p2[1] - p1[1];
                const angle = Math.atan2(dLat, dLng) * (180 / Math.PI);
                const arrow = L.divIcon({
                  className: 'route-arrow',
                  html: `<div style="transform: rotate(${-angle}deg); color: ${route.color}; font-size: 20px; font-weight:900; text-shadow: 0 0 3px #fff;">➤</div>`,
                  iconSize: [20, 20], iconAnchor: [10, 10]
                });
                L.marker(p1, { icon: arrow, interactive: false, zIndexOffset: 400 }).addTo(map);
              }
              line.bindTooltip(`<b>${language === 'al' ? 'Linja' : language === 'it' ? 'Linea' : 'Line'} ${route.name}</b><br/>${leg.boardAt} ➔ ${leg.alightAt}`, { sticky: true });
              routeLinesRef.current.push({ line, shadow, routeId: route.id });
            }
          });
        } else {
          filteredRoutes.forEach((route) => {
            const dirs = ['0', '1'];
            dirs.forEach(dir => {
              const shapeKey = `${route.id}_${dir}`;
              let coords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
              if (coords.length === 0 && dir === '0') coords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];
              if (coords.length < 2) return;
              const shadow = L.polyline(coords, { color: '#000', weight: 6, opacity: 0.15, interactive: false }).addTo(map);
              const line = L.polyline(coords, { color: route.color, weight: 3.5, opacity: 0.85, lineCap: 'round' }).addTo(map);
              for (let i = 2; i < coords.length - 2; i += 10) {
                const p1 = coords[i]; const p2 = coords[i + 1];
                const dLat = p2[0] - p1[0]; const dLng = p2[1] - p1[1];
                const angle = Math.atan2(dLat, dLng) * (180 / Math.PI);
                const arrow = L.divIcon({
                  className: 'route-arrow',
                  html: `<div style="transform: rotate(${-angle}deg); color: ${route.color}; font-size: 18px; line-height:1; font-weight:900; text-shadow: 0 0 3px #fff;">➤</div>`,
                  iconSize: [18, 18], iconAnchor: [9, 9]
                });
                L.marker(p1, { icon: arrow, interactive: false, zIndexOffset: 400 }).addTo(map);
              }
              line.bindTooltip(`<b>${language === 'al' ? 'Linja' : language === 'it' ? 'Linea' : 'Line'} ${route.name}</b>`, { sticky: true });
              routeLinesRef.current.push({ line, shadow, routeId: route.id });
            });
          });
        }

        // ── Përditësimi i markerit të përdoruesit (Lëvizur në effect më poshtë) ──

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (e) {
        console.error('Gabim gjatë inicializimit të hartës:', e);
      }
    };

    init();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        busMarkersRef.current = {};
        stopMarkersRef.current = [];
        routeLinesRef.current = [];
      }
    };
  }, [activeTrip, language]);

  // ── Visibility Logic ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Toggle Stops
    stopMarkersRef.current.forEach(m => {
      if (showStops) m.addTo(map);
      else map.removeLayer(m);
    });

    // Toggle Routes
    routeLinesRef.current.forEach(r => {
      if (showRoutes) {
        r.line.addTo(map);
        if (r.shadow) r.shadow.addTo(map);
      } else {
        map.removeLayer(r.line);
        if (r.shadow) map.removeLayer(r.shadow);
      }
    });

    // Toggle Buses (handled in live updates effect too, but good for instant toggle)
    Object.values(busMarkersRef.current).forEach((m: any) => {
      if (showBuses) m.addTo(map);
      else map.removeLayer(m);
    });
  }, [showStops, showRoutes, showBuses, mapReady]);

  // ── Ndrysho stilin e hartës ──────────────────────────────────────────────────
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

  // ── Trego/fshih stacionet ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;
    stopMarkersRef.current.forEach(m => {
      if (showStops) m.addTo(map);
      else map.removeLayer(m);
    });
  }, [showStops, mapReady]);

  // ── Trego/fshih linjat & filtër ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;
    routeLinesRef.current.forEach(({ line, shadow, routeId }) => {
      const visible = showRoutes && (!activeRouteFilter || routeId === activeRouteFilter);
      if (visible) {
        line.addTo(map);
        shadow.addTo(map);
        line.setStyle({ opacity: 0.85, weight: 4 });
      } else if (!showRoutes) {
        map.removeLayer(line);
        map.removeLayer(shadow);
      } else {
        line.setStyle({ opacity: 0.15, weight: 2 });
        shadow.setStyle({ opacity: 0.05 });
        line.addTo(map);
        shadow.addTo(map);
      }
    });
  }, [showRoutes, activeRouteFilter, mapReady]);

  // ── Përditëso vendndodhjen e përdoruesit ─────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    const pulseHtml = `
      <div style="position:relative;width:20px;height:20px">
        <div style="position:absolute;inset:0;background:#10b981;border-radius:50%;opacity:0.3;animation:pulse-ring 2s ease infinite"></div>
        <div style="position:absolute;inset:3px;background:#10b981;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(16,185,129,0.8)"></div>
      </div>`;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({ html: pulseHtml, className: '', iconSize: [20, 20], iconAnchor: [10, 10] }),
        zIndexOffset: 999,
      })
        .bindTooltip('<b>Vendndodhja juaj</b>', { permanent: false, direction: 'top' })
        .addTo(map);
    }
  }, [userLocation, mapReady]);

  // ── Përditëso autobuzët ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !mapReady) return;

    buses.forEach((bus: any) => {
      // Filtro sipas linjës aktive
      const isActive = !activeRouteFilter || bus.routeId === activeRouteFilter;
      const opacity = isActive ? 1 : 0.2;

      const load = bus.passengerLoad;
      const loadColor = load > 40 ? '#ef4444' : load > 25 ? '#f59e0b' : '#10b981';
      const loadBar = Math.round((load / 50) * 10);

      const html = `
        <div style="
          position:relative;
          background:${bus.routeColor};
          color:#fff;
          padding:3px 7px;
          border-radius:6px;
          font-size:11px;
          font-weight:800;
          box-shadow:0 2px 8px rgba(0,0,0,0.6);
          cursor:pointer;
          opacity:${opacity};
          letter-spacing:0.5px;
          white-space:nowrap;
          border: 1.5px solid rgba(255,255,255,0.4);
        ">
          ${bus.routeName || bus.routeId.replace('L', '')}
          <div style="position:absolute;bottom:-3px;left:2px;right:2px;height:3px;background:rgba(0,0,0,0.3);border-radius:2px">
            <div style="height:100%;width:${loadBar * 10}%;background:${loadColor};border-radius:2px"></div>
          </div>
        </div>`;

      if (busMarkersRef.current[bus.id]) {
        busMarkersRef.current[bus.id].setLatLng([bus.lat, bus.lng]);
        busMarkersRef.current[bus.id].setIcon(L.divIcon({
          html,
          className: '',
          iconSize: [36, 22],
          iconAnchor: [18, 11],
        }));
      } else {
        const marker = L.marker([bus.lat, bus.lng], {
          icon: L.divIcon({ html, className: '', iconSize: [36, 22], iconAnchor: [18, 11] }),
          zIndexOffset: 500,
        });
        marker.bindTooltip(`
          <div style="min-width:160px">
            <b style="font-size:13px">Linja ${bus.routeName}</b><br>
            <span style="font-size:11px;opacity:0.8">${bus.routeLabel}</span><br>
            <span style="font-size:11px">▶ ${bus.nextStop}</span><br>
            <span style="font-size:11px">👥 ${bus.passengerLoad}/50 · ${Math.round(bus.speed)} km/h</span>
            ${bus.delay > 0 ? `<br><span style="color:#f59e0b;font-size:11px">⚠ ${bus.delay} min vonesë</span>` : ''}
          </div>`, {
          direction: 'top',
          offset: [0, -12],
        });
        marker.on('click', () => {
          setInfoPanel(bus);
          setSelectedBus(bus);
        });
        marker.addTo(map);
        busMarkersRef.current[bus.id] = marker;
      }
    });
  }, [buses, mapReady, activeRouteFilter, setSelectedBus]);

  // ── Kontrolle hartë ──────────────────────────────────────────────────────────
  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const centerMap = () => {
    fetchUserLocation();
    mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
  };

  const activeRoute = BUS_ROUTES.find(r => r.id === activeRouteFilter);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* ── Harta ── */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* ── CSS Animacione ── */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* ── Header bar ── */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div className="card" style={{
          flex: 1, padding: '10px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(12px)',
          background: 'rgba(15,23,42,0.85)',
        }}>
          <div style={{
            width: 8, height: 8, background: 'var(--success)',
            borderRadius: '50%', animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            Harta e Linjave Urbane – Tiranë
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            {BUS_ROUTES.length} linja · {BUS_STOPS.length} stacione
          </span>
        </div>
      </div>

      {/* ── Kontrollat djathtas (Zoom & Mjetet) ── */}
      <div className="djathtas-controls" style={{
        position: 'absolute', right: 20, top: 80, zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Zoom In */}
        <button onClick={zoomIn} className="card" style={{
          width: 42, height: 42, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid var(--border)',
          background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          transition: 'all 0.2s',
          fontSize: '20px', fontWeight: 'bold', color: '#fff'
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          +
        </button>

        {/* Zoom Out */}
        <button onClick={zoomOut} className="card" style={{
          width: 42, height: 42, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid var(--border)',
          background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          transition: 'all 0.2s',
          fontSize: '20px', fontWeight: 'bold', color: '#fff'
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          −
        </button>

        {/* Center Map */}
        <button onClick={centerMap} className="card" style={{
          width: 42, height: 42, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid var(--border)',
          background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          transition: 'all 0.2s',
          color: 'var(--text-muted)'
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Locate size={18} />
        </button>

        {/* Stil hartes */}
        <div className="card" style={{
          padding: '4px', display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 12,
        }}>
          {(['dark', 'light', 'satellite'] as const).map(s => (
            <button key={s} onClick={() => setMapStyle(s)} style={{
              width: 34, height: 34, borderRadius: 8, fontSize: 14,
              cursor: 'pointer', border: 'none',
              background: mapStyle === s ? 'var(--primary)' : 'transparent',
              color: mapStyle === s ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              {s === 'dark' ? '🌙' : s === 'light' ? '☀️' : '🛰'}
            </button>
          ))}
        </div>

        {/* Visibility Toggles */}
        <div className="card" style={{
          padding: '4px', display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 12,
        }}>
          <button onClick={() => setShowStops(!showStops)} style={{
            width: 34, height: 34, borderRadius: 8, fontSize: 16,
            cursor: 'pointer', border: 'none',
            background: showStops ? 'rgba(59,130,246,0.2)' : 'transparent',
            color: showStops ? '#3b82f6' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }} title="Show Stops">
            🚏
          </button>
          <button onClick={() => setShowRoutes(!showRoutes)} style={{
            width: 34, height: 34, borderRadius: 8, fontSize: 16,
            cursor: 'pointer', border: 'none',
            background: showRoutes ? 'rgba(239,68,68,0.2)' : 'transparent',
            color: showRoutes ? '#ef4444' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }} title="Show Routes">
            🛤️
          </button>
          <button onClick={() => setShowBuses(!showBuses)} style={{
            width: 34, height: 34, borderRadius: 8, fontSize: 16,
            cursor: 'pointer', border: 'none',
            background: showBuses ? 'rgba(245,158,11,0.2)' : 'transparent',
            color: showBuses ? '#f59e0b' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }} title="Show Live Buses">
            🚌
          </button>
        </div>
      </div>

      {/* ── Filtër linjash (poshtë-majtas) ── */}
      <div style={{
        position: 'absolute', bottom: 100, left: 16, zIndex: 1000,
        maxWidth: 'calc(100% - 32px)', overflowX: 'auto',
        display: 'flex', gap: 6, paddingBottom: 4,
      }}>
        <button
          onClick={() => setActiveRouteFilter(null)}
          style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', border: '1px solid',
            borderColor: !activeRouteFilter ? 'var(--primary)' : 'var(--border)',
            background: !activeRouteFilter ? 'rgba(99,102,241,0.2)' : 'rgba(15,23,42,0.85)',
            color: !activeRouteFilter ? 'var(--primary)' : 'var(--text-muted)',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            transition: 'var(--transition)',
          }}>
          Të gjitha
        </button>
        {BUS_ROUTES.map(route => (
          <button
            key={route.id}
            onClick={() => setActiveRouteFilter(activeRouteFilter === route.id ? null : route.id)}
            style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', border: '2px solid',
              borderColor: activeRouteFilter === route.id ? route.color : 'transparent',
              background: activeRouteFilter === route.id ? `${route.color}33` : 'rgba(15,23,42,0.75)',
              color: activeRouteFilter === route.id ? route.color : 'var(--text-muted)',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}>
            {route.name}
          </button>
        ))}
      </div>

      {/* ── Info panel autobuzi ── */}
      {infoPanel && (
        <div className="card animate-slide" style={{
          position: 'absolute', bottom: 160, right: 16, zIndex: 1000,
          width: 270, backdropFilter: 'blur(16px)',
          background: 'rgba(15,23,42,0.92)',
          border: `1px solid ${infoPanel.routeColor}55`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: infoPanel.routeColor,
                color: '#fff', fontWeight: 800, fontSize: 13,
                padding: '3px 10px', borderRadius: 6,
              }}>
                {infoPanel.routeName || infoPanel.routeId.replace('L', '')}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live</span>
            </div>
            <button onClick={() => setInfoPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{infoPanel.routeLabel}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stacioni tjetër</span>
              <b>{infoPanel.nextStop}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pasagjerë</span>
              <b>{infoPanel.passengerLoad} / 50</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shpejtësia</span>
              <b>{Math.round(infoPanel.speed)} km/h</b>
            </div>
            {infoPanel.delay > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f59e0b' }}>Vonesë</span>
                <b style={{ color: '#f59e0b' }}>{infoPanel.delay} min</b>
              </div>
            )}
          </div>

          {/* Barra e ngarkesës */}
          <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: 2, transition: 'width 0.8s ease',
              width: `${(infoPanel.passengerLoad / 50) * 100}%`,
              background: infoPanel.passengerLoad > 40 ? 'var(--danger)' : infoPanel.passengerLoad > 25 ? 'var(--warning)' : 'var(--success)',
            }} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12, fontSize: 13 }}
            onClick={() => setView('tracker')}>
            Shiko Detajet →
          </button>
        </div>
      )}

      {/* ── Banner linja aktive ── */}
      {activeRoute && !activeTrip && (
        <div style={{
          position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000,
          background: `${activeRoute.color}22`,
          border: `1px solid ${activeRoute.color}66`,
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontWeight: 600,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: activeRoute.color }} />
          <span style={{ color: activeRoute.color }}>Linja {activeRoute.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>{activeRoute.label}</span>
          <button onClick={() => setActiveRouteFilter(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 4 }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Banner Trip Aktiv ── */}
      {activeTrip && (
        <div style={{
          position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(59,130,246,0.15)',
          border: '1.5px solid rgba(59,130,246,0.4)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          padding: '8px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <Navigation size={14} color="var(--primary)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>{activeTrip.from}</span>
            <ArrowRight size={12} color="var(--text-muted)" />
            <span style={{ color: '#10b981' }}>{activeTrip.to}</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          <button
            onClick={() => { setActiveTrip(null); }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ef4444'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Legenda ── */}
      <div className="card" style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        padding: '8px 12px',
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
        fontSize: 10, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 11 }}>Legjenda</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 3, background: '#60a5fa', borderRadius: 2 }} />
          <span style={{ color: 'var(--text-muted)' }}>Linja urbane</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, background: '#1a73e8', borderRadius: 3, border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 7, color: '#fff' }}>🚌</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>Stacion</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
          <span style={{ color: 'var(--text-muted)' }}>Vendndodhja juaj</span>
        </div>
      </div>
    </div>
  );
}