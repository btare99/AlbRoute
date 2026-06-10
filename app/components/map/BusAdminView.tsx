'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import useStore, { BUS_ROUTES, BUS_STOPS } from '../../store/useStore';
import { BUS_SHAPES } from '../../store/busShapes';
import { IonIcon } from '@/app/components/common/IonIcon';
import { arrowBackOutline, trashOutline, playOutline, stopOutline, checkmarkCircleOutline, settingsOutline } from 'ionicons/icons';

interface BusLocation {
  id: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  lat: number;
  lng: number;
  status: string;
  passengerLoad?: number;
  speed?: number;
  nextStop?: string;
  direction?: 'forward' | 'return';
  currentPointIdx?: number;
  updatedAt?: string;
  licensePlate?: string;
  busNumber?: string;
  model?: string;
  isRealGPS?: boolean;
}

// Load map dynamically to prevent SSR window reference issues
const BusAdminMap = dynamic(() => import('./BusAdminMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: '#0a0f1d',
      color: '#3b82f6',
      fontSize: '16px',
      fontWeight: '600'
    }}>
      Loading Admin Map...
    </div>
  )
});

export default function BusAdminView() {
  const setView = useStore((state: any) => state.setView);
  
  const [buses, setBuses] = useState<Record<string, BusLocation>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form Fields
  const [busId, setBusId] = useState('Bus-01');
  const [selectedRouteId, setSelectedRouteId] = useState(BUS_ROUTES[0]?.id || '');
  
  // Custom Metadata Fields
  const [licensePlate, setLicensePlate] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [model, setModel] = useState('');

  // Auto-populate form fields when typing or selecting a bus ID that exists
  useEffect(() => {
    const existingBus = buses[busId.trim()];
    if (existingBus) {
      setSelectedRouteId(existingBus.routeId || '');
      setLicensePlate(existingBus.licensePlate || '');
      setBusNumber(existingBus.busNumber || '');
      setModel(existingBus.model || '');
    } else {
      setLicensePlate('');
      setBusNumber('');
      setModel('');
    }
  }, [busId, buses]);

  // Fetch all buses from database on mount
  const fetchBusesFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/buses');
      if (!res.ok) throw new Error('Failed to fetch buses');
      const data: BusLocation[] = await res.json();
      const mapped: Record<string, BusLocation> = {};
      data.forEach((bus) => {
        if (bus.id) mapped[bus.id] = bus;
      });
      setBuses(mapped);
    } catch (err) {
      console.error('Error loading admin buses:', err);
      showStatus('Error loading buses from database', 'error');
    }
  }, []);

  useEffect(() => {
    fetchBusesFromDb();

    // Set up a slow polling in the admin panel to keep coordinates in sync
    const interval = setInterval(fetchBusesFromDb, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchBusesFromDb]);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Save/Update Bus in Database
  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busId.trim()) {
      showStatus('Please enter a Bus ID', 'error');
      return;
    }

    const exists = !!buses[busId.trim()];
    const route = BUS_ROUTES.find((r: any) => r.id === selectedRouteId);
    if (!route) {
      showStatus('Selected route is invalid', 'error');
      return;
    }

    const busPayload: any = {
      id: busId.trim(),
      routeId: selectedRouteId,
      routeName: route.name,
      routeColor: route.color || '#3b82f6',
      status: 'Aktiv',
      passengerLoad: 15 + Math.floor(Math.random() * 20),
      speed: 30 + Math.floor(Math.random() * 15),
      nextStop: 'Qendër',
      direction: 'forward' as const,
      currentPointIdx: 0,
      licensePlate: licensePlate.trim(),
      busNumber: busNumber.trim(),
      model: model.trim(),
      isRealGPS: true
    };

    // Only set standard center coordinates as temporary fallback when registering a brand new bus
    if (!exists) {
      busPayload.lat = 41.3275;
      busPayload.lng = 19.8187;
    }

    setLoading(true);
    try {
      const endpoint = '/api/admin/buses';
      const method = exists ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busPayload)
      });

      if (res.ok) {
        showStatus(`Bus ${busPayload.id} saved successfully!`, 'success');
        fetchBusesFromDb();
      } else {
        const err = await res.json();
        showStatus(err.error || 'Failed to save bus to database', 'error');
      }
    } catch (err) {
      showStatus('Network error connecting to database API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Bus from Database
  const handleDeleteBus = async (targetBusId: string) => {
    if (!confirm(`Are you sure you want to delete ${targetBusId} from database?`)) return;

    try {
      const res = await fetch(`/api/admin/buses?id=${targetBusId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showStatus(`Bus ${targetBusId} deleted`, 'success');
        fetchBusesFromDb();
      } else {
        const err = await res.json();
        showStatus(err.error || 'Failed to delete bus', 'error');
      }
    } catch (err) {
      showStatus('Network error connecting to database API', 'error');
    }
  };

  // Convert buses state map to list for mapping component
  const busList = Object.values(buses).reduce<Record<string, any>>((acc, bus) => {
    acc[bus.id] = {
      busId: bus.id,
      lat: bus.lat,
      lng: bus.lng,
      timestamp: bus.updatedAt || new Date().toISOString()
    };
    return acc;
  }, {});

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      background: '#070a13',
      color: '#cbd5e1',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left Pane: Interactive Map */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <BusAdminMap buses={busList} />
        
        {/* Floating Back Button */}
        <button
          onClick={() => {
            setView('map');
            window.location.href = '/';
          }}
          style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px',
            padding: '10px 16px', color: '#fff', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'all 0.2s'
          }}
        >
          <IonIcon icon={arrowBackOutline} style={{ fontSize: 16 }} />
          Back to Map
        </button>

        {/* Map Help Overlay */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
          padding: '8px 16px', color: '#94a3b8', fontSize: '12px', pointerEvents: 'none'
        }}>
          📡 Harta tregon vetëm pozicionet reale të autobusëve nga GPS.
        </div>
      </div>

      {/* Right Pane: Control Panel */}
      <div style={{
        width: '380px',
        height: '100%',
        borderLeft: '1.5px solid rgba(255,255,255,0.08)',
        background: '#090d16',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)', border: '1.5px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IonIcon icon={settingsOutline} style={{ fontSize: 18, color: '#3b82f6' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Urbani Im - Admin
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
              Manage live active buses in MongoDB.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
            color: message.type === 'success' ? '#10b981' : message.type === 'error' ? '#ef4444' : '#3b82f6',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 15 }} />
            {message.text}
          </div>
        )}

        {/* Add/Update form */}
        <form onSubmit={handleSaveBus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', margin: 0, letterSpacing: '0.05em' }}>
            Add / Update Bus
          </h2>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Bus ID (SinoTrack ID)</label>
            <input
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              placeholder="e.g. 9170258631"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Route Line</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              style={{
                width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {BUS_ROUTES.map((route: any) => (
                <option key={route.id} value={route.id}>
                  {route.id} - {route.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Targa (Plate)</label>
              <input
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="e.g. TR 123 AB"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Nr. Autobusi</label>
              <input
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. Urbani 04"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Modeli i Urbanit</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Mercedes-Benz Citaro"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            padding: '12px 14px', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed rgba(59, 130, 246, 0.2)',
            borderRadius: '8px', fontSize: '11px', color: '#93c5fd', lineHeight: '1.4'
          }}>
            📡 Ky urban do të marrë koordinatat direkt nga pajisja fizike GPS SinoTrack (nuk ka vendosje manuale).
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)', marginTop: '8px'
            }}
          >
            {loading ? 'Saving to Database...' : buses[busId] ? 'Update Bus Details' : 'Create & Register Bus'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Active Buses list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', margin: 0, letterSpacing: '0.05em' }}>
            Active Database Buses ({Object.keys(buses).length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.values(buses).map((bus) => (
              <div
                key={bus.id}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}
              >
                {/* ID & Route Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>🚌 {bus.id}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', color: '#fff',
                    backgroundColor: bus.routeColor, padding: '2px 8px', borderRadius: '20px'
                  }}>
                    Line {bus.routeId}
                  </span>
                </div>
                
                {/* Coordinates & Route Details */}
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
                  <div>Name: <strong>{bus.routeName}</strong></div>
                  {bus.licensePlate && <div>Targa: <strong style={{ color: '#fff' }}>{bus.licensePlate}</strong></div>}
                  {bus.busNumber && <div>Urbani Nr: <strong style={{ color: '#fff' }}>{bus.busNumber}</strong></div>}
                  {bus.model && <div>Modeli: <strong>{bus.model}</strong></div>}
                  <div>Lat: {bus.lat.toFixed(5)} | Lng: {bus.lng.toFixed(5)}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteBus(bus.id)}
                    style={{
                      padding: '7px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <IonIcon icon={trashOutline} style={{ fontSize: 12 }} />
                    Delete
                  </button>

                  {/* Quick Edit load button */}
                  <button
                    onClick={() => {
                      setBusId(bus.id);
                      setSelectedRouteId(bus.routeId || '');
                      setLicensePlate(bus.licensePlate || '');
                      setBusNumber(bus.busNumber || '');
                      setModel(bus.model || '');
                      showStatus(`Loaded bus ${bus.id} into editor`, 'info');
                    }}
                    style={{
                      padding: '7px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                      background: 'rgba(59,130,246,0.06)', color: '#3b82f6',
                      border: '1px solid rgba(59,130,246,0.12)', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {Object.keys(buses).length === 0 && (
              <div style={{
                textAlign: 'center', padding: '30px 20px', color: '#64748b', fontSize: '12px',
                border: '1.5px dashed rgba(255,255,255,0.05)', borderRadius: '12px', lineHeight: '1.5'
              }}>
                No active database buses found.<br />Register a new bus using its SinoTrack ID to start.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
