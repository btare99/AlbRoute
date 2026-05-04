import { create } from 'zustand';
import { BUS_STOPS, BUS_ROUTES } from '../constants/busData';

// ─── INITIAL BUS GENERATION ──────────────────────────────────────────────────
const createBuses = () => {
  const buses: any[] = [];
  BUS_ROUTES.forEach((route) => {
    const numBuses = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBuses; i++) {
      const direction = Math.random() > 0.5 ? 'forward' : 'return';
      const stopIds = direction === 'forward' ? route.stops : (route.returnStops || route.stops);
      const stopIdx = Math.floor(Math.random() * stopIds.length);
      const stopId = stopIds[stopIdx];
      const stop = BUS_STOPS.find(s => s.id === stopId) || BUS_STOPS[0];

      buses.push({
        id: `bus-${route.id}-${i}`,
        routeId: route.id,
        routeName: route.name,
        lat: stop.lat + (Math.random() - 0.5) * 0.0008,
        lng: stop.lng + (Math.random() - 0.5) * 0.0008,
        currentStopIdx: stopIdx,
        direction: direction,
        speed: 18 + Math.random() * 22,
        passengerLoad: Math.floor(Math.random() * 50),
        nextStop: BUS_STOPS.find(s => s.id === stopIds[Math.min(stopIdx + 1, stopIds.length - 1)])?.name || '',
        delay: Math.floor(Math.random() * 5),
        lastUpdate: Date.now(),
      });
    }
  });
  return buses;
};

// ─── STORE ───────────────────────────────────────────────────────────────────
const useStore = create((set: any, get: any) => ({
  // ── Auth ──
  user: { name: 'Admin', email: 'admin@busal.al', avatar: null },
  isAuthenticated: true,
  token: 'dev-token',
  login: (userData: any, token: any) => set({ user: userData, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null, currentView: 'login' }),
  updateProfile: (data: any) => set((state: any) => ({ user: { ...state.user, ...data } })),

  // ── Language ──
  language: 'al',
  setLanguage: (lang: string) => set({ language: lang }),

  // ── Navigation ──
  currentView: 'map',
  isSidebarOpen: false,
  setView: (v: any) => set({ currentView: v, isSidebarOpen: false }),
  toggleSidebar: () => set((state: any) => ({ isSidebarOpen: !state.isSidebarOpen })),
  // ── Map Settings ──
  showStops: true,
  showRoutes: true,
  showBuses: true,
  setShowStops: (val: boolean) => set({ showStops: val }),
  setShowRoutes: (val: boolean) => set({ showRoutes: val }),
  setShowBuses: (val: boolean) => set({ showBuses: val }),

  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  // ── Buses ──
  buses: createBuses(),
  selectedBus: null,
  selectedRoute: null,
  userLocation: { lat: 41.3275, lng: 19.8187 },
  setUserLocation: (loc: { lat: number, lng: number }) => set({ userLocation: loc }),
  fetchUserLocation: () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set({
          userLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
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
      const route = BUS_ROUTES.find(r => r.id === bus.routeId);
      if (!route) return bus;

      // Përcakto listën e stacioneve bazuar në drejtimin
      const stopIds = (bus.direction === 1 || !route.returnStops) ? route.stops : route.returnStops;
      const stops = stopIds.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean);

      const nextIdx = bus.currentStopIdx + 1;

      // Nëse arriti në fund të njërës rrugë, kthehu në fillim të rrugës tjetër
      if (nextIdx >= (stops as any[]).length) {
        return {
          ...bus,
          currentStopIdx: 0,
          direction: bus.direction === 1 ? -1 : 1,
          lastUpdate: Date.now()
        };
      }

      const target = (stops as any[])[nextIdx];
      if (!target) return bus;

      // Logjika e Trafikut: Kontrollo nese autobuzi eshte ne nje zone trafiku
      let speedMultiplier = 1.0;
      trafficZones.forEach((zone: any) => {
        const distToZone = Math.sqrt(Math.pow(bus.lat - zone.lat, 2) + Math.pow(bus.lng - zone.lng, 2));
        if (distToZone < zone.radius) {
          speedMultiplier = 1.0 - zone.intensity;
        }
      });

      const dlat = target.lat - bus.lat;
      const dlng = target.lng - bus.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);

      if (dist < 0.0003) {
        const arrivalIdx = nextIdx;

        // Simulimi i pasagjereve: Shto/Hiq pasagjere ne stacion
        let newLoad = bus.passengerLoad + (Math.floor(Math.random() * 11) - 5);
        if (isPeakHour) newLoad += Math.floor(Math.random() * 8); // Me shume njerez ne pik
        newLoad = Math.max(2, Math.min(50, newLoad));

        return {
          ...bus,
          currentStopIdx: arrivalIdx,
          lat: target.lat,
          lng: target.lng,
          passengerLoad: newLoad,
          delay: speedMultiplier < 0.5 ? (bus.delay + 1) : Math.max(0, bus.delay - 1),
          nextStop: (stops as any[])[Math.min(arrivalIdx + 1, (stops as any[]).length - 1)]?.name || '',
          lastUpdate: Date.now(),
        };
      }

      // Levizja me shpejtesi te ndryshueshme nga trafiku
      const baseStep = 0.00018;
      const actualStep = baseStep * speedMultiplier;

      return {
        ...bus,
        lat: bus.lat + (dlat / dist) * actualStep,
        lng: bus.lng + (dlng / dist) * actualStep,
        speed: 40 * speedMultiplier * (0.8 + Math.random() * 0.4), // km/h vizuale
      };
    });
    set({ buses: updated });
  },

  // ── Trip Planner ──
  tripResult: null,
  activeTrip: null,
  setActiveTrip: (trip: any) => set({ activeTrip: trip }),
  tripFrom: '',
  tripTo: '',
  setTripFrom: (v: any) => set({ tripFrom: v }),
  setTripTo: (v: any) => set({ tripTo: v }),
  planTrip: (fromName: string, toName: string) => {
    const from = BUS_STOPS.find(s => s.name.toLowerCase().includes(fromName.toLowerCase()));
    const to = BUS_STOPS.find(s => s.name.toLowerCase().includes(toName.toLowerCase()));
    if (!from || !to) {
      set({ tripResult: { error: 'Stacioni nuk u gjet. Provo me emër tjetër.' } });
      return;
    }

    // Kërko linjë direkte
    let legs: any[] = [];
    for (const route of BUS_ROUTES) {
      const fi = route.stops.indexOf(from.id);
      const ti = route.stops.indexOf(to.id);
      if (fi !== -1 && ti !== -1) {
        const stopsInBetween = route.stops.slice(Math.min(fi, ti), Math.max(fi, ti) + 1)
          .map(id => BUS_STOPS.find(s => s.id === id)?.name)
          .filter(Boolean);
        legs = [{
          route,
          stops: stopsInBetween,
          boardAt: from.name,
          alightAt: to.name,
          numStops: Math.abs(ti - fi),
        }];
        break;
      }
    }

    // Nëse nuk ka direkte, kërko me ndërrim (transfer)
    if (!legs.length) {
      for (const route1 of BUS_ROUTES) {
        const fi = route1.stops.indexOf(from.id);
        if (fi === -1) continue;
        for (const route2 of BUS_ROUTES) {
          if (route1.id === route2.id) continue;
          const ti = route2.stops.indexOf(to.id);
          if (ti === -1) continue;
          // Gjej stacion ndërrimi të përbashkët
          const transfer = route1.stops.find(id => route2.stops.includes(id) && id !== from.id && id !== to.id);
          if (transfer) {
            const transferStop = BUS_STOPS.find(s => s.id === transfer);
            legs = [
              { route: route1, boardAt: from.name, alightAt: transferStop?.name || transfer, transfer: true },
              { route: route2, boardAt: transferStop?.name || transfer, alightAt: to.name, transfer: false },
            ];
            break;
          }
        }
        if (legs.length) break;
      }
    }

    const travelTime = legs.length === 1
      ? (legs[0].numStops || 3) * 4
      : legs.length === 2 ? 30 : 20;

    set({
      tripResult: legs.length
        ? { from: from.name, to: to.name, legs, travelTime, totalPrice: legs.length > 1 ? 80 : 40 }
        : { error: 'Nuk u gjet rrugë. Provo destinacion tjetër.' }
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
}));

export default useStore;