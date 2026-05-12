import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUS_STOPS, BUS_ROUTES } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';
export { BUS_STOPS, BUS_ROUTES };

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
            await fetch('/api/user/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...data }),
            });
          } catch (error) {
            console.error('Failed to sync profile with MongoDB', error);
          }
        }
      },

      // ── Language ──
      language: 'al',
      setLanguage: (lang: string) => set({ language: lang }),

      // ── Navigation ──
      currentView: 'map',
      isSidebarOpen: false,
      checkoutPackage: null,
      setView: (v: any) => set({ currentView: v, isSidebarOpen: false }),
      setCheckoutPackage: (pkg: any) => set({ checkoutPackage: pkg, currentView: 'checkout' }),
      toggleSidebar: () => set((state: any) => ({ isSidebarOpen: !state.isSidebarOpen })),
      // ── Map Settings ──
      showStops: true,
      showRoutes: true,
      showBuses: true,
      setShowStops: (val: boolean) => set({ showStops: val }),
      setShowRoutes: (val: boolean) => set({ showRoutes: val }),
      setShowBuses: (val: boolean) => set({ showBuses: val }),

      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

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
      setUserLocation: (loc: { lat: number, lng: number }) => set({ userLocation: loc }),
      fetchBuses: async () => {
        try {
          const res = await fetch('/api/buses');
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
      fetchUserLocation: () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
          (err) => console.error(err)
        );
      },
      watchId: null as number | null,
      startTracking: () => {
        if (!navigator.geolocation || get().watchId) return;
        const id = navigator.geolocation.watchPosition(
          (pos) => set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
          (err) => console.error(err),
          { enableHighAccuracy: true }
        );
        set({ watchId: id });
      },
      stopTracking: () => {
        const { watchId } = get();
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
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
            ticks: ticks
          };
        });
        set({ buses: updated });
      },

      // ── Trip Planner ──
      tripResult: null,
      activeTrip: null,
      tripOriginCoords: null as { lat: number, lng: number } | null,
      setTripOriginCoords: (coords: any) => set({ tripOriginCoords: coords }),
      setActiveTrip: (trip: any) => set({ activeTrip: trip }),
      tripFrom: '',
      tripTo: '',
      setTripFrom: (v: any) => set({ tripFrom: v }),
      setTripTo: (v: any) => set({ tripTo: v }),
      setTripResult: (v: any) => set({ tripResult: v }),
      planTrip: async (fromName: string, toName: string) => {
        const { tripOriginCoords } = get();
        const searchTo = toName.trim().toLowerCase();
        const searchFrom = fromName.trim().toLowerCase();

        const toStops = BUS_STOPS.filter(s => s.name.toLowerCase().trim() === searchTo);
        if (!toStops.length) {
          set({ tripResult: { error: 'Stacioni i destinacionit nuk u gjet.' }, activeTrip: null });
          return;
        }

        let possibleFromStops: { stop: any, walkDist: number, walkTime: number }[] = [];
        const isMyLocation = searchFrom.includes('vendndodhja') || searchFrom.includes('my location') || searchFrom.includes('📍');

        if (isMyLocation && tripOriginCoords) {
          const distances = BUS_STOPS.map(s => {
            const R = 6371e3;
            const dLat = (s.lat - tripOriginCoords.lat) * Math.PI / 180;
            const dLng = (s.lng - tripOriginCoords.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(tripOriginCoords.lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
            return { stop: s, dist };
          });

          // Increase to 10 nearest stops to find more route possibilities
          const nearby = distances.filter(d => d.dist < 2000).sort((a, b) => a.dist - b.dist).slice(0, 10);
          if (!nearby.length) {
            set({ tripResult: { error: 'Nuk ka stacione afër vendndodhjes tuaj.' }, activeTrip: null });
            return;
          }

          try {
            const coords = [`${tripOriginCoords.lng},${tripOriginCoords.lat}`, ...nearby.map(n => `${n.stop.lng},${n.stop.lat}`)];
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
        } else {
          const searchName = fromName.trim().toLowerCase();
          const stops = BUS_STOPS.filter(s => s.name.toLowerCase().trim() === searchName);
          if (!stops.length) {
            set({ tripResult: { error: 'Stacioni i nisjes nuk u gjet.' }, activeTrip: null });
            return;
          }
          possibleFromStops = stops.map(s => ({ stop: s, walkDist: 0, walkTime: 0 }));
        }



        let bestTrip: any = null;
        let bestScore = Infinity;

        const evaluateTrip = (legs: any[], initialWalkDist: number, initialWalkTime: number, actualFromStopName: string) => {
          const busLegs = legs.filter(l => l.route);
          const totalStops = legs.reduce((acc, leg) => acc + (leg.numStops || 0), 0);
          const walkTimeTransfer = legs.reduce((acc, leg) => acc + (leg.walkingTime || 0), 0);
          const totalWalkDist = initialWalkDist + legs.reduce((acc, leg) => acc + (leg.walkingDist || 0), 0);

          // Weighted score: Transfers are expensive (15 min penalty), each stop is 2 mins, each min of walking is 1.5 units
          const transferPenalty = Math.max(0, busLegs.length - 1) * 15;
          const totalTime = initialWalkTime + (totalStops * 2) + walkTimeTransfer + transferPenalty;
          const score = (totalWalkDist / 100) + totalTime;

          if (score < bestScore) {
            bestScore = score;
            bestTrip = {
              from: fromName, to: toName, actualFrom: actualFromStopName,
              walkingDist: initialWalkDist, walkingTime: initialWalkTime,
              totalStops, transfers: Math.max(0, busLegs.length - 1),
              legs, travelTime: Math.round(totalTime - transferPenalty + (busLegs.length > 1 ? 5 : 0)), // Estimated real time
              totalPrice: busLegs.length * 40
            };
          }
        };

        for (const pfs of possibleFromStops) {
          const { stop: fStop, walkDist, walkTime } = pfs;

          for (const route1 of BUS_ROUTES) {
            const r1Paths = [route1.stops, route1.returnStops].filter(Boolean) as string[][];
            for (const r1Arr of r1Paths) {
              const fi = r1Arr.indexOf(fStop.id);
              if (fi === -1) continue;

              // 1. Direct route
              for (const tStop of toStops) {
                const ti = r1Arr.indexOf(tStop.id);
                if (ti !== -1 && fi < ti) {
                  const stopIds = r1Arr.slice(fi, ti + 1);
                  const stops = stopIds.map(id => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean);
                  evaluateTrip([{ route: route1, stops, stopIds, boardAt: fStop.name, alightAt: tStop.name, numStops: ti - fi }], walkDist, walkTime, fStop.name);
                }
              }

              // 2. Transfer (1 change)
              for (const route2 of BUS_ROUTES) {
                if (route1.id === route2.id) continue;
                const r2Paths = [route2.stops, route2.returnStops].filter(Boolean) as string[][];
                for (const r2Arr of r2Paths) {
                  for (const tStop of toStops) {
                    const ti = r2Arr.indexOf(tStop.id);
                    if (ti === -1) continue;

                    // Check every stop on route1 after fi for potential transfer to route2 before ti
                    for (let i = fi + 1; i < r1Arr.length; i++) {
                      const s1 = BUS_STOPS.find(s => s.id === r1Arr[i]);
                      if (!s1) continue;

                      for (let j = 0; j < ti; j++) {
                        const s2 = BUS_STOPS.find(s => s.id === r2Arr[j]);
                        if (!s2) continue;

                        const dist = s1.id === s2.id ? 0 : Math.sqrt(Math.pow(s1.lat - s2.lat, 2) + Math.pow(s1.lng - s2.lng, 2)) * 111320;
                        if (dist < 400) { // Max 400m transfer walk
                          const stopIds1 = r1Arr.slice(fi, i + 1);
                          const stopIds2 = r2Arr.slice(j, ti + 1);
                          const legs = [
                            { route: route1, stops: stopIds1.map(id => BUS_STOPS.find(s => s.id === id)?.name), stopIds: stopIds1, boardAt: fStop.name, alightAt: s1.name, numStops: i - fi },
                            { isWalking: dist > 30, boardAt: s1.name, alightAt: s2.name, walkingDist: Math.round(dist), walkingTime: Math.ceil(dist / 80), numStops: 0 },
                            { route: route2, stops: stopIds2.map(id => BUS_STOPS.find(s => s.id === id)?.name), stopIds: stopIds2, boardAt: s2.name, alightAt: tStop.name, numStops: ti - j }
                          ].filter(l => !l.isWalking || (l.walkingDist && l.walkingDist > 30));


                          evaluateTrip(legs, walkDist, walkTime, fStop.name);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        const result = bestTrip || { error: 'Nuk u gjet rrugë e përshtatshme. Provo stacione të tjera.' };
        set({
          tripResult: result,
          activeTrip: bestTrip ? result : null,
          showRoutes: true,
          showBuses: true
        });
      },



      // ── Notifications ──
      notifications: [],
      addNotification: (msg: string, type = 'info') => {
        const id = Date.now();
        set((state: any) => ({ notifications: [...state.notifications, { id, msg, type }] }));
        setTimeout(() => set((state: any) => ({
          notifications: state.notifications.filter((n: any) => n.id !== id)
        })), 4500);
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