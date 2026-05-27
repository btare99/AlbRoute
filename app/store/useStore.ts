import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUS_ROUTES, BUS_STOPS } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';
export { BUS_ROUTES, BUS_STOPS };

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

// Calculates the accumulated distance (progress) of a projected point along the polyline
const getProgressOnPolyline = (point: [number, number], polyline: [number, number][]): number => {
  if (polyline.length < 2) return 0;

  let minD2 = Infinity;
  let bestProgress = 0;
  let accumulatedDist = 0;
  const [px, py] = point;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    let t = 0;
    if (segmentLength > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / (segmentLength * segmentLength);
      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;

    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) {
      minD2 = dist2;
      bestProgress = accumulatedDist + t * segmentLength;
    }
    accumulatedDist += segmentLength;
  }

  return bestProgress;
};

// Retrieves the detailed coordinates of a route leg
const getLegCoords = (leg: any): [number, number][] => {
  if (leg.isWalking) return [];

  const route = leg.route;
  if (!route) return [];

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

  return legCoords;
};

// Retrieves the full shape coordinates of a route and direction
const getFullShapeCoords = (routeId: string, direction: 'forward' | 'return'): [number, number][] => {
  const shapeKey = direction === 'forward' ? `${routeId}_0` : `${routeId}_1`;
  let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
  if (shapeCoords.length === 0 && direction === 'forward') {
    shapeCoords = (BUS_SHAPES[routeId as keyof typeof BUS_SHAPES] as [number, number][]) || [];
  }
  return shapeCoords;
};


// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface StaffAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: 'dispatcher' | 'operator' | 'driver' | 'inspector';
  routeId?: string;
  status: string;
}

const useStore = create<any>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      user: { name: 'Admin', email: 'admin@busal.al', avatar: null },
      staffUser: null,
      isAuthenticated: true,
      guestMode: false,
      setGuestMode: (val: boolean) => set({ guestMode: val }),
      token: 'dev-token',
      login: (userData: any, token: any) => set({ user: userData, isAuthenticated: true, token }),
      loginAsStaff: (staffData: any) => set({ staffUser: staffData, isAuthenticated: true, user: null, currentView: 'staff_dashboard' }),
      logout: () => set({ user: null, staffUser: null, isAuthenticated: false, token: null, currentView: 'login' }),
      updateProfile: async (data: any) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Update local state first for responsiveness
        set((state: any) => ({ user: { ...state.user, ...data } }));

        // Sync with MongoDB if user has an ID
        if (currentUser.id || currentUser._id) {
          try {
            const res = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...data }),
            });

            if (!res.ok) {
              const body = await res.text();
              throw new Error(`Profile sync failed (${res.status} ${res.statusText}): ${body}`);
            }
          } catch (error) {
            console.error('Failed to sync profile with MongoDB', error);
          }
        }
      },

      // ── Language ──
      language: 'al',
      setLanguage: async (lang: string) => {
        set({ language: lang });
        try {
          await Preferences.set({ key: 'app_language', value: lang });
        } catch (error) {
          console.warn('Failed to persist language preference:', error);
        }
      },

      // ── Device + Network ──
      deviceInfo: null,
      networkStatus: { connected: true, connectionType: 'unknown' },
      appState: { isActive: true },
      initializeNativeServices: async () => {
        try {
          const [deviceInfo, networkStatus, appState] = await Promise.all([
            Device.getInfo(),
            Network.getStatus(),
            App.getState()
          ]);
          set({ deviceInfo, networkStatus, appState });

          Network.addListener('networkStatusChange', (status) => {
            set({ networkStatus: status });
          });

          App.addListener('appStateChange', (state) => {
            set({ appState: state });
          });

          try {
            await LocalNotifications.requestPermissions();
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
          } catch (notifyCleanupError) {
            console.warn('Local notification cleanup failed:', notifyCleanupError);
          }
        } catch (error) {
          console.warn('Native service initialization failed:', error);
        }
      },
      currentView: 'map',
      checkoutPackage: null,
      isSidebarOpen: false,
      showStops: true,
      showRoutes: true,
      showBuses: true,
      setView: (v: any) => set({ currentView: v, isSidebarOpen: false }),
      setCheckoutPackage: (pkg: any) => set({ checkoutPackage: pkg }),
      setShowStops: (val: boolean) => set({ showStops: val }),
      setShowRoutes: (val: boolean) => set({ showRoutes: val }),
      setShowBuses: (val: boolean) => set({ showBuses: val }),

      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

      // ── Map Selection Mode ──
      selectingOnMap: null as 'from' | 'to' | null,
      setSelectingOnMap: (val: 'from' | 'to' | null) => set({ selectingOnMap: val }),

      // ── Admin Data ──
      adminDrivers: [],
      adminInspectors: [],
      adminBuses: [],
      setAdminDrivers: (drivers: any[]) => set({ adminDrivers: drivers }),
      setAdminInspectors: (inspectors: any[]) => set({ adminInspectors: inspectors }),
      setAdminBuses: (buses: any[]) => set({ adminBuses: buses }),
      fetchAdminDrivers: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=driver');
          const drivers = await res.json();
          set({ adminDrivers: Array.isArray(drivers) ? drivers : [] });
        } catch (error) {
          console.error('Failed to fetch drivers', error);
          set({ adminDrivers: [] });
        }
      },
      fetchAdminInspectors: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=inspector');
          const inspectors = await res.json();
          set({ adminInspectors: Array.isArray(inspectors) ? inspectors : [] });
        } catch (error) {
          console.error('Failed to fetch inspectors', error);
          set({ adminInspectors: [] });
        }
      },
      fetchAdminBuses: async () => {
        try {
          const res = await fetch('/api/admin/buses');
          const buses = await res.json();
          set({ adminBuses: Array.isArray(buses) ? buses : [] });
        } catch (error) {
          console.error('Failed to fetch buses', error);
          set({ adminBuses: [] });
        }
      },
      // When admin adds/removes buses, we rebuild the simulation array but preserve existing buses that didn't change
      syncBusesWithAdmin: async () => {
        const { adminBuses, buses } = get();
        if (!Array.isArray(adminBuses)) return;

        const newBuses: any[] = [];
        const currentBuses = Array.isArray(buses) ? buses : [];

        for (const adminBus of adminBuses) {
          if (!adminBus || adminBus.status !== 'Aktiv') continue;

          // Check local state first
          const existingLocal = currentBuses.find(b => b.id === adminBus.id);
          if (existingLocal) {
            newBuses.push({
              ...existingLocal,
              routeId: adminBus.routeId,
              driverId: adminBus.driverId,
              inspectorId: adminBus.inspectorId
            });
            continue;
          }

          // Fetch from API
          try {
            const res = await fetch(`/api/admin/buses?id=${adminBus.id}`);
            const existing = await res.json();
            if (existing && !existing.error) {
              newBuses.push({
                ...existing,
                routeId: adminBus.routeId,
                driverId: adminBus.driverId,
                inspectorId: adminBus.inspectorId
              });
            }
            // Automated generation removed to prevent ghost buses
          } catch (error) {
            console.error('Error syncing bus', error);
          }
        }
        set({ buses: newBuses });
      },

      // ── Buses ──
      buses: [],
      selectedBus: null,
      selectedRoute: null,
      userLocation: { lat: 41.3275, lng: 19.8187 },
      geolocationPermissionDenied: false,
      setUserLocation: (loc: { lat: number, lng: number }) => set({ userLocation: loc }),
      fetchBuses: async () => {
        try {
          const res = await fetch('/api/buses');
          if (!res.ok) {
            const body = await res.text();
            throw new Error(`Buses fetch failed (${res.status} ${res.statusText}): ${body}`);
          }
          const buses = await res.json();
          if (Array.isArray(buses)) {
            // Normalize routeId to match the BUS_ROUTES format (e.g., '1A' -> 'L1A')
            const normalizedBuses = buses.map((bus: any) => ({
              ...bus,
              routeId: bus.routeId && !bus.routeId.startsWith('L') ? `L${bus.routeId}` : bus.routeId
            }));
            set({ buses: normalizedBuses });
          }
        } catch (error) {
          console.error('Failed to fetch buses from MongoDB:', error);
        }
      },
      updateBus: async (busData: any) => {
        try {
          const res = await fetch('/api/admin/buses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(busData),
          });
          if (res.ok) {
            const updatedBus = await res.json();
            set((state: any) => ({
              buses: Array.isArray(state.buses)
                ? state.buses.map((b: any) => b.id === updatedBus.id ? updatedBus : b)
                : [updatedBus]
            }));
          }
        } catch (error) {
          console.error('Failed to update bus', error);
        }
      },
      getCurrentPosition: async (options: any = {}) => {
        const defaultOptions = { enableHighAccuracy: true, timeout: 45000, maximumAge: 120000 }; // 45s timeout, 2min cache
        const mergedOptions = { ...defaultOptions, ...options };

        const fallbackToBrowser = async () => {
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            return new Promise<any>((resolve, reject) => {
              // Browser geolocation precisa de timeout maior
              const browserOptions = {
                enableHighAccuracy: true,
                timeout: 45000,  // 45 segundos para navegador (sinal fraco é comum)
                maximumAge: 300000  // 5 minutos de cache é aceitável
              };
              navigator.geolocation.getCurrentPosition(resolve, reject, browserOptions);
            });
          }
          throw new Error('Geolocation not supported');
        };

        const tryNativePosition = async (attemptTimeout: number) => {
          try {
            try {
              await Geolocation.requestPermissions();
            } catch (permissionError) {
              console.warn('Geolocation permission request failed:', permissionError);
            }
            return await Geolocation.getCurrentPosition({ ...mergedOptions, timeout: attemptTimeout });
          } catch (nativeError: any) {
            const message = String(nativeError?.message || '').toLowerCase();
            const isTimeoutError = message.includes('timeout') || message.includes('could not obtain location in time');
            if (isTimeoutError && attemptTimeout < 60000) {
              console.warn(`Native geolocation timeout after ${attemptTimeout}ms, retrying with a longer timeout...`);
              return await tryNativePosition(60000);
            }
            throw nativeError;
          }
        };

        if (Capacitor.isNativePlatform()) {
          try {
            return await tryNativePosition(mergedOptions.timeout);
          } catch (nativeError) {
            console.warn('Native geolocation failed, falling back to browser', nativeError);
            return await fallbackToBrowser();
          }
        }

        return await fallbackToBrowser();
      },
      fetchUserLocation: async (notify = false) => {
        // Skip if permission was already denied to prevent Chrome from blocking
        if (get().geolocationPermissionDenied) {
          const lastLocation = get().user?.lastLocation;
          if (lastLocation) {
            set({ userLocation: { lat: lastLocation.lat, lng: lastLocation.lng } });
          }
          return;
        }

        try {
          const position = await get().getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          set({ userLocation: { lat, lng } });

          const currentUser = get().user;
          const lastLocation = currentUser?.lastLocation;
          const now = new Date();
          const albaniaTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

          const locationChanged = !lastLocation ||
            Math.abs(lastLocation.lat - lat) > 0.0001 ||
            Math.abs(lastLocation.lng - lng) > 0.0001;

          if (currentUser && (currentUser.id || currentUser._id)) {
            get().updateProfile({
              lastLocation: { lat, lng, updatedAt: albaniaTime }
            });
          }

        } catch (error) {
          // Mark as denied if permission is rejected
          const isPermissionDenied = error instanceof GeolocationPositionError && error.code === 1;
          if (isPermissionDenied) {
            set({ geolocationPermissionDenied: true });
          } else {
            console.warn('[Geolocation] primary location request failed, attempting fallback', error);
          }
          try {
            // Fallback com timeout ainda maior
            const fallbackPosition = await get().getCurrentPosition({ 
              enableHighAccuracy: false, 
              timeout: 45000,  // Aumentado de 12000 para 45000
              maximumAge: 600000  // 10 minutos de cache aceitável
            });
            const lat = fallbackPosition.coords.latitude;
            const lng = fallbackPosition.coords.longitude;
            set({ userLocation: { lat, lng } });

            const currentUser = get().user;
            if (currentUser && (currentUser.id || currentUser._id)) {
              const now = new Date();
              const albaniaTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
              get().updateProfile({ lastLocation: { lat, lng, updatedAt: albaniaTime } });
            }
          } catch (fallbackError) {
            // Mark as denied if permission is rejected
            const isFallbackPermissionDenied = fallbackError instanceof GeolocationPositionError && fallbackError.code === 1;
            if (isFallbackPermissionDenied) {
              set({ geolocationPermissionDenied: true });
            } else {
              console.warn('[Geolocation] fallback request failed:', fallbackError);
            }
            // Fallback final: usar última localização conhecida ou localização padrão
            const lastLocation = get().user?.lastLocation;
            if (lastLocation) {
              set({ userLocation: { lat: lastLocation.lat, lng: lastLocation.lng } });
              if (!isFallbackPermissionDenied) {
                console.debug('[Geolocation] using cached user location');
              }
            } else {
              // Localização padrão (centro de Tirana)
              set({ userLocation: { lat: 41.3275, lng: 19.8187 } });
              if (!isFallbackPermissionDenied) {
                console.debug('[Geolocation] using default location (Tirana center)');
              }
            }
          }
        }
      },
      watchId: null as string | null,
      startTracking: async () => {
        // Skip if permission was already denied
        if (get().geolocationPermissionDenied || get().watchId) return;

        const fallbackWatch = () => {
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
              (pos) => set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
              (err) => {
                // Mark as denied if permission is rejected
                if (err.code === 1) {
                  set({ geolocationPermissionDenied: true });
                  return;
                }
                // Suppress timeout (code 3) errors
                const message = String(err?.message || '').toLowerCase();
                const isTimeout = err.code === 3 || message.includes('timeout') || message.includes('could not obtain location');
                if (!isTimeout) {
                  console.warn('Browser geolocation watch error:', err);
                }
              },
              { 
                enableHighAccuracy: true,
                timeout: 60000,  // 60 segundos de timeout para watch
                maximumAge: 600000  // 10 minutos de cache
              }
            );
            set({ watchId: id });
          }
        };

        if (Capacitor.isNativePlatform()) {
          try {
            const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
              if (err) {
                // Check if permission was denied
                const message = String(err?.message || '').toLowerCase();
                const errorCode = String(err?.code || '').toLowerCase();
                if (message.includes('permission') || errorCode.includes('permission')) {
                  set({ geolocationPermissionDenied: true });
                  return;
                }
                // Suppress timeout errors silently
                const isTimeout = message.includes('timeout') || message.includes('could not obtain location') || errorCode.includes('timeout') || errorCode.includes('gloc-0010');
                if (!isTimeout) {
                  console.warn('Capacitor geolocation watch error:', err);
                }
                return;
              }
              if (position?.coords) {
                set({ userLocation: { lat: position.coords.latitude, lng: position.coords.longitude } });
              }
            });
            set({ watchId: id });
            return;
          } catch (error) {
            console.warn('Native watchPosition failed, falling back to browser', error);
          }
        }

        fallbackWatch();
      },
      stopTracking: async () => {
        const { watchId } = get();
        if (watchId) {
          if (Capacitor.isNativePlatform()) {
            try {
              await Geolocation.clearWatch({ id: watchId });
            } catch (clearError) {
              console.warn('Failed to clear native geolocation watch:', clearError);
            }
          } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId as number);
          }
          set({ watchId: null });
        }
      },
      findNearestStop: (lat: number, lng: number) => {
        let nearest = BUS_STOPS[0];
        let minDist = Infinity;
        BUS_STOPS.forEach(stop => {
          const dist = Math.sqrt(Math.pow(stop.lat - lat, 2) + Math.pow(stop.lng - lng, 2));
          if (dist < minDist) {
            minDist = dist;
            nearest = stop;
          }
        });
        return nearest;
      },
      setSelectedBus: (bus: any) => set({ selectedBus: bus }),
      setSelectedRoute: (route: any) => set({ selectedRoute: route }),
      selectedStop: null,
      setSelectedStop: (stop: any) => set({ selectedStop: stop }),

      // ── Traffic & Intelligence Logic ──
      trafficZones: [
        { id: 'tz1', name: 'Zogu i Zi', lat: 41.3323, lng: 19.8078, radius: 0.003, intensity: 0.8 }, // 80% vonesë
        { id: 'tz2', name: 'Qendra', lat: 41.3275, lng: 19.8187, radius: 0.004, intensity: 0.6 },
        { id: 'tz3', name: '21 Dhjetori', lat: 41.3265, lng: 19.8030, radius: 0.002, intensity: 0.7 },
      ],

      moveBuses: () => {
        const { buses, trafficZones } = get();
        const now = new Date();
        const hour = now.getHours();
        const isPeakHour = (hour >= 8 && hour <= 9) || (hour >= 16 && hour <= 18);

        const updated = buses.map((bus: any) => {
          if (bus.waitingTicks && bus.waitingTicks > 0) {
            return { ...bus, waitingTicks: bus.waitingTicks - 1, status: 'stopped' };
          }

          // Increase ticks
          const ticks = (bus.ticks || 0) + 1;

          const route = BUS_ROUTES.find(r => r.id === bus.routeId);
          if (!route) return bus;

          const isReturn = bus.direction === 'return';

          // Smart Shape Selection: Gjej shape-in që përputhet më mirë me drejtimin
          const shape0 = BUS_SHAPES[`${route.id}_0` as keyof typeof BUS_SHAPES] || [];
          const shape1 = BUS_SHAPES[`${route.id}_1` as keyof typeof BUS_SHAPES] || [];
          const mainShape = BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] || [];

          let coords: [number, number][] = [];

          // Gjej stacionin e parë dhe të fundit për drejtimin aktual
          const sIds = isReturn ? (route.returnStops || [...route.stops].reverse()) : route.stops;
          const startStop = BUS_STOPS.find(s => s.id === sIds[0]);
          const endStop = BUS_STOPS.find(s => s.id === sIds[sIds.length - 1]);

          if (startStop && endStop) {
            // Kontrollo cilin shape (0 apo 1) ka pikën e fillimit më afër stacionit nisës
            const dist0 = shape0.length > 0 ? Math.sqrt(Math.pow(shape0[0][0] - startStop.lat, 2) + Math.pow(shape0[0][1] - startStop.lng, 2)) : Infinity;
            const dist1 = shape1.length > 0 ? Math.sqrt(Math.pow(shape1[0][0] - startStop.lat, 2) + Math.pow(shape1[0][1] - startStop.lng, 2)) : Infinity;

            if (dist0 < dist1 && dist0 < 0.01) coords = shape0;
            else if (dist1 < dist0 && dist1 < 0.01) coords = shape1;
            else if (mainShape.length > 0) coords = isReturn ? [...mainShape].reverse() : mainShape;
          }

          // Fallback nëse smart-selection dështon
          if (coords.length === 0) {
            const shapeKey = isReturn ? `${route.id}_1` : `${route.id}_0`;
            coords = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
          }

          // If return shape is missing, try reversing the forward shape
          if (coords.length === 0 && isReturn) {
            const forwardShape = (BUS_SHAPES[`${route.id}_0` as keyof typeof BUS_SHAPES] || BUS_SHAPES[route.id as keyof typeof BUS_SHAPES]) || [];
            if (forwardShape.length > 0) coords = [...forwardShape].reverse();
          }

          // Final fallback to straight lines
          if (coords.length === 0) {
            coords = sIds.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean).map(s => [s!.lat, s!.lng]) as [number, number][];
          }

          if (coords.length < 2) return bus;

          const currentIdx = typeof bus.currentPointIdx === 'number' ? bus.currentPointIdx : 0;
          const nextPointIdx = currentIdx + 1;

          // Arriti në fund të shape-it
          if (nextPointIdx >= coords.length || !coords[nextPointIdx]) {
            return {
              ...bus,
              currentPointIdx: 0,
              direction: isReturn ? 'forward' : 'return',
              lat: coords[0][0],
              lng: coords[0][1],
              lastUpdate: Date.now(),
              ticks: 0
            };
          }

          const target = coords[nextPointIdx];

          // Logjika e Trafikut
          let speedMultiplier = 1.0;
          trafficZones.forEach((zone: any) => {
            const distToZone = Math.sqrt(Math.pow(bus.lat - zone.lat, 2) + Math.pow(bus.lng - zone.lng, 2));
            if (distToZone < zone.radius) {
              speedMultiplier = 1.0 - zone.intensity;
            }
          });

          const dlat = target[0] - bus.lat;
          const dlng = target[1] - bus.lng;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);

          // Përditëso shpejtësinë vetëm çdo 3 sekonda (30 ticks pasi 1 tick = 100ms)
          let currentSpeed = bus.speed;
          if (ticks % 30 === 0) {
            currentSpeed = 35 * speedMultiplier * (0.8 + Math.random() * 0.4);
          }

          // Nëse është shumë afër pikës tjetër, kalo te pika pasardhëse
          if (dist < 0.0001) {
            const currentStop = BUS_STOPS.find(s =>
              Math.sqrt(Math.pow(s.lat - target[0], 2) + Math.pow(s.lng - target[1], 2)) < 0.0002
            );

            let waitingTicks = 0;
            let newLoad = bus.passengerLoad;

            if (currentStop) {
              waitingTicks = 30;
              newLoad += (Math.floor(Math.random() * 7) - 3);
              if (isPeakHour) newLoad += Math.floor(Math.random() * 4);
              newLoad = Math.max(2, Math.min(50, newLoad));
            }

            const stopsList = isReturn ? (route.returnStops || route.stops) : route.stops;
            const nextStops = stopsList.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean);
            let nearestStop = nextStops[0];
            let minDist = Infinity;
            nextStops.forEach(s => {
              const d = Math.sqrt(Math.pow(s!.lat - target[0], 2) + Math.pow(s!.lng - target[1], 2));
              if (d < minDist) {
                minDist = d;
                nearestStop = s;
              }
            });

            return {
              ...bus,
              currentPointIdx: nextPointIdx,
              lat: target[0],
              lng: target[1],
              passengerLoad: newLoad,
              waitingTicks: waitingTicks,
              nextStop: nearestStop?.name || bus.nextStop,
              currentStop: currentStop?.name || bus.currentStop,
              status: waitingTicks > 0 ? 'stopped' : 'moving',
              delay: speedMultiplier < 0.5 ? (bus.delay + 0.05) : Math.max(0, bus.delay - 0.05),
              lastUpdate: Date.now(),
              ticks: ticks,
              speed: waitingTicks > 0 ? 0 : currentSpeed
            };
          }

          if (bus.waitingTicks > 0) {
            return {
              ...bus,
              waitingTicks: bus.waitingTicks - 1,
              speed: 0,
              ticks: ticks
            };
          }

          const baseStep = 0.00003;
          const actualStep = baseStep * speedMultiplier;

          return {
            ...bus,
            lat: bus.lat + (dlat / dist) * actualStep,
            lng: bus.lng + (dlng / dist) * actualStep,
            speed: currentSpeed,
            status: 'moving',
            ticks: ticks
          };
        });
        set({ buses: updated });
      },

      // ── Trip Planner ──
      tripResult: null,
      activeTrip: null,
      tripOriginCoords: null as { lat: number, lng: number } | null,
      tripOriginName: '',
      setTripOriginCoords: (coords: any, name = '') => set({ tripOriginCoords: coords, tripOriginName: name }),
      tripDestCoords: null as { lat: number, lng: number } | null,
      tripDestName: '',
      setTripDestCoords: (coords: any, name = '') => set({ tripDestCoords: coords, tripDestName: name }),
      tripFrom: '',
      tripTo: '',
      setTripFrom: (v: any) => {
        set({ tripFrom: v });
        if (v !== get().tripOriginName) {
          set({ tripOriginCoords: null, tripOriginName: '' });
        }
      },
      setTripTo: (v: any) => {
        set({ tripTo: v });
        if (v !== get().tripDestName) {
          set({ tripDestCoords: null, tripDestName: '' });
        }
      },
      setTripResult: (v: any) => set({ tripResult: v }),
      tripOptions: [] as any[],
      selectedTripOptionIndex: 0,
      tripDepartureMode: 'now' as 'now' | 'depart_at' | 'arrive_by',
      tripDepartureTime: new Date().toISOString().slice(0, 16),
      setTripOptions: (options: any[]) => set({ tripOptions: options }),
      setSelectedTripOptionIndex: (idx: number) => set({ selectedTripOptionIndex: idx }),
      setTripDepartureMode: (mode: 'now' | 'depart_at' | 'arrive_by') => set({ tripDepartureMode: mode }),
      setTripDepartureTime: (time: string) => set({ tripDepartureTime: time }),
      setActiveTrip: (trip: any) => set({ activeTrip: trip }),
      planTrip: async (fromName: string, toName: string) => {
        console.log('🔍 planTrip iniciuar:', { fromName, toName });
        const searchTo = toName.trim().toLowerCase();
        const searchFrom = fromName.trim().toLowerCase();

        const cleanName = (n: string) => n.trim().toLowerCase();
        const findExactStop = (name: string) => {
          const clean = cleanName(name);
          return BUS_STOPS.find(s => s.name.toLowerCase().trim() === clean);
        };

        const exactFromStop = findExactStop(fromName);
        const exactToStop = findExactStop(toName);

        const departureMode = get().tripDepartureMode;
        const desiredTime = departureMode !== 'now' && get().tripDepartureTime
          ? new Date(get().tripDepartureTime)
          : new Date();
        const isArriveBy = departureMode === 'arrive_by';

        const formatIso = (date: Date) => date.toISOString();
        const candidates: any[] = [];
        let bestTrip: any = null;
        let bestScore = Infinity;

        // Ndihmës: Gjen koordinatat [lat, lng] për një adresë të shkruar (Geocoding)
        const geocodeQuery = async (query: string): Promise<{ lat: number, lng: number } | null> => {
          const stop = findExactStop(query);
          if (stop) return { lat: stop.lat, lng: stop.lng };

          const cleanQuery = query.toLowerCase().trim();
          const suffix = (cleanQuery.includes('tiran') || cleanQuery.includes('albania')) ? '' : ', Tirana';

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + suffix)}&format=json&limit=1`, {
              headers: { 'User-Agent': 'UrbaniIm/1.0' }
            });
            const data = await res.json();
            if (data && data.length > 0) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
          return null;
        };

        // 1. Geocode destinacionin (toName) dhe përcakto stacionet e mbërritjes
        let toCoords = get().tripDestName === toName ? get().tripDestCoords : null;
        if (exactToStop) {
          toCoords = { lat: exactToStop.lat, lng: exactToStop.lng };
        } else if (!toCoords) {
          toCoords = await geocodeQuery(toName);
        }

        if (!toCoords) {
          set({ tripResult: { error: 'Adresa e destinacionit nuk u gjet. Provo një adresë tjetër ose emër stacioni.' }, activeTrip: null });
          return;
        }
        set({ tripDestCoords: toCoords, tripDestName: toName });

        let possibleToStops: { stop: any, walkDist: number, walkTime: number }[] = [];
        if (exactToStop) {
          possibleToStops = [{
            stop: exactToStop,
            walkDist: 0,
            walkTime: 0
          }];
        } else {
          BUS_STOPS.forEach(s => {
            const dist = Math.sqrt(Math.pow(s.lat - toCoords!.lat, 2) + Math.pow(s.lng - toCoords!.lng, 2)) * 111320;
            if (dist <= 1500) {
              possibleToStops.push({
                stop: s,
                walkDist: Math.round(dist),
                walkTime: Math.ceil(dist / 80)
              });
            }
          });

          // Fallback: nëse nuk ka asnjë stacion brenda 1.5km, gjej 3 stacionet më të afërta të qytetit!
          if (possibleToStops.length === 0) {
            const sortedStops = BUS_STOPS.map(s => {
              const dist = Math.sqrt(Math.pow(s.lat - toCoords!.lat, 2) + Math.pow(s.lng - toCoords!.lng, 2)) * 111320;
              return { stop: s, dist };
            }).sort((a, b) => a.dist - b.dist);

            sortedStops.slice(0, 3).forEach(item => {
              possibleToStops.push({
                stop: item.stop,
                walkDist: Math.round(item.dist),
                walkTime: Math.ceil(item.dist / 80)
              });
            });
          }
          possibleToStops.sort((a, b) => a.walkDist - b.walkDist);
        }

        const primaryToStops = possibleToStops.filter(p => p.walkDist <= 400);
        const directToStops = primaryToStops.filter(p => p.walkDist <= 300);
        const toStopsForEvaluation = primaryToStops.length > 0 ? primaryToStops : possibleToStops;

        // 2. Geocode pikën e nisjes (fromName) dhe përcakto stacionet e nisjes
        let possibleFromStops: { stop: any, walkDist: number, walkTime: number }[] = [];
        const isMyLocation = cleanName(fromName).includes('vendndodhja') || cleanName(fromName).includes('my location');
        
        // Kontrollo nëse ky është zgjedhje në hartë (map selection)
        const storedOriginCoords = get().tripOriginCoords;
        const isMapSelection = storedOriginCoords && get().tripOriginName === fromName;

        let fromCoords = get().tripOriginName === fromName ? get().tripOriginCoords : null;
        if (exactFromStop) {
          fromCoords = { lat: exactFromStop.lat, lng: exactFromStop.lng };
        } else if (isMyLocation || isMapSelection) {
          fromCoords = get().tripOriginCoords || get().userLocation;
        } else if (!fromCoords) {
          fromCoords = await geocodeQuery(fromName);
        }

        if (!fromCoords) {
          set({ tripResult: { error: 'Adresa e nisjes nuk u gjet. Provo një adresë tjetër ose emër stacioni.' }, activeTrip: null });
          return;
        }
        set({ tripOriginCoords: fromCoords, tripOriginName: fromName });

        if (exactFromStop) {
          possibleFromStops = [{
            stop: exactFromStop,
            walkDist: 0,
            walkTime: 0
          }];
        } else if (isMyLocation || isMapSelection) {
          const distances = BUS_STOPS.map(s => {
            const R = 6371e3;
            const dLat = (s.lat - fromCoords!.lat) * Math.PI / 180;
            const dLng = (s.lng - fromCoords!.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(fromCoords!.lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
            return { stop: s, dist };
          });

          let nearby = distances.filter(d => d.dist <= 1500).sort((a, b) => a.dist - b.dist).slice(0, 10);
          if (!nearby.length) {
            nearby = distances.sort((a, b) => a.dist - b.dist).slice(0, 3);
          }

          try {
            const coords = [`${fromCoords!.lng},${fromCoords!.lat}`, ...nearby.map(n => `${n.stop.lng},${n.stop.lat}`)];
            const res = await fetch(`https://router.project-osrm.org/table/v1/foot/${coords.join(';')}?sources=0&annotations=distance,duration`);
            const data = await res.json();
            if (data.code === 'Ok') {
              possibleFromStops = nearby.map((n, i) => ({
                stop: n.stop,
                walkDist: Math.round(data.distances[0][i + 1]),
                walkTime: Math.ceil(data.durations[0][i + 1] / 60)
              }));
            } else { throw new Error(); }
          } catch (err) {
            possibleFromStops = nearby.map(n => ({ stop: n.stop, walkDist: n.dist, walkTime: Math.ceil(n.dist / 80) }));
          }

          possibleFromStops.sort((a, b) => a.walkDist - b.walkDist);
        } else {
          BUS_STOPS.forEach(s => {
            const dist = Math.sqrt(Math.pow(s.lat - fromCoords!.lat, 2) + Math.pow(s.lng - fromCoords!.lng, 2)) * 111320;
            if (dist <= 1500) {
              possibleFromStops.push({
                stop: s,
                walkDist: Math.round(dist),
                walkTime: Math.ceil(dist / 80)
              });
            }
          });

          // Fallback: nëse nuk ka asnjë stacion brenda 1.5km, gjej 3 stacionet më të afërta të qytetit!
          if (possibleFromStops.length === 0) {
            const sortedStops = BUS_STOPS.map(s => {
              const dist = Math.sqrt(Math.pow(s.lat - fromCoords!.lat, 2) + Math.pow(s.lng - fromCoords!.lng, 2)) * 111320;
              return { stop: s, dist };
            }).sort((a, b) => a.dist - b.dist);

            sortedStops.slice(0, 3).forEach(item => {
              possibleFromStops.push({
                stop: item.stop,
                walkDist: Math.round(item.dist),
                walkTime: Math.ceil(item.dist / 80)
              });
            });
          }
          possibleFromStops.sort((a, b) => a.walkDist - b.walkDist);
        }

        const evaluateTrip = (
          legs: any[],
          initialWalkDist: number,
          initialWalkTime: number,
          actualFromStopName: string,
          finalWalkDist: number = 0,
          finalWalkTime: number = 0,
          actualToStopName: string = '',
          secondLegLength = 0
        ) => {
          const busLegs = legs.filter(l => l.route);
          const totalStops = legs.reduce((acc, leg) => acc + (leg.numStops || 0), 0);
          const walkTimeTransfer = legs.reduce((acc, leg) => acc + (leg.walkingTime || 0), 0);
          const totalWalkDist = initialWalkDist + finalWalkDist + legs.reduce((acc, leg) => acc + (leg.walkingDist || 0), 0);

          if (totalWalkDist > 2500) {
            console.log('⛔ Kalim shumë i madh ecjeje:', totalWalkDist);
            return;
          }

          const transferPenalty = Math.max(0, busLegs.length - 1) * 15;
          const totalTime = initialWalkTime + finalWalkTime + (totalStops * 2.5) + walkTimeTransfer + transferPenalty;
          const secondLegBonus = busLegs.length > 1 ? secondLegLength * 0.25 : 0;

          // ── Real-Time Vehicle direction and progress check ──
          let liveBusScoreAdjustment = 0;
          let firstBusLeg = busLegs[0];

          if (firstBusLeg) {
            const route = firstBusLeg.route;
            const boardStop = BUS_STOPS.find(s => s.name === firstBusLeg.boardAt);
            const expectedDir = firstBusLeg.direction; // 'forward' or 'return'
            const fullShape = getFullShapeCoords(route.id, expectedDir);

            let bestEta = Infinity;
            let bestBus = null;

            if (boardStop && fullShape.length >= 2) {
              const boardProgress = getProgressOnPolyline([boardStop.lat, boardStop.lng], fullShape);
              const liveBuses = get().buses;

              liveBuses.forEach((bus: any) => {
                if (bus.routeId === route.id && bus.direction === expectedDir) {
                  const busProgress = getProgressOnPolyline([bus.lat, bus.lng], fullShape);
                  const distToBoard = boardProgress - busProgress;

                  // Check if the bus is approaching the boarding stop or currently at it (tolerance = 0.0003 coords)
                  if (distToBoard >= -0.0003) {
                    const speedKmh = bus.speed > 5 ? bus.speed : 30; // fallback to 30 km/h
                    const distMeters = distToBoard * 111320;
                    const eta = Math.max(0, distMeters / (speedKmh * 1000 / 60)); // ETA in minutes

                    if (eta < bestEta) {
                      bestEta = eta;
                      bestBus = bus;
                    }
                  }
                }
              });
            }

            if (bestBus) {
              firstBusLeg.liveBus = bestBus;
              firstBusLeg.etaMinutes = Math.round(bestEta);
              // Provide bonus for close, active live bus
              liveBusScoreAdjustment = -10 + Math.min(10, bestEta * 0.5); // bonus between -10 and -5
            } else {
              // Penalty for no live bus currently serving this stop / direction
              liveBusScoreAdjustment = 15;
            }
          }

          const score = (totalWalkDist / 8) + totalTime - secondLegBonus + liveBusScoreAdjustment;

          if (finalWalkDist > 400) {
            console.log('⛔ Ecje finale shumë e madhe:', finalWalkDist);
            return;
          }

          const finalLegs = !exactFromStop ? [
            { isWalking: true, boardAt: fromName, alightAt: actualFromStopName, walkingDist: initialWalkDist, walkingTime: initialWalkTime, numStops: 0 },
            ...legs
          ] : [...legs];

          if (!exactToStop) {
            finalLegs.push({ isWalking: true, boardAt: actualToStopName, alightAt: toName, walkingDist: finalWalkDist, walkingTime: finalWalkTime, numStops: 0 });
          }

          const travelTime = Math.round(totalTime - transferPenalty + (busLegs.length > 1 ? 5 : 0));
          const departure = isArriveBy ? new Date(desiredTime.getTime() - travelTime * 60000) : new Date(desiredTime);
          const arrival = isArriveBy ? new Date(desiredTime) : new Date(desiredTime.getTime() + travelTime * 60000);

          const trip = {
            from: fromName,
            to: toName,
            actualFrom: actualFromStopName,
            actualTo: actualToStopName,
            walkingDist: initialWalkDist + finalWalkDist,
            walkingTime: initialWalkTime + finalWalkTime,
            totalStops,
            transfers: Math.max(0, busLegs.length - 1),
            legs: finalLegs,
            travelTime,
            totalPrice: busLegs.length * 40,
            score,
            departureTime: formatIso(departure),
            arrivalTime: formatIso(arrival),
            isDirect: busLegs.length === 1,
            routeNames: busLegs.map((leg: any) => leg.route?.name).filter(Boolean).join(' → ')
          };

          candidates.push(trip);

          if (score < bestScore) {
            bestScore = score;
            bestTrip = trip;
          }
        };

        // 1. DIRECT ROUTES
        console.log('🚀 Kërkojnë rrugë të drejtpërdrejtë:', possibleFromStops.length, 'nga', possibleFromStops.map(p => p.stop.name));
        for (const pfs of possibleFromStops) {
          for (const pts of directToStops.length ? directToStops : toStopsForEvaluation) {
            for (const route of BUS_ROUTES) {
              const directions: { arr: string[], dirName: 'forward' | 'return' }[] = [
                { arr: route.stops, dirName: 'forward' as const },
                { arr: route.returnStops || [], dirName: 'return' as const }
              ].filter(d => d.arr.length > 0);

              for (const { arr, dirName } of directions) {
                // Find all occurrences of origin and destination stops in the sequence (resolves loops/circles)
                const startIndices: number[] = [];
                const endIndices: number[] = [];

                arr.forEach((stopId, idx) => {
                  if (stopId === pfs.stop.id) startIndices.push(idx);
                  if (stopId === pts.stop.id) endIndices.push(idx);
                });

                // Find valid stop pairs where boarding is before alight
                for (const i of startIndices) {
                  for (const j of endIndices) {
                    if (i < j) {
                      const stopIds = arr.slice(i, j + 1);
                      const stops = stopIds.map(id => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean);

                      // Build candidate leg for validation
                      const leg = {
                        route,
                        stops,
                        stopIds,
                        boardAt: pfs.stop.name,
                        alightAt: pts.stop.name,
                        numStops: j - i,
                        direction: dirName
                      };

                      // Polyline-based progress validation
                      const legCoords = getLegCoords(leg);
                      if (legCoords.length >= 2) {
                        const progressBoard = getProgressOnPolyline([pfs.stop.lat, pfs.stop.lng], legCoords);
                        const progressAlight = getProgressOnPolyline([pts.stop.lat, pts.stop.lng], legCoords);

                        // Ensure boarding stop appears before destination stop along road geometry
                        if (progressBoard < progressAlight) {
                          console.log('✅ Gjetur rrugë e drejtpërdrejtë e vlefshme:', pfs.stop.name, '→', pts.stop.name, 'me linjën', route.name, `(${dirName})`);
                          evaluateTrip([leg], pfs.walkDist, pfs.walkTime, pfs.stop.name, pts.walkDist, pts.walkTime, pts.stop.name);
                        } else {
                          console.log('⛔ Refuzuar drejtimi (dështoi progresi në polyline):', route.name, pfs.stop.name, '→', pts.stop.name);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // 2. TRANSFER ROUTES
        for (const pfs of possibleFromStops) {
          for (const route1 of BUS_ROUTES) {
            const r1Directions: { arr: string[], dirName: 'forward' | 'return' }[] = [
              { arr: route1.stops, dirName: 'forward' as const },
              { arr: route1.returnStops || [], dirName: 'return' as const }
            ].filter(d => d.arr.length > 0);

            for (const { arr: r1Arr, dirName: r1DirName } of r1Directions) {
              const startIndices1: number[] = [];
              r1Arr.forEach((stopId, idx) => {
                if (stopId === pfs.stop.id) startIndices1.push(idx);
              });

              if (startIndices1.length === 0) continue;

              for (const pts of toStopsForEvaluation) {
                for (const route2 of BUS_ROUTES) {
                  if (route1.id === route2.id) continue;

                  const r2Directions: { arr: string[], dirName: 'forward' | 'return' }[] = [
                    { arr: route2.stops, dirName: 'forward' as const },
                    { arr: route2.returnStops || [], dirName: 'return' as const }
                  ].filter(d => d.arr.length > 0);

                  for (const { arr: r2Arr, dirName: r2DirName } of r2Directions) {
                    const endIndices2: number[] = [];
                    r2Arr.forEach((stopId, idx) => {
                      if (stopId === pts.stop.id) endIndices2.push(idx);
                    });

                    if (endIndices2.length === 0) continue;

                    // Evaluate possible transfer points
                    for (const idx1_start of startIndices1) {
                      for (const idx2_end of endIndices2) {
                        
                        // Look for a transfer stop on route1 (after boarding) and route2 (before alighting)
                        for (let i = idx1_start + 1; i < r1Arr.length; i++) {
                          const s1 = BUS_STOPS.find(s => s.id === r1Arr[i]);
                          if (!s1) continue;

                          for (let j = 0; j < idx2_end; j++) {
                            const s2 = BUS_STOPS.find(s => s.id === r2Arr[j]);
                            if (!s2) continue;

                            // Walk distance between transfer stops must be <= 300m
                            const d = s1.id === s2.id ? 0 : Math.sqrt(Math.pow(s1.lat - s2.lat, 2) + Math.pow(s1.lng - s2.lng, 2)) * 111320;
                            if (d > 300) continue;

                            const dist = Math.round(d);
                            const walkTime = Math.ceil(dist / 80);

                            const stopIds1 = r1Arr.slice(idx1_start, i + 1);
                            const stopIds2 = r2Arr.slice(j, idx2_end + 1);

                            const leg1 = {
                              route: route1,
                              stops: stopIds1.map(id => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean),
                              stopIds: stopIds1,
                              boardAt: pfs.stop.name,
                              alightAt: s1.name,
                              numStops: i - idx1_start,
                              direction: r1DirName
                            };

                            const leg2 = {
                              route: route2,
                              stops: stopIds2.map(id => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean),
                              stopIds: stopIds2,
                              boardAt: s2.name,
                              alightAt: pts.stop.name,
                              numStops: idx2_end - j,
                              direction: r2DirName
                            };

                            // Validate leg 1 polyline progress
                            const legCoords1 = getLegCoords(leg1);
                            if (legCoords1.length < 2) continue;
                            const progressBoard1 = getProgressOnPolyline([pfs.stop.lat, pfs.stop.lng], legCoords1);
                            const progressAlight1 = getProgressOnPolyline([s1.lat, s1.lng], legCoords1);
                            if (progressBoard1 >= progressAlight1) continue;

                            // Validate leg 2 polyline progress
                            const legCoords2 = getLegCoords(leg2);
                            if (legCoords2.length < 2) continue;
                            const progressBoard2 = getProgressOnPolyline([s2.lat, s2.lng], legCoords2);
                            const progressAlight2 = getProgressOnPolyline([pts.stop.lat, pts.stop.lng], legCoords2);
                            if (progressBoard2 >= progressAlight2) continue;

                            // If both legs are valid, add the trip
                            evaluateTrip([
                              leg1,
                              dist > 30 ? { isWalking: true, boardAt: s1.name, alightAt: s2.name, walkingDist: dist, walkingTime: walkTime, numStops: 0 } : null,
                              leg2
                            ].filter(Boolean), pfs.walkDist, pfs.walkTime, pfs.stop.name, pts.walkDist, pts.walkTime, pfs.stop.name, stopIds2.length - 1);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        const sortedCandidates = candidates
          .filter(c => !!c)
          .sort((a, b) => a.score - b.score);

        console.log('✅ Kandidatë të gjetura:', sortedCandidates.length, sortedCandidates.slice(0, 2));

        const topOptions = sortedCandidates.slice(0, 4).map((option, index) => ({ ...option, optionIndex: index + 1 }));
        const selected = topOptions[0] || null;

        console.log('🎯 Ruga e zgjedhur:', selected);

        set({
          tripResult: selected,
          tripOptions: topOptions,
          selectedTripOptionIndex: 0,
          activeTrip: selected,
          showRoutes: true,
          showBuses: true
        });
      },

      isSplashFinished: false,
      setSplashFinished: (val: boolean) => set({ isSplashFinished: val }),

      // ── Notifications ──
      notifications: [],
      addNotification: (msg: string, type = 'info') => {
        const id = Date.now() + Math.random(); // Sigurohemi që ID është unike
        set((state: any) => ({ notifications: [...state.notifications, { id, msg, type }] }));
      },
      removeNotification: (id: number) => {
        set((state: any) => ({
          notifications: state.notifications.filter((n: any) => n.id !== id)
        }));
      },

      // ── Saved Routes ──
      savedRoutes: [],
      saveRoute: (route: any) => set((state: any) => ({
        savedRoutes: state.savedRoutes.find((r: any) => r.id === route.id)
          ? state.savedRoutes
          : [...state.savedRoutes, route]
      })),
      removeSavedRoute: (routeId: string) => set((state: any) => ({
        savedRoutes: state.savedRoutes.filter((r: any) => r.id !== routeId)
      })),

      // ── Filter ──
      activeFilter: 'all',
      setActiveFilter: (f: string) => set({ activeFilter: f }),
      searchQuery: '',
      setSearchQuery: (q: string) => set({ searchQuery: q }),
    }),
    {
      name: 'urbani-im-storage-v2',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => ![
          'searchQuery',
          'tripFrom',
          'tripTo',
          'tripResult',
          'tripOptions',
          'selectedTripOptionIndex',
          'activeTrip',
          'selectedStop',
          'activeRouteFilter',
          'currentView',
          'isSidebarOpen'
        ].includes(key))
      ),
    }
  )
);

export default useStore;