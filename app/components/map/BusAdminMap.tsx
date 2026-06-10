'use client';

import React, { useEffect, useRef } from 'react';

interface BusLocation {
  busId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface BusAdminMapProps {
  buses: Record<string, BusLocation>;
}

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

export default function BusAdminMap({ buses }: BusAdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!isMounted) return;
        LRef.current = L;

        const container = mapContainerRef.current;
        if (!container) return;
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }

        const map = L.map(container, {
          zoomControl: true,
          preferCanvas: true
        }).setView([41.3275, 19.8187], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Failed to initialize Admin Map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        // Cancel all active marker animations
        Object.values(markersRef.current).forEach((marker: any) => {
          if (marker._animationFrameId) {
            cancelAnimationFrame(marker._animationFrameId);
          }
        });
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync active bus markers
  useEffect(() => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // 1. Remove markers for deleted buses
    Object.keys(markersRef.current).forEach((busId) => {
      if (!buses[busId]) {
        const marker = markersRef.current[busId];
        if (marker._animationFrameId) {
          cancelAnimationFrame(marker._animationFrameId);
        }
        map.removeLayer(marker);
        delete markersRef.current[busId];
      }
    });

    // 2. Add or update markers for current buses
    Object.entries(buses).forEach(([busId, busLoc]) => {
      let marker = markersRef.current[busId];

      if (marker) {
        // Animate existing marker position
        const currentPos = marker.getLatLng();
        animateMarker(marker, [currentPos.lat, currentPos.lng], [busLoc.lat, busLoc.lng], 4500);
      } else {
        const busIcon = L.divIcon({
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background-color: #3b82f6;
              border: 3px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              font-size: 18px;
              color: white;
              position: relative;
            ">
              🚌
              <span style="
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(17, 24, 39, 0.85);
                color: white;
                padding: 1px 5px;
                border-radius: 4px;
                font-size: 8px;
                font-weight: 700;
                white-space: nowrap;
                border: 0.5px solid rgba(255,255,255,0.15);
              ">${busId}</span>
            </div>
          `,
          className: 'smooth-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        marker = L.marker([busLoc.lat, busLoc.lng], { icon: busIcon }).addTo(map);
        markersRef.current[busId] = marker;
      }
    });
  }, [buses]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0a0f1d' }} />
    </div>
  );
}
