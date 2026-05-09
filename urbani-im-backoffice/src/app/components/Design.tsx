'use client';
import { useState, useEffect } from 'react';
import useStore, { BUS_ROUTES, BUS_STOPS } from '../store/useStore';
import {
    Users, UserCheck, Clock, Bus, Activity, LogOut,
    Settings, Banknote, MapPin, AlertTriangle, ShieldCheck, User, Trash2, Edit2, Plus, Route, X, ChevronLeft, Check, Save, ChevronRight, Printer, Search
} from 'lucide-react';

const EMPTY_ARRAY: any[] = [];

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
    bg: '#09090b',
    surface: '#111113',
    raised: '#18181b',
    border: '#27272a',
    borderHi: '#3f3f46',
    text: '#fafafa',
    muted: '#71717a',
    dim: '#52525b',
    blue: '#3b82f6',
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
    violet: '#8b5cf6',
};

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

const Badge = ({ color, children, dot }: any) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 20,
        background: `${color}14`, border: `1px solid ${color}30`,
        color, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        whiteSpace: 'nowrap'
    }}>
        {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />}
        {children}
    </span>
);

const Pill = ({ label, active, color = '#3b82f6', onClick }: any) => (
    <button onClick={onClick} style={{
        padding: '6px 14px', borderRadius: 8,
        background: active ? `${color}18` : 'transparent',
        border: `1px solid ${active ? color + '40' : T.border}`,
        color: active ? color : T.muted,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        transition: 'all .15s', fontFamily: 'inherit'
    }}>
        {label}
    </button>
);

const IconBtn = ({ icon: Icon, color = T.muted, bg = 'transparent', size = 15, onClick, title, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} style={{
        width: 32, height: 32, borderRadius: 8,
        background: bg, border: `1px solid ${T.border}`,
        color, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s', opacity: disabled ? .5 : 1,
        fontFamily: 'inherit'
    }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = color)}
        onMouseLeave={e => !disabled && (e.currentTarget.style.borderColor = T.border)}
    >
        <Icon size={size} />
    </button>
);

const Btn = ({ children, variant = 'ghost', onClick, disabled, style: sx }: any) => {
    const variants: any = {
        ghost: { bg: T.raised, border: T.border, color: T.text },
        primary: { bg: T.blue, border: T.blue, color: '#fff' },
        danger: { bg: `${T.red}14`, border: `${T.red}30`, color: T.red },
        success: { bg: `${T.green}14`, border: `${T.green}30`, color: T.green },
        amber: { bg: `${T.amber}14`, border: `${T.amber}30`, color: T.amber },
    };
    const v = variants[variant] || variants.ghost;
    return (
        <button onClick={onClick} disabled={disabled} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 9,
            background: disabled ? T.raised : v.bg,
            border: `1px solid ${disabled ? T.border : v.border}`,
            color: disabled ? T.muted : v.color,
            fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
            opacity: disabled ? .6 : 1, ...sx
        }}>{children}</button>
    );
};

const Card = ({ children, style: sx, accent }: any) => (
    <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, overflow: 'hidden',
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        ...sx
    }}>{children}</div>
);

const SectionHead = ({ icon: Icon, title, color = T.blue }: any) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: `1px solid ${T.border}`,
        background: `${color}06`
    }}>
        <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={15} color={color} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
    </div>
);

const Field = ({ label, children }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>
            {label}
        </label>
        {children}
    </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', disabled, mono, style: sx }: any) => (
    <input
        type={type} value={value || ''} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        style={{
            padding: '10px 13px', borderRadius: 9,
            background: T.raised, border: `1px solid ${T.border}`,
            color: disabled ? T.muted : T.text,
            fontSize: mono ? 15 : 13, fontFamily: mono ? 'monospace' : 'inherit',
            outline: 'none', transition: 'border .15s',
            opacity: disabled ? .6 : 1, cursor: disabled ? 'not-allowed' : 'text',
            ...sx
        }}
        onFocus={e => !disabled && (e.currentTarget.style.borderColor = T.blue)}
        onBlur={e => (e.currentTarget.style.borderColor = T.border)}
    />
);

const Select = ({ value, onChange, children, disabled }: any) => (
    <select
        value={value || ''} onChange={onChange} disabled={disabled}
        style={{
            padding: '10px 13px', borderRadius: 9,
            background: T.raised, border: `1px solid ${T.border}`,
            color: disabled ? T.muted : T.text,
            fontSize: 13, fontFamily: 'inherit', outline: 'none',
            opacity: disabled ? .6 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            paddingRight: 36
        }}
        onFocus={e => !disabled && (e.currentTarget.style.borderColor = T.blue)}
        onBlur={e => (e.currentTarget.style.borderColor = T.border)}
    >{children}</select>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div style={{
        padding: '18px 20px', borderRadius: 12,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 14
    }}>
        <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={18} color={color} />
        </div>
        <div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
        </div>
    </div>
);

const Spinner = ({ size = 16 }: any) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `2px solid rgba(255,255,255,0.15)`,
        borderTopColor: '#fff',
        animation: 'ap-spin .7s linear infinite', display: 'inline-block', flexShrink: 0
    }} />
);

// ─── SEARCH + FILTER BAR ──────────────────────────────────────────────────────
const SearchBar = ({ placeholder, filterOptions, searchQuery, setSearchQuery, activeFilter, setActiveFilter }: any) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
            <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9,
                    background: T.raised, border: `1px solid ${T.border}`,
                    color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = T.blue)}
                onBlur={e => (e.currentTarget.style.borderColor = T.border)}
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 2, display: 'flex'
                }}><X size={13} /></button>
            )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filterOptions.map((o: any) => (
                <Pill key={o.id} label={o.label} active={activeFilter === o.id} onClick={() => setActiveFilter(o.id)} />
            ))}
        </div>
    </div>
);

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
const PageHeader = ({ title, sub, onBack, actions }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onBack && (
                <button onClick={onBack} style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: T.raised, border: `1px solid ${T.border}`,
                    color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}><ChevronLeft size={18} /></button>
            )}
            <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
                {sub && <p style={{ margin: '3px 0 0', fontSize: 12, color: T.muted }}>{sub}</p>}
            </div>
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
);

// ─── TABLE ────────────────────────────────────────────────────────────────────
const Th = ({ children, right }: any) => (
    <th style={{
        padding: '11px 16px', textAlign: right ? 'right' : 'left',
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: T.muted,
        borderBottom: `1px solid ${T.border}`, background: T.surface,
        whiteSpace: 'nowrap'
    }}>{children}</th>
);
const Td = ({ children, right, mono }: any) => (
    <td style={{
        padding: '12px 16px', textAlign: right ? 'right' : 'left',
        fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`,
        fontFamily: mono ? 'monospace' : 'inherit', verticalAlign: 'middle'
    }}>{children}</td>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('routes');
    const [currentView, setCurrentView] = useState<any>('list');
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentView, activeTab]);

    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState<any>({});

    const buses = useStore((s: any) => Array.isArray(s.buses) ? s.buses : EMPTY_ARRAY);
    const adminDrivers = useStore((s: any) => Array.isArray(s.adminDrivers) ? s.adminDrivers : EMPTY_ARRAY);
    const adminInspectors = useStore((s: any) => Array.isArray(s.adminInspectors) ? s.adminInspectors : EMPTY_ARRAY);
    const adminBuses = useStore((s: any) => Array.isArray(s.adminBuses) ? s.adminBuses : EMPTY_ARRAY);
    const searchQuery = useStore((s: any) => s.searchQuery || '');
    const setSearchQuery = useStore((s: any) => s.setSearchQuery);
    const activeFilter = useStore((s: any) => s.activeFilter || 'all');
    const setActiveFilter = useStore((s: any) => s.setActiveFilter);
    const setAdminDrivers = useStore((s: any) => s.setAdminDrivers);
    const setAdminInspectors = useStore((s: any) => s.setAdminInspectors);
    const setAdminBuses = useStore((s: any) => s.setAdminBuses);
    const fetchAdminDrivers = useStore((s: any) => s.fetchAdminDrivers);
    const fetchAdminInspectors = useStore((s: any) => s.fetchAdminInspectors);
    const syncBusesWithAdmin = useStore((s: any) => s.syncBusesWithAdmin);
    const logout = useStore((s: any) => s.logout);
    const user = useStore((s: any) => s.user);
    const currentAccount = useStore((s: any) => s.currentAccount);
    const isDispatcher = useStore((s: any) => s.isDispatcher);
    const staffAccounts = useStore((s: any) => s.staffAccounts);
    const addStaffAccount = useStore((s: any) => s.addStaffAccount);
    const updateStaffAccount = useStore((s: any) => s.updateStaffAccount);
    const deleteStaffAccount = useStore((s: any) => s.deleteStaffAccount);
    const auditLogs = useStore((s: any) => s.auditLogs || []);
    const addLog = useStore((s: any) => s.addLog);

    const [isLoadingBuses, setIsLoadingBuses] = useState(true);
    const [dbAccounts, setDbAccounts] = useState<any[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
    const [confModal, setConfModal] = useState<any>(null);

    const closeConf = () => setConfModal(null);
    const triggerConf = (data: any) => setConfModal({ ...data, isOpen: true });

    const refreshData = async () => {
        try {
            await fetchAdminDrivers();
            await fetchAdminInspectors();
            const routeParam = currentAccount?.role === 'operator' && currentAccount.routeId
                ? `?routeId=${encodeURIComponent(currentAccount.routeId)}` : '';
            const busesRes = await fetch(`/api/admin/buses${routeParam}`);
            if (busesRes.ok) setAdminBuses(await busesRes.json());
        } catch (err) { console.error(err); }
        finally { setIsLoadingBuses(false); }
    };

    useEffect(() => {
        refreshData();
        const iv = setInterval(refreshData, 15000);
        return () => clearInterval(iv);
    }, [currentAccount?.routeId]);

    const fetchDbAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
            const [opRes, drRes, inRes] = await Promise.all([
                fetch('/api/admin/staff?role=operator'),
                fetch('/api/admin/staff?role=driver'),
                fetch('/api/admin/staff?role=inspector'),
            ]);
            const normalize = (list: any[], role: string) =>
                (Array.isArray(list) ? list : []).map((a: any) => ({ ...a, id: a.id || a._id?.toString(), role: a.role || role }));
            setDbAccounts([
                ...normalize(opRes.ok ? await opRes.json() : [], 'operator'),
                ...normalize(drRes.ok ? await drRes.json() : [], 'driver'),
                ...normalize(inRes.ok ? await inRes.json() : [], 'inspector'),
            ]);
        } catch (err) { console.error(err); }
        finally { setIsLoadingAccounts(false); }
    };

    useEffect(() => {
        if (activeTab === 'accounts' && isDispatcher) {
            fetchDbAccounts();
            const iv = setInterval(fetchDbAccounts, 15000);
            return () => clearInterval(iv);
        }
    }, [activeTab, isDispatcher]);

    const routeMatches = (a: string | undefined, b: string | undefined) => {
        if (!a || !b) return false;
        const n = (r: string) => r.startsWith('L') ? r.substring(1) : r;
        return n(a) === n(b);
    };

    const visibleRoutes = currentAccount?.role === 'operator'
        ? BUS_ROUTES.filter(r => routeMatches(r.id, currentAccount.routeId))
        : BUS_ROUTES;

    const visibleBuses = currentAccount?.role === 'operator'
        ? adminBuses.filter((b: any) => routeMatches(b.routeId, currentAccount.routeId))
        : adminBuses;

    const flt = (list: any[], keys: string[]) =>
        list.filter(item => {
            const q = searchQuery.toLowerCase();
            const matchSearch = !q || keys.some(k => (item[k] || '').toLowerCase().includes(q));
            const matchFilter = activeFilter === 'all' || item.status === activeFilter || item.role === activeFilter;
            return matchSearch && matchFilter;
        });

    const filteredDrivers = flt(
        currentAccount?.role === 'operator'
            ? adminDrivers.filter((d: any) => routeMatches(d.routeId, currentAccount.routeId))
            : adminDrivers,
        ['name', 'personalId', 'id']
    );
    const filteredInspectors = flt(
        currentAccount?.role === 'operator'
            ? adminInspectors.filter((i: any) => routeMatches(i.routeId, currentAccount.routeId))
            : adminInspectors,
        ['name', 'personalId', 'id']
    );
    const filteredBuses = flt(
        currentAccount?.role === 'operator'
            ? adminBuses.filter((b: any) => routeMatches(b.routeId, currentAccount.routeId))
            : adminBuses,
        ['id', 'brand']
    );
    const filteredAccounts = flt(dbAccounts, ['name', 'username']);

    const activeBuses = buses.filter((b: any) =>
        b.speed > 0 && (currentAccount?.role === 'dispatcher' || routeMatches(b.routeId, currentAccount?.routeId))
    ).length;

    const selectedRoute = visibleRoutes.find(r => r.id === selectedRouteId);
    const routeBuses = selectedRoute ? filteredBuses.filter((b: any) => routeMatches(b.routeId, selectedRoute.id)) : [];
    const routeDrivers = selectedRoute ? filteredDrivers.filter((d: any) => routeMatches(d.routeId, selectedRoute.id)) : [];
    const routeInspectors = selectedRoute ? adminInspectors.filter((i: any) => routeMatches(i.routeId, selectedRoute.id)) : [];

    // ── DELETE HANDLERS ──────────────────────────────────────────────────────
    const handleDeleteDriver = (id: string, routeId: string) => {
        const dr = adminDrivers.find((x: any) => x.id === id);
        triggerConf({
            title: 'Fshirja e Shoferit', confirmText: 'Fshi', confirmColor: T.red,
            icon: Trash2,
            message: `A je i sigurt që dëshiron të fshish shoferin "${dr?.name || id}"?`,
            onConfirm: () => {
                closeConf();
                setAdminDrivers(adminDrivers.filter((x: any) => x.id !== id));
                setAdminBuses(adminBuses.map((b: any) => b.driverId === id ? { ...b, driverId: null } : b));
                fetch(`/api/admin/staff?id=${id}&routeId=${routeId}&role=driver`, { method: 'DELETE' }).catch(console.error);
                syncBusesWithAdmin();
            }
        });
    };
    const handleDeleteInspector = (id: string, routeId: string) => {
        const ins = adminInspectors.find((x: any) => x.id === id);
        triggerConf({
            title: 'Fshirja e Faturinos', confirmText: 'Fshi', confirmColor: T.red, icon: Trash2,
            message: `A je i sigurt që dëshiron të fshish faturinon "${ins?.name || id}"?`,
            onConfirm: () => {
                closeConf();
                setAdminInspectors(adminInspectors.filter((x: any) => x.id !== id));
                setAdminBuses(adminBuses.map((b: any) => b.inspectorId === id ? { ...b, inspectorId: null } : b));
                fetch(`/api/admin/staff?id=${id}&routeId=${routeId}&role=inspector`, { method: 'DELETE' }).catch(console.error);
                syncBusesWithAdmin();
            }
        });
    };
    const handleDeleteBus = (plate: string, routeId: string) => {
        triggerConf({
            title: 'Fshirja e Autobusit', confirmText: 'Fshi', confirmColor: T.red, icon: Trash2,
            message: `A je i sigurt që dëshiron të fshish autobusin "${plate}"?`,
            onConfirm: () => {
                closeConf();
                setAdminBuses(adminBuses.filter((b: any) => b.id !== plate));
                fetch(`/api/admin/buses?id=${plate}&routeId=${routeId}`, { method: 'DELETE' }).catch(console.error);
                syncBusesWithAdmin();
            }
        });
    };
    const handleDeleteAccount = async (acc: any) => {
        const accId = acc.id || acc._id?.toString();
        if (!accId) return;
        triggerConf({
            title: 'Fshirja e Llogarisë', confirmText: 'Fshi', confirmColor: T.red, icon: Trash2,
            message: `A je i sigurt që dëshiron të fshish llogarinë e "${acc.name || acc.username}"?`,
            onConfirm: async () => {
                closeConf(); setDeletingAccountId(accId);
                try {
                    const rawRoute = (acc.routeId || '').toString();
                    const routeId = rawRoute.startsWith('L') ? rawRoute.substring(1) : rawRoute;
                    const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(accId)}&routeId=${encodeURIComponent(routeId)}&role=${encodeURIComponent(acc.role || 'driver')}`, { method: 'DELETE' });
                    if (res.ok) { setNotification({ msg: 'Llogaria u fshi! ✓', type: 'success' }); fetchDbAccounts(); }
                    else { const e = await res.json().catch(() => ({})); setNotification({ msg: `Gabim: ${e.error || 'Dështoi'}`, type: 'error' }); }
                } catch { setNotification({ msg: 'Gabim i brendshëm.', type: 'error' }); }
                finally { setDeletingAccountId(null); }
            }
        });
    };

    // ── NAVIGATION ────────────────────────────────────────────────────────────
    const navigateToForm = (view: any, mode: 'add' | 'edit', data?: any) => {
        setCurrentView(view); setFormMode(mode);
        if (mode === 'edit' && data) {
            if (view === 'form-schedules') {
                const routeObj = BUS_ROUTES.find(r => r.id === data.routeId);
                const t1Id = routeObj?.stops?.[0];
                const t2Id = routeObj?.stops?.[routeObj?.stops?.length - 1];
                const term1 = BUS_STOPS.find(s => s.id === t1Id)?.name || 'Terminali 1';
                const term2 = BUS_STOPS.find(s => s.id === t2Id)?.name || 'Terminali 2';
                const migrate = (arr: any[]) => (arr || []).map(item => typeof item === 'string' ? { d: item, a: '' } : item);
                setFormData({ ...data, schedules: { terminal1: migrate(data.schedules?.terminal1 || []), terminal2: migrate(data.schedules?.terminal2 || []) }, _termNames: [term1, term2] });
            } else {
                const normalizedId = data.id || data.plate || data._id?.toString?.() || '';
                setFormData({ ...data, id: normalizedId, plate: normalizedId, schedules: data.schedules || { terminal1: [], terminal2: [] } });
            }
        } else {
            if (view === 'form-driver') setFormData({ name: '', phone: '', shift: 'Mëngjes (05:00 - 13:00)', status: 'Aktiv', licenseCat: 'D', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (selectedRouteId || BUS_ROUTES[0].id), personalId: '', username: '', pin: '', joinDate: new Date().toISOString().split('T')[0], address: '' });
            if (view === 'form-inspector') setFormData({ name: '', phone: '', status: 'Në Linjë', posCode: '', employmentType: 'Full-Time', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (selectedRouteId || BUS_ROUTES[0].id), personalId: '', username: '', pin: '' });
            if (view === 'form-bus') setFormData({ plate: '', routeId: currentAccount?.role === 'operator' ? currentAccount.routeId : (data?.routeId || selectedRouteId || BUS_ROUTES[0].id), driverId: '', inspectorId: '', year: new Date().getFullYear().toString(), brand: '', capacity: 60, status: 'Aktiv', schedules: { terminal1: [], terminal2: [] } });
        }
    };

    const closeForm = () => {
        if (['form-bus', 'form-driver', 'form-inspector', 'form-schedules'].includes(currentView) && selectedRouteId)
            setCurrentView('route-detail');
        else setCurrentView('list');
        setFormData({});
    };

    // ── FORM SUBMIT ───────────────────────────────────────────────────────────
    const handleFormSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (currentView === 'form-driver' || (currentView === 'view-staff-schedule' && formData.role === 'driver')) {
            setIsSaving(true);
            const newId = formMode === 'add' ? `d_${Date.now()}` : formData.id;
            const loginUsername = formData.username || formData.personalId || newId;
            const loginPin = formData.pin || '1234';
            const driverToSave = isDispatcher ? { id: newId, name: formData.name, username: loginUsername, pin: loginPin, personalId: formData.personalId || loginUsername, phone: formData.phone, routeId: formData.routeId || selectedRouteId || '1A', shift: formData.shift, status: formData.status || 'Aktiv', weeklyProgram: formData.weeklyProgram || {}, role: 'driver' } : { id: formData.id, role: 'driver', routeId: formData.routeId, weeklyProgram: formData.weeklyProgram || {} };
            fetch('/api/admin/staff', { method: formMode === 'add' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(driverToSave) })
                .then(async res => {
                    if (!res.ok) throw new Error('Failed');
                    const saved = await res.json();
                    if (formMode === 'add') setAdminDrivers([...adminDrivers, saved]);
                    else setAdminDrivers(adminDrivers.map((d: any) => d.id === driverToSave.id ? { ...d, ...saved } : d));
                    addStaffAccount({ id: saved.id || driverToSave.id, name: saved.name || formData.name, username: saved.username || loginUsername, pin: saved.pin || loginPin, role: 'driver', routeId: saved.routeId || formData.routeId, weeklyProgram: saved.weeklyProgram, status: saved.status || 'Aktiv', createdAt: Date.now() });
                    closeForm(); setTimeout(() => setNotification({ msg: isDispatcher ? 'Shoferi u ruajt! ✓' : 'Programi u ruajt! ✓', type: 'success' }), 300);
                })
                .catch(() => setNotification({ msg: 'Gabim gjatë ruajtjes.', type: 'error' }))
                .finally(() => setIsSaving(false));
            syncBusesWithAdmin();

        } else if (currentView === 'form-inspector' || (currentView === 'view-staff-schedule' && formData.role === 'inspector')) {
            setIsSaving(true);
            const newId = formMode === 'add' ? `i_${Date.now()}` : formData.id;
            const loginUsername = formData.username || formData.personalId || newId;
            const loginPin = formData.pin || '1234';
            const inspToSave = isDispatcher ? { id: newId, name: formData.name, username: loginUsername, pin: loginPin, personalId: formData.personalId || loginUsername, phone: formData.phone, routeId: formData.routeId || selectedRouteId || '1A', status: formData.status || 'Në Linjë', weeklyProgram: formData.weeklyProgram || {}, role: 'inspector' } : { id: formData.id, role: 'inspector', routeId: formData.routeId, weeklyProgram: formData.weeklyProgram || {} };
            fetch('/api/admin/staff', { method: formMode === 'add' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inspToSave) })
                .then(async res => {
                    if (!res.ok) throw new Error('Failed');
                    const saved = await res.json();
                    if (formMode === 'add') setAdminInspectors([...adminInspectors, saved]);
                    else setAdminInspectors(adminInspectors.map((i: any) => i.id === inspToSave.id ? { ...i, ...saved } : i));
                    addStaffAccount({ id: saved.id || inspToSave.id, name: saved.name || formData.name, username: saved.username || loginUsername, pin: saved.pin || loginPin, role: 'inspector', routeId: saved.routeId || formData.routeId, weeklyProgram: saved.weeklyProgram, status: saved.status || 'Aktiv', createdAt: Date.now() });
                    closeForm(); setTimeout(() => setNotification({ msg: isDispatcher ? 'Faturino u ruajt! ✓' : 'Programi u ruajt! ✓', type: 'success' }), 300);
                })
                .catch(() => setNotification({ msg: 'Gabim gjatë ruajtjes.', type: 'error' }))
                .finally(() => setIsSaving(false));

        } else if (currentView === 'form-bus' || currentView === 'form-schedules') {
            setIsSaving(true);
            const busId = formData.id || formData.plate || formData._id?.toString?.() || '';
            const busRouteId = (formData.routeId || selectedRouteId || '1A').replace('L', '');
            if (!busId && formMode === 'edit') { setNotification({ msg: 'ID e mjetit mungon.', type: 'error' }); setIsSaving(false); return; }
            const busToSave = isDispatcher ? { ...formData, id: formMode === 'add' ? (formData.plate || formData.id) : busId, routeId: busRouteId } : { id: busId, routeId: busRouteId, driverId: formData.driverId || '', inspectorId: formData.inspectorId || '', schedules: formData.schedules || { terminal1: [], terminal2: [] } };
            fetch('/api/admin/buses', { method: formMode === 'add' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(busToSave) })
                .then(async res => {
                    if (!res.ok) { if (res.status === 404) throw new Error('Autobusi nuk u gjet.'); throw new Error(`Gabim ${res.status}`); }
                    const saved = await res.json();
                    if (formMode === 'add') setAdminBuses([...adminBuses, saved]);
                    else setAdminBuses(adminBuses.map((b: any) => (b.id === busId || b._id?.toString() === busId) ? { ...b, ...saved } : b));
                    if (typeof syncBusesWithAdmin === 'function') syncBusesWithAdmin();
                    refreshData(); closeForm();
                    setTimeout(() => setNotification({ msg: isDispatcher ? 'Mjeti u ruajt! ✓' : 'Mjeti u përditësua! ✓', type: 'success' }), 300);
                })
                .catch(err => setNotification({ msg: `Gabim: ${err.message}`, type: 'error' }))
                .finally(() => setIsSaving(false));

        } else if (currentView === 'form-account') {
            setIsSaving(true);
            const accToSave = formMode === 'add' ? { ...formData, id: `acc_${Date.now()}`, createdAt: Date.now(), status: 'active', routeId: formData.routeId || selectedRouteId || '1A' } : { ...formData, routeId: formData.routeId || selectedRouteId || '1A' };
            fetch('/api/admin/staff', { method: formMode === 'add' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accToSave) })
                .then(async res => {
                    if (!res.ok) throw new Error('Failed');
                    const saved = await res.json();
                    if (formMode === 'add') addStaffAccount(saved); else updateStaffAccount(saved.id, saved);
                    fetchDbAccounts(); closeForm();
                    setTimeout(() => setNotification({ msg: 'Llogaria u ruajt! ✓', type: 'success' }), 300);
                })
                .catch(() => setNotification({ msg: 'Gabim gjatë ruajtjes.', type: 'error' }))
                .finally(() => setIsSaving(false));
        }
    };

    const handlePrintSchedules = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const driver = adminDrivers.find((d: any) => d.id === formData.driverId);
        const t1Name = formData._termNames?.[0] || 'Terminali 1';
        const t2Name = formData._termNames?.[1] || 'Terminali 2';
        const t1s = [...(formData.schedules?.terminal1 || [])].sort((a, b) => (a.d || '').localeCompare(b.d || ''));
        const t2s = [...(formData.schedules?.terminal2 || [])].sort((a, b) => (a.d || '').localeCompare(b.d || ''));
        const maxRows = Math.max(t1s.length, t2s.length);
        let rows = maxRows === 0 ? '<tr><td colspan="4" style="padding:20px;text-align:center;color:#666">Nuk ka orare.</td></tr>' : '';
        for (let i = 0; i < maxRows; i++) {
            const t1 = { d: '-', a: '-', ...t1s[i] }, t2 = { d: '-', a: '-', ...t2s[i] };
            rows += `<tr><td>${t1.d || '-'}</td><td>${t1.a || '-'}</td><td>${t2.d || '-'}</td><td>${t2.a || '-'}</td></tr>`;
        }
        printWindow.document.write(`<html><head><title>Oraret - ${formData.id}</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px;text-align:center}th{background:#f4f4f5}@media print{@page{margin:15mm}}</style></head><body><h2>Fleta e Orareve: ${formData.id}</h2><p>Shoferi: ${driver?.name || 'E pacaktuar'} · Linja: ${formData.routeId}</p><table><thead><tr><th colspan="2">${t1Name}</th><th colspan="2">${t2Name}</th></tr><tr><th>Nisja</th><th>Mbërritja</th><th>Nisja</th><th>Mbërritja</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:40px;color:#999;font-size:12px">Urbani Im · ${new Date().toLocaleDateString('sq-AL')}</p><script>window.onload=function(){window.print()}<\/script></body></html>`);
        printWindow.document.close();
    };

    const renderWeeklyProgram = () => {
        const days = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];
        const prog = formData.weeklyProgram || Object.fromEntries(days.map(d => [d, 'Pushim']));
        const shiftColors: any = { 'Mëngjes': T.blue, 'Pasdite': T.amber, 'Nata': T.violet, 'Pushim': T.dim };
        return (
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                    {days.map(day => {
                        const val = prog[day] || 'Pushim';
                        const isWeekend = day === 'E Shtunë' || day === 'E Diel';
                        return (
                            <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', color: isWeekend ? T.red : T.muted }}>
                                    {day.substring(0, 3)}
                                </div>
                                <div style={{
                                    padding: '6px 3px', borderRadius: 8,
                                    background: `${shiftColors[val] || T.dim}14`,
                                    border: `1px solid ${shiftColors[val] || T.dim}30`,
                                    textAlign: 'center', fontSize: 10, fontWeight: 700,
                                    color: shiftColors[val] || T.dim, marginBottom: 4
                                }}>{val}</div>
                                <select
                                    value={val}
                                    onChange={e => setFormData({ ...formData, weeklyProgram: { ...prog, [day]: e.target.value } })}
                                    style={{
                                        width: '100%', padding: '6px 4px', borderRadius: 7,
                                        background: T.raised, border: `1px solid ${T.border}`,
                                        color: T.text, fontSize: 10, fontFamily: 'inherit', outline: 'none',
                                        appearance: 'none', textAlign: 'center', cursor: 'pointer'
                                    }}
                                >
                                    <option value="Mëngjes">Mëngjes</option>
                                    <option value="Pasdite">Pasdite</option>
                                    <option value="Nata">Nata</option>
                                    <option value="Pushim">Pushim</option>
                                </select>
                            </div>
                        );
                    })}
                </div>
                <p style={{ fontSize: 11, color: T.dim, marginTop: 12, fontStyle: 'italic' }}>* Programi pasqyrohet në dashboard-in e punonjësit.</p>
            </div>
        );
    };

    // ── TABS NAV ─────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'routes', label: 'Linjat', icon: Route },
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'drivers', label: 'Shoferët', icon: Users },
        { id: 'inspectors', label: 'Faturino', icon: UserCheck },
        ...(isDispatcher ? [{ id: 'accounts', label: 'Llogaritë', icon: ShieldCheck }, { id: 'logs', label: 'Auditimi', icon: Activity }] : []),
    ];

    const roleColor = (role: string) => ({ dispatcher: T.red, operator: T.violet, driver: T.amber, inspector: T.green }[role] || T.muted);
    const roleLabel = (role: string) => ({ dispatcher: 'Dispatcher', operator: 'Operator', driver: 'Shofer', inspector: 'Faturino' }[role] || role);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            width: '100%', minHeight: '100vh',
            background: T.bg, color: T.text,
            fontFamily: "'Inter','system-ui',sans-serif",
            boxSizing: 'border-box'
        }}>

            {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: `${T.surface}f0`, backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${T.border}`,
                padding: '0 24px', height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
            }}>
                {/* Left: brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: T.violet,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ShieldCheck size={16} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Backoffice</span>
                    {currentAccount?.role === 'operator' && (
                        <Badge color={T.violet}>Linja {currentAccount.routeId}</Badge>
                    )}
                </div>

                {/* Center: tabs */}
                <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', overflow: 'auto' }}>
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id}
                            onClick={() => { setActiveTab(id); setCurrentView('list'); setSelectedRouteId(null); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 14px', borderRadius: 7,
                                background: activeTab === id ? T.raised : 'transparent',
                                border: `1px solid ${activeTab === id ? T.border : 'transparent'}`,
                                color: activeTab === id ? T.text : T.muted,
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap'
                            }}>
                            <Icon size={13} />{label}
                        </button>
                    ))}
                </div>

                {/* Right: user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: `${T.violet}20`, border: `1px solid ${T.violet}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={13} color={T.violet} />
                            </div>
                            <span style={{ fontSize: 12, color: T.muted }}>{user.name}</span>
                        </div>
                    )}
                    <Btn variant="danger" onClick={() => triggerConf({
                        title: 'Dalja nga Sistemi',
                        message: 'A je i sigurt që dëshiron të dalësh?',
                        confirmText: 'Dil', confirmColor: T.red, icon: LogOut,
                        onConfirm: logout
                    })}>
                        <LogOut size={13} /> Dil
                    </Btn>
                </div>
            </div>

            {/* ── CONTENT ─────────────────────────────────────────────────────── */}
            <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

                {/* ── ROUTES LIST ─────────────────────────────────────────────── */}
                {currentView === 'list' && activeTab === 'routes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={currentAccount?.role === 'operator' ? `Linja ${currentAccount.routeId}` : 'Menaxhimi i Linjave'}
                            sub="Zgjidhni një linjë për të menaxhuar flotën, stafin dhe oraret."
                        />
                        <SearchBar placeholder="Kërko me targë ose model..." filterOptions={[{ id: 'all', label: 'Të Gjithë' }, { id: 'Aktiv', label: 'Aktiv' }, { id: 'Në Garazh', label: 'Në Garazh' }]} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                        {isLoadingBuses && currentAccount?.role === 'operator' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0', color: T.muted }}>
                                <Spinner size={20} /> Duke ngarkuar...
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                                {(currentAccount?.role === 'operator'
                                    ? BUS_ROUTES.filter(r => routeMatches(r.id, currentAccount.routeId))
                                    : visibleRoutes
                                ).map(route => {
                                    const rb = visibleBuses.filter((b: any) => routeMatches(b.routeId, route.id));
                                    const active = rb.filter((b: any) => b.status === 'Aktiv').length;
                                    return (
                                        <div key={route.id}
                                            onClick={() => { setSelectedRouteId(route.id); setCurrentView('route-detail'); }}
                                            style={{
                                                padding: '20px', borderRadius: 12, cursor: 'pointer',
                                                background: T.surface, border: `1px solid ${T.border}`,
                                                transition: 'all .15s', position: 'relative', overflow: 'hidden'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = route.color + '60'; e.currentTarget.style.background = T.raised; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
                                        >
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, bottom: 0, background: route.color, borderRadius: '12px 0 0 12px' }} />
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 44, height: 44, borderRadius: 10,
                                                        background: `${route.color}18`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 14, fontWeight: 800, color: route.color,
                                                        border: `1px solid ${route.color}30`
                                                    }}>{route.id}</div>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{route.label}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <Badge color={active > 0 ? T.green : T.muted} dot={active > 0}>{active}/{rb.length} aktive</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} color={T.dim} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ROUTE DETAIL ────────────────────────────────────────────── */}
                {currentView === 'route-detail' && selectedRoute && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={`Linja ${selectedRoute.id} — ${selectedRoute.name}`}
                            sub="Mjetet, stafi dhe oraret e kësaj linje."
                            onBack={() => { setSelectedRouteId(null); setCurrentView('list'); }}
                            actions={isDispatcher ? [
                                <Btn key="d" onClick={() => navigateToForm('form-driver', 'add')}><User size={13} /> Shto Shofer</Btn>,
                                <Btn key="i" onClick={() => navigateToForm('form-inspector', 'add')}><Banknote size={13} /> Shto Faturino</Btn>,
                                <Btn key="b" variant="primary" onClick={() => navigateToForm('form-bus', 'add', { routeId: selectedRoute.id })}><Bus size={13} /> Shto Autobus</Btn>,
                            ] : undefined}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
                            <StatCard icon={Bus} label="Mjete Aktive" value={`${routeBuses.filter((b: any) => b.status === 'Aktiv').length}/${routeBuses.length}`} color={T.green} />
                            <StatCard icon={Users} label="Shoferë" value={routeDrivers.length} color={T.blue} />
                            <StatCard icon={UserCheck} label="Faturino" value={routeInspectors.length} color={T.amber} />
                        </div>

                        <SearchBar placeholder="Kërko autobus në këtë linjë..." filterOptions={[{ id: 'all', label: 'Të Gjithë' }, { id: 'Aktiv', label: 'Aktiv' }, { id: 'Në Garazh', label: 'Jashtë' }]} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                        {routeBuses.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', background: T.surface, borderRadius: 12, border: `1px dashed ${T.border}` }}>
                                <Bus size={36} color={T.dim} style={{ marginBottom: 12 }} />
                                <p style={{ color: T.muted, margin: 0 }}>Asnjë autobus në këtë linjë.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                                {routeBuses.map((bus: any) => {
                                    const driver = adminDrivers.find((d: any) => d.id === bus.driverId || d._id?.toString() === bus.driverId);
                                    const inspector = adminInspectors.find((i: any) => i.id === bus.inspectorId || i._id?.toString() === bus.inspectorId);
                                    const isActive = bus.status === 'Aktiv';
                                    return (
                                        <div key={bus.id || bus._id}
                                            onClick={() => navigateToForm('form-bus', 'edit', bus)}
                                            style={{
                                                padding: '18px', borderRadius: 12, cursor: 'pointer',
                                                background: T.surface, border: `1px solid ${isActive ? T.green + '25' : T.border}`,
                                                transition: 'all .15s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.raised}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                                <span style={{
                                                    fontFamily: 'monospace', fontWeight: 800, fontSize: 16,
                                                    color: '#eab308', letterSpacing: 1,
                                                    padding: '4px 10px', borderRadius: 7,
                                                    background: 'rgba(234,179,8,.1)', border: '1px solid rgba(234,179,8,.2)'
                                                }}>{bus.id || bus.plate}</span>
                                                <Badge color={isActive ? T.green : T.dim} dot={isActive}>{isActive ? 'Aktiv' : 'Garazh'}</Badge>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                                {[
                                                    { label: 'Shoferi', val: driver?.name || bus.driverId || 'Pa caktuar', hasDr: !!driver, hasId: !!bus.driverId },
                                                    { label: 'Faturino', val: inspector?.name || bus.inspectorId || 'Pa caktuar', hasDr: !!inspector, hasId: !!bus.inspectorId },
                                                ].map(({ label, val, hasDr, hasId }) => (
                                                    <div key={label} style={{ padding: '9px 11px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}` }}>
                                                        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>{label}</div>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: hasDr ? T.text : hasId ? T.blue : T.red, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: T.muted }}>
                                                <span>{bus.brand} {bus.year}</span>
                                                <span style={{ color: T.blue, fontWeight: 600 }}>Menaxho →</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── OVERVIEW ────────────────────────────────────────────────── */}
                {currentView === 'list' && activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader title="Pasqyra e Sistemit" sub="Gjendja operative në kohë reale" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                            <StatCard icon={Bus} label="Autobusë Aktivë" value={`${activeBuses}/${filteredBuses.length}`} color={T.blue} />
                            <StatCard icon={Users} label="Shoferë" value={filteredDrivers.length} color={T.green} />
                            <StatCard icon={Banknote} label="Faturino" value={filteredInspectors.length} color={T.amber} />
                            <StatCard icon={Route} label="Linja Aktive" value={`${new Set(filteredBuses.map((b: any) => b.routeId)).size}/${visibleRoutes.length}`} color={T.violet} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { title: 'Lidhja GPS', desc: 'Pajisjet GPS po komunikojnë. Vonesa rrjeti ~1.2ms.', color: T.green },
                                { title: 'Databaza', desc: 'Relacionet janë sinkronizuar. Sistemi gati.', color: T.blue },
                            ].map(({ title, desc, color }) => (
                                <Card key={title} style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                                        <span style={{ fontWeight: 700, fontSize: 13, color }}>{title}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── DRIVERS LIST ────────────────────────────────────────────── */}
                {currentView === 'list' && activeTab === 'drivers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <PageHeader title="Regjistri i Shoferëve" sub="Lista e plotë e shoferëve në sistem." />
                        <SearchBar placeholder="Kërko emër ose ID..." filterOptions={[{ id: 'all', label: 'Të Gjithë' }, { id: 'Aktiv', label: 'Aktiv' }, { id: 'Pushim', label: 'Pushim' }]} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        <Card style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                    <thead><tr>
                                        <Th>Punonjësi</Th><Th>Linja & Mjeti</Th><Th>Turni</Th><Th>Statusi</Th><Th right>Veprime</Th>
                                    </tr></thead>
                                    <tbody>
                                        {filteredDrivers.map((d: any, idx: number) => {
                                            const bus = filteredBuses.find((b: any) => b.driverId === d.id);
                                            const route = BUS_ROUTES.find(r => r.id === d.routeId);
                                            const sc = d.status === 'Aktiv' ? T.green : d.status === 'Pushim' ? T.amber : T.red;
                                            return (
                                                <tr key={`${d.id}-${idx}`} style={{ transition: 'background .1s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: T.raised, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <User size={16} color={T.muted} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                                                                <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace' }}>{d.personalId || d.id}</div>
                                                            </div>
                                                        </div>
                                                    </Td>
                                                    <Td>
                                                        <div style={{ fontWeight: 600, fontSize: 12, color: route?.color || T.muted, marginBottom: 4 }}>{route?.name || '—'}</div>
                                                        {bus ? <Badge color={T.dim}><Bus size={10} /> {bus.id}</Badge> : <span style={{ fontSize: 11, color: T.dim }}>Pa mjet</span>}
                                                    </Td>
                                                    <Td><span style={{ fontSize: 12, color: T.muted }}>{d.shift?.split('(')[0]?.trim()}</span></Td>
                                                    <Td><Badge color={sc} dot>{d.status}</Badge></Td>
                                                    <Td right>
                                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                            <Btn onClick={() => { setFormData(d); setFormMode('edit'); setCurrentView('view-staff-schedule'); }}><Clock size={12} /> Program</Btn>
                                                            <Btn onClick={() => navigateToForm('form-driver', 'edit', d)}><Edit2 size={12} /> Hap</Btn>
                                                            {isDispatcher && <IconBtn icon={Trash2} color={T.red} onClick={() => handleDeleteDriver(d.id, d.routeId)} />}
                                                        </div>
                                                    </Td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── INSPECTORS LIST ─────────────────────────────────────────── */}
                {currentView === 'list' && activeTab === 'inspectors' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <PageHeader title="Regjistri i Faturinove" sub="Lista e plotë e faturinove në sistem." />
                        <SearchBar placeholder="Kërko emër ose ID..." filterOptions={[{ id: 'all', label: 'Të Gjithë' }, { id: 'Në Linjë', label: 'Aktiv' }, { id: 'Pushim', label: 'Pushim' }]} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        <Card style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                                    <thead><tr><Th>Punonjësi</Th><Th>Linja & Mjeti</Th><Th>POS / Kontrata</Th><Th right>Veprime</Th></tr></thead>
                                    <tbody>
                                        {filteredInspectors.map((d: any, idx: number) => {
                                            const bus = adminBuses.find((b: any) => b.inspectorId === d.id);
                                            const route = BUS_ROUTES.find(r => r.id === d.routeId);
                                            return (
                                                <tr key={`${d.id}-${idx}`}
                                                    onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: T.raised, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <Banknote size={16} color={T.muted} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                                                                <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace' }}>{d.personalId || d.id}</div>
                                                            </div>
                                                        </div>
                                                    </Td>
                                                    <Td>
                                                        <div style={{ fontWeight: 600, fontSize: 12, color: route?.color || T.muted, marginBottom: 4 }}>{route?.name || '—'}</div>
                                                        {bus ? <Badge color={T.dim}><Bus size={10} /> {bus.id}</Badge> : <span style={{ fontSize: 11, color: T.dim }}>Pa mjet</span>}
                                                    </Td>
                                                    <Td>
                                                        <div style={{ fontSize: 12 }}>POS: <span style={{ fontFamily: 'monospace', color: T.text }}>{d.posCode || '—'}</span></div>
                                                        <div style={{ fontSize: 11, color: T.muted }}>{d.employmentType || 'Full-Time'}</div>
                                                    </Td>
                                                    <Td right>
                                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                            <Btn onClick={() => { setFormData(d); setFormMode('edit'); setCurrentView('view-staff-schedule'); }}><Clock size={12} /> Program</Btn>
                                                            <Btn onClick={() => navigateToForm('form-inspector', 'edit', d)}><Edit2 size={12} /> Hap</Btn>
                                                            {isDispatcher && <IconBtn icon={Trash2} color={T.red} onClick={() => handleDeleteInspector(d.id, d.routeId)} />}
                                                        </div>
                                                    </Td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── ACCOUNTS ────────────────────────────────────────────────── */}
                {currentView === 'list' && activeTab === 'accounts' && isDispatcher && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <PageHeader
                            title="Menaxhimi i Llogarive"
                            sub={`${filteredAccounts.length} llogari në total`}
                            actions={[
                                <Btn key="r" onClick={fetchDbAccounts} disabled={isLoadingAccounts}>{isLoadingAccounts ? <Spinner /> : <Activity size={12} />} Rifresko</Btn>,
                                <Btn key="a" variant="primary" onClick={() => { setCurrentView('form-account'); setFormMode('add'); setFormData({ name: '', username: '', pin: '', role: 'operator', routeId: BUS_ROUTES[0].id, status: 'active' }); }}><Plus size={12} /> Shto Llogari</Btn>,
                            ]}
                        />
                        <SearchBar placeholder="Kërko emër ose username..." filterOptions={[{ id: 'all', label: 'Të Gjitha' }, { id: 'operator', label: 'Operator' }, { id: 'driver', label: 'Shofer' }, { id: 'inspector', label: 'Faturino' }]} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        <Card style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                                    <thead><tr><Th>Emri</Th><Th>Username</Th><Th>Roli</Th><Th>Linja</Th><Th>Statusi</Th><Th right>Veprime</Th></tr></thead>
                                    <tbody>
                                        {isLoadingAccounts && dbAccounts.length === 0 ? (
                                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: T.muted }}><Spinner size={20} /></td></tr>
                                        ) : filteredAccounts.length === 0 ? (
                                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: T.muted, fontSize: 13 }}>Nuk u gjet asnjë llogari.</td></tr>
                                        ) : filteredAccounts.map((acc: any, i: number) => (
                                            <tr key={`${acc.id}-${i}`}
                                                onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <Td><span style={{ fontWeight: 600 }}>{acc.name || '—'}</span></Td>
                                                <Td mono>{acc.username || acc.personalId || '—'}</Td>
                                                <Td><Badge color={roleColor(acc.role)}>{roleLabel(acc.role)}</Badge></Td>
                                                <Td mono>{acc.routeId || '—'}</Td>
                                                <Td><Badge color={acc.status === 'active' || acc.status === 'Aktiv' ? T.green : T.red} dot>{acc.status === 'active' || acc.status === 'Aktiv' ? 'Aktiv' : 'Joaktiv'}</Badge></Td>
                                                <Td right>
                                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                        <IconBtn icon={Edit2} color={T.blue} onClick={() => { setFormData(acc); setFormMode('edit'); setCurrentView('form-account'); }} />
                                                        {acc.role !== 'dispatcher' && (
                                                            <IconBtn icon={Trash2} color={T.red} disabled={deletingAccountId === (acc.id || acc._id?.toString())} onClick={() => handleDeleteAccount(acc)} />
                                                        )}
                                                    </div>
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── FORM: DRIVER ─────────────────────────────────────────────── */}
                {currentView === 'form-driver' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={formMode === 'add' ? 'Regjistro Shofer' : `Profili: ${formData.name}`}
                            sub="Të dhënat personale, operative dhe programi javor."
                            onBack={closeForm}
                            actions={[
                                formMode === 'edit' && isDispatcher && <Btn key="del" variant="danger" onClick={() => { handleDeleteDriver(formData.id, formData.routeId); closeForm(); }}><Trash2 size={13} /> Fshi</Btn>,
                                <Btn key="c" onClick={closeForm}>Anulo</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} {isSaving ? 'Duke ruajtur...' : 'Ruaj'}</Btn>,
                            ].filter(Boolean)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Card>
                                    <SectionHead icon={User} title="Të Dhënat Personale" color={T.blue} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, opacity: isDispatcher ? 1 : .5, pointerEvents: isDispatcher ? 'auto' : 'none' }}>
                                        {!isDispatcher && <div style={{ gridColumn: 'span 2', padding: '8px 12px', borderRadius: 8, background: `${T.amber}10`, border: `1px solid ${T.amber}25`, fontSize: 12, color: T.amber }}>🔒 Vetëm Dispatcher mund të modifikojë të dhënat personale.</div>}
                                        <Field label="Emri i Plotë *"><Input value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="p.sh. Artan Hoxha" disabled={!isDispatcher} /></Field>
                                        <Field label="Personal ID"><Input value={formData.personalId} onChange={(e: any) => setFormData({ ...formData, personalId: e.target.value.toUpperCase() })} placeholder="J12345678A" disabled={!isDispatcher} /></Field>
                                        <Field label="Telefoni"><Input value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder="+355 6x xxx xxxx" disabled={!isDispatcher} /></Field>
                                        <Field label="Adresa"><Input value={formData.address} onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} placeholder="Adresa e plotë" disabled={!isDispatcher} /></Field>
                                    </div>
                                </Card>

                                {isDispatcher && (
                                    <Card>
                                        <SectionHead icon={ShieldCheck} title="Kredencialet e Hyrjes" color={T.violet} />
                                        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <Field label="Username (opsional)"><Input value={formData.username} onChange={(e: any) => setFormData({ ...formData, username: e.target.value })} placeholder="Lihet bosh = Personal ID" /></Field>
                                            <Field label="PIN (default: 1234)"><Input type="password" value={formData.pin} onChange={(e: any) => setFormData({ ...formData, pin: e.target.value })} placeholder="4–6 shifra" /></Field>
                                        </div>
                                    </Card>
                                )}

                                <Card>
                                    <SectionHead icon={Settings} title="Detajet Operative" color={T.green} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Linja">
                                            <Select value={formData.routeId} onChange={(e: any) => setFormData({ ...formData, routeId: e.target.value })} disabled={!isDispatcher}>
                                                {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </Select>
                                        </Field>
                                        <Field label="Turni">
                                            <Select value={formData.shift} onChange={(e: any) => setFormData({ ...formData, shift: e.target.value })}>
                                                <option value="Mëngjes (05:00 - 13:00)">Mëngjes</option>
                                                <option value="Pasdite (13:00 - 21:00)">Pasdite</option>
                                                <option value="Natë (21:00 - 05:00)">Natë</option>
                                                <option value="E Ndarë (06-10 / 15-19)">E Ndarë</option>
                                            </Select>
                                        </Field>
                                        <Field label="Kat. Patentës"><Input value={formData.licenseCat} onChange={(e: any) => setFormData({ ...formData, licenseCat: e.target.value.toUpperCase() })} placeholder="D" /></Field>
                                        <Field label="Statusi">
                                            <Select value={formData.status} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Aktiv">Aktiv</option>
                                                <option value="Pushim">Pushim</option>
                                                <option value="Në Garazh">Në Garazh</option>
                                            </Select>
                                        </Field>
                                    </div>
                                </Card>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <Card style={{ padding: 16 }}>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 8 }}>Mjeti i atribuar</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#eab308' }}>
                                        {adminBuses.find((b: any) => b.driverId === formData.id)?.id || 'Pa mjet'}
                                    </div>
                                </Card>
                                <Card style={{ padding: 16 }}>
                                    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>Për programin javor, përdorni "Program" nga lista e shoferëve.</div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FORM: INSPECTOR ──────────────────────────────────────────── */}
                {currentView === 'form-inspector' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={formMode === 'add' ? 'Regjistro Faturino' : `Profili: ${formData.name}`}
                            sub="Të dhënat personale dhe operacionale të faturinos."
                            onBack={closeForm}
                            actions={[
                                formMode === 'edit' && isDispatcher && <Btn key="del" variant="danger" onClick={() => { handleDeleteInspector(formData.id, formData.routeId); closeForm(); }}><Trash2 size={13} /> Fshi</Btn>,
                                <Btn key="c" onClick={closeForm}>Anulo</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} {isSaving ? 'Duke ruajtur...' : 'Ruaj'}</Btn>,
                            ].filter(Boolean)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Card>
                                    <SectionHead icon={User} title="Të Dhënat Personale" color={T.blue} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Emri i Plotë *"><Input value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="p.sh. Ilir Meta" /></Field>
                                        <Field label="Personal ID"><Input value={formData.personalId} onChange={(e: any) => setFormData({ ...formData, personalId: e.target.value.toUpperCase() })} placeholder="J12345678A" /></Field>
                                        <Field label="Telefoni"><Input value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder="+355 6x xxx xxxx" /></Field>
                                    </div>
                                </Card>
                                <Card>
                                    <SectionHead icon={ShieldCheck} title="Kredencialet" color={T.violet} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Username"><Input value={formData.username} onChange={(e: any) => setFormData({ ...formData, username: e.target.value })} placeholder="Lihet bosh = Personal ID" /></Field>
                                        <Field label="PIN"><Input type="password" value={formData.pin} onChange={(e: any) => setFormData({ ...formData, pin: e.target.value })} placeholder="Default: 1234" /></Field>
                                    </div>
                                </Card>
                                <Card>
                                    <SectionHead icon={Banknote} title="Detajet Operative" color={T.green} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Linja *">
                                            <Select value={formData.routeId} onChange={(e: any) => setFormData({ ...formData, routeId: e.target.value })}>
                                                {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </Select>
                                        </Field>
                                        <Field label="Statusi">
                                            <Select value={formData.status} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Në Linjë">Në Linjë</option>
                                                <option value="Pushim">Pushim</option>
                                            </Select>
                                        </Field>
                                        <Field label="Kodi POS"><Input value={formData.posCode} onChange={(e: any) => setFormData({ ...formData, posCode: e.target.value.toUpperCase() })} placeholder="1029A" /></Field>
                                        <Field label="Kontrata">
                                            <Select value={formData.employmentType} onChange={(e: any) => setFormData({ ...formData, employmentType: e.target.value })}>
                                                <option value="Full-Time">Full-Time</option>
                                                <option value="Part-Time">Part-Time</option>
                                            </Select>
                                        </Field>
                                    </div>
                                </Card>
                            </div>
                            <Card style={{ padding: 16 }}>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 8 }}>Mjeti i atribuar</div>
                                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#eab308' }}>
                                    {adminBuses.find((b: any) => b.inspectorId === formData.id)?.id || 'Pa mjet'}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ── FORM: BUS ────────────────────────────────────────────────── */}
                {currentView === 'form-bus' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={formMode === 'add' ? 'Regjistro Autobus' : `Mjeti: ${formData.id || formData.plate}`}
                            sub={isDispatcher ? 'Të dhënat teknike dhe caktimi i stafit.' : '⚠ Si operator, mund të caktoni vetëm shoferin, faturinon dhe oraret.'}
                            onBack={closeForm}
                            actions={[
                                formMode === 'edit' && isDispatcher && <Btn key="del" variant="danger" onClick={() => { handleDeleteBus(formData.id, formData.routeId); closeForm(); }}><Trash2 size={13} /> Çregjistro</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} {isSaving ? 'Duke ruajtur...' : 'Ruaj'}</Btn>,
                            ].filter(Boolean)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: isDispatcher ? '1fr 280px' : '1fr 1fr', gap: 16, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {!isDispatcher && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: `${T.amber}0a`, border: `1px solid ${T.amber}25` }}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: '#eab308', letterSpacing: 2, padding: '6px 14px', borderRadius: 8, background: 'rgba(234,179,8,.1)' }}>{formData.id}</span>
                                        <div><div style={{ fontSize: 12, color: T.amber }}>Linja {(formData.routeId || '').replace('L', '')}</div>{formData.brand && <div style={{ fontSize: 11, color: T.muted }}>{formData.brand} {formData.year}</div>}</div>
                                    </div>
                                )}
                                {isDispatcher && (
                                    <Card>
                                        <SectionHead icon={Bus} title="Informacioni Teknik" color={T.blue} />
                                        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <Field label="Targa (ID)"><Input value={formData.id || formData.plate || ''} onChange={(e: any) => setFormData({ ...formData, plate: e.target.value.toUpperCase(), id: e.target.value.toUpperCase() })} placeholder="AB 123 CD" mono disabled={formMode === 'edit'} /></Field>
                                            <Field label="Linja">
                                                <Select value={formData.routeId || ''} onChange={(e: any) => setFormData({ ...formData, routeId: e.target.value, driverId: '', inspectorId: '' })}>
                                                    {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>Linja {r.id} — {r.name}</option>)}
                                                </Select>
                                            </Field>
                                            <Field label="Marka / Modeli"><Input value={formData.brand || ''} onChange={(e: any) => setFormData({ ...formData, brand: e.target.value })} placeholder="Mercedes-Benz Citaro" /></Field>
                                            <Field label="Viti"><Input type="number" value={formData.year || ''} onChange={(e: any) => setFormData({ ...formData, year: e.target.value })} placeholder="2018" /></Field>
                                        </div>
                                    </Card>
                                )}
                                <Card>
                                    <SectionHead icon={Users} title="Ekuipazhi — Caktimi i Stafit" color={T.green} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Shoferi">
                                            <Select value={formData.driverId || ''} onChange={(e: any) => setFormData({ ...formData, driverId: e.target.value })}>
                                                <option value="">Zgjidh shoferin...</option>
                                                {adminDrivers.filter((d: any) => routeMatches(d.routeId, formData.routeId)).map((d: any, idx: number) => (
                                                    <option key={`d-${d.id || idx}`} value={d.id || d._id}>{d.name} ({d.shift?.split('(')[0]?.trim()})</option>
                                                ))}
                                            </Select>
                                        </Field>
                                        <Field label="Faturino">
                                            <Select value={formData.inspectorId || ''} onChange={(e: any) => setFormData({ ...formData, inspectorId: e.target.value })}>
                                                <option value="">Zgjidh faturinon...</option>
                                                {adminInspectors.filter((i: any) => routeMatches(i.routeId, formData.routeId)).map((i: any, idx: number) => (
                                                    <option key={`i-${i.id || idx}`} value={i.id || i._id}>{i.name}</option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>
                                    <div style={{ margin: '0 20px 20px', padding: '10px 14px', borderRadius: 8, background: `${T.amber}0a`, border: `1px solid ${T.amber}20`, fontSize: 12, color: T.muted, display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <AlertTriangle size={13} color={T.amber} /> Vetëm stafi i Linjës {(formData.routeId || '').replace('L', '')} është i disponueshëm.
                                    </div>
                                </Card>
                            </div>

                            {isDispatcher ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Card style={{ padding: 16 }}>
                                        <Field label="Gjendja Operative">
                                            <Select value={formData.status || 'Aktiv'} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Aktiv">🟢 Në Linjë</option>
                                                <option value="Në Garazh">⚪ Në Garazh</option>
                                                <option value="Mirëmbajtje">🔧 Mirëmbajtje</option>
                                            </Select>
                                        </Field>
                                    </Card>
                                </div>
                            ) : (() => {
                                const routeObj = BUS_ROUTES.find(r => routeMatches(r.id, formData.routeId));
                                const t1Id = routeObj?.stops?.[0], t2Id = routeObj?.stops?.[routeObj?.stops?.length - 1];
                                const t1Name = BUS_STOPS.find(s => s.id === t1Id)?.name || 'Terminali 1';
                                const t2Name = BUS_STOPS.find(s => s.id === t2Id)?.name || 'Terminali 2';
                                const t1 = (formData.schedules?.terminal1 || []) as any[];
                                const t2 = (formData.schedules?.terminal2 || []) as any[];
                                return (
                                    <Card>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Oraret</div>
                                                <div style={{ fontSize: 10, color: T.muted }}>{t1Name} · {t2Name}</div>
                                            </div>
                                            <Btn onClick={() => setFormData({ ...formData, schedules: { ...formData.schedules, terminal1: [...t1, { d: '', a: '' }], terminal2: [...t2, { d: '', a: '' }] } })}>
                                                <Plus size={11} /> Shto
                                            </Btn>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', background: T.bg }}>
                                            <div style={{ gridColumn: 'span 2', padding: '8px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>{t1Name.substring(0, 12)}</div>
                                            <div style={{ gridColumn: 'span 2', padding: '8px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>{t2Name.substring(0, 12)}</div>
                                        </div>
                                        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                            {Math.max(t1.length, t2.length) === 0 ? (
                                                <div style={{ padding: '28px', textAlign: 'center', color: T.dim, fontSize: 12 }}>Shtyp "Shto" për të shtuar orare</div>
                                            ) : Array.from({ length: Math.max(t1.length, t2.length) }).map((_, i) => (
                                                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${T.border}` }}>
                                                    {[
                                                        { arr: t1, term: 'terminal1', cyan: true },
                                                        { arr: t1, term: 'terminal1', cyan: false, isA: true },
                                                        { arr: t2, term: 'terminal2', cyan: true },
                                                        { arr: t2, term: 'terminal2', cyan: false, isA: true, last: true },
                                                    ].map(({ arr, term, cyan, isA, last }: any, ci) => (
                                                        <div key={ci} style={{ borderRight: !last ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center' }}>
                                                            <input type="time"
                                                                value={isA ? arr[i]?.a || '' : arr[i]?.d || ''}
                                                                onChange={e => {
                                                                    const n = [...(formData.schedules?.[term] || [])];
                                                                    n[i] = { ...(n[i] || {}), [isA ? 'a' : 'd']: e.target.value };
                                                                    setFormData({ ...formData, schedules: { ...formData.schedules, [term]: n } });
                                                                }}
                                                                style={{
                                                                    width: '100%', border: 'none', background: 'transparent',
                                                                    color: cyan ? '#67e8f9' : T.dim,
                                                                    fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                                                                    padding: '8px 6px', textAlign: 'center', colorScheme: 'dark', outline: 'none'
                                                                }}
                                                            />
                                                            {last && (
                                                                <button type="button"
                                                                    onClick={() => {
                                                                        const n1 = [...t1]; n1.splice(i, 1);
                                                                        const n2 = [...t2]; n2.splice(i, 1);
                                                                        setFormData({ ...formData, schedules: { terminal1: n1, terminal2: n2 } });
                                                                    }}
                                                                    style={{ width: 24, height: 24, borderRadius: 5, background: `${T.red}14`, color: T.red, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 6 }}
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* ── FORM: SCHEDULES ──────────────────────────────────────────── */}
                {currentView === 'form-schedules' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={`Oraret: ${formData.id}`}
                            sub="Oraret fikse të nisjeve nga secili terminal."
                            onBack={closeForm}
                            actions={[
                                <Btn key="p" variant="amber" onClick={handlePrintSchedules}><Printer size={13} /> Printo</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} Ruaj</Btn>,
                            ]}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[0, 1].map(ti => {
                                const termName = formData._termNames?.[ti] || `Terminali ${ti + 1}`;
                                const termKey = ti === 0 ? 'terminal1' : 'terminal2';
                                const items = formData.schedules?.[termKey] || [];
                                return (
                                    <Card key={ti}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{termName}</span>
                                            <Btn onClick={() => setFormData({ ...formData, schedules: { ...formData.schedules, [termKey]: [...items, ''] } })}>
                                                <Plus size={11} /> Shto
                                            </Btn>
                                        </div>
                                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {items.length === 0 && <div style={{ textAlign: 'center', color: T.dim, fontSize: 12, padding: '16px 0' }}>Asnjë orar i shtuar.</div>}
                                            {items.map((time: string, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <input type="time" value={time} required
                                                        onChange={e => { const n = [...items]; n[idx] = e.target.value; setFormData({ ...formData, schedules: { ...formData.schedules, [termKey]: n } }); }}
                                                        style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: T.raised, border: `1px solid ${T.border}`, color: '#67e8f9', fontFamily: 'monospace', fontSize: 13, outline: 'none', colorScheme: 'dark' }}
                                                    />
                                                    <IconBtn icon={Trash2} color={T.red} onClick={() => { const n = [...items]; n.splice(idx, 1); setFormData({ ...formData, schedules: { ...formData.schedules, [termKey]: n } }); }} />
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── FORM: ACCOUNT ────────────────────────────────────────────── */}
                {currentView === 'form-account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={formMode === 'add' ? 'Krijo Llogari' : `Llogaria: ${formData.username}`}
                            sub="Konfiguroni aksesin dhe rolin e punonjësit."
                            onBack={closeForm}
                            actions={[
                                formMode === 'edit' && formData.role !== 'dispatcher' && <Btn key="del" variant="danger" onClick={() => { deleteStaffAccount(formData.id); closeForm(); }}><Trash2 size={13} /> Fshi</Btn>,
                                <Btn key="c" onClick={closeForm}>Anulo</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} {isSaving ? 'Duke ruajtur...' : 'Ruaj'}</Btn>,
                            ].filter(Boolean)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Card>
                                    <SectionHead icon={ShieldCheck} title="Kredencialet e Hyrjes" color={T.violet} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Username *"><Input value={formData.username} onChange={(e: any) => setFormData({ ...formData, username: e.target.value })} placeholder="p.sh. emri.mbiemri" /></Field>
                                        <Field label="PIN / Fjalëkalim *"><Input type="text" value={formData.pin} onChange={(e: any) => setFormData({ ...formData, pin: e.target.value })} placeholder="Kod hyrjeje" /></Field>
                                    </div>
                                </Card>
                                <Card>
                                    <SectionHead icon={Users} title="Informacioni i Punonjësit" color={T.green} />
                                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <Field label="Emri i Plotë *"><Input value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="p.sh. Artan Hoxha" /></Field>
                                        <Field label="Roli">
                                            <Select value={formData.role || 'operator'} onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}>
                                                <option value="operator">Operator</option>
                                                <option value="driver">Shofer</option>
                                                <option value="inspector">Faturino</option>
                                            </Select>
                                        </Field>
                                        <Field label="Linja">
                                            <Select value={formData.routeId || ''} onChange={(e: any) => setFormData({ ...formData, routeId: e.target.value })} disabled={formData.role === 'dispatcher'}>
                                                {BUS_ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </Select>
                                        </Field>
                                        <Field label="Statusi">
                                            <Select value={formData.status || 'active'} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="active">Aktiv</option>
                                                <option value="inactive">Joaktiv</option>
                                            </Select>
                                        </Field>
                                    </div>
                                </Card>
                            </div>
                            <Card style={{ padding: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 10 }}>Udhëzues</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                                    <div><span style={{ color: T.text, fontWeight: 600 }}>Operatorët</span> — menaxhojnë linjën e tyre.</div>
                                    <div><span style={{ color: T.text, fontWeight: 600 }}>Shoferët</span> — aksesojnë orarin personal.</div>
                                    <div><span style={{ color: T.text, fontWeight: 600 }}>PIN</span> — duhet të jetë i fshehtë.</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ── WEEKLY SCHEDULE VIEW ────────────────────────────────────── */}
                {currentView === 'view-staff-schedule' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <PageHeader
                            title={`Programi Javor: ${formData.name}`}
                            sub="Planifikoni turnet javore të punonjësit."
                            onBack={closeForm}
                            actions={[
                                <Btn key="c" onClick={closeForm}>Mbyll</Btn>,
                                <Btn key="s" variant="primary" onClick={handleFormSubmit} disabled={isSaving}>{isSaving ? <Spinner /> : <Save size={13} />} {isSaving ? 'Duke ruajtur...' : 'Ruaj'}</Btn>,
                            ]}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
                            <Card>
                                <SectionHead icon={Clock} title="Turnet (E Hënë – E Diel)" color={T.amber} />
                                <div style={{ padding: 20 }}>{renderWeeklyProgram()}</div>
                            </Card>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <Card style={{ padding: 16 }}>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 8 }}>Mjeti i atribuar</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#eab308' }}>
                                        {adminBuses.find((b: any) => b.driverId === formData.id || b.inspectorId === formData.id)?.id || 'PA CAKTUAR'}
                                    </div>
                                </Card>
                                <Card style={{ padding: 16 }}>
                                    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>Ndryshimet reflektohen menjëherë në dashboard-in e punonjësit.</div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── TOAST ───────────────────────────────────────────────────────── */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 18px', borderRadius: 10,
                    background: notification.type === 'success' ? T.green : notification.type === 'error' ? T.red : T.blue,
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                    animation: 'ap-slide-in .25s ease'
                }}>
                    {notification.type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {notification.msg}
                </div>
            )}

            {/* ── CONFIRM MODAL ───────────────────────────────────────────────── */}
            {confModal?.isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{
                        width: '100%', maxWidth: 380,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 16, padding: 28, textAlign: 'center',
                        animation: 'ap-modal-up .25s cubic-bezier(.16,1,.3,1)'
                    }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${confModal.confirmColor || T.red}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: confModal.confirmColor || T.red }}>
                            {confModal.icon ? <confModal.icon size={22} /> : <AlertTriangle size={22} />}
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: T.text }}>{confModal.title}</h3>
                        <p style={{ margin: '0 0 24px', fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{confModal.message}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <Btn onClick={closeConf}>Anulo</Btn>
                            <button onClick={confModal.onConfirm} style={{
                                padding: '9px', borderRadius: 9,
                                background: confModal.confirmColor || T.red,
                                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                            }}>{confModal.confirmText || 'Konfirmo'}</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes ap-spin { to { transform: rotate(360deg); } }
        @keyframes ap-slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes ap-modal-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        select option { background: #18181b; color: #fafafa; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 300px"],
          div[style*="grid-template-columns: 1fr 280px"],
          div[style*="grid-template-columns: 1fr 260px"],
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          div[style*="padding: 24px"] { padding: 14px !important; }
        }
      `}</style>
        </div>
    );
}