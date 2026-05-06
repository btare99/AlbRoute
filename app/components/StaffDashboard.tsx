'use client';
import { useState } from 'react';
import { Calendar, Clock, Bus, MapPin, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { BUS_ROUTES, BUS_STOPS } from '../constants/busData';
import useStore from '../store/useStore';

export default function StaffDashboard() {
  const staffUser = useStore((state: any) => state.staffUser);
  const adminBuses = useStore((state: any) => state.adminBuses);
  const busRoutes = useStore((state: any) => state.buses); // Actually from constantss
  const logout = useStore((state: any) => state.logout);


  const [activeTab, setActiveTab] = useState<'shift' | 'schedule'>('shift');

  if (!staffUser) return null;

  const isDriver = staffUser.type === 'driver';

  // Find assigned bus
  const assignedBus = adminBuses.find((b: any) =>
    isDriver ? b.driverId === staffUser.id : b.inspectorId === staffUser.id
  );

  const route = BUS_ROUTES.find((r: any) => r.id === staffUser.routeId);

  // Generate a weekly schedule based on current week
  const days = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];

  // Shift times based on what is in useStore
  const isMorning = staffUser.shift?.includes('Mëngjes') || Math.random() > 0.5;
  const shiftTime = isMorning ? '05:00 - 13:00' : '13:00 - 21:00';

  // Terminals for this route
  const startTerminal = route?.stops ? BUS_STOPS.find((s: any) => s.id === route.stops[0])?.name : 'Terminali i Nisjes';
  const endTerminal = route?.stops ? BUS_STOPS.find((s: any) => s.id === route.stops[route.stops.length - 1])?.name : 'Terminali i Mbërritjes';

  // Schedule generator for the selected terminal
  const generateSchedule = () => {
    const times = [];
    let startHour = isMorning ? 5 : 13;
    for (let i = 0; i < 8; i++) { // 8 hours shift
      times.push(`${startHour + i}:00`);
      times.push(`${startHour + i}:30`);
    }
    return times;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1e3a8a 0%, #0f172a 100%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      padding: '0'
    }}>
      {/* HEADER SECTION */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <User size={30} color="#fff" />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              background: '#10b981',
              borderRadius: '50%',
              border: '3px solid #0f172a'
            }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: '600' }}>
              {isDriver ? 'Drejtues Mjeti' : 'Faturino'}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '2px 0 0 0', letterSpacing: '-0.5px' }}>{staffUser.name}</h1>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ID: {staffUser.personalId}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '10px 14px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Dilni
        </button>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* ASSIGNED BUS HERO CARD */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: route?.color || '#3b82f6', opacity: '0.15', borderRadius: '50%', filter: 'blur(40px)' }} />
          
          <div className="responsive-hero" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            <div>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <Bus size={16} /> Mjeti në Detyrë
              </p>
              {assignedBus ? (
                <>
                  <div style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginBottom: '4px' }}>
                    {assignedBus.id}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '15px' }}>{assignedBus.brand} (Viti {assignedBus.year})</div>
                </>
              ) : (
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={24} /> Nuk ka mjet
                </div>
              )}
            </div>
            
            {assignedBus && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Linja</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: route?.color || '#fff' }}>{route?.label || 'N/A'}</div>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOM TOGGLE TABS */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '28px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <button 
            onClick={() => setActiveTab('shift')}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
              background: activeTab === 'shift' ? '#3b82f6' : 'transparent',
              color: activeTab === 'shift' ? '#fff' : '#94a3b8',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'shift' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
            }}>
            Programi Javor
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
              background: activeTab === 'schedule' ? '#3b82f6' : 'transparent',
              color: activeTab === 'schedule' ? '#fff' : '#94a3b8',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'schedule' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
            }}>
            Nisjet (Terminali)
          </button>
        </div>

        {/* CONTENT PANELS */}
        <div style={{ position: 'relative' }}>
          {activeTab === 'shift' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#f8fafc' }}>
                Turnet tuaja <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginLeft: '8px' }}> Java 12 - 18 Maj</span>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {days.map((day, idx) => {
                  const isToday = idx === new Date().getDay() - 1; // Simplistic
                  const isOff = idx === 6; // Sunday off
                  
                  return (
                    <div key={day} className="responsive-shift-row" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      background: isToday ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: isToday ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      transform: isToday ? 'scale(1.02)' : 'none',
                      transition: 'transform 0.2s',
                      boxShadow: isToday ? '0 10px 25px rgba(0,0,0,0.2)' : 'none'
                    }}>
                      <div style={{ width: '120px' }}>
                        <div style={{ fontSize: '16px', fontWeight: isToday ? '800' : '600', color: isToday ? '#60a5fa' : '#e2e8f0' }}>{day}</div>
                        {isToday && <div style={{ fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', fontWeight: 'bold' }}>Sot</div>}
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        {isOff ? (
                          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                            Pushim
                          </div>
                        ) : (
                          <div className="shift-time-container" style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isToday ? '#3b82f6' : 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                              <Clock size={16} /> {shiftTime}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <MapPin size={12} /> Linja {route?.label}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={18} color="#60a5fa" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Nisjet nga</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{startTerminal}</div>
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                  {generateSchedule().map((time, i) => (
                    <div key={i} style={{ padding: '12px 0', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', fontSize: '15px', fontWeight: '600', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.02)' }}>
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={18} color="#34d399" style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Kthimet nga</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{endTerminal}</div>
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                  {generateSchedule().map((time, i) => {
                    const [h, m] = time.split(':').map(Number);
                    let newM = m + 45;
                    let newH = h;
                    if (newM >= 60) { newH += 1; newM -= 60; }
                    const formattedTime = `${newH}:${newM === 0 ? '00' : newM}`;
                    return (
                      <div key={i} style={{ padding: '12px 0', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', fontSize: '15px', fontWeight: '600', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.02)' }}>
                        {formattedTime}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .responsive-hero {
            flex-direction: column !important;
            gap: 24px;
          }
          .responsive-hero > div:last-child {
            width: 100%;
            text-align: left !important;
          }
          .responsive-shift-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          .responsive-shift-row > div:first-child {
            width: 100% !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .responsive-shift-row > div:last-child {
            width: 100%;
            justify-content: flex-start !important;
          }
          .shift-time-container {
            text-align: left !important;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .shift-time-container > div:last-child {
            justify-content: flex-start !important;
            margin-top: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
