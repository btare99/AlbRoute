import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUS_STOPS, BUS_ROUTES } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';
export { BUS_STOPS, BUS_ROUTES };

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type StaffRole = 'dispatcher' | 'operator' | 'driver' | 'inspector';

export interface StaffAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: StaffRole;
  routeId?: string;
  phone?: string;
  shift?: string;
  weeklyProgram?: any;
  status: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: number;
  details: string;
}

// ─── INITIAL ACCOUNTS ────────────────────────────────────────────────────────
const initialAccounts: StaffAccount[] = [
  {
    id: 'admin_1',
    name: 'Admin Kryesor',
    username: 'admin@urbani.al',
    pin: '1234',
    role: 'dispatcher',
    status: 'Aktiv',
    createdAt: Date.now(),
  },
];

// ─── ADMIN DATA ──────────────────────────────────────────────────────────────
let adminDrivers: any[] = [];
let adminInspectors: any[] = [];
let adminBuses: any[] = [];

// Data will be populated manually via Dispatcher account creation

// ─── INITIAL BUS GENERATION ──────────────────────────────────────────────────
const createBuses = () => {
  const buses: any[] = [];
  adminBuses.forEach((adminBus) => {
    if (adminBus.status !== 'Aktiv') return;
    const route = BUS_ROUTES.find(r => r.id === adminBus.routeId);
    if (!route) return;

    const isReturn = Math.random() > 0.5;
    const direction = isReturn ? 'return' : 'forward';
    const shapeKey = isReturn ? `${route.id}_1` : `${route.id}_0`;

    let coords = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
    if (coords.length === 0 && !isReturn) coords = BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] || [];

    if (coords.length === 0) {
      const sIds = isReturn ? (route.returnStops || route.stops) : route.stops;
      coords = sIds.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean).map(s => [s!.lat, s!.lng]) as [number, number][];
    }

    if (coords.length < 2) return;

    const pointIdx = Math.floor(Math.random() * (coords.length - 1));
    const pos = coords[pointIdx];

    buses.push({
      id: adminBus.id, // Targa
      routeId: route.id,
      routeName: route.name,
      routeLabel: route.label,
      routeColor: route.color,
      driverId: adminBus.driverId,
      inspectorId: adminBus.inspectorId,
      lat: pos[0],
      lng: pos[1],
      currentPointIdx: pointIdx,
      direction: direction,
      speed: 18 + Math.random() * 22,
      passengerLoad: Math.floor(Math.random() * 50),
      nextStop: route.stops[0] ? BUS_STOPS.find(s => s.id === route.stops[0])?.name : '',
      delay: Math.floor(Math.random() * 5),
      lastUpdate: Date.now(),
      ticks: Math.floor(Math.random() * 30),
    });
  });
  return buses;
};

// ─── STORE ───────────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set: any, get: any) => ({
      // ── Staff Accounts ──
      staffAccounts: initialAccounts as StaffAccount[],

      // Idempotent: if an account with the same id already exists, update it; otherwise append.
      addStaffAccount: (account: StaffAccount) =>
        set((s: any) => {
          const exists = s.staffAccounts.some((a: StaffAccount) => a.id === account.id);
          const updatedAccounts = exists
            ? s.staffAccounts.map((a: StaffAccount) => a.id === account.id ? { ...a, ...account } : a)
            : [...s.staffAccounts, account];

          // Keep adminDrivers/adminInspectors in sync (only add if new)
          let updatedDrivers = [...s.adminDrivers];
          let updatedInspectors = [...s.adminInspectors];

          if (!exists) {
            if (account.role === 'driver') {
              updatedDrivers.push({
                id: account.id,
                name: account.name,
                phone: account.phone || '',
                routeId: account.routeId,
                shift: account.shift || 'Mëngjes (05:00 - 13:00)',
                status: account.status || 'Aktiv',
                personalId: account.username,
                weeklyProgram: account.weeklyProgram || null,
              });
            } else if (account.role === 'inspector') {
              updatedInspectors.push({
                id: account.id,
                name: account.name,
                phone: account.phone || '',
                routeId: account.routeId,
                status: account.status || 'Në Linjë',
                personalId: account.username,
                weeklyProgram: account.weeklyProgram || null,
              });
            }
          }

          return {
            staffAccounts: updatedAccounts,
            adminDrivers: updatedDrivers,
            adminInspectors: updatedInspectors,
          };
        }),
      updateStaffAccount: (id: string, data: Partial<StaffAccount>) =>
        set((s: any) => ({
          staffAccounts: s.staffAccounts.map((a: StaffAccount) => a.id === id ? { ...a, ...data } : a),
          adminDrivers: s.adminDrivers.map((d: any) => d.id === id ? { ...d, ...data } : d),
          adminInspectors: s.adminInspectors.map((i: any) => i.id === id ? { ...i, ...data } : i),
        })),
      deleteStaffAccount: async (id: string) => {
        const state = get();
        const account = state.staffAccounts.find((a: StaffAccount) => a.id === id);
        if (!account) return false;

        const shouldDeleteFromDb = account.role !== 'dispatcher';
        if (shouldDeleteFromDb) {
          const query = new URLSearchParams({
            id: account.id,
            role: account.role,
            routeId: account.routeId || 'Global'
          }).toString();

          try {
            const res = await fetch(`/api/admin/staff?${query}`, { method: 'DELETE' });
            if (!res.ok) {
              console.error('Failed to delete staff from MongoDB', await res.text());
              return false;
            }
          } catch (error) {
            console.error('Failed to delete staff from MongoDB', error);
            return false;
          }
        }

        set((s: any) => ({
          staffAccounts: s.staffAccounts.filter((a: StaffAccount) => a.id !== id),
          adminDrivers: s.adminDrivers.filter((d: any) => d.id !== id),
          adminInspectors: s.adminInspectors.filter((i: any) => i.id !== id),
        }));
        return true;
      },

      // ── Auth ──
      currentAccount: null as StaffAccount | null,
      isAuthenticated: false,
      auditLogs: [] as AuditLog[],
      user: null,
      staffUser: null,
      isDispatcher: false,
      token: null,

      /**
       * loginWithAccount — used for hardcoded dispatcher accounts only.
       * Pass the full account object directly (no DB lookup needed).
       */
      loginWithAccount: (username: string, pin: string, directAccount?: StaffAccount): boolean => {
        // If a direct account is provided (hardcoded dispatcher), use it immediately
        if (directAccount) {
          set({
            currentAccount: directAccount,
            isAuthenticated: true,
            isDispatcher: directAccount.role === 'dispatcher',
            user: { id: directAccount.id, name: directAccount.name, email: directAccount.username },
            staffUser: null,
            token: 'session-token',
          });
          return true;
        }
        // Fallback: search local staffAccounts (for accounts created during this session)
        const accounts: StaffAccount[] = get().staffAccounts;
        const account = accounts.find(
          (a) => a.username === username && a.pin === pin &&
            (a.status?.toLowerCase() === 'active' || a.status?.toLowerCase() === 'aktiv')
        );
        if (!account) return false;
        const isDispOrOp = account.role === 'dispatcher' || account.role === 'operator';
        set({
          currentAccount: account,
          isAuthenticated: true,
          isDispatcher: account.role === 'dispatcher',
          user: isDispOrOp ? { id: account.id, name: account.name, email: account.username } : null,
          staffUser: !isDispOrOp ? { id: account.id, name: account.name, type: account.role, routeId: account.routeId } : null,
          token: 'session-token',
        });
        return true;
      },

      /**
       * loginFromDb — used when the user has been authenticated via the
       * /api/admin/auth API route (DB-backed). This is the primary login path
       * for all non-hardcoded accounts (operators, drivers, inspectors).
       */
      loginFromDb: (dbUser: {
        id: string; name: string; username: string; pin: string;
        role: StaffRole; routeId?: string; weeklyProgram?: any; status: string;
      }) => {
        // Normalize routeId: strip leading 'L' prefix (BUS_ROUTES use 'L1A' but DB stores '1A')
        const rawRoute = dbUser.routeId || '';
        const normalizedRouteId = rawRoute.startsWith('L') ? rawRoute.substring(1) : rawRoute;

        const account: StaffAccount = {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          pin: dbUser.pin,
          role: dbUser.role,
          routeId: normalizedRouteId || undefined,
          weeklyProgram: dbUser.weeklyProgram,
          status: dbUser.status,
          createdAt: Date.now(),
        };
        const isDispOrOp = dbUser.role === 'dispatcher' || dbUser.role === 'operator';
        set({
          currentAccount: account,
          isAuthenticated: true,
          isDispatcher: dbUser.role === 'dispatcher',
          user: isDispOrOp ? { id: dbUser.id, name: dbUser.name, email: dbUser.username } : null,
          staffUser: !isDispOrOp ? { id: dbUser.id, name: dbUser.name, type: dbUser.role, routeId: normalizedRouteId } : null,
          token: 'session-token',
        });
      },

      logout: () => set({
        user: null,
        staffUser: null,
        currentAccount: null,
        isAuthenticated: false,
        isDispatcher: false,
        token: null,
      }),
      updateProfile: (data: any) => set((state: any) => ({ user: { ...state.user, ...data } })),

      addLog: (action: string, details: string) => {
        const { currentAccount, user } = get();
        const actor = currentAccount || user;
        if (!actor) return;
        const newLog: AuditLog = {
          id: `log_${Date.now()}`,
          userId: actor.id || 'admin',
          userName: actor.name,
          action,
          timestamp: Date.now(),
          details
        };
        set((state: any) => ({ auditLogs: [newLog, ...(state.auditLogs || [])].slice(0, 100) }));
      },

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

      // ── Admin Data ──
      adminDrivers,
      adminInspectors,
      adminBuses,
      setAdminDrivers: (drivers: any[]) => set({ adminDrivers: drivers }),
      setAdminInspectors: (inspectors: any[]) => set({ adminInspectors: inspectors }),
      setAdminBuses: (buses: any[]) => set({ adminBuses: buses }),
      fetchAdminDrivers: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=driver');
          if (!res.ok) return;
          const drivers = await res.json();
          if (!Array.isArray(drivers)) return;
          const normalized = drivers.map((d: any) => ({ ...d, id: d.id || d._id?.toString() }));
          set({ adminDrivers: normalized });
          // Sync into staffAccounts (idempotent — addStaffAccount deduplicates by id)
          const { addStaffAccount } = get();
          normalized.forEach((driver: any) => {
            if (!driver.id) return;
            addStaffAccount({
              id: driver.id,
              name: driver.name,
              username: driver.username || driver.personalId || driver.id,
              pin: driver.pin || '1234',
              role: 'driver',
              routeId: driver.routeId,
              weeklyProgram: driver.weeklyProgram || {},
              bussAssigned: driver.assignedBusPlate || driver.assignedBusId || '',
              status: driver.status || 'Aktiv',
              createdAt: Date.now(),
            });
          });
        } catch (error) {
          console.error('Failed to fetch drivers', error);
        }
      },
      fetchAdminInspectors: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=inspector');
          if (!res.ok) return;
          const inspectors = await res.json();
          if (!Array.isArray(inspectors)) return;
          const normalized = inspectors.map((i: any) => ({ ...i, id: i.id || i._id?.toString() }));
          set({ adminInspectors: normalized });
          // Sync into staffAccounts (idempotent — addStaffAccount deduplicates by id)
          const { addStaffAccount } = get();
          normalized.forEach((inspector: any) => {
            if (!inspector.id) return;
            addStaffAccount({
              id: inspector.id,
              name: inspector.name,
              username: inspector.username || inspector.personalId || inspector.id,
              pin: inspector.pin || '1234',
              role: 'inspector',
              routeId: inspector.routeId,
              weeklyProgram: inspector.weeklyProgram || {},
              bussAssigned: inspector.assignedBusPlate || inspector.assignedBusId || '',
              status: inspector.status || 'Aktiv',
              createdAt: Date.now(),
            });
          });
        } catch (error) {
          console.error('Failed to fetch inspectors', error);
        }
      },
      // Fetches operator accounts from MongoDB and syncs into staffAccounts
      fetchAdminOperators: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=operator');
          if (!res.ok) return;
          const operators = await res.json();
          if (!Array.isArray(operators)) return;
          const { addStaffAccount } = get();
          operators.forEach((op: any) => {
            if (!op.id) return;
            addStaffAccount({
              id: op.id,
              name: op.name,
              username: op.username || op.personalId || op.id,
              pin: op.pin || '1234',
              role: 'operator',
              routeId: op.routeId,
              status: op.status || 'Aktiv',
              createdAt: Date.now(),
            });
          });
        } catch (error) {
          console.error('Failed to fetch operators', error);
        }
      },
      fetchAdminBuses: async () => {
        try {
          const res = await fetch('/api/admin/buses');
          const buses = await res.json();
          if (Array.isArray(buses)) {
            set({ adminBuses: buses });
          } else {
            console.error('Buses API returned non-array', buses);
          }
        } catch (error) {
          console.error('Failed to fetch buses', error);
        }
      },
      clearAllBuses: () => {
        set({ adminBuses: [], buses: [] });
        get().addLog('Reset Flote', 'Të gjithë autobusët u fshinë nga sistemi.');
      },
      clearRouteBuses: async (routeId: string) => {
        set((state: any) => ({
          adminBuses: state.adminBuses.filter((b: any) => b.routeId !== routeId),
          buses: state.buses.filter((b: any) => b.routeId !== routeId)
        }));
        // Delete from MongoDB
        try {
          const buses = get().adminBuses.filter((b: any) => b.routeId === routeId);
          for (const bus of buses) {
            await fetch(`/api/admin/buses?id=${bus.id}`, { method: 'DELETE' });
          }
        } catch (error) {
          console.error('Failed to delete buses from MongoDB', error);
        }
        get().addLog('Pastrim Linje', `Të gjithë autobusët e linjës ${routeId} u fshinë.`);
      },
      // Syncs adminBuses into the simulation buses array.
      // Uses local state to determine existence (avoids broken ?id= GET query).
      syncBusesWithAdmin: async () => {
        const { adminBuses, buses: currentBuses } = get();
        const newBuses: any[] = [];
        for (const adminBus of adminBuses) {
          if (adminBus.status !== 'Aktiv') continue;
          try {
            // Check local simulation state first
            const existingSimBus = currentBuses.find((b: any) => b.id === adminBus.id);
            if (existingSimBus) {
              newBuses.push({
                ...existingSimBus,
                routeId: adminBus.routeId,
                driverId: adminBus.driverId,
                inspectorId: adminBus.inspectorId,
              });
              continue;
            }
            
            // Fetch from API
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
            // Automated generation removed
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
          const res = await fetch('/api/admin/buses');
          const buses = await res.json();
          set({ buses });
        } catch (error) {
          console.error('Failed to fetch buses', error);
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
              buses: state.buses.map((b: any) => b.id === updatedBus.id ? updatedBus : b)
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
          (err) => console.error(err),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
        );
      },
      watchId: null as number | null,
      startTracking: () => {
        if (!navigator.geolocation || get().watchId) return;
        const id = navigator.geolocation.watchPosition(
          (pos) => set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
          (err) => console.error(err),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
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

          const nextPointIdx = bus.currentPointIdx + 1;

          // Arriti në fund të shape-it
          if (nextPointIdx >= coords.length) {
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
      planTrip: async (fromName: string, toName: string) => {
        const { tripOriginCoords } = get();
        const toStops = BUS_STOPS.filter(s => s.name.toLowerCase() === toName.toLowerCase());

        if (!toStops.length) {
          set({ tripResult: { error: 'Stacioni i destinacionit nuk u gjet.' } });
          return;
        }

        let possibleFromStops: { stop: any, walkDist: number, walkTime: number }[] = [];

        if (fromName === '📍 Vendndodhja Ime' && tripOriginCoords) {
          // Gjej 5 stacionet më të afërta (vije ajrore) brenda 1.5km
          const distances = BUS_STOPS.map(s => {
            const R = 6371e3;
            const φ1 = tripOriginCoords.lat * Math.PI / 180, φ2 = s.lat * Math.PI / 180;
            const Δφ = (s.lat - tripOriginCoords.lat) * Math.PI / 180, Δλ = (s.lng - tripOriginCoords.lng) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            return { stop: s, dist: Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) };
          });

          const nearby = distances.filter(d => d.dist < 1500).sort((a, b) => a.dist - b.dist).slice(0, 5);

          if (!nearby.length) {
            set({ tripResult: { error: 'Nuk ka stacione afër vendndodhjes tuaj.' } });
            return;
          }

          // Kërko distancat reale të ecjes nga OSRM
          const coords = [`${tripOriginCoords.lng},${tripOriginCoords.lat}`];
          nearby.forEach(n => coords.push(`${n.stop.lng},${n.stop.lat}`));

          try {
            const res = await fetch(`https://router.project-osrm.org/table/v1/foot/${coords.join(';')}?sources=0&annotations=distance,duration`);
            const data = await res.json();
            if (data.code === 'Ok') {
              possibleFromStops = nearby.map((n, i) => {
                const trueDist = data.distances[0][i + 1];
                const trueDur = Math.ceil(data.durations[0][i + 1] / 60);
                return { stop: n.stop, walkDist: Math.round(trueDist), walkTime: trueDur };
              });
            } else { throw new Error('OSRM API failed'); }
          } catch (err) {
            console.error('OSRM foot fallback to Haversine', err);
            possibleFromStops = nearby.map(n => ({ stop: n.stop, walkDist: n.dist, walkTime: Math.ceil(n.dist / 80) }));
          }
        } else {
          const stops = BUS_STOPS.filter(s => s.name.toLowerCase() === fromName.toLowerCase());
          if (!stops.length) {
            set({ tripResult: { error: 'Stacioni i nisjes nuk u gjet.' } });
            return;
          }
          possibleFromStops = stops.map(s => ({ stop: s, walkDist: 0, walkTime: 0 }));
        }

        let bestTrip: any = null;
        let bestScore = Infinity;

        // Funksion për të ruajtur udhëtimin më të mirë (me kohën më të shkurtër)
        const evaluateTrip = (legs: any[], initialWalkDist: number, initialWalkTime: number, actualFromStopName: string) => {
          const totalStops = legs.reduce((acc, leg) => acc + (leg.numStops || 0), 0);
          const busTime = totalStops * 3 + (legs.filter(l => l.route).length > 1 ? 10 : 0);
          const walkTimeTransfer = legs.reduce((acc, leg) => acc + (leg.walkingTime || 0), 0);
          const totalTime = initialWalkTime + busTime + walkTimeTransfer;

          if (totalTime < bestScore) {
            bestScore = totalTime;
            bestTrip = {
              from: fromName,
              to: toName,
              actualFrom: actualFromStopName,
              walkingDist: initialWalkDist,
              walkingTime: initialWalkTime,
              totalStops,
              transfers: legs.filter(l => l.route).length - 1,
              legs,
              travelTime: totalTime,
              totalPrice: legs.filter(l => l.route).length * 40
            };
          }
        };

        // Për çdo stacion të mundshëm nisjeje, gjej të gjitha rrugët dhe vlerësoji
        for (const pfs of possibleFromStops) {
          const { stop: fStop, walkDist, walkTime } = pfs;
          const fStops = [fStop];

          // 1. Kërko linjë direkte
          for (const route of BUS_ROUTES) {
            const checkRoute = (arr: string[]) => {
              let bestFi = -1, bestTi = -1;
              for (const fs of fStops) {
                const fi = arr.indexOf(fs.id);
                if (fi === -1) continue;
                for (const ts of toStops) {
                  const ti = arr.indexOf(ts.id);
                  if (ti !== -1 && fi < ti) {
                    if (bestFi === -1 || (ti - fi < bestTi - bestFi)) {
                      bestFi = fi; bestTi = ti;
                    }
                  }
                }
              }
              if (bestFi !== -1 && bestTi !== -1) {
                const stopIdsInBetween = arr.slice(bestFi, bestTi + 1);
                const stopsInBetween = stopIdsInBetween.map(id => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean);
                evaluateTrip([{ route, stops: stopsInBetween, stopIds: stopIdsInBetween, boardAt: fStop.name, alightAt: toName, numStops: bestTi - bestFi }], walkDist, walkTime, fStop.name);
              }
            };
            checkRoute(route.stops);
            if (route.returnStops) checkRoute(route.returnStops);
          }

          // 2. Kërko me ndërrim (nëse ka mundësi më të mirë)
          for (const route1 of BUS_ROUTES) {
            const r1Arrs = [route1.stops, route1.returnStops].filter(Boolean) as string[][];
            for (const r1Arr of r1Arrs) {
              let fi = -1;
              for (const fs of fStops) { const i = r1Arr.indexOf(fs.id); if (i !== -1) fi = i; }
              if (fi === -1) continue;

              for (const route2 of BUS_ROUTES) {
                if (route1.id === route2.id) continue;
                const r2Arrs = [route2.stops, route2.returnStops].filter(Boolean) as string[][];

                for (const r2Arr of r2Arrs) {
                  let ti = -1;
                  for (const ts of toStops) { const i = r2Arr.indexOf(ts.id); if (i !== -1) ti = i; }
                  if (ti === -1) continue;

                  // Ndërrime ekzakte: Vlerëso TË GJITHA stacionet e përbashkëta
                  for (let i = fi + 1; i < r1Arr.length; i++) {
                    const id = r1Arr[i];
                    if (r2Arr.includes(id) && r2Arr.indexOf(id) < ti) {
                      const transferStop = BUS_STOPS.find(s => s.id === id);
                      const stopIds1 = r1Arr.slice(fi, i + 1);
                      const stopIds2 = r2Arr.slice(r2Arr.indexOf(id), ti + 1);
                      const stops1 = stopIds1.map(x => BUS_STOPS.find(s => s.id === x)?.name).filter(Boolean);
                      const stops2 = stopIds2.map(x => BUS_STOPS.find(s => s.id === x)?.name).filter(Boolean);
                      evaluateTrip([
                        { route: route1, stops: stops1, stopIds: stopIds1, boardAt: fStop.name, alightAt: transferStop?.name || id, transfer: true, transferAt: transferStop?.name || id, numStops: stops1.length - 1 },
                        { route: route2, stops: stops2, stopIds: stopIds2, boardAt: transferStop?.name || id, alightAt: toName, transfer: false, numStops: stops2.length - 1 }
                      ], walkDist, walkTime, fStop.name);
                    }
                  }

                  // Ndërrim me ecje (vlerëso GJITHMONË, sepse një ecje 1 min mund të shpëtojë 30 min autobus!)
                  for (let i = fi + 1; i < r1Arr.length; i++) {
                    const stop1 = BUS_STOPS.find(s => s.id === r1Arr[i]);
                    if (!stop1) continue;
                    for (let j = 0; j < ti; j++) {
                      const stop2 = BUS_STOPS.find(s => s.id === r2Arr[j]);
                      if (!stop2) continue;

                      const R = 6371e3;
                      const φ1 = stop1.lat * Math.PI / 180; const φ2 = stop2.lat * Math.PI / 180;
                      const Δφ = (stop2.lat - stop1.lat) * Math.PI / 180; const Δλ = (stop2.lng - stop1.lng) * Math.PI / 180;
                      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                      const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

                      if (dist < 700) { // Align with main app MAX_TRANSFER_WALK_METERS (700m)
                        const stopIds1 = r1Arr.slice(fi, i + 1);
                        const stopIds2 = r2Arr.slice(j, ti + 1);
                        const stops1 = stopIds1.map(x => BUS_STOPS.find(s => s.id === x)?.name).filter(Boolean);
                        const stops2 = stopIds2.map(x => BUS_STOPS.find(s => s.id === x)?.name).filter(Boolean);
                        const wTime = Math.ceil(dist / 80);
                        evaluateTrip([
                          { route: route1, stops: stops1, stopIds: stopIds1, boardAt: fStop.name, alightAt: stop1.name, transfer: true, transferAt: stop1.name, numStops: stops1.length - 1 },
                          { isWalking: true, boardAt: stop1.name, alightAt: stop2.name, boardNodeId: stop1.id, alightNodeId: stop2.id, walkingDist: dist, walkingTime: wTime, numStops: 0 },
                          { route: route2, stops: stops2, stopIds: stopIds2, boardAt: stop2.name, alightAt: toName, transfer: false, numStops: stops2.length - 1 }
                        ], walkDist, walkTime, fStop.name);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        set({
          tripResult: bestTrip || { error: 'Nuk u gjet rrugë e përshtatshme. Provo stacione të tjera.' }
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
      name: 'urbani-im-storage',
    }
  )
);

export default useStore;