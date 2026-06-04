'use client';

import { useState } from 'react';
import { 
  Search, Bus, Clock, MapPin, ChevronDown, 
  Map, Activity, ArrowRight, Shield 
} from 'lucide-react';

interface BusLine {
  id: string;
  name: string;
  code: string;
  status: string;
  statusType: 'green' | 'orange';
  hours: string;
  frequency: string;
  price: string;
  stations: string[];
  timetable: {
    weekdays: string;
    weekends: string;
  };
}

export default function TransitRoutes() {
  const [search, setSearch] = useState('');
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, 'stations' | 'timetable' | 'details'>>({});

  const busLines: BusLine[] = [
    {
      id: 'unaza',
      name: 'Unaza',
      code: 'L1',
      status: 'Operative',
      statusType: 'green',
      hours: '05:00 - 23:00',
      frequency: '3 - 5 min',
      price: '40 Lekë',
      stations: [
        'Sheshi Skënderbej (Qendër)',
        'Stacioni i Trenit',
        'Medreseja',
        'Brryli',
        'Shkolla e Baletit',
        'Qyteti Studenti',
        'Rruga e Elbasanit',
        'Vasil Shanto',
        'Pallati me Shigjeta',
        'Zogu i Zi'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 3-5 minuta nga stacionet fundore duke filluar nga ora 05:00 deri në 23:00.',
        weekends: 'Nisjet çdo 6-8 minuta nga stacionet fundore duke filluar nga ora 05:30 deri në 22:30.'
      }
    },
    {
      id: 'tirana-e-re',
      name: 'Tirana e Re',
      code: 'L2',
      status: 'Operative',
      statusType: 'green',
      hours: '05:30 - 22:30',
      frequency: '5 - 8 min',
      price: '40 Lekë',
      stations: [
        'Qendër (Kisha Ortodokse)',
        'Zogu i Zi',
        'Kombinati i Ushqimit',
        'Fakulteti i Inxhinierisë',
        'Shkolla Teknologjike',
        'Selitë',
        'Komuna e Parisit',
        'Kopshti Zoologjik'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 5-8 minuta nga ora 05:30 deri në 22:30.',
        weekends: 'Nisjet çdo 8-10 minuta nga ora 06:00 deri në 22:00.'
      }
    },
    {
      id: 'kombinat-kinostudio',
      name: 'Kombinat - Kinostudio',
      code: 'L3',
      status: 'Vonesa të lehta',
      statusType: 'orange',
      hours: '05:00 - 23:30',
      frequency: '4 - 6 min',
      price: '40 Lekë',
      stations: [
        'Kombinat (Stacioni Fundor)',
        'Shkolla Teknologjike',
        'Selitë',
        'Vasil Shanto',
        'Zogu i Zi',
        'Rruga e Durrësit',
        'Sheshi Skënderbej',
        'Rruga e Dibrës',
        'Medreseja',
        'Kinostudio (Stacioni Fundor)'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 4-6 minuta nga ora 05:00 deri në 23:30.',
        weekends: 'Nisjet çdo 7-9 minuta nga ora 05:30 deri në 23:00.'
      }
    },
    {
      id: 'sauk',
      name: 'Sauk - Kopshti Zoologjik',
      code: 'L4',
      status: 'Operative',
      statusType: 'green',
      hours: '06:00 - 22:00',
      frequency: '10 - 12 min',
      price: '40 Lekë',
      stations: [
        'Sheshi Skënderbej (Qendër)',
        'Rruga e Elbasanit',
        'Kopshti Botanik',
        'Kopshti Zoologjik',
        'Sauk i Vjetër',
        'Sauk i Ri (Stacioni Fundor)'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 10-12 minuta nga ora 06:00 deri në 22:00.',
        weekends: 'Nisjet çdo 15-18 minuta nga ora 06:30 deri në 21:30.'
      }
    },
    {
      id: 'kamez',
      name: 'Kamëz',
      code: 'L5',
      status: 'Operative',
      statusType: 'green',
      hours: '05:00 - 23:00',
      frequency: '6 - 8 min',
      price: '40 Lekë',
      stations: [
        'Qendër (Teatri Kombëtar i Operas)',
        'Zogu i Zi',
        'Laprakë',
        'Kupola',
        'Kamëz Qendër',
        'Universiteti Bujqësor'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 6-8 minuta nga ora 05:00 deri në 23:00.',
        weekends: 'Nisjet çdo 10-12 minuta nga ora 05:30 deri në 22:30.'
      }
    },
    {
      id: 'porcelan',
      name: 'Porcelan',
      code: 'L6',
      status: 'Operative',
      statusType: 'green',
      hours: '05:45 - 22:15',
      frequency: '8 - 10 min',
      price: '40 Lekë',
      stations: [
        'Sheshi Skënderbej (Qendër)',
        'Rruga e Barrikadave',
        'Medreseja',
        'Xhamlliku',
        'Porcelani (Stacioni Fundor)',
        'Qyteti Studenti 2'
      ],
      timetable: {
        weekdays: 'Nisjet çdo 8-10 minuta nga ora 05:45 deri në 22:15.',
        weekends: 'Nisjet çdo 12-15 minuta nga ora 06:00 deri në 21:45.'
      }
    }
  ];

  const filteredLines = busLines.filter(line => 
    line.name.toLowerCase().includes(search.toLowerCase()) ||
    line.code.toLowerCase().includes(search.toLowerCase()) ||
    line.stations.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLine = (lineId: string) => {
    if (expandedLine === lineId) {
      setExpandedLine(null);
    } else {
      setExpandedLine(lineId);
      if (!activeTab[lineId]) {
        setActiveTab(prev => ({ ...prev, [lineId]: 'stations' }));
      }
    }
  };

  const setTab = (lineId: string, tab: 'stations' | 'timetable' | 'details') => {
    setActiveTab(prev => ({ ...prev, [lineId]: tab }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-up">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/60 rounded-full px-4 py-1.5 mb-4">
          <Map size={14} className="text-orange-600" />
          <span className="text-xs font-semibold text-orange-800">Itineraret Zyrtare &amp; Stacionet</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Linjat dhe Oraret e Autobusëve
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 max-w-xl mx-auto">
          Kërkoni për linjën tuaj të udhëtimit, kontrolloni sekuencën e stacioneve dhe oraret e sakta të nisjeve për çdo ditë të javës.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-lg mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Kërkoni linjën ose stacionin (p.sh. Unaza, Zogu i Zi)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12 py-3.5 shadow-sm border-slate-200 rounded-2xl text-sm"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-4 flex items-center text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Fshi
          </button>
        )}
      </div>

      {/* Result Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
        <span>U gjetën {filteredLines.length} linja tranziti</span>
        <span className="flex items-center gap-1.5">
          <span className="live-dot-container">
            <span className="live-dot" />
            <span className="live-ring" />
          </span>
          GPS Monitorim Aktiv
        </span>
      </div>

      {/* Lines Accordion Grid */}
      <div className="accordion-wrapper">
        {filteredLines.length > 0 ? (
          filteredLines.map((line) => {
            const isExpanded = expandedLine === line.id;
            const currentTab = activeTab[line.id] || 'stations';

            return (
              <div 
                key={line.id} 
                className={`accordion-card border shadow-sm ${
                  isExpanded ? 'border-orange-500/30 ring-4 ring-orange-500/5' : 'border-slate-200/60'
                }`}
              >
                {/* Header/Trigger */}
                <button
                  onClick={() => toggleLine(line.id)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white"
                >
                  <div className="flex items-center gap-4">
                    {/* Badge Line Code */}
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-orange-600 font-bold">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider leading-none text-orange-400">Kodi</span>
                      <span className="text-base leading-none mt-1">{line.code}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        Linja {line.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {line.frequency}
                        </span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{line.stations.length} Stacione</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Arrow */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="live-dot-container">
                          <span className={`live-dot ${line.statusType === 'orange' ? 'live-dot-orange' : ''}`} />
                          <span className={`live-ring ${line.statusType === 'orange' ? 'live-ring-orange' : ''}`} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{line.status}</span>
                      </div>
                    </div>
                    <div className={`accordion-icon ${isExpanded ? 'bg-orange-50 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronDown size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200/60 px-5">
                      {[
                        { id: 'stations', label: 'Stacionet' },
                        { id: 'timetable', label: 'Oraret' },
                        { id: 'details', label: 'Informacione' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setTab(line.id, tab.id as any)}
                          className={`text-xs font-bold py-3.5 px-4 border-b-2 -mb-px transition-colors ${
                            currentTab === tab.id 
                              ? 'border-orange-600 text-orange-600' 
                              : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content Panels */}
                    <div className="p-6">
                      {/* Stations Tab */}
                      {currentTab === 'stations' && (
                        <div className="relative pl-6 border-l-2 border-slate-200/80 flex flex-col gap-6 ml-2">
                          {line.stations.map((station, sIdx) => {
                            const isFirst = sIdx === 0;
                            const isLast = sIdx === line.stations.length - 1;
                            return (
                              <div key={sIdx} className="relative flex items-center gap-3">
                                {/* Bullet indicator on the line */}
                                <div 
                                  className={`absolute -left-[31px] w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center ${
                                    isFirst || isLast 
                                      ? 'border-orange-600 scale-110 z-10' 
                                      : 'border-slate-300'
                                  }`}
                                  style={{ width: '18px', height: '18px' }}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    isFirst || isLast ? 'bg-orange-600' : 'bg-slate-300'
                                  }`} />
                                </div>
                                <span className={`text-sm ${
                                  isFirst || isLast ? 'font-bold text-slate-800' : 'text-slate-600'
                                }`}>
                                  {station}
                                </span>
                                {isFirst && <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Fillimi</span>}
                                {isLast && <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">Fundi</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Timetable Tab */}
                      {currentTab === 'timetable' && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Activity size={14} className="text-orange-600" /> Ditë Pune (E Hënë - E Premte)
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{line.timetable.weekdays}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Clock size={14} className="text-amber-500" /> Fundjavë &amp; Festa Zyrtare
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{line.timetable.weekends}</p>
                          </div>
                        </div>
                      )}

                      {/* Details Tab */}
                      {currentTab === 'details' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orari i Punës</span>
                            <span className="text-sm font-bold text-slate-800">{line.hours}</span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Frekuenca (Mesatarja)</span>
                            <span className="text-sm font-bold text-slate-800">{line.frequency}</span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Çmimi i Biletës</span>
                            <span className="text-sm font-bold text-slate-800">{line.price}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <Bus size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nuk u gjet asnjë linjë</p>
            <p className="text-xs text-slate-400 mt-1">Provoni të kërkoni me një emër tjetër linje ose stacioni.</p>
          </div>
        )}
      </div>

      {/* Info Tip Footer Card */}
      <div className="bg-orange-50 border border-orange-200/60 p-6 rounded-2xl mt-12 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
        <span className="flex p-3 rounded-xl bg-white text-orange-600 shadow-sm flex-shrink-0">
          <Shield size={20} />
        </span>
        <div>
          <h4 className="text-sm font-bold text-orange-800 leading-snug">Vonesat në Trafik &amp; Devijimet</h4>
          <p className="text-xs text-orange-700/80 leading-relaxed mt-1">
            Të dhënat në hartën live të aplikacionit tonë marrin parasysh vonesat e mundshme të trafikut në Tiranë në kohë reale. Ju rekomandojmë të kontrolloni gjithmonë hartën live brenda aplikacionit përpara se të shkoni në stacion.
          </p>
        </div>
      </div>
    </div>
  );
}
