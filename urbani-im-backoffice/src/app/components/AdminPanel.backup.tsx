'use client';
import { useState, useEffect } from 'react';
import useStore, { BUS_ROUTES, BUS_STOPS } from '../store/useStore';
import {
  Users, UserCheck, Clock, Bus, Activity, LogOut,
  Settings, Banknote, MapPin, AlertTriangle, ShieldCheck, User, Trash2, Edit2, Plus, Route, X, ChevronLeft, Check, Save, ChevronRight, Printer, Search
} from 'lucide-react';

const EMPTY_ARRAY: any[] = [];

export default function AdminPanel() {
  // Set "routes" as the default active tab because the user wants it to be primary.
  const [activeTab, setActiveTab] = useState('routes');

  // View State for Pages: 'list' | 'route-detail' | 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules' | 'form-account'
  const [currentView, setCurrentView] = useState<'list' | 'route-detail' | 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules' | 'form-account' | 'view-staff-schedule'>('list');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Clear notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Scroll to top on view or tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, activeTab]);

  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<any>({});

  // Zustand State
  const buses = useStore((state: any) => Array.isArray(state.buses) ? state.buses : EMPTY_ARRAY);
  const adminDrivers = useStore((state: any) => Array.isArray(state.adminDrivers) ? state.adminDrivers : EMPTY_ARRAY);
  const adminInspectors = useStore((state: any) => Array.isArray(state.adminInspectors) ? state.adminInspectors : EMPTY_ARRAY);
  const adminBuses = useStore((state: any) => Array.isArray(state.adminBuses) ? state.adminBuses : EMPTY_ARRAY);
  const searchQuery = useStore((state: any) => state.searchQuery || '');
  const setSearchQuery = useStore((state: any) => state.setSearchQuery);
  const activeFilter = useStore((state: any) => state.activeFilter || 'all');
  const setActiveFilter = useStore((state: any) => state.setActiveFilter);

  const setAdminDrivers = useStore((state: any) => state.setAdminDrivers);
  const setAdminInspectors = useStore((state: any) => state.setAdminInspectors);
  const setAdminBuses = useStore((state: any) => state.setAdminBuses);
  const fetchAdminDrivers = useStore((state: any) => state.fetchAdminDrivers);
  const fetchAdminInspectors = useStore((state: any) => state.fetchAdminInspectors);
  const syncBusesWithAdmin = useStore((state: any) => state.syncBusesWithAdmin);
  const logout = useStore((state: any) => state.logout);
  const user = useStore((state: any) => state.user);
  const currentAccount = useStore((state: any) => state.currentAccount);
  const isDispatcher = useStore((state: any) => state.isDispatcher);

  // Track initial data load for operator dashboard
  const [isLoadingBuses, setIsLoadingBuses] = useState(true);

  const refreshData = async () => {
    try {
      await fetchAdminDrivers();
      await fetchAdminInspectors();
      const routeParam = currentAccount?.role === 'operator' && currentAccount.routeId
        ? `?routeId=${encodeURIComponent(currentAccount.routeId)}` : '';
      const busesRes = await fetch(`/api/admin/buses${routeParam}`);
      if (busesRes.ok) setAdminBuses(await busesRes.json());
    } catch (err) {
      console.error('Failed to poll data', err);
    } finally {
      setIsLoadingBuses(false);
    }
  };

  // Auto-sync polling to keep data fresh across all operators
  useEffect(() => {
    // Fetch immediately on mount, then poll every 15s
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [currentAccount?.routeId]);


  const staffAccounts = useStore((state: any) => state.staffAccounts);
  const addStaffAccount = useStore((state: any) => state.addStaffAccount);
  const updateStaffAccount = useStore((state: any) => state.updateStaffAccount);
  const deleteStaffAccount = useStore((state: any) => state.deleteStaffAccount);
  const auditLogs = useStore((state: any) => state.auditLogs || []);
  const addLog = useStore((state: any) => state.addLog);

  // ── Live DB accounts (for the Accounts tab) ──────────────────────────────
  const [dbAccounts, setDbAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // --- Confirmation Modal State ---
  const [confModal, setConfModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmColor?: string;
    icon?: any;
  } | null>(null);

  const closeConf = () => setConfModal(null);
  const triggerConf = (data: { title: string, message: string, onConfirm: () => void, confirmText?: string, confirmColor?: string, icon?: any }) => {
    setConfModal({ ...data, isOpen: true });
  };

  const fetchDbAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const [opRes, drRes, inRes] = await Promise.all([
        fetch('/api/admin/staff?role=operator'),
        fetch('/api/admin/staff?role=driver'),
        fetch('/api/admin/staff?role=inspector'),
      ]);
      const operators = opRes.ok ? await opRes.json() : [];
      const drivers = drRes.ok ? await drRes.json() : [];
      const inspectors = inRes.ok ? await inRes.json() : [];

      // Normalize: ensure each has a stable 'id' key (fallback to _id)
      const normalize = (list: any[], role: string) =>
        (Array.isArray(list) ? list : []).map((a: any) => ({
          ...a,
          id: a.id || a._id?.toString(),
          role: a.role || role,
        }));

      setDbAccounts([
        ...normalize(operators, 'operator'),
        ...normalize(drivers, 'driver'),
        ...normalize(inspectors, 'inspector'),
      ]);
    } catch (err) {
      console.error('Failed to fetch DB accounts', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Fetch when accounts tab becomes active
  useEffect(() => {
    if (activeTab === 'accounts' && isDispatcher) {
      fetchDbAccounts();
      const iv = setInterval(fetchDbAccounts, 15000);
      return () => clearInterval(iv);
    }
  }, [activeTab, isDispatcher]);

  // Track which account is being deleted (for loading state)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleDeleteAccount = async (acc: any) => {
    const accId = acc.id || acc._id?.toString();
    if (!accId) return;

    triggerConf({
      title: 'Fshirja e Llogarisë',
      message: `A je i sigurt që dëshiron të fshish llogarinë e "${acc.name || acc.username}"? Ky veprim nuk mund të kthehet mbrapa.`,
      confirmText: 'Po, Fshije',
      confirmColor: '#ef4444',
      icon: Trash2,
      onConfirm: async () => {
        closeConf();
        setDeletingAccountId(accId);
        try {
          const rawRoute = (acc.routeId || '').toString();
          const routeId = rawRoute.startsWith('L') ? rawRoute.substring(1) : rawRoute;
          const res = await fetch(
            `/api/admin/staff?id=${encodeURIComponent(accId)}&routeId=${encodeURIComponent(routeId)}&role=${encodeURIComponent(acc.role || 'driver')}`,
            { method: 'DELETE' }
          );
          if (res.ok) {
            setNotification({ msg: `Llogaria e "${acc.name || acc.username}" u fshi me sukses! ✓`, type: 'success' });
            fetchDbAccounts();
          } else {
            const err = await res.json().catch(() => ({}));
            setNotification({ msg: `Gabim: ${err.error || 'Fshirja dështoi.'}`, type: 'error' });
          }
        } catch (err) {
          console.error('Delete account error:', err);
          setNotification({ msg: 'Gabim i brendshëm. Provo sërish.', type: 'error' });
        } finally {
          setDeletingAccountId(null);
        }
      }
    });
  };

  // --- Route ID normalization helper ---
  // BUS_ROUTES use 'L1A', DB records store '1A' — this matches both formats.
  const routeMatches = (routeA: string | undefined, routeB: string | undefined): boolean => {
    if (!routeA || !routeB) return false;
    const norm = (r: string) => r.startsWith('L') ? r.substring(1) : r;
    return norm(routeA) === norm(routeB);
  };

  // Scoped Data for Operators (must come after routeMatches)
  const visibleDrivers = currentAccount?.role === 'operator'
    ? adminDrivers.filter((d: any) => routeMatches(d.routeId, currentAccount.routeId))
    : adminDrivers;

  const visibleInspectors = currentAccount?.role === 'operator'
    ? adminInspectors.filter((i: any) => i.id === currentAccount.id || routeMatches(i.routeId, currentAccount.routeId))
    : adminInspectors;

  const visibleBuses = currentAccount?.role === 'operator'
    ? adminBuses.filter((b: any) => routeMatches(b.routeId, currentAccount.routeId))
    : adminBuses;

  // --- Role-Based Filtering ---
  // If operator, only show their assigned route
  const visibleRoutes = currentAccount?.role === 'operator'
    ? BUS_ROUTES.filter(r => routeMatches(r.id, currentAccount.routeId))
    : BUS_ROUTES;

  const filteredDrivers = (currentAccount?.role === 'operator'
    ? adminDrivers.filter((d: any) => routeMatches(d.routeId, currentAccount.routeId))
    : adminDrivers).filter((d: any) => {
      const matchesSearch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.personalId || d.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || d.status === activeFilter;
      return matchesSearch && matchesFilter;
    });

  const filteredInspectors = (currentAccount?.role === 'operator'
    ? adminInspectors.filter((i: any) => routeMatches(i.routeId, currentAccount.routeId))
    : adminInspectors).filter((i: any) => {
      const matchesSearch = (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.personalId || i.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || i.status === activeFilter;
      return matchesSearch && matchesFilter;
    });

  const filteredBuses = (currentAccount?.role === 'operator'
    ? adminBuses.filter((b: any) => routeMatches(b.routeId, currentAccount.routeId))
    : adminBuses).filter((b: any) => {
      const matchesSearch = (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || b.status === activeFilter;
      return matchesSearch && matchesFilter;
    });

  const filteredAccounts = dbAccounts.filter((a: any) => {
    const matchesSearch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || a.role === activeFilter || a.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalBuses = filteredBuses.length;
  const activeBuses = buses.filter((b: any) =>
    b.speed > 0 && (currentAccount?.role === 'dispatcher' || routeMatches(b.routeId, currentAccount?.routeId))
  ).length;

  // Computed for Route Detail
  const selectedRoute = visibleRoutes.find(r => r.id === selectedRouteId);
  const routeBuses = selectedRoute ? filteredBuses.filter((b: any) => routeMatches(b.routeId, selectedRoute.id)) : [];
  const routeDrivers = selectedRoute ? filteredDrivers.filter((d: any) => routeMatches(d.routeId, selectedRoute.id)) : [];
  const routeInspectors = selectedRoute ? adminInspectors.filter((i: any) => routeMatches(i.routeId, selectedRoute.id)) : [];

  // --- Handlers ---
  const handleDeleteDriver = (id: string, routeId: string) => {
    const dr = adminDrivers.find((x: any) => x.id === id);
    triggerConf({
      title: 'Fshirja e Shoferit',
      message: `A je i sigurt që dëshiron të fshish shoferin ${dr?.name || id}?`,
      confirmText: 'Po, Fshije',
      confirmColor: '#ef4444',
      onConfirm: () => {
        closeConf();
        setAdminDrivers(adminDrivers.filter((x: any) => x.id !== id));
        const updatedBuses = adminBuses.map((b: any) => b.driverId === id ? { ...b, driverId: null } : b);
        setAdminBuses(updatedBuses);
        fetch(`/api/admin/staff?id=${id}&routeId=${routeId}&role=driver`, { method: 'DELETE' })
          .catch(err => console.error('Failed to delete driver', err));
        syncBusesWithAdmin();
      }
    });
  };

  const handleDeleteInspector = (id: string, routeId: string) => {
    const ins = adminInspectors.find((x: any) => x.id === id);
    triggerConf({
      title: 'Fshirja e Faturinos',
      message: `A je i sigurt që dëshiron të fshish faturinon ${ins?.name || id}?`,
      confirmText: 'Po, Fshije',
      confirmColor: '#ef4444',
      onConfirm: () => {
        closeConf();
        setAdminInspectors(adminInspectors.filter((x: any) => x.id !== id));
        const updatedBuses = adminBuses.map((b: any) => b.inspectorId === id ? { ...b, inspectorId: null } : b);
        setAdminBuses(updatedBuses);
        fetch(`/api/admin/staff?id=${id}&routeId=${routeId}&role=inspector`, { method: 'DELETE' })
          .catch(err => console.error('Failed to delete inspector', err));
        syncBusesWithAdmin();
      }
    });
  };

  const handleDeleteBus = (plate: string, routeId: string) => {
    triggerConf({
      title: 'Fshirja e Autobusit',
      message: `A je i sigurt që dëshiron të fshish autobusin me targë ${plate}? Ky veprim do të heqë edhe caktimet e shoferëve.`,
      confirmText: 'Po, Fshije',
      confirmColor: '#ef4444',
      onConfirm: () => {
        closeConf();
        setAdminBuses(adminBuses.filter((b: any) => b.id !== plate));
        fetch(`/api/admin/buses?id=${plate}&routeId=${routeId}`, { method: 'DELETE' })
          .catch(err => console.error('Failed to delete bus', err));
        syncBusesWithAdmin();
      }
    });
  };


  // --- Form Navigation ---
  const navigateToForm = (view: 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules', mode: 'add' | 'edit', data?: any) => {
    setCurrentView(view);
    setFormMode(mode);
    if (mode === 'edit' && data) {
      if (view === 'form-schedules') {
        const routeObj = BUS_ROUTES.find(r => r.id === data.routeId);
        const t1Id = routeObj?.stops?.[0];
        const t2Id = routeObj?.stops?.[routeObj?.stops?.length - 1];
        const term1 = BUS_STOPS.find(s => s.id === t1Id)?.name || 'Terminali 1';
        const term2 = BUS_STOPS.find(s => s.id === t2Id)?.name || 'Terminali 2';
        const existingSchedules = data.schedules || { terminal1: [], terminal2: [] };
        // Convert old array of strings to array of objects {d, a}
        const migrate = (arr: any[]) => (arr || []).map(item => typeof item === 'string' ? { d: item, a: '' } : item);
        const t1 = migrate(existingSchedules.terminal1);
        const t2 = migrate(existingSchedules.terminal2);

        setFormData({
          ...data,
          schedules: { terminal1: t1, terminal2: t2 },
          _termNames: [term1, term2]
        });
      } else {
        // Normalize id: MongoDB may return _id without id field
        const normalizedId = data.id || data.plate || data._id?.toString?.() || '';
        setFormData({
          ...data,
          id: normalizedId,
          plate: normalizedId,
          schedules: data.schedules || { terminal1: [], terminal2: [] },
        });
      }
    } else {
      // Defaults
      if (view === 'form-driver') setFormData({ name: '', phone: '', shift: 'Mëngjes (05:00 - 13:00)', status: 'Aktiv', licenseCat: 'D', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (selectedRouteId || BUS_ROUTES[0].id), personalId: '', username: '', pin: '', joinDate: new Date().toISOString().split('T')[0], address: '' });
      if (view === 'form-inspector') setFormData({ name: '', phone: '', status: 'Në Linjë', posCode: '', employmentType: 'Full-Time', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (selectedRouteId || BUS_ROUTES[0].id), personalId: '', username: '', pin: '' });
      if (view === 'form-bus') setFormData({ plate: '', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (data?.routeId || selectedRouteId || BUS_ROUTES[0].id), driverId: '', inspectorId: '', year: new Date().getFullYear().toString(), brand: '', capacity: 60, status: 'Aktiv', schedules: { terminal1: [], terminal2: [] } });
    }
  };

  const closeForm = () => {
    if ((currentView === 'form-bus' || currentView === 'form-driver' || currentView === 'form-inspector' || currentView === 'form-schedules') && selectedRouteId) {
      setCurrentView('route-detail');
    } else {
      setCurrentView('list');
    }
    setFormData({});
  };

  const openRouteDetail = (routeId: string) => {
    setSelectedRouteId(routeId);
    setCurrentView('route-detail');
  };

  const closeRouteDetail = () => {
    setSelectedRouteId(null);
    setCurrentView('list');
  };

  // --- Form Submit ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentView === 'form-driver' || (currentView === 'view-staff-schedule' && formData.role === 'driver')) {
      setIsSaving(true);
      const newId = formMode === 'add' ? `d_${Date.now()}` : formData.id;
      const loginUsername = formData.username || formData.personalId || newId;
      const loginPin = formData.pin || '1234';

      // Operators can ONLY update weeklyProgram — not personal info
      const driverToSave = isDispatcher ? {
        id: newId,
        name: formData.name,
        username: loginUsername,
        pin: loginPin,
        personalId: formData.personalId || loginUsername,
        phone: formData.phone,
        routeId: formData.routeId || selectedRouteId || '1A',
        shift: formData.shift,
        status: formData.status || 'Aktiv',
        weeklyProgram: formData.weeklyProgram || {},
        role: 'driver',
      } : {
        // Operator: only weeklyProgram allowed
        id: formData.id,
        role: 'driver',
        routeId: formData.routeId,
        weeklyProgram: formData.weeklyProgram || {},
      };

      fetch('/api/admin/staff', {
        method: formMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverToSave),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to save');
          const savedData = await res.json();

          if (formMode === 'add') {
            setAdminDrivers([...adminDrivers, savedData]);
          } else {
            setAdminDrivers(adminDrivers.map((d: any) => d.id === driverToSave.id ? { ...d, ...savedData } : d));
          }
          addStaffAccount({
            id: savedData.id || driverToSave.id,
            name: savedData.name || formData.name,
            username: savedData.username || formData.username || formData.personalId || driverToSave.id,
            pin: savedData.pin || loginPin,
            role: 'driver',
            routeId: savedData.routeId || formData.routeId,
            weeklyProgram: savedData.weeklyProgram,
            status: savedData.status || 'Aktiv',
            createdAt: Date.now(),
          });

          closeForm();
          setTimeout(() => {
            setNotification({ msg: isDispatcher ? 'Të dhënat e shoferit u ruajtën! ✓' : 'Programi javor u ruajt! ✓', type: 'success' });
          }, 300);
        })
        .catch(err => {
          console.error('Failed to save driver', err);
          setNotification({ msg: 'Gabim gjatë ruajtjes së shoferit.', type: 'error' });
        })
        .finally(() => setIsSaving(false));

      syncBusesWithAdmin();
    } else if (currentView === 'form-inspector' || (currentView === 'view-staff-schedule' && formData.role === 'inspector')) {
      setIsSaving(true);
      const newId = formMode === 'add' ? `i_${Date.now()}` : formData.id;
      const loginUsername = formData.username || formData.personalId || newId;
      const loginPin = formData.pin || '1234';

      // Operators can ONLY update weeklyProgram
      const inspectorToSave = isDispatcher ? {
        id: newId,
        name: formData.name,
        username: loginUsername,
        pin: loginPin,
        personalId: formData.personalId || loginUsername,
        phone: formData.phone,
        routeId: formData.routeId || selectedRouteId || '1A',
        status: formData.status || 'Në Linjë',
        weeklyProgram: formData.weeklyProgram || {},
        role: 'inspector',
      } : {
        id: formData.id,
        role: 'inspector',
        routeId: formData.routeId,
        weeklyProgram: formData.weeklyProgram || {},
      };

      fetch('/api/admin/staff', {
        method: formMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectorToSave),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to save');
          const savedData = await res.json();

          if (formMode === 'add') {
            setAdminInspectors([...adminInspectors, savedData]);
          } else {
            setAdminInspectors(adminInspectors.map((i: any) => i.id === inspectorToSave.id ? { ...i, ...savedData } : i));
          }
          addStaffAccount({
            id: savedData.id || inspectorToSave.id,
            name: savedData.name || formData.name,
            username: savedData.username || formData.username || formData.personalId || inspectorToSave.id,
            pin: savedData.pin || loginPin,
            role: 'inspector',
            routeId: savedData.routeId || formData.routeId,
            weeklyProgram: savedData.weeklyProgram,
            status: savedData.status || 'Aktiv',
            createdAt: Date.now(),
          });

          closeForm();
          setTimeout(() => {
            setNotification({ msg: isDispatcher ? 'Të dhënat e faturinos u ruajtën! ✓' : 'Programi javor u ruajt! ✓', type: 'success' });
          }, 300);
        })
        .catch(err => {
          console.error('Failed to save inspector', err);
          setNotification({ msg: 'Gabim gjatë ruajtjes së faturinos.', type: 'error' });
        })
        .finally(() => setIsSaving(false));
    } else if (currentView === 'form-bus' || currentView === 'form-schedules') {
      setIsSaving(true);

      // Resolve the bus ID — could be plate, id, or MongoDB _id string
      const busId = formData.id || formData.plate || formData._id?.toString?.() || '';
      const busRouteId = (formData.routeId || selectedRouteId || '1A').replace('L', '');

      if (!busId && formMode === 'edit') {
        setNotification({ msg: 'Gabim: ID e mjetit mungon.', type: 'error' });
        setIsSaving(false);
        return;
      }

      // Operators can only update: driverId, inspectorId, schedules — not plate/brand/year/status
      const busToSave = isDispatcher ? {
        ...formData,
        id: formMode === 'add' ? (formData.plate || formData.id) : busId,
        routeId: busRouteId,
      } : {
        id: busId,
        routeId: busRouteId,
        driverId: formData.driverId || '',
        inspectorId: formData.inspectorId || '',
        schedules: formData.schedules || { terminal1: [], terminal2: [] },
      };

      fetch('/api/admin/buses', {
        method: formMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busToSave),
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 404) throw new Error('Ky autobus nuk u gjet në databazë. Mund të jetë fshirë ose ID është e pasaktë.');
            const errBody = await res.text().catch(() => '');
            throw new Error(`Gabim nga serveri (${res.status}): ${errBody || 'Ruajtja dështoi'}`);
          }
          const savedData = await res.json();

          if (formMode === 'add') {
            setAdminBuses([...adminBuses, savedData]);
          } else {
            setAdminBuses(adminBuses.map((b: any) =>
              (b.id === busId || b._id?.toString() === busId) ? { ...b, ...savedData } : b
            ));
          }

          // Trigger sync with simulation after successful save
          if (typeof syncBusesWithAdmin === 'function') syncBusesWithAdmin();

          // Re-fetch everything to be sure (Backend handles staff-bus sync automatically)
          refreshData();

          closeForm();
          setTimeout(() => {
            setNotification({ msg: isDispatcher ? 'Të dhënat e mjetit u ruajtën! ✓' : 'Mjeti u përditësua! ✓', type: 'success' });
          }, 300);
        })
        .catch(err => {
          console.error('Failed to save bus', err);
          setNotification({ msg: `Gabim gjatë ruajtjes: ${err.message}`, type: 'error' });
        })
        .finally(() => setIsSaving(false));
    } else if (currentView === 'form-account') {
      setIsSaving(true);
      const accToSave = {
        ...(formMode === 'add' ? { ...formData, id: `acc_${Date.now()}`, createdAt: Date.now(), status: 'active' } : formData),
        routeId: formData.routeId || selectedRouteId || '1A'
      };

      fetch('/api/admin/staff', {
        method: formMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accToSave),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to save account');
          const savedData = await res.json();

          if (formMode === 'add') {
            addStaffAccount(savedData);
          } else {
            updateStaffAccount(savedData.id, savedData);
          }

          // Refresh live accounts table from DB
          fetchDbAccounts();
          closeForm();
          setTimeout(() => {
            setNotification({ msg: 'Llogaria e stafit u ruajt me sukses! ✓', type: 'success' });
          }, 300);
        })
        .catch(err => {
          console.error('Failed to save account', err);
          setNotification({ msg: 'Gabim gjatë ruajtjes së llogarisë.', type: 'error' });
        })
        .finally(() => setIsSaving(false));
    }
  };


  const handlePrintSchedules = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const driver = adminDrivers.find((d: any) => d.id === formData.driverId);
    const driverName = driver ? driver.name : 'E pacaktuar';
    const term1Name = formData._termNames?.[0] || 'Terminali 1';
    const term2Name = formData._termNames?.[1] || 'Terminali 2';

    // Sort schedules chronologically
    const term1Schedules = [...(formData.schedules?.terminal1 || [])].sort((a, b) => (a.d || '').localeCompare(b.d || ''));
    const term2Schedules = [...(formData.schedules?.terminal2 || [])].sort((a, b) => (a.d || '').localeCompare(b.d || ''));

    const maxRows = Math.max(term1Schedules.length, term2Schedules.length);
    let tableRows = '';

    if (maxRows === 0) {
      tableRows = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #666;">Nuk ka asnjë orar të regjistruar për këtë mjet.</td></tr>';
    } else {
      for (let i = 0; i < maxRows; i++) {
        const t1 = term1Schedules[i] || { d: '-', a: '-' };
        const t2 = term2Schedules[i] || { d: '-', a: '-' };
        tableRows += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 15px; font-weight: bold;">${t1.d || '-'}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 15px; color: #666;">${t1.a || '-'}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 15px; font-weight: bold;">${t2.d || '-'}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 15px; color: #666;">${t2.a || '-'}</td>
          </tr>
        `;
      }
    }

    const html = `
      <html>
        <head>
          <title>Oraret - ${formData.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; text-align: left; margin: 0 auto; max-width: 500px; gap: 10px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background-color: #f4f4f5; padding: 14px; border: 1px solid #ddd; font-size: 14px; text-transform: uppercase; color: #555; }
            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; padding-top: 20px; }
            @media print {
              @page { margin: 15mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Fleta e Orareve të Flotës</div>
            <div class="info-grid">
              <div><strong>Targa e Mjetit:</strong> ${formData.id}</div>
              <div><strong>Linja:</strong> ${formData.routeId}</div>
              <div><strong>Shoferi:</strong> ${driverName}</div>
              <div><strong>Statusi:</strong> ${formData.status}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th colspan="2">Nisjet nga: ${term1Name}</th>
                <th colspan="2">Nisjet nga: ${term2Name}</th>
              </tr>
              <tr>
                <th style="width: 25%">Nisja</th>
                <th style="width: 25%">Mbërritja</th>
                <th style="width: 25%">Nisja</th>
                <th style="width: 25%">Mbërritja</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            Dokument i gjeneruar nga Qendra e Kontrollit "Urbani Im"<br>
            Data e printimit: ${new Date().toLocaleDateString('sq-AL')}
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const renderWeeklyProgram = () => {
    const days = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];
    const program = formData.weeklyProgram || {
      'E Hënë': 'Pushim', 'E Martë': 'Pushim', 'E Mërkurë': 'Pushim',
      'E Enjte': 'Pushim', 'E Premte': 'Pushim', 'E Shtunë': 'Pushim', 'E Diel': 'Pushim'
    };

    return (
      <div style={{ marginTop: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} /> Programi Javor i Punës
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {days.map(day => (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', textAlign: 'center', color: day === 'E Shtunë' || day === 'E Diel' ? '#ef4444' : '#fff' }}>{day}</div>
              <select
                className="premium-select"
                value={program[day] || 'Pushim'}
                onChange={(e) => {
                  const newProgram = { ...program, [day]: e.target.value };
                  setFormData({ ...formData, weeklyProgram: newProgram });
                }}
                style={{ fontSize: '12px', padding: '10px 4px' }}
              >
                <option value="Mëngjes" style={{ color: '#000' }}>Mëngjes</option>
                <option value="Pasdite" style={{ color: '#000' }}>Pasdite</option>
                <option value="Nata" style={{ color: '#000' }}>Nata</option>
                <option value="Pushim" style={{ color: '#000' }}>Pushim</option>
              </select>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', fontStyle: 'italic' }}>
          * Ky program pasqyrohet direkt në dashboard-in personal të punonjësit.
        </p>
      </div>
    );
  };

  const renderSearchAndFilter = (placeholder: string, filterOptions: { id: string, label: string }[]) => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
        <input
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Search size={18} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {filterOptions.map(opt => (
          <button
            key={`filter-${opt.id}`}
            onClick={() => setActiveFilter(opt.id)}
            style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              background: activeFilter === opt.id ? 'var(--primary)' : 'transparent',
              color: activeFilter === opt.id ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  // --- RENDERERS ---

  const renderTabs = () => (
    <div style={{ marginBottom: '28px' }}>
      {/* Top bar: branding + user + logout */}
      <div className="admin-topbar" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.3px' }}>Urbani Im — Backoffice</div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>
              {currentAccount?.role === 'dispatcher' ? 'Dispatcher Panel' : `Operator Panel — Linja ${currentAccount?.routeId}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={15} color="#818cf8" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>{user.name}</span>
            </div>
          )}
          <button
            onClick={() => {
              triggerConf({
                title: 'Dalja nga Sistemi',
                message: 'A je i sigurt që dëshiron të dalësh? Do të duhet të identifikohesh përsëri për të hyrë.',
                confirmText: 'Dil',
                confirmColor: '#ef4444',
                icon: LogOut,
                onConfirm: logout
              });
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s', fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <LogOut size={14} /> Dil
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="tabs-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>Qendra e Kontrollit</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Databaza Qendrore e Transportit Publik</p>
        </div>
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { id: 'routes', label: 'Linjat', icon: Route },
            { id: 'overview', label: 'Dashboard', icon: Activity },
            { id: 'drivers', label: 'Shoferët', icon: Users },
            { id: 'inspectors', label: 'Faturinot', icon: UserCheck },
            ...(isDispatcher ? [
              { id: 'accounts', label: 'Llogaritë', icon: ShieldCheck },
              { id: 'logs', label: 'Auditimi', icon: Activity }
            ] : []),
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setCurrentView('list'); setSelectedRouteId(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px',
                background: activeTab === id ? 'var(--primary)' : 'transparent',
                color: activeTab === id ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                transition: 'all 0.2s', fontFamily: 'inherit'
              }}
            >
              <Icon size={14} />
              <span className="hide-mobile">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFormHeader = (title: string, subtitle: string, onBack: () => void) => (
    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <button type="button" onClick={onBack} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
        }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-panel-shell" style={{ width: '100%', minHeight: '100vh', padding: '40px', position: 'relative' }}>

      {/* Show tabs only on list view */}
      {currentView === 'list' && renderTabs()}

      {/* --- ROUTES VIEW (PRIMARY) --- */}
      {currentView === 'list' && activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {renderSearchAndFilter("Kërko autobus me targë ose model...", [
            { id: 'all', label: 'Të Gjithë' },
            { id: 'Aktiv', label: 'Në Linjë' },
            { id: 'Në Garazh', label: 'Në Garazh' }
          ])}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>{currentAccount?.role === 'operator' ? `Linja juaj: ${currentAccount.routeId}` : 'Menaxhimi i Linjave'}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{currentAccount?.role === 'operator' ? 'Menaxhoni mjetet, oraret dhe stafin e linjës tuaj.' : 'Klikoni mbi një linjë për të menaxhuar flotën, oraret, shoferët dhe faturinot specifikë të saj.'}</p>
            </div>
          </div>

          {/* Loading skeleton for operator while DB data loads */}
          {isLoadingBuses && currentAccount?.role === 'operator' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
              <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Duke ngarkuar mjetet e linjës tuaj nga databaza...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {(currentAccount?.role === 'operator'
                ? BUS_ROUTES.filter(r => routeMatches(r.id, currentAccount.routeId))
                : visibleRoutes
              ).map(route => {
                const routeBuses = visibleBuses.filter((b: any) => routeMatches(b.routeId, route.id));
                const activeRouteBuses = routeBuses.filter((b: any) => b.status === 'Aktiv').length;

                return (
                  <div
                    key={`route-card-${route.id}`}
                    onClick={() => openRouteDetail(route.id)}
                    style={{
                      padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                      position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: route.color }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${route.color}15`, color: route.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', border: `1px solid ${route.color}30` }}>
                          {route.id}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} style={{ color: 'var(--primary)' }} /> {route.label}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <Bus size={14} /> <span style={{ fontWeight: '700', color: '#10b981' }}>{activeRouteBuses}</span> / {routeBuses.length} Mjete Aktive
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--text-muted)', marginTop: '18px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* --- ROUTE DETAIL VIEW (BUSES & SCHEDULES) --- */}
      {currentView === 'route-detail' && selectedRoute && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeRouteDetail} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedRoute.color }} />
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Linja {selectedRoute.id} - {selectedRoute.name}</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 24px' }}>Detajet e mjeteve, shoferëve dhe faturinove vetëm për këtë linjë.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isDispatcher && (
                <>
                  <button onClick={() => navigateToForm('form-driver', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <User size={14} /> Shto Shofer
                  </button>
                  <button onClick={() => navigateToForm('form-inspector', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <Banknote size={14} /> Shto Faturino
                  </button>
                  <button onClick={() => navigateToForm('form-bus', 'add', { routeId: selectedRoute.id })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    <Bus size={16} /> Shto Autobus
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dashboard for Route */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mjete Aktive (Në Qarkullim)</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{routeBuses.filter((b: any) => b.status === 'Aktiv').length} / {routeBuses.length}</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Staf: Shoferë të Linjës</div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>{routeDrivers.length}</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Staf: Faturino të Linjës</div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>{routeInspectors.length}</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            {renderSearchAndFilter("Kërko autobus në këtë linjë (targa)...", [
              { id: 'all', label: 'Të Gjithë' },
              { id: 'Aktiv', label: 'Në Linjë' },
              { id: 'Në Garazh', label: 'Në Garazh' }
            ])}
          </div>

          {routeBuses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Bus size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Nuk ka asnjë autobus në këtë linjë</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Shtoni autobusin e parë për të nisur operimin e kësaj linje.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {routeBuses.map((bus: any) => {
                const driver = adminDrivers.find((d: any) => (d.id === bus.driverId || d._id?.toString() === bus.driverId));
                const inspector = adminInspectors.find((i: any) => (i.id === bus.inspectorId || i._id?.toString() === bus.inspectorId));
                const isAktiv = bus.status === 'Aktiv';
                const statusColor = isAktiv ? '#10b981' : '#64748b';

                return (
                  <div
                    key={`bus-card-${bus.id || bus._id || Math.random()}`}
                    onClick={() => navigateToForm('form-bus', 'edit', bus)}
                    className="card-hover"
                    style={{
                      padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isAktiv ? statusColor + '20' : 'rgba(255,255,255,0.05)'}`,
                      cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', gap: '20px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        padding: '8px 16px', background: '#eab308', color: '#000', borderRadius: '8px',
                        fontWeight: '800', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px',
                        boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)'
                      }}>
                        {bus.id || bus.plate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: isAktiv ? '#10b981' : '#64748b',
                          boxShadow: isAktiv ? '0 0 10px #10b981' : 'none'
                        }} />
                        <span style={{ fontSize: '11px', fontWeight: '800', color: isAktiv ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {isAktiv ? 'Në Linjë' : 'Jashtë Linje'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={10} /> Shoferi
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: driver ? '#fff' : (bus.driverId ? 'var(--primary)' : 'rgba(239, 68, 68, 0.6)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {driver ? driver.name : (bus.driverId ? bus.driverId : 'Pa caktuar')}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Banknote size={10} /> Faturino
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: inspector ? '#fff' : (bus.inspectorId ? 'var(--primary)' : 'rgba(239, 68, 68, 0.6)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inspector ? inspector.name : (bus.inspectorId ? bus.inspectorId : 'Pa caktuar')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{bus.brand} ({bus.year})</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>
                        Menaxho <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {/* --- DASHBOARD VIEW --- */}
      {currentView === 'list' && activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Autobusë Aktivë', value: `${activeBuses} / ${totalBuses}`, icon: Bus, color: '#3b82f6' },
              { label: 'Shoferë të Regjistruar', value: `${filteredDrivers.length}`, icon: Users, color: '#10b981' },
              { label: 'Faturino në Databazë', value: `${filteredInspectors.length}`, icon: Banknote, color: '#f59e0b' },
              { label: 'Linja të Mbuluara', value: `${new Set(filteredBuses.map((b: any) => b.routeId)).size} / ${visibleRoutes.length}`, icon: Route, color: '#8b5cf6' },
            ].map((kpi) => {
              const KpiIcon = kpi.icon;
              return (
                <div key={`kpi-${kpi.label}`} className="card" style={{ padding: '24px', borderLeft: `4px solid ${kpi.color}`, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>{kpi.label}</p>
                      <h3 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text)' }}>{kpi.value}</h3>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <KpiIcon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={20} style={{ color: 'var(--primary)' }} /> Monitorimi i Sistemit
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: '800', marginBottom: '8px', fontSize: '15px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', animation: 'pulse-ring 2s infinite' }} />
                  Lidhja me Satelitët GPS
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Pajisjet GPS në flotë po komunikojnë me sukses. Vonesa e rrjetit është e ulët (~1.2ms). Nuk ka humbje paketi.</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontWeight: '800', marginBottom: '8px', fontSize: '15px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse-ring 2s infinite' }} />
                  Integriteti i Databazës
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Relacionet mes Shoferëve, Faturinove dhe Autobusëve janë sinkronizuar dhe ruajtur lokalisht. Databaza gati për përdorim.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LIST VIEWS --- */}
      {currentView === 'list' && activeTab === 'drivers' && (
        <div className="card staff-list-shell" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            {renderSearchAndFilter("Kërko shofer me emër ose ID...", [
              { id: 'all', label: 'Të Gjithë' },
              { id: 'Aktiv', label: 'Aktiv' },
              { id: 'Pushim', label: 'Në Pushim' }
            ])}
          </div>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>Regjistri i Përgjithshëm i Shoferëve</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Lista e punonjësve në rolin e shoferit. Shtimi i tyre bëhet vetëm përmes krijimit të llogarisë nga Dispatcheri.</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Të Dhënat & ID</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Linja & Mjeti</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Turni / Kat.</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Statusi</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d: any, idx: number) => {
                  const assignedBus = filteredBuses.find((b: any) => b.driverId === d.id);
                  const statusColor = d.status === 'Aktiv' ? '#10b981' : d.status === 'Pushim' ? '#f59e0b' : '#ef4444';
                  const route = BUS_ROUTES.find(r => r.id === d.routeId);

                  return (
                    <tr key={`driver-row-${d.id}-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td data-label="Të Dhënat & ID" style={{ padding: '20px 32px', fontWeight: '600', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <User size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{d.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', fontFamily: 'monospace' }}>
                              <span>ID: {d.personalId || d.id}</span>
                              <span>•</span>
                              <span>{d.phone || 'S\'ka numër'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: route?.color || '#fff' }}>{route?.name || 'Linjë e papërcaktuar'}</div>
                          {assignedBus ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: `rgba(255,255,255,0.05)`, color: '#fff', fontWeight: '800', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', letterSpacing: '1px', width: 'fit-content' }}>
                              <Bus size={12} /> {assignedBus.id}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', width: 'fit-content' }}>Mjet në pritje</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Turni / Kat." style={{ padding: '20px 32px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{d.shift.split('(')[0]}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kat. Patentës: {d.licenseCat || 'D'}</div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: statusColor, fontWeight: '700', fontSize: '13px', background: `${statusColor}15`, padding: '6px 12px', borderRadius: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                          {d.status}
                        </span>
                      </td>
                      <td data-label="Veprime" style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <div className="staff-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => { setFormData(d); setFormMode('edit'); setCurrentView('view-staff-schedule'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Clock size={14} /> Programi</button>
                          <button onClick={() => navigateToForm('form-driver', 'edit', d)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Edit2 size={14} /> Hap</button>
                          {isDispatcher && (
                            <button onClick={() => handleDeleteDriver(d.id, d.routeId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentView === 'list' && activeTab === 'inspectors' && (
        <div className="card staff-list-shell" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            {renderSearchAndFilter("Kërko faturino me emër ose ID...", [
              { id: 'all', label: 'Të Gjithë' },
              { id: 'Në Linjë', label: 'Në Linjë' },
              { id: 'Pushim', label: 'Në Pushim' }
            ])}
          </div>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>Regjistri i Përgjithshëm i Faturinove</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Lista e stafit për kontrollin e biletave. Shtimi i tyre bëhet vetëm përmes krijimit të llogarisë nga Dispatcheri.</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Të Dhënat & ID</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Linja & Mjeti</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Kodi POS & Tipi</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspectors.map((d: any, idx: number) => {
                  const assignedBus = adminBuses.find((b: any) => b.inspectorId === d.id);
                  const route = BUS_ROUTES.find(r => r.id === d.routeId);

                  return (
                    <tr key={`inspector-row-${d.id}-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td data-label="Të Dhënat & ID" style={{ padding: '20px 32px', fontWeight: '600', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Banknote size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{d.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', fontFamily: 'monospace' }}>
                              <span>ID: {d.personalId || d.id}</span>
                              <span>•</span>
                              <span>{d.phone || 'S\'ka numër'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: route?.color || '#fff' }}>{route?.name || 'Linjë e papërcaktuar'}</div>
                          {assignedBus ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: `rgba(255,255,255,0.05)`, color: '#fff', fontWeight: '800', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', letterSpacing: '1px', width: 'fit-content' }}>
                              <Bus size={12} /> {assignedBus.id}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', width: 'fit-content' }}>Mjet në pritje</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Kodi POS & Tipi" style={{ padding: '20px 32px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>POS: {d.posCode || 'Pabashkangjitur'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.employmentType || 'Full-Time'}</div>
                      </td>
                      <td data-label="Veprime" style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <div className="staff-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => { setFormData(d); setFormMode('edit'); setCurrentView('view-staff-schedule'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Clock size={14} /> Programi</button>
                          <button onClick={() => navigateToForm('form-inspector', 'edit', d)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Edit2 size={14} /> Hap</button>
                          {isDispatcher && (
                            <button onClick={() => handleDeleteInspector(d.id, d.routeId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FORM PAGES --- */}

      {/* DRIVER FORM (FULL PAGE DASHBOARD) */}
      {currentView === 'form-driver' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeForm} style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
                  {formMode === 'add' ? 'Regjistrimi i Shoferit të Ri' : `Profili i Shoferit: ${formData.name}`}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Menaxhoni të dhënat profesionale, licencën dhe programin javor të punës.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {formMode === 'edit' && isDispatcher && (
                <button
                  type="button"
                  onClick={() => { handleDeleteDriver(formData.id, formData.routeId); closeForm(); }}
                  style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={18} /> Fshi
                </button>
              )}
              <button onClick={closeForm} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>Anulo</button>
              <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isSaving} style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={20} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* SECTION 1: PERSONAL INFO */}
              <div className="card" style={{ padding: '32px', position: 'relative' }}>
                {!isDispatcher && (
                  <div style={{ position: 'absolute', top: '14px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                    🔒 Bllokuar — vetëm Dispatcher
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <User size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>1. Të Dhënat Personale & ID</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', opacity: isDispatcher ? 1 : 0.55, pointerEvents: isDispatcher ? 'auto' : 'none' }}>
                  <div className="input-group">
                    <label className="input-label">Emri dhe Mbiemri i Plotë <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" required className="input-field" placeholder="p.sh. Artan Hoxha"
                      value={formData.name || ''}
                      readOnly={!isDispatcher}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Numri i Identifikimit (Personal ID)</label>
                    <input
                      type="text" required className="input-field" placeholder="J12345678A"
                      value={formData.personalId || ''}
                      readOnly={!isDispatcher}
                      onChange={(e) => setFormData({ ...formData, personalId: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Numri i Telefonit</label>
                    <input
                      type="text" className="input-field" placeholder="+355 6x xxx xxxx"
                      value={formData.phone || ''}
                      readOnly={!isDispatcher}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Adresa e Banimit</label>
                    <input
                      type="text" className="input-field" placeholder="Adresa e plotë"
                      value={formData.address || ''}
                      readOnly={!isDispatcher}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: LOGIN CREDENTIALS — dispatcher only */}
              {isDispatcher && <div className="card" style={{ padding: '32px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                  <ShieldCheck size={20} color="#818cf8" />
                  <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#818cf8' }}>Kredencialet e Hyrjes</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Shoferi do t'i përdorë këto të dhëna për t'u identifikuar në backoffice. Username mësohet nga Personal ID nëse lëhet bosh.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Username (Login) <span style={{ color: '#94a3b8', fontWeight: '400' }}>— optional, merr Personal ID</span></label>
                    <input
                      type="text" className="input-field" placeholder="p.sh. artan.hoxha (lihet bosh = Personal ID)"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">PIN (4-6 shifra) <span style={{ color: '#94a3b8', fontWeight: '400' }}>— default: 1234</span></label>
                    <input
                      type="password" className="input-field" placeholder="Lini bosh për PIN default (1234)"
                      value={formData.pin || ''}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>}

              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <ShieldCheck size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>2. Detajet Profesionale & Operacionale</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Linja e Atribuar</label>
                    <select
                      className="input-field" value={formData.routeId || ''}
                      disabled={!isDispatcher}
                      style={!isDispatcher ? { opacity: 0.55, cursor: 'not-allowed' } : {}}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    >
                      {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name} - {r.label}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Turni i Punës (Default)</label>
                    <select
                      className="input-field" value={formData.shift || 'Mëngjes (05:00 - 13:00)'}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="Mëngjes (05:00 - 13:00)">Mëngjes (05:00 - 13:00)</option>
                      <option value="Pasdite (13:00 - 21:00)">Pasdite (13:00 - 21:00)</option>
                      <option value="Natë (21:00 - 05:00)">Natë (21:00 - 05:00)</option>
                      <option value="E Ndarë (06-10 / 15-19)">E Ndarë (06-10 / 15-19)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Kategoria e Patentës</label>
                    <input
                      type="text" className="input-field" placeholder="p.sh. D, DE"
                      value={formData.licenseCat || ''}
                      onChange={(e) => setFormData({ ...formData, licenseCat: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Statusi i Punonjësit</label>
                    <select
                      className="input-field" value={formData.status || 'Aktiv'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktiv">🟢 Aktiv / Në Detyrë</option>
                      <option value="Pushim">🟡 Pushim / Leje</option>
                      <option value="Në Garazh">⚪ Në Garazh / Gatishmëri</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                  <Activity size={18} /> Statusi Operativ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Mjeti i Atribuar</div>
                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>
                      {adminBuses.find((b: any) => b.driverId === formData.id)?.id || 'Asnjë mjet i caktuar'}
                    </div>
                  </div>
                  <p>Për të menaxhuar oraret javore, përdorni opsionin "Programi Javor" te lista e shoferëve.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* INSPECTOR FORM (FULL PAGE DASHBOARD) */}
      {currentView === 'form-inspector' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeForm} style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
                  {formMode === 'add' ? 'Regjistrimi i Faturinos së Ri' : `Profili i Faturinos: ${formData.name}`}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Menaxhimi i kredencialeve operative dhe kontrollit të biletave.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {formMode === 'edit' && isDispatcher && (
                <button
                  type="button"
                  onClick={() => { handleDeleteInspector(formData.id, formData.routeId); closeForm(); }}
                  style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={18} /> Fshi
                </button>
              )}
              <button onClick={closeForm} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>Anulo</button>
              <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isSaving} style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={20} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* SECTION 1: PERSONAL INFO */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <User size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>1. Të Dhënat Personale & ID</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Emri dhe Mbiemri i Plotë <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" required className="input-field" placeholder="p.sh. Ilir Meta"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Numri i Identifikimit (Personal ID)</label>
                    <input
                      type="text" required className="input-field" placeholder="J12345678A"
                      value={formData.personalId || ''}
                      onChange={(e) => setFormData({ ...formData, personalId: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Numri i Telefonit</label>
                    <input
                      type="text" className="input-field" placeholder="+355 6x xxx xxxx"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: LOGIN CREDENTIALS */}
              <div className="card" style={{ padding: '32px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                  <ShieldCheck size={20} color="#818cf8" />
                  <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#818cf8' }}>Kredencialet e Hyrjes</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Faturino/a do t'i përdorë këto të dhëna për t'u identifikuar në backoffice.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Username (Login) <span style={{ color: '#94a3b8', fontWeight: '400' }}>— optional, merr Personal ID</span></label>
                    <input
                      type="text" className="input-field" placeholder="p.sh. ilir.meta (lihet bosh = Personal ID)"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">PIN (4-6 shifra) <span style={{ color: '#94a3b8', fontWeight: '400' }}>— default: 1234</span></label>
                    <input
                      type="password" className="input-field" placeholder="Lini bosh për PIN default (1234)"
                      value={formData.pin || ''}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: OPERATIONAL INFO */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <Banknote size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>2. Detajet Operacionale & Pajisjet</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Linja ku Asenjohet <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      className="input-field" value={formData.routeId || ''}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    >
                      {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name} - {r.label}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Statusi Operativ</label>
                    <select
                      className="input-field" value={formData.status || 'Në Linjë'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Në Linjë">🟢 Në Linjë / Aktiv</option>
                      <option value="Pushim">🟡 Pushim / Leje</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Kodi i Pajisjes POS (Biletaria)</label>
                    <input
                      type="text" className="input-field" placeholder="p.sh. 1029A"
                      value={formData.posCode || ''}
                      onChange={(e) => setFormData({ ...formData, posCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Tipi i Kontratës</label>
                    <select
                      className="input-field" value={formData.employmentType || 'Full-Time'}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    >
                      <option value="Full-Time">Me Kohë të Plotë</option>
                      <option value="Part-Time">Me Kohë të Pjesshme</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Information & Weekly Program */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                  <ShieldCheck size={16} /> Verifikimi
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Mjeti i Atribuar</div>
                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '13px' }}>
                      {adminBuses.find((b: any) => b.inspectorId === formData.id)?.id || 'Asnjë mjet'}
                    </div>
                  </div>
                  <p>Për të menaxhuar oraret javore, përdorni opsionin "Programi Javor" te lista e faturinove.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- BUS MANAGEMENT PAGE (DETAILED) --- */}
      {currentView === 'form-bus' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeForm} style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
                  {formMode === 'add' ? 'Regjistrimi i Autobusit të Ri' : `Menaxhimi i Mjetit: ${formData.id || formData.plate}`}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  {isDispatcher ? 'Plotësoni të dhënat teknike dhe caktoni stafin përkatës për operim.' : <span style={{ color: '#f59e0b' }}>⚠ Si operator mund të caktoni vetëm shoferin, faturinon dhe oraret.</span>}
                </p>
              </div>
            </div>
            <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isSaving} style={{ padding: '14px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={20} />}
              {isSaving ? 'Duke ruajtur...' : 'Ruaj'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isDispatcher ? '1fr 320px' : '1fr 1fr', gap: '32px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Bus identity badge — operator view */}
              {!isDispatcher && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <div style={{ padding: '10px 20px', background: '#eab308', color: '#000', borderRadius: '10px', fontWeight: '900', fontSize: '22px', fontFamily: 'monospace', letterSpacing: '3px' }}>{formData.id}</div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '700' }}>Linja {(formData.routeId || '').replace('L', '')}</div>
                    {formData.brand && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formData.brand} {formData.year}</div>}
                  </div>
                </div>
              )}

              {/* SECTION 1: VEHICLE DATA — dispatcher only */}
              {isDispatcher && <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <Bus size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>1. Informacioni Teknik i Mjetit</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Targa e Autobusit (ID)</label>
                    <input type="text" className="input-field" placeholder="p.sh. AB 123 CD" value={formData.id || formData.plate || ''} onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase(), id: e.target.value.toUpperCase() })} disabled={formMode === 'edit'} style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'monospace', color: '#eab308', letterSpacing: '1px' }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Linja e Operimit</label>
                    <select className="input-field" value={formData.routeId || ''} onChange={e => setFormData({ ...formData, routeId: e.target.value, driverId: '', inspectorId: '' })}>
                      {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>Linja {r.id} - {r.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Marka / Modeli</label>
                    <input type="text" className="input-field" placeholder="p.sh. Mercedes-Benz Citaro" value={formData.brand || ''} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Viti i Prodhimit</label>
                    <input type="number" className="input-field" placeholder="p.sh. 2018" value={formData.year || ''} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                  </div>
                </div>
              </div>}

              {/* SECTION 2: STAFF ASSIGNMENT */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <Users size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>2. Caktimi i Personelit (Ekuipazhi)</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Shoferi i Linjës</label>
                    <select
                      className="input-field"
                      value={formData.driverId || ''}
                      onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                    >
                      <option value="">Zgjidh Shoferin</option>
                      {adminDrivers.filter((d: any) => routeMatches(d.routeId, formData.routeId)).map((d: any, idx: number) => (
                        <option key={`opt-driver-${d.id || d._id || idx}`} value={d.id || d._id}>{d.name} ({d.shift?.split('(')[0].trim()})</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Faturino i Linjës</label>
                    <select
                      className="input-field"
                      value={formData.inspectorId || ''}
                      onChange={e => setFormData({ ...formData, inspectorId: e.target.value })}
                    >
                      <option value="">Zgjidh Faturinon</option>
                      {adminInspectors.filter((i: any) => routeMatches(i.routeId, formData.routeId)).map((i: any, idx: number) => (
                        <option key={`opt-inspector-${i.id || i._id || idx}`} value={i.id || i._id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', fontSize: '13px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span>Vetëm personeli i regjistruar në <strong>Linjën {(formData.routeId || '').replace('L', '')}</strong> është i disponueshëm për këtë mjet.</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            {isDispatcher ? (
              /* Dispatcher sidebar: status + delete */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Gjendja Operacionale</div>
                  <div className="input-group">
                    <select className="input-field" value={formData.status || 'Aktiv'} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ background: formData.status === 'Aktiv' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: formData.status === 'Aktiv' ? '#10b981' : '#fff', fontWeight: '800', border: formData.status === 'Aktiv' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <option value="Aktiv">🟢 Në Linjë (Aktiv)</option>
                      <option value="Në Garazh">⚪ Jashtë Linje (Në Garazh)</option>
                      <option value="Mirëmbajtje">🔧 Mirëmbajtje</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Data e Modifikimit:</div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                {formMode === 'edit' && (
                  <button onClick={() => { handleDeleteBus(formData.id, formData.routeId); closeForm(); }} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                    <Trash2 size={20} /> Çregjistro Mjetin
                  </button>
                )}
              </div>
            ) : (() => {
              /* Operator right column: schedule editor styled like StaffDashboard */
              const routeObj = BUS_ROUTES.find(r => routeMatches(r.id, formData.routeId));
              const t1Id = routeObj?.stops?.[0];
              const t2Id = routeObj?.stops?.[routeObj?.stops?.length - 1];
              const t1Name = BUS_STOPS.find(s => s.id === t1Id)?.name || 'Terminali 1';
              const t2Name = BUS_STOPS.find(s => s.id === t2Id)?.name || 'Terminali 2';
              const t1 = (formData.schedules?.terminal1 || []) as any[];
              const t2 = (formData.schedules?.terminal2 || []) as any[];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: '#111118', border: '1px solid #1e1e35', borderRadius: '18px', overflow: 'hidden', position: 'sticky', top: '24px' }}>
                  {/* Header */}
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e1e35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>Tabela e Orarit</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{t1Name} · {t2Name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: [...t1, { d: '', a: '' }], terminal2: [...t2, { d: '', a: '' }] } })}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '800' }}>
                        <Plus size={12} /> Shto rresht
                      </button>
                    </div>
                  </div>

                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0d0d1a' }}>
                    <div style={{ gridColumn: 'span 2', padding: '10px 12px', textAlign: 'center', fontWeight: '800', fontSize: '12px', color: '#f8fafc', borderBottom: '1px solid #1e1e35', borderRight: '1px solid #1e1e35' }}>{t1Name}</div>
                    <div style={{ gridColumn: 'span 2', padding: '10px 12px', textAlign: 'center', fontWeight: '800', fontSize: '12px', color: '#f8fafc', borderBottom: '1px solid #1e1e35' }}>{t2Name}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0a0a10' }}>
                    {['Nisja', 'Mbërritja', 'Nisja', 'Mbërritja'].map((lbl, i) => (
                      <div key={i} style={{ padding: '7px 12px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#94a3b8', borderBottom: '1px solid #1e1e35', borderRight: i < 3 ? '1px solid #1e1e35' : 'none', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {Math.max(t1.length, t2.length) === 0 ? (
                      <div style={{ padding: '28px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>Shtyp &ldquo;Shto rresht&rdquo; për të shtuar orare</div>
                    ) : (
                      Array.from({ length: Math.max(t1.length, t2.length) }).map((_, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #1e1e35', position: 'relative' }}>
                          {/* T1 Nisja */}
                          <div style={{ borderRight: '1px solid #1e1e35' }}>
                            <input type="time" value={t1[i]?.d || ''} onChange={e => {
                              const n = [...t1]; n[i] = { ...(n[i] || {}), d: e.target.value };
                              setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: n } });
                            }} style={{ width: '100%', border: 'none', background: 'transparent', color: '#a5f3fc', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', padding: '10px 8px', textAlign: 'center', colorScheme: 'dark', outline: 'none' }} />
                          </div>
                          {/* T1 Mbërritja */}
                          <div style={{ borderRight: '1px solid #1e1e35' }}>
                            <input type="time" value={t1[i]?.a || ''} onChange={e => {
                              const n = [...t1]; n[i] = { ...(n[i] || {}), a: e.target.value };
                              setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: n } });
                            }} style={{ width: '100%', border: 'none', background: 'transparent', color: '#64748b', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', padding: '10px 8px', textAlign: 'center', colorScheme: 'dark', outline: 'none' }} />
                          </div>
                          {/* T2 Nisja */}
                          <div style={{ borderRight: '1px solid #1e1e35' }}>
                            <input type="time" value={t2[i]?.d || ''} onChange={e => {
                              const n = [...t2]; n[i] = { ...(n[i] || {}), d: e.target.value };
                              setFormData({ ...formData, schedules: { ...formData.schedules, terminal2: n } });
                            }} style={{ width: '100%', border: 'none', background: 'transparent', color: '#a5f3fc', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', padding: '10px 8px', textAlign: 'center', colorScheme: 'dark', outline: 'none' }} />
                          </div>
                          {/* T2 Mbërritja */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '6px' }}>
                            <input type="time" value={t2[i]?.a || ''} onChange={e => {
                              const n = [...t2]; n[i] = { ...(n[i] || {}), a: e.target.value };
                              setFormData({ ...formData, schedules: { ...formData.schedules, terminal2: n } });
                            }} style={{ width: '100%', border: 'none', background: 'transparent', color: '#64748b', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', padding: '10px 8px', textAlign: 'center', colorScheme: 'dark', outline: 'none' }} />
                            <button type="button" onClick={() => {
                              const n1 = [...t1]; n1.splice(i, 1);
                              const n2 = [...t2]; n2.splice(i, 1);
                              setFormData({ ...formData, schedules: { terminal1: n1, terminal2: n2 } });
                            }} style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer note */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #1e1e35', fontSize: '10px', color: '#475569', textAlign: 'center' }}>
                    Vendosni oraret e nisjes dhe mbërritjes për çdo rresht
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SCHEDULES FORM */}
      {currentView === 'form-schedules' && (
        <div className="card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          {renderFormHeader(
            'Konfigurimi i Orareve të Nisjes',
            `Përcakto oraret fikse të nisjeve për autobusin me targë ${formData.id} nga secili terminal.`,
            closeForm
          )}

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

              {/* Terminal 1 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, textTransform: 'uppercase' }}>{formData._termNames?.[0]}</h4>
                  <button type="button" onClick={() => {
                    const newT1 = [...(formData.schedules?.terminal1 || []), ''];
                    setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: newT1 } });
                  }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>
                    <Plus size={14} /> Shto
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.schedules?.terminal1?.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Nuk ka asnjë orar të shtuar.</div>
                  )}
                  {formData.schedules?.terminal1?.map((time: string, index: number) => (
                    <div key={`t1-row-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="time" value={time} required onChange={(e) => {
                        const newT1 = [...formData.schedules.terminal1];
                        newT1[index] = e.target.value;
                        setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: newT1 } });
                      }} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', colorScheme: 'dark' }} />
                      <button type="button" onClick={() => {
                        const newT1 = [...formData.schedules.terminal1];
                        newT1.splice(index, 1);
                        setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: newT1 } });
                      }} style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal 2 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, textTransform: 'uppercase' }}>{formData._termNames?.[1]}</h4>
                  <button type="button" onClick={() => {
                    const newT2 = [...(formData.schedules?.terminal2 || []), ''];
                    setFormData({ ...formData, schedules: { ...formData.schedules, terminal2: newT2 } });
                  }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>
                    <Plus size={14} /> Shto
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.schedules?.terminal2?.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Nuk ka asnjë orar të shtuar.</div>
                  )}
                  {formData.schedules?.terminal2?.map((time: string, index: number) => (
                    <div key={`t2-row-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="time" value={time} required onChange={(e) => {
                        const newT2 = [...formData.schedules.terminal2];
                        newT2[index] = e.target.value;
                        setFormData({ ...formData, schedules: { ...formData.schedules, terminal2: newT2 } });
                      }} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', colorScheme: 'dark' }} />
                      <button type="button" onClick={() => {
                        const newT2 = [...formData.schedules.terminal2];
                        newT2.splice(index, 1);
                        setFormData({ ...formData, schedules: { ...formData.schedules, terminal2: newT2 } });
                      }} style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Kthehu</button>

              <button type="button" onClick={handlePrintSchedules} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', cursor: 'pointer', fontWeight: '800', fontSize: '15px' }}>
                <Printer size={18} /> Printo (PDF)
              </button>

              <button type="submit" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', background: isSaving ? 'rgba(239, 68, 68, 0.5)' : 'var(--primary)', color: '#fff', border: 'none', cursor: isSaving ? 'default' : 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={18} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj Oraret'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ACCOUNTS VIEW (DISPATCHER ONLY) --- */}
      {currentView === 'list' && activeTab === 'accounts' && isDispatcher && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {renderSearchAndFilter("Kërko llogari me emër ose username...", [
            { id: 'all', label: 'Të Gjitha' },
            { id: 'operator', label: 'Operator' },
            { id: 'driver', label: 'Shofer' },
            { id: 'inspector', label: 'Faturino' }
          ])}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>
                Menaxhimi i Llogarive
                <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '20px' }}>
                  {filteredAccounts.length} llogari
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Të gjitha llogaritë nga databaza — operatorë, shoferë dhe faturino.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={fetchDbAccounts}
                disabled={isLoadingAccounts}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {isLoadingAccounts
                  ? <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  : <Activity size={14} />}
                Rifresko
              </button>
              <button
                onClick={() => {
                  setCurrentView('form-account');
                  setFormMode('add');
                  setFormData({ name: '', username: '', pin: '', role: 'operator', routeId: BUS_ROUTES[0].id, status: 'active', phone: '', shift: 'Mëngjes (05:00 - 13:00)' });
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                <Plus size={18} /> Shto Llogari
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emri</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username / ID</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roli</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Linja</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statusi</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAccounts && dbAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 12px' }} />
                      Duke ngarkuar llogaritë nga databaza...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      Nuk u gjet asnjë llogari. Shto llogarinë e parë ose rifresko.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc: any, index: number) => (
                    <tr key={`acc-${acc.id}-${acc.username}-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>{acc.name || '—'}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{acc.username || acc.personalId || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                          background: acc.role === 'dispatcher' ? 'rgba(239,68,68,0.1)' : acc.role === 'operator' ? 'rgba(99,102,241,0.1)' : acc.role === 'driver' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                          color: acc.role === 'dispatcher' ? '#ef4444' : acc.role === 'operator' ? '#818cf8' : acc.role === 'driver' ? '#f59e0b' : '#10b981'
                        }}>
                          {acc.role === 'driver' ? 'Shofer' : acc.role === 'inspector' ? 'Faturino' : acc.role === 'operator' ? 'Operator' : acc.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: '#94a3b8' }}>{acc.routeId || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '12px', color: acc.status === 'active' || acc.status === 'Aktiv' ? '#10b981' : '#ef4444' }}>
                          {acc.status === 'active' || acc.status === 'Aktiv' ? '● Aktiv' : '● Joaktiv'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setFormData(acc);
                              setFormMode('edit');
                              setCurrentView('form-account');
                            }}
                            style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                            <Edit2 size={16} />
                          </button>
                          {acc.role !== 'dispatcher' && (
                            <button
                              onClick={() => handleDeleteAccount(acc)}
                              disabled={deletingAccountId === (acc.id || acc._id?.toString())}
                              title="Fshi llogarinë"
                              style={{
                                padding: '8px', borderRadius: '8px',
                                background: deletingAccountId === (acc.id || acc._id?.toString()) ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.1)',
                                color: '#ef4444', border: 'none',
                                cursor: deletingAccountId === (acc.id || acc._id?.toString()) ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '34px', height: '34px', transition: 'all 0.15s'
                              }}>
                              {deletingAccountId === (acc.id || acc._id?.toString())
                                ? <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#ef4444', borderRadius: '50%' }} />
                                : <Trash2 size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ACCOUNT FORM (FULL PAGE DASHBOARD) --- */}
      {currentView === 'form-account' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeForm} style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
                  {formMode === 'add' ? 'Krijimi i një Llogarie të Re' : `Përditësimi i Llogarisë: ${formData.username}`}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Përcaktoni rolet, aksesin dhe të dhënat e sigurisë për punonjësin.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {formMode === 'edit' && formData.role !== 'dispatcher' && (
                <button
                  type="button"
                  onClick={() => { deleteStaffAccount(formData.id); closeForm(); }}
                  style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={18} /> Fshi
                </button>
              )}
              <button onClick={closeForm} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>Anulo</button>
              <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isSaving} style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={20} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* SECTION 1: SECURITY */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <ShieldCheck size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>1. Kredencialet e Sigurisë (Login)</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Username / Email Hyrës <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" required className="input-field" placeholder="p.sh. emri.mbiemri"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">PIN ose Fjalëkalimi <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" required className="input-field" placeholder="Krijo një kod hyrjeje"
                      value={formData.pin || ''}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ASSIGNMENT */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <Users size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>2. Informacioni i Punonjësit & Roli</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label">Emri dhe Mbiemri i Plotë <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" required className="input-field" placeholder="p.sh. Artan Hoxha"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Roli i Atribuar</label>
                    <select
                      className="input-field" value={formData.role || 'operator'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="operator">Operator (Menaxher Linje)</option>
                      <option value="driver">Shofer Autobusi</option>
                      <option value="inspector">Faturino / Kontrollor</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Linja ku do të operojë</label>
                    <select
                      className="input-field" value={formData.routeId || ''}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                      disabled={formData.role === 'dispatcher'}
                    >
                      {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name} - {r.label}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Statusi i Llogarisë</label>
                    <select
                      className="input-field" value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">🟢 Llogari Aktive</option>
                      <option value="inactive">🔴 E Pezulluar / Joaktive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                  <Activity size={16} /> Udhëzues i Shpejtë
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Operatorët:</strong> Menaxhojnë vetëm linjën e tyre.
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Siguria:</strong> PIN-i duhet të jetë i fshehtë.
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- STAFF WEEKLY SCHEDULE VIEW --- */}
      {currentView === 'view-staff-schedule' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={closeForm} style={{
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', color: '#fff', cursor: 'pointer'
              }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
                  Programi Javor i Punës: {formData.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Planifikoni turnet javore dhe monitoroni mjetin e asenjuar.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={closeForm} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>Mbyll</button>
              <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isSaving} style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', gap: '10px', display: 'flex', alignItems: 'center' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={20} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj Programin'}
              </button>
            </div>
          </div>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#f59e0b', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <Clock size={24} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>Programimi i Turneve (E Hënë - E Diel)</h3>
              </div>
              {renderWeeklyProgram()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <Bus size={18} /> Atribuimi i Mjetit
                </h4>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Mjeti Aktual (Targa)</div>
                  <div style={{ color: '#fff', fontWeight: '900', fontSize: '20px', fontFamily: 'monospace' }}>
                    {adminBuses.find((b: any) => b.driverId === formData.id || b.inspectorId === formData.id)?.id || 'PA CAKTUAR'}
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
                  Ky punonjës do të shohë këtë mjet në dashboard-in e tij. Programi javor i mësipërm do të ruhet në profilin e tij.
                </p>
              </div>

              <div className="card" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: '#3b82f6' }}>ℹ️ Informacion</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Ndryshimet e bëra këtu do të reflektohen menjëherë te llogaria e punonjësit. Sigurohuni që oraret të mos përplasen me mjetet e tjera.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000,
          padding: '16px 24px', borderRadius: '16px', background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
          color: '#fff', fontWeight: '800', fontSize: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
          {notification.msg}
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confModal?.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '400px', background: '#111118', border: '1px solid #1e1e35',
            borderRadius: '24px', padding: '32px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'modalFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: `${confModal.confirmColor || '#ef4444'}15`,
              color: confModal.confirmColor || '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              {confModal.icon ? <confModal.icon size={28} /> : <AlertTriangle size={28} />}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#fff' }}>
              {confModal.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 32px 0', lineHeight: '1.6' }}>
              {confModal.message}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={closeConf}
                style={{
                  padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '700'
                }}
              >
                Anulo
              </button>
              <button
                onClick={confModal.onConfirm}
                style={{
                  padding: '12px', borderRadius: '12px', background: confModal.confirmColor || '#ef4444',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '700', boxShadow: `0 8px 20px ${confModal.confirmColor || '#ef4444'}30`
                }}
              >
                {confModal.confirmText || 'Konfirmo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }


        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .admin-panel-shell { width: 100%; }
        .admin-panel-shell .tabs-row { gap: 10px; }
        .admin-panel-shell .responsive-table { overflow-x: auto; }
        .admin-panel-shell .responsive-table table { width: 100%; min-width: 640px; }
        .admin-panel-shell .hide-mobile { display: none !important; }

        @media (max-width: 960px) {
          .admin-panel-shell { padding: 20px !important; }
          .admin-panel-shell .admin-topbar,
          .admin-panel-shell .tabs-row { flex-direction: column; align-items: stretch; }
          .admin-panel-shell .tabs-row { justify-content: flex-start; }
          .admin-panel-shell [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .admin-panel-shell [style*="grid-template-columns: 1fr 320px"] { grid-template-columns: 1fr !important; }
          .admin-panel-shell [style*="grid-template-columns: 1fr 350px"] { grid-template-columns: 1fr !important; }
          .admin-panel-shell .admin-form-grid { grid-template-columns: 1fr !important; }
          .admin-panel-shell .grid-2 { grid-template-columns: 1fr !important; }
          .admin-panel-shell .responsive-table { overflow-x: auto; }
          .admin-panel-shell .responsive-table table { min-width: 100%; }
          .admin-panel-shell button { width: 100%; }
        }

        @media (max-width: 640px) {
          .admin-panel-shell { padding: 16px !important; }
          .admin-panel-shell .tabs-row { gap: 8px; }
          .admin-panel-shell .admin-form-grid { gap: 20px !important; }
        }

        .input-field {
          width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 15px;
        transition: all 0.2s ease;
        outline: none;
        appearance: none;
      }

      select.input-field {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        background-size: 18px;
        padding-right: 42px;
        cursor: pointer;
      }

      .input-field:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .input-field:focus {
        background: rgba(255, 255, 255, 0.07);
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
      }

      select.input-field option {
        background: #121212;
        color: #fff;
        padding: 12px;
      }

      .input-label {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `}</style>
    </div>
  );
}
