'use client';
import { useState } from 'react';
import useStore, { BUS_ROUTES } from '../store/useStore';
import { 
  Users, UserCheck, Clock, Bus, Activity, 
  Settings, Banknote, MapPin, AlertTriangle, ShieldCheck, User, Trash2, Edit2, Plus, Route, X, ChevronLeft, Check, Save, ChevronRight, Printer
} from 'lucide-react';

export default function AdminPanel() {
  // Set "routes" as the default active tab because the user wants it to be primary.
  const [activeTab, setActiveTab] = useState('routes');
  
  // View State for Pages: 'list' | 'route-detail' | 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules'
  const [currentView, setCurrentView] = useState<'list' | 'route-detail' | 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules'>('list');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<any>({});

  // Zustand State
  const buses = useStore((state: any) => state.buses || []);
  const adminDrivers = useStore((state: any) => state.adminDrivers || []);
  const adminInspectors = useStore((state: any) => state.adminInspectors || []);
  const adminBuses = useStore((state: any) => state.adminBuses || []);
  
  const setAdminDrivers = useStore((state: any) => state.setAdminDrivers);
  const setAdminInspectors = useStore((state: any) => state.setAdminInspectors);
  const setAdminBuses = useStore((state: any) => state.setAdminBuses);
  const syncBusesWithAdmin = useStore((state: any) => state.syncBusesWithAdmin);

  const totalBuses = adminBuses.length;
  const activeBuses = buses.filter((b: any) => b.speed > 0).length;

  // --- Handlers ---
  const handleDeleteDriver = (id: string) => {
    if (window.confirm('Je i sigurt që do të fshish këtë shofer nga databaza?')) {
      setAdminDrivers(adminDrivers.filter((x: any) => x.id !== id));
      const updatedBuses = adminBuses.map((b: any) => b.driverId === id ? { ...b, driverId: null } : b);
      setAdminBuses(updatedBuses);
      syncBusesWithAdmin();
    }
  };

  const handleDeleteInspector = (id: string) => {
    if (window.confirm('Je i sigurt që do të fshish këtë faturino nga databaza?')) {
      setAdminInspectors(adminInspectors.filter((x: any) => x.id !== id));
      const updatedBuses = adminBuses.map((b: any) => b.inspectorId === id ? { ...b, inspectorId: null } : b);
      setAdminBuses(updatedBuses);
      syncBusesWithAdmin();
    }
  };

  const handleDeleteBus = (plate: string) => {
    if (window.confirm(`Do të hiqni përfundimisht autobusin me targë ${plate} nga databaza?`)) {
      setAdminBuses(adminBuses.filter((b: any) => b.id !== plate));
      syncBusesWithAdmin(); 
    }
  };

  // --- Form Navigation ---
  const navigateToForm = (view: 'form-driver' | 'form-inspector' | 'form-bus' | 'form-schedules', mode: 'add'|'edit', data?: any) => {
    setCurrentView(view);
    setFormMode(mode);
    if (mode === 'edit' && data) {
      if (view === 'form-schedules') {
        const routeParts = BUS_ROUTES.find(r => r.id === data.routeId)?.name.split('-') || ['Terminali 1', 'Terminali 2'];
        const term1 = routeParts[0].trim();
        const term2 = routeParts.length > 1 ? routeParts[1].trim() : 'Terminali 2';
        const existingSchedules = data.schedules || { terminal1: [], terminal2: [] };
        // Convert old array schedules if they exist
        let t1 = Array.isArray(existingSchedules.terminal1) ? existingSchedules.terminal1 : [];
        let t2 = Array.isArray(existingSchedules.terminal2) ? existingSchedules.terminal2 : [];
        if (Array.isArray(existingSchedules) && existingSchedules.length > 0 && typeof existingSchedules[0] === 'object') {
          t1 = []; t2 = [];
        }
        
        setFormData({
          ...data,
          schedules: { terminal1: t1, terminal2: t2 },
          _termNames: [term1, term2]
        });
      } else {
        setFormData({ ...data });
      }
    } else {
      // Defaults
      if (view === 'form-driver') setFormData({ name: '', phone: '', shift: 'Mëngjes (05:00 - 13:00)', status: 'Aktiv', licenseCat: 'D', routeId: selectedRouteId || BUS_ROUTES[0].id, personalId: '', joinDate: new Date().toISOString().split('T')[0], address: '' });
      if (view === 'form-inspector') setFormData({ name: '', phone: '', status: 'Në Linjë', posCode: '', employmentType: 'Full-Time', routeId: selectedRouteId || BUS_ROUTES[0].id, personalId: '' });
      if (view === 'form-bus') setFormData({ plate: '', routeId: data?.routeId || selectedRouteId || BUS_ROUTES[0].id, driverId: '', inspectorId: '', year: new Date().getFullYear().toString(), brand: '', capacity: 60, status: 'Aktiv', schedules: { terminal1: [], terminal2: [] } });
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

    if (currentView === 'form-driver') {
      if (formMode === 'add') {
        setAdminDrivers([...adminDrivers, { ...formData, id: `d_${Date.now()}`, ticketsSold: 0 }]);
      } else {
        setAdminDrivers(adminDrivers.map((d: any) => d.id === formData.id ? formData : d));
      }
      // Re-evaluate buses if driver status or route changed
      syncBusesWithAdmin();
    } else if (currentView === 'form-inspector') {
      if (formMode === 'add') {
        setAdminInspectors([...adminInspectors, { ...formData, id: `i_${Date.now()}`, ticketsSold: 0 }]);
      } else {
        setAdminInspectors(adminInspectors.map((i: any) => i.id === formData.id ? formData : i));
      }
    } else if (currentView === 'form-bus' || currentView === 'form-schedules') {
      if (formMode === 'add') {
        setAdminBuses([...adminBuses, { ...formData, id: formData.plate }]);
      } else {
        setAdminBuses(adminBuses.map((b: any) => b.id === formData.id ? formData : b));
      }
      syncBusesWithAdmin();
    }
    
    closeForm();
  };

  const handlePrintSchedules = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const driver = adminDrivers.find((d: any) => d.id === formData.driverId);
    const driverName = driver ? driver.name : 'E pacaktuar';
    const term1Name = formData._termNames?.[0] || 'Terminali 1';
    const term2Name = formData._termNames?.[1] || 'Terminali 2';
    
    // Sort schedules chronologically
    const term1Schedules = [...(formData.schedules?.terminal1 || [])].sort();
    const term2Schedules = [...(formData.schedules?.terminal2 || [])].sort();

    const maxRows = Math.max(term1Schedules.length, term2Schedules.length);
    let tableRows = '';
    
    if (maxRows === 0) {
      tableRows = '<tr><td colspan="2" style="padding: 20px; text-align: center; color: #666;">Nuk ka asnjë orar të regjistruar për këtë mjet.</td></tr>';
    } else {
      for (let i = 0; i < maxRows; i++) {
        tableRows += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 16px;">${term1Schedules[i] || '-'}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 16px;">${term2Schedules[i] || '-'}</td>
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
                <th>Nisjet nga: ${term1Name}</th>
                <th>Nisjet nga: ${term2Name}</th>
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

  // --- RENDERERS ---

  const renderTabs = () => (
    <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldCheck size={20} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>Qendra e Kontrollit</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '52px' }}>
          Databaza Qendrore e Transportit Publik
        </p>
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
              transition: 'all 0.2s'
            }}
          >
            <Icon size={14} />
            <span className="hide-mobile">{label}</span>
          </button>
        ))}
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
    <div className="page-content" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Show tabs only on list view */}
      {currentView === 'list' && renderTabs()}

      {/* --- ROUTES VIEW (PRIMARY) --- */}
      {currentView === 'list' && activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>Menaxhimi i Linjave</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Klikoni mbi një linjë për të menaxhuar flotën, oraret, shoferët dhe faturinot specifikë të saj.</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {BUS_ROUTES.map(route => {
              const routeBuses = adminBuses.filter((b: any) => b.routeId === route.id);
              const activeRouteBuses = routeBuses.filter((b: any) => b.status === 'Aktiv').length;
              
              return (
                <div 
                  key={route.id} 
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
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>{route.name}</h4>
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
        </div>
      )}

      {/* --- ROUTE DETAIL VIEW (BUSES & SCHEDULES) --- */}
      {currentView === 'route-detail' && selectedRouteId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {(() => {
            const route = BUS_ROUTES.find(r => r.id === selectedRouteId);
            if (!route) return null;
            const routeBuses = adminBuses.filter((b: any) => b.routeId === route.id);
            const routeDrivers = adminDrivers.filter((d: any) => d.routeId === route.id);
            const routeInspectors = adminInspectors.filter((i: any) => i.routeId === route.id);

            return (
              <>
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
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: route.color }} />
                        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Linja {route.id} - {route.name}</h2>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 24px' }}>Detajet e mjeteve, shoferëve dhe faturinove vetëm për këtë linjë.</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigateToForm('form-driver', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      <User size={14} /> Shto Shofer
                    </button>
                    <button onClick={() => navigateToForm('form-inspector', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      <Banknote size={14} /> Shto Faturino
                    </button>
                    <button onClick={() => navigateToForm('form-bus', 'add', { routeId: route.id })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                      <Bus size={16} /> Shto Autobus
                    </button>
                  </div>
                </div>

                {/* Dashboard for Route */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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

                {routeBuses.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Bus size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Nuk ka asnjë autobus në këtë linjë</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Shtoni autobusin e parë për të nisur operimin e kësaj linje.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {routeBuses.map((bus: any) => {
                      const driver = adminDrivers.find((d: any) => d.id === bus.driverId);
                      const inspector = adminInspectors.find((i: any) => i.id === bus.inspectorId);
                      const isAktiv = bus.status === 'Aktiv';

                      return (
                        <div key={bus.id} className="card" style={{ display: 'flex', padding: '24px', borderRadius: '16px', gap: '32px', alignItems: 'center', border: isAktiv ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)', opacity: isAktiv ? 1 : 0.7 }}>
                          {/* Bus Info */}
                          <div style={{ minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <div style={{ display: 'inline-block', padding: '8px 16px', background: '#eab308', color: '#000', borderRadius: '8px', fontWeight: '800', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px', boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)' }}>
                                {bus.id}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStatus = isAktiv ? 'Në Garazh' : 'Aktiv';
                                  setAdminBuses(adminBuses.map((b: any) => b.id === bus.id ? { ...b, status: newStatus } : b));
                                  syncBusesWithAdmin();
                                }}
                                style={{ 
                                  padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: 'none', cursor: 'pointer',
                                  background: isAktiv ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.1)', 
                                  color: isAktiv ? '#10b981' : 'var(--text-muted)',
                                  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAktiv ? '#10b981' : 'var(--text-muted)' }} />
                                {isAktiv ? 'NË QARKULLIM' : 'NË GARAZH'}
                              </button>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Viti: {bus.year || 'N/A'} • {bus.brand || 'Model i pacaktuar'}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                              <button onClick={() => navigateToForm('form-bus', 'edit', bus)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}><Edit2 size={14} /> Ndrysho</button>
                              <button onClick={() => navigateToForm('form-schedules', 'edit', bus)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}><Clock size={14} /> Oraret</button>
                              <button onClick={() => handleDeleteBus(bus.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </div>

                          <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border)' }} />

                          {/* Staff Info */}
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Driver Details */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                <User size={16} /> <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shoferi i Caktuar</span>
                              </div>
                              {driver ? (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{driver.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace' }}>ID: {driver.personalId || driver.id}</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Orari / Turni:</span> <span style={{ fontWeight: '600' }}>{driver.shift}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Telefoni:</span> <span style={{ fontWeight: '600' }}>{driver.phone || 'N/A'}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Statusi:</span> <span style={{ fontWeight: '700', color: driver.status === 'Aktiv' ? '#10b981' : '#f59e0b' }}>{driver.status}</span></div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <AlertTriangle size={16} /> Nuk është caktuar shofer!
                                </div>
                              )}
                            </div>

                            {/* Inspector Details */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                <Banknote size={16} /> <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturino i Caktuar</span>
                              </div>
                              {inspector ? (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{inspector.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace' }}>ID: {inspector.personalId || inspector.id}</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Kodi POS:</span> <span style={{ fontWeight: '600' }}>{inspector.posCode || 'N/A'}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Telefoni:</span> <span style={{ fontWeight: '600' }}>{inspector.phone || 'N/A'}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Statusi:</span> <span style={{ fontWeight: '700', color: inspector.status === 'Në Linjë' ? '#10b981' : '#f59e0b' }}>{inspector.status}</span></div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <AlertTriangle size={16} /> Nuk është caktuar faturino.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}


      {/* --- DASHBOARD VIEW --- */}
      {currentView === 'list' && activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Autobusë Aktivë', value: `${activeBuses} / ${totalBuses}`, icon: Bus, color: '#3b82f6' },
              { label: 'Shoferë të Regjistruar', value: `${adminDrivers.length}`, icon: Users, color: '#10b981' },
              { label: 'Faturino në Databazë', value: `${adminInspectors.length}`, icon: Banknote, color: '#f59e0b' },
              { label: 'Linja të Mbuluara', value: `${new Set(adminBuses.map((b: any) => b.routeId)).size} / ${BUS_ROUTES.length}`, icon: Route, color: '#8b5cf6' },
            ].map((kpi, i) => {
              const KpiIcon = kpi.icon;
              return (
                <div key={i} className="card" style={{ padding: '24px', borderLeft: `4px solid ${kpi.color}`, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
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
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>Regjistri i Përgjithshëm i Shoferëve</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Lista e plotë e punonjësve në rolin e shoferit në të gjitha linjat.</p>
            </div>
            <button onClick={() => navigateToForm('form-driver', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              <Plus size={16} /> Regjistro Shofer
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
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
                {adminDrivers.map((d: any) => {
                  const assignedBus = adminBuses.find((b: any) => b.driverId === d.id);
                  const statusColor = d.status === 'Aktiv' ? '#10b981' : d.status === 'Pushim' ? '#f59e0b' : '#ef4444';
                  const route = BUS_ROUTES.find(r => r.id === d.routeId);
                  
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '20px 32px', fontWeight: '600', color: 'var(--text)' }}>
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
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{d.shift.split('(')[0]}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kat. Patentës: {d.licenseCat || 'D'}</div>
                      </td>
                      <td style={{ padding: '20px 32px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: statusColor, fontWeight: '700', fontSize: '13px', background: `${statusColor}15`, padding: '6px 12px', borderRadius: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => navigateToForm('form-driver', 'edit', d)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Edit2 size={14} /> Hap</button>
                          <button onClick={() => handleDeleteDriver(d.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>Regjistri i Përgjithshëm i Faturinove</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Lista e stafit për kontrollin dhe shitjen e biletave në të gjitha linjat.</p>
            </div>
            <button onClick={() => navigateToForm('form-inspector', 'add')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              <Plus size={16} /> Regjistro Faturino
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Të Dhënat & ID</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Linja & Mjeti</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600' }}>Kodi POS & Tipi</th>
                  <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {adminInspectors.map((d: any) => {
                  const assignedBus = adminBuses.find((b: any) => b.inspectorId === d.id);
                  const route = BUS_ROUTES.find(r => r.id === d.routeId);

                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '20px 32px', fontWeight: '600', color: 'var(--text)' }}>
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
                      <td style={{ padding: '20px 32px' }}>
                         <div style={{ fontWeight: '600', marginBottom: '4px' }}>POS: {d.posCode || 'Pabashkangjitur'}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.employmentType || 'Full-Time'}</div>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => navigateToForm('form-inspector', 'edit', d)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}><Edit2 size={14} /> Hap</button>
                          <button onClick={() => handleDeleteInspector(d.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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

      {/* DRIVER FORM */}
      {currentView === 'form-driver' && (
        <div className="card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          {renderFormHeader(
            formMode === 'add' ? 'Regjistrimi i Shoferit të Ri' : 'Përditëso të Dhënat e Shoferit',
            'Plotëso të dhënat profesionale dhe personale të punonjësit.',
            closeForm
          )}
          
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Section 1 */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Të Dhënat Personale & ID</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Numri i Mjetit të Identifikimit (ID) <span style={{ color: '#ef4444' }}>*</span>
                  <input type="text" required value={formData.personalId || ''} onChange={(e) => setFormData({...formData, personalId: e.target.value.toUpperCase()})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', textTransform: 'uppercase', fontFamily: 'monospace' }} placeholder="J12345678A" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Emri dhe Mbiemri i Plotë <span style={{ color: '#ef4444' }}>*</span>
                  <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="p.sh. Artan Hoxha" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Numri i Telefonit
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="+355 6x xxx xxxx" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Adresa e Banimit
                  <input type="text" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="Adresa e plotë" />
                </label>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Të Dhënat Profesionale & Operacionale</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Linja ku Asenjohet <span style={{ color: '#ef4444' }}>*</span>
                  <select required value={formData.routeId || ''} onChange={(e) => setFormData({...formData, routeId: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    {BUS_ROUTES.map(r => <option key={r.id} value={r.id} style={{ color: '#000' }}>{r.id} - {r.name}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Statusi i Punonjësit
                  <select value={formData.status || 'Aktiv'} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="Aktiv" style={{ color: '#000' }}>🟢 Aktiv / Në Detyrë</option>
                    <option value="Pushim" style={{ color: '#000' }}>🟡 Pushim / Leje</option>
                    <option value="Në Garazh" style={{ color: '#000' }}>⚪ Në Garazh / Gatishmëri</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Turni i Punës / Orari
                  <select value={formData.shift || 'Mëngjes (05:00 - 13:00)'} onChange={(e) => setFormData({...formData, shift: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="Mëngjes (05:00 - 13:00)" style={{ color: '#000' }}>Mëngjes (05:00 - 13:00)</option>
                    <option value="Pasdite (13:00 - 21:00)" style={{ color: '#000' }}>Pasdite (13:00 - 21:00)</option>
                    <option value="Nata (21:00 - 05:00)" style={{ color: '#000' }}>Nata (21:00 - 05:00)</option>
                    <option value="E Ndarë (06-10 / 15-19)" style={{ color: '#000' }}>E Ndarë (06-10 / 15-19)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Kategoria e Patentës
                  <input type="text" value={formData.licenseCat || ''} onChange={(e) => setFormData({...formData, licenseCat: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="p.sh. D, DE" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Data e Fillimit
                  <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', colorScheme: 'dark' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Anulo</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}>
                <Save size={18} /> Ruaj në Databazë
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INSPECTOR FORM */}
      {currentView === 'form-inspector' && (
        <div className="card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          {renderFormHeader(
            formMode === 'add' ? 'Regjistrimi i Faturinos së Ri' : 'Përditëso të Dhënat e Faturinos',
            'Shto personelin përgjegjës për biletarinë dhe kontrollin e mjetit.',
            closeForm
          )}
          
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Të Dhënat Personale & ID</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Numri i Mjetit të Identifikimit (ID) <span style={{ color: '#ef4444' }}>*</span>
                  <input type="text" required value={formData.personalId || ''} onChange={(e) => setFormData({...formData, personalId: e.target.value.toUpperCase()})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', textTransform: 'uppercase', fontFamily: 'monospace' }} placeholder="J12345678A" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Emri dhe Mbiemri i Plotë <span style={{ color: '#ef4444' }}>*</span>
                  <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="p.sh. Ilir Meta" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Numri i Telefonit
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="+355 6x xxx xxxx" />
                </label>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Detajet e Detyrës</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Linja ku Asenjohet <span style={{ color: '#ef4444' }}>*</span>
                  <select required value={formData.routeId || ''} onChange={(e) => setFormData({...formData, routeId: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    {BUS_ROUTES.map(r => <option key={r.id} value={r.id} style={{ color: '#000' }}>{r.id} - {r.name}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Statusi
                  <select value={formData.status || 'Në Linjë'} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="Në Linjë" style={{ color: '#000' }}>🟢 Në Linjë</option>
                    <option value="Pushim" style={{ color: '#000' }}>🟡 Pushim / Leje</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Kodi Pajisjes POS
                  <input type="text" value={formData.posCode || ''} onChange={(e) => setFormData({...formData, posCode: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="Psh. 1029A" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Tipi i Kontratës
                  <select value={formData.employmentType || 'Full-Time'} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="Full-Time" style={{ color: '#000' }}>Me Kohë të Plotë</option>
                    <option value="Part-Time" style={{ color: '#000' }}>Me Kohë të Pjesshme</option>
                  </select>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Anulo</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}>
                <Save size={18} /> Ruaj në Databazë
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BUS FORM */}
      {currentView === 'form-bus' && (
        <div className="card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          {renderFormHeader(
            formMode === 'add' ? 'Konfigurimi i Autobusit të Ri' : 'Përditëso të Dhënat e Mjetit',
            'Plotëso detajet e mjetit dhe asenjo stafin e nevojshëm që ky mjet të operojë në linjë.',
            closeForm
          )}
          
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Bus Details */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Të Dhënat Identifikuese & Statusi</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Targa e Mjetit <span style={{ color: '#ef4444' }}>*</span>
                  {formMode === 'add' ? (
                     <input type="text" required value={formData.plate || ''} onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '2px dashed rgba(255,255,255,0.2)', color: '#eab308', fontSize: '18px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }} placeholder="AB 123 CD" />
                  ) : (
                     <input type="text" disabled value={formData.id || ''} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '18px', fontWeight: '800', letterSpacing: '2px', cursor: 'not-allowed' }} />
                  )}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Linja e Operimit <span style={{ color: '#ef4444' }}>*</span>
                  <select required value={formData.routeId || ''} onChange={(e) => {
                    // When route changes, reset staff to prevent mismatch
                    setFormData({...formData, routeId: e.target.value, driverId: '', inspectorId: ''})
                  }} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    {BUS_ROUTES.map(r => (
                      <option key={r.id} value={r.id} style={{ color: '#000' }}>{r.id} - {r.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Statusi i Mjetit <span style={{ color: '#ef4444' }}>*</span>
                  <select required value={formData.status || 'Aktiv'} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: formData.status === 'Aktiv' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)', border: formData.status === 'Aktiv' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)', color: formData.status === 'Aktiv' ? '#10b981' : '#fff', fontSize: '15px', fontWeight: '800' }}>
                    <option value="Aktiv" style={{ color: '#000' }}>🟢 Aktiv (Në Harta)</option>
                    <option value="Në Garazh" style={{ color: '#000' }}>⚪ Në Garazh (Offline)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Marka / Modeli
                  <input type="text" value={formData.brand || ''} onChange={(e) => setFormData({...formData, brand: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="p.sh. Mercedes-Benz Citaro" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Viti i Prodhimit
                  <input type="number" min="1990" max="2026" value={formData.year || ''} onChange={(e) => setFormData({...formData, year: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="2018" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Kapaciteti (Pasagjerë)
                  <input type="number" value={formData.capacity || ''} onChange={(e) => setFormData({...formData, capacity: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }} placeholder="60" />
                </label>
              </div>
            </div>

            {/* Staff Assignment */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Asenjimi i Stafit Operacional & Oraret</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Këtu shfaqen vetëm punonjësit që i përkasin linjës <strong>{formData.routeId}</strong> dhe janë aktivë.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Zgjidh Shoferin e Linjës</span>
                  <select value={formData.driverId || ''} onChange={(e) => setFormData({...formData, driverId: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="" style={{ color: '#000' }}>-- Pa Shofer të Caktuar --</option>
                    {adminDrivers
                      .filter((d: any) => d.routeId === formData.routeId)
                      .map((d: any) => (
                        <option key={d.id} value={d.id} style={{ color: '#000' }}>
                          {d.name} ({d.shift.split('(')[0].trim()}) {d.status !== 'Aktiv' ? `[${d.status}]` : ''}
                        </option>
                      ))
                    }
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Banknote size={16} /> Zgjidh Faturinon e Linjës</span>
                  <select value={formData.inspectorId || ''} onChange={(e) => setFormData({...formData, inspectorId: e.target.value})} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}>
                    <option value="" style={{ color: '#000' }}>-- Pa Faturino të Caktuar --</option>
                    {adminInspectors
                      .filter((i: any) => i.routeId === formData.routeId)
                      .map((i: any) => (
                        <option key={i.id} value={i.id} style={{ color: '#000' }}>
                          {i.name} {i.status !== 'Në Linjë' ? `[${i.status}]` : ''}
                        </option>
                      ))
                    }
                  </select>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <button type="button" onClick={closeForm} style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Anulo</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}>
                <Save size={18} /> Ruaj në Databazë
              </button>
            </div>
          </form>
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
                    <div key={`t1-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    <div key={`t2-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}>
                <Save size={18} /> Ruaj Oraret
              </button>
            </div>
          </form>
        </div>
      )}
      
      <style jsx>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}
