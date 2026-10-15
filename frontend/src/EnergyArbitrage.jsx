import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * EnergiOS Energy Arbitrage & Microgrid Financials Component
 * Fulfills requirements for:
 * - 24-Hour Energy Arbitrage Forecast with Interactive SVG Scrubber
 * - Dynamic TNB Tariff Band Peak-Shaving Telemetry
 * - Savings Contribution by Zone Donut Chart
 * - AI Arbitrage Control Parameters with Risk Profile Slider
 * - High-Tech Interactive Agent Dispatch Terminal & Dynamic Island Copilot
 */
export default function EnergyArbitrage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [riskProfile, setRiskProfile] = useState(50);
  const [toastMessage, setToastMessage] = useState(null);
  const [cliInput, setCliInput] = useState('');
  const [scrubberHour, setScrubberHour] = useState(21.8); // 21:48 default
  const [isDragging, setIsDragging] = useState(false);

  const chartRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Initial terminal logs
  const [logs, setLogs] = useState([
    {
      time: '14:00:00',
      category: 'AUTO_DISPATCH',
      categoryColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/70',
      text: 'Holding solar surplus. Will dispatch 2.5 MW to Commercial Mall HVAC at 14:00 to offset TNB grid reliance.',
      statusTag: '[EXEC_SUCCESS]'
    },
    {
      time: '13:45:12',
      category: 'GRID_SYNC',
      categoryColor: 'bg-blue-950/80 text-blue-400 border-blue-800/70',
      text: 'TNB Substation Peak Tariff surge pre-alert received (Surge window: 14:00 - 17:00 MYT, rate escalates to RM 0.58/kWh).'
    },
    {
      time: '13:30:05',
      category: 'BESS_CONTROL',
      categoryColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/70',
      text: 'Priming 6.4 MWh BESS battery banks 1-4 for discharge threshold balancing. State of charge optimal at 85%.'
    },
    {
      time: '13:15:22',
      category: 'SOLAR_TELEMETRY',
      categoryColor: 'bg-yellow-950/80 text-yellow-400 border-yellow-800/70',
      text: 'PV Canopy array generating 3.42 MW (Irradiance: 890 W/m²). Cloud passage dampening absorbed by inverter capacitance.'
    },
    {
      time: '12:50:40',
      category: 'HVAC_PRECOOL',
      categoryColor: 'bg-purple-950/80 text-purple-400 border-purple-800/70',
      text: 'Initiated thermal flywheel sub-cooling across Boulevard Commercial Mall. Setpoint lowered to 21.5°C utilizing cheap off-peak surplus.'
    },
    {
      time: '12:20:18',
      category: 'MARKET_ARBITRAGE',
      categoryColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/70',
      text: 'Algorithm model EcoGrid-4.2 committed: Net arbitrage saving delta +32.4% vs grid baseline.'
    },
    {
      time: '11:45:00',
      category: 'IEC_61850',
      categoryColor: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
      text: 'Safety interlock telemetry verification: All 18 micro-substations synched and locked (0 anomalies).'
    }
  ]);

  // Telemetry computation by hour
  const telemetry = useCallback((h) => {
    let solar = 0;
    if (h >= 6.5 && h <= 18.5) {
      const sDist = Math.abs(h - 12.5);
      solar = Math.max(0, 5.2 * (1 - Math.pow(sDist / 6, 2)));
    }

    let demand = 1.35;
    if (h >= 6 && h <= 13) {
      demand = 1.35 + ((h - 6) / 7) * 2.1;
    } else if (h > 13 && h <= 17) {
      demand = 3.6 - Math.sin((h - 13) * 0.7) * 0.4;
    } else if (h > 17 && h <= 21) {
      demand = 3.2 - ((h - 17) / 4) * 1.1;
    } else if (h > 21) {
      demand = 2.1 - ((h - 21) / 3) * 0.6;
    }

    const isPeak = h >= 13.8 && h <= 17.2;
    const tariffBadge = isPeak ? 'Peak Surge (RM 0.58)' : 'Off-Peak (RM 0.22)';

    let stratTitle = 'Off-Peak Baseline';
    let stratDesc = 'Township grid operating under baseline off-peak contract.';
    let economy = '+RM 45 saved';

    if (h < 6) {
      stratTitle = 'Night Base Grid Sync';
      stratDesc = 'Residential off-peak baseline. EV chargers queued on economy band.';
      economy = '+RM 60 saved';
    } else if (h >= 6 && h < 10) {
      stratTitle = 'Solar Pre-Charge Priming';
      stratDesc = 'Inverters synchronizing to morning PV generation. Substation charging initialized.';
      economy = '+RM 210 saved';
    } else if (h >= 10 && h < 13.8) {
      stratTitle = 'Peak Solar Absorption';
      stratDesc = 'Maximum irradiance feeding BESS storage at zero marginal fuel cost.';
      economy = '+RM 850 saved';
    } else if (isPeak) {
      stratTitle = 'Peak Shaving Discharge';
      stratDesc = 'BESS discharging 2.5 MW to eliminate TNB surge penalties across HVAC chillers.';
      economy = '+RM 1,420 saved';
    } else if (h > 17.2 && h <= 21) {
      stratTitle = 'Evening Demand Support';
      stratDesc = 'Boulevard lighting & sports hubs supported via remaining stored battery reserves.';
      economy = '+RM 320 saved';
    } else {
      stratTitle = 'Commercial Load Dropping';
      stratDesc = 'Mall closes. Retaining chilled inventory with minimal power draw.';
      economy = '+RM 90 saved';
    }

    let netGrid = Math.max(0, demand - solar);
    if (isPeak) {
      netGrid = Math.max(0.2, demand - 2.5);
    }

    const hour = Math.floor(h);
    const minute = Math.floor((h % 1) * 60);
    const timeStr = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');

    return {
      timeStr,
      solar: solar.toFixed(2),
      demand: demand.toFixed(2),
      netGrid: netGrid.toFixed(2),
      isPeak,
      tariffBadge,
      stratTitle,
      stratDesc,
      economy
    };
  }, []);

  const curTelem = telemetry(scrubberHour);

  // Scrubber mouse/touch handling
  const handleScrubMove = (clientX) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const scale = 760 / rect.width;
    let svgX = relativeX * scale;
    svgX = Math.max(25, Math.min(735, svgX));
    const h = ((svgX - 25) / (735 - 25)) * 24;
    setScrubberHour(h);
  };

  const handleCliSubmit = (e) => {
    if (e.key === 'Enter') {
      const cmd = cliInput.trim();
      if (!cmd) return;
      setCliInput('');
      showToast(`Command executed: ${cmd}`);

      const now = new Date();
      const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');

      setLogs((prev) => [
        ...prev,
        {
          time: timeStr,
          category: 'AUTO_DISPATCH',
          categoryColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/70',
          text: `> ${cmd} [ACCEPTED]`,
          statusTag: '[OPERATOR_CMD]'
        }
      ]);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === 'ALL') return true;
    return log.category === activeFilter;
  });

  const svgX = 25 + (scrubberHour / 24) * (735 - 25);
  const demandY = 165 - (parseFloat(curTelem.demand) / 4.5) * 85;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans">
      {/* FLOATING AI DYNAMIC ISLAND */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto">
        <div
          className="cursor-pointer group flex items-center gap-3 px-4 py-2 bg-slate-900/95 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-full shadow-xl shadow-slate-950/20 backdrop-blur-md transition-all duration-200 select-none"
          onClick={() => setIslandExpanded(!islandExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200 tracking-wide">AI Copilot</span>
            <span className="h-3 w-px bg-slate-700"></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-normal">
            <span className="text-slate-400">Grid stable. Next tariff spike in 2 hours. Pre-charging BESS.</span>
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            <span>AUTO</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
        </div>

        {islandExpanded && (
          <div className="mt-2 w-[560px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden transition-all duration-300 z-50 text-slate-200">
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    EcoGrid Neural Arbitrage 4.2
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">AUTONOMOUS</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Confidence: 98.6% • Latency: 120ms</div>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setIslandExpanded(false)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-400">bolt</span>
                    Pre-Peak Arbitrage Strategy in Effect
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Dispatch Window: 14:00 - 17:00</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  TNB Peak Surge tariff of <strong className="text-amber-300">RM 0.58/kWh</strong> approaches in 2 hours. Substation battery storage (BESS-01 & BESS-02) is currently pre-charging at off-peak rates (<strong className="text-emerald-300">RM 0.22/kWh</strong>) utilizing surplus solar feed-in to maximize evening discharge delta.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition-colors"
                    onClick={() => {
                      setIslandExpanded(false);
                      showToast('Autonomous protocol confirmed for 14:00 peak discharge');
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span> Keep Autonomous Protocol
                  </button>
                  <button
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-[11px] transition-colors"
                    onClick={() => setIslandExpanded(false)}
                  >
                    Manual Override
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-slate-300 pt-1">
                <div className="flex gap-2 items-start">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase pt-0.5">COPILOT:</span>
                  <span className="text-slate-300">Predicted savings for today’s 14:00 arbitrage discharge: <strong className="text-white">RM 1,420</strong> across Commercial Mall & Boulevard chillers.</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Explain peak shaving logic', 'Simulate 1-hour cloud cover', 'Show TNB Tariff Schedule'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => showToast(`Simulating: "${chip}"`)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-md text-[11px] text-slate-300 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED SIDEBAR */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-200/80 flex flex-col fixed inset-y-0 left-0 z-40 select-none shadow-xs transition-all duration-300 h-screen overflow-y-auto`}
      >
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between overflow-hidden">
          <a href="homepage.html" className="flex items-center gap-3 min-w-0 group" title="Back to Overview">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-200 transition-colors">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-bold text-slate-800 tracking-tight whitespace-nowrap overflow-hidden">
                EnergyOS
              </span>
            )}
          </a>
        </div>

        <div className="px-3.5 pt-3 pb-1">
          <button
            className={`w-full flex items-center gap-3 px-2 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {sidebarCollapsed ? 'menu' : 'menu_open'}
            </span>
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold tracking-wide text-slate-500 truncate">
                Collapse Menu
              </span>
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <a
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all"
            href="homepage.html"
            title="Overview"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 shrink-0">grid_view</span>
            {!sidebarCollapsed && <span className="truncate">Overview</span>}
          </a>

          <a
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#065f46] text-white font-bold text-sm shadow-sm transition-all"
            href="energy.html"
            title="Energy Arbitrage"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-[20px] text-white shrink-0">swap_vert</span>
              {!sidebarCollapsed && <span className="truncate text-white">Energy Arbitrage</span>}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold bg-[#97f5cc] text-[#005137] px-2 py-0.5 rounded-md font-mono shrink-0">
                AUTO
              </span>
            )}
          </a>

          <a
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all"
            href="digital-twin.html"
            title="Digital Twin"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 shrink-0">domain</span>
            {!sidebarCollapsed && <span className="truncate">Digital Twin</span>}
          </a>

          <a
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all"
            href="asset-diagnostics.html"
            title="Asset Diagnostics"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 shrink-0">shield</span>
            {!sidebarCollapsed && <span className="truncate">Asset Diagnostics</span>}
          </a>

          <a
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all"
            href="homepage.html#carbon-analytics"
            title="Carbon Analytics"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 shrink-0">co2</span>
            {!sidebarCollapsed && <span className="truncate">Carbon Analytics</span>}
          </a>

          <a
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all"
            href="#"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500 shrink-0">settings</span>
            {!sidebarCollapsed && <span className="truncate">Settings</span>}
          </a>
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-2 overflow-hidden">
          <div
            className={`p-2.5 bg-[#eff4ff] border border-[#d3e4fe] rounded-xl flex items-center ${
              sidebarCollapsed ? 'justify-center p-2' : 'justify-between'
            } gap-2.5 transition-all cursor-pointer hover:bg-blue-100/60`}
            title="Bandar Eco Sanctuary (Phase 1 & 2 Online)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase truncate">ACTIVE TOWNSHIP</span>
                  <div className="text-xs font-bold text-slate-800 truncate">Bandar Eco Sanctuary</div>
                  <span className="block text-[10px] text-emerald-700 font-medium truncate">Phase 1 & 2 Online</span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">unfold_more</span>
            )}
          </div>

          <div
            className={`px-3 py-2 bg-[#d1fae5]/80 border border-emerald-200/70 text-emerald-900 rounded-xl flex items-center ${
              sidebarCollapsed ? 'justify-center px-2' : 'justify-between'
            } gap-1 text-xs font-semibold shadow-2xs transition-all`}
            title="SCADA Synchronized: 100% Locked"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              {!sidebarCollapsed && <span className="text-[11px] font-bold tracking-tight truncate">SCADA Synchronized</span>}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono font-medium text-emerald-800 shrink-0 bg-white/70 px-1.5 py-0.5 rounded">
                100% Locked
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } p-8 pt-16 max-w-7xl mx-auto space-y-6 transition-all duration-300 min-h-screen pb-16`}
      >
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">show_chart</span>
              <span>Microgrid Financial Optimization</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Energy Arbitrage & Microgrid Financials
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time tariff band dispatch, predictive solar curve absorption, and autonomous BESS peak-shaving ledger.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Next Arbitrage Dispatch:</span>
              <strong className="font-mono text-slate-900">14:00 MYT (in 1h 45m)</strong>
            </div>
            <button
              onClick={() => showToast('Exporting microgrid financial ledger audit...')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Audit</span>
            </button>
          </div>
        </header>

        {/* 4 KPI BANNER CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Cost Avoided (Today)</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">RM 3,450</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                +12%
              </span>
              <span className="text-slate-400 font-normal">vs yesterday benchmark</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Current TNB Tariff</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              Off-Peak <span className="text-sm font-semibold text-slate-500">(RM 0.22/kWh)</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-amber-600">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                <span>2 hours until Peak Surge</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Surge: RM 0.58</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[70%]" title="Off-peak window"></div>
              <div className="bg-amber-400 h-full w-[30%]" title="Approaching surge"></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>AI Forecast Accuracy</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">95.2%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">High Conf.</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 flex items-center justify-between">
              <span>Weather & Demand combined</span>
              <span className="text-[11px] font-mono text-slate-400">±0.08 MW margin</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>BESS State of Charge</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">battery_charging_full</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">85%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Ready
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full w-[85%] transition-all duration-500"></div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">6.4 MWh</span>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION: 70/30 GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* LEFT: 24-HOUR INTERACTIVE FORECAST CHART */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2.5">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    24-Hour Energy Arbitrage Forecast
                  </h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-emerald-700 text-[11px] font-medium select-none shadow-2xs">
                    <span className="material-symbols-outlined text-[14px]">pan_tool</span>
                    <span>Drag or scrub anywhere along curve to inspect hourly telemetry</span>
                  </div>
                </div>

                <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-600 self-start sm:self-auto shadow-inner">
                  <button className="px-3 py-1 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200/50 transition-all font-bold">
                    Today (Live)
                  </button>
                  <button className="px-3 py-1 hover:text-slate-900 text-slate-500 rounded-lg transition-colors">
                    24H View
                  </button>
                  <button className="px-3 py-1 hover:text-slate-900 text-slate-500 rounded-lg transition-colors">
                    Cost Arbitrage
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    <span className="font-semibold text-slate-800">Solar Generation Forecast (MW)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#475569]"></span>
                    <span className="font-medium text-slate-600">Aggregate Demand (MW)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-medium">Tariff Schedule:</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Off-Peak (RM 0.22)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                    Peak Surge (RM 0.58)
                  </span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE CHART CANVAS */}
            <div
              ref={chartRef}
              className="relative w-full h-[260px] my-2 select-none cursor-crosshair group/chart"
              onMouseDown={(e) => {
                setIsDragging(true);
                handleScrubMove(e.clientX);
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={(e) => {
                handleScrubMove(e.clientX);
              }}
              onTouchMove={(e) => {
                if (e.touches && e.touches[0]) {
                  handleScrubMove(e.touches[0].clientX);
                }
              }}
            >
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 760 220">
                <defs>
                  <linearGradient id="solarAreaGradientReact" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
                    <stop offset="70%" stopColor="#10b981" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Dashed Horizontal Grid */}
                <g className="stroke-slate-200/70" strokeDasharray="3,3" strokeWidth="1">
                  <line x1="20" x2="740" y1="20" y2="20" />
                  <line x1="20" x2="740" y1="65" y2="65" />
                  <line x1="20" x2="740" y1="110" y2="110" />
                  <line x1="20" x2="740" y1="155" y2="155" />
                  <line x1="20" x2="740" y1="185" y2="185" />
                </g>

                {/* Shaded Peak Surge Band */}
                <rect fill="#fee2e2" fillOpacity="0.45" height="170" rx="4" stroke="#fecaca" strokeDasharray="3,2" strokeWidth="1" width="118" x="430" y="15" />

                {/* Solar Area Fill */}
                <path d="M 20 185 L 180 185 C 230 185, 270 170, 310 120 C 350 70, 385 32, 415 32 C 450 32, 480 80, 510 135 C 535 175, 555 185, 570 185 L 740 185 Z" fill="url(#solarAreaGradientReact)" />

                {/* Aggregate Demand Curve */}
                <path d="M 20 162 C 60 160, 110 155, 160 145 C 220 130, 260 110, 300 102 C 340 98, 380 105, 420 108 C 460 105, 500 88, 540 85 C 590 85, 630 120, 680 145 C 710 160, 730 165, 740 165" fill="none" stroke="#334155" strokeLinecap="round" strokeWidth="2" />

                {/* Solar Curve */}
                <path d="M 20 185 L 180 185 C 230 185, 270 170, 310 120 C 350 70, 385 32, 415 32 C 450 32, 480 80, 510 135 C 535 175, 555 185, 570 185 L 740 185" fill="none" stroke="#047857" strokeLinecap="round" strokeWidth="2.5" />

                {/* X Axis Labels */}
                <g className="fill-slate-500 font-medium text-[9.5px]" textAnchor="middle">
                  <text x="25" y="206">00:00</text>
                  <text x="95" y="206">03:00</text>
                  <text x="175" y="206">06:00 (Dawn)</text>
                  <text x="255" y="206">09:00</text>
                  <text x="340" y="206">12:00 (Solar Peak)</text>
                  <text fill="#047857" fontWeight="700" x="450" y="206">14:00 (Discharge)</text>
                  <text x="535" y="206">17:00</text>
                  <text x="625" y="206">20:00 (Night Grid)</text>
                  <text x="715" y="206">23:00</text>
                </g>

                {/* Dynamic Scrubber */}
                <g transform={`translate(${svgX}, 0)`}>
                  <line stroke="#047857" strokeDasharray="3,3" strokeWidth="1.5" x1="0" x2="0" y1="15" y2="185" />
                  <circle cx="0" cy="18" fill="#ffffff" r="6" stroke="#047857" strokeWidth="2.5" />
                  <circle cx="0" cy="18" fill="#047857" r="2.5" />
                  <circle cx="0" cy={demandY} fill="#334155" r="4.5" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              </svg>

              {/* Bottom Scrubber Badge */}
              <div
                className="absolute -bottom-1 pointer-events-none transform -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-[#065f46] text-white font-mono text-[10px] font-bold shadow-md"
                style={{ left: `${(svgX / 760) * 100}%` }}
              >
                {curTelem.timeStr}
              </div>

              {/* Floating Tooltip */}
              <div
                className="absolute pointer-events-none z-30 w-[240px] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xl text-slate-800 transition-all duration-75"
                style={{
                  left: svgX > 400 ? '25px' : 'calc(100% - 265px)',
                  top: '10px'
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{curTelem.timeStr} MYT</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                      curTelem.isPeak
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {curTelem.tariffBadge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>
                      <span>Solar Gen</span>
                    </div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{curTelem.solar} MW</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      <span>Total Demand</span>
                    </div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{curTelem.demand} MW</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 text-[11px] text-slate-600">
                  <span className="text-slate-500">Net Grid Import:</span>
                  <span className="font-semibold text-slate-800 font-mono">{curTelem.netGrid} MW from TNB</span>
                </div>

                <div className="p-2 my-1 bg-[#effdf5] border border-emerald-200/70 rounded-xl flex items-start gap-2 text-xs">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 text-[11px] leading-tight truncate">{curTelem.stratTitle}</div>
                    <div className="text-[10px] text-emerald-800/90 leading-tight mt-0.5 line-clamp-2">{curTelem.stratDesc}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">Interval Economy:</span>
                  <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                    {curTelem.economy}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Bottom Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500">Total Solar Harvest</div>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">34.2 MWh</div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">94% forecast accuracy</div>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500">Predicted Grid Import</div>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">18.6 MWh</div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">Restricted to off-peak</div>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500">BESS Arbitrage Capacity</div>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">6.4 MWh</div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">Full round-trip primed</div>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500">Net Energy Cost Delta</div>
                <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">-32.4%</div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">Optimized vs. baselines</div>
              </div>
            </div>
          </div>

          {/* RIGHT: SAVINGS CONTRIBUTION DONUT */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Savings Contribution by Zone
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distributed microgrid financial yield breakdown.
              </p>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" fill="none" r="75" stroke="#f1f5f9" strokeWidth="24" />
                <circle
                  className="transition-all hover:opacity-90 cursor-pointer"
                  cx="100"
                  cy="100"
                  fill="none"
                  r="75"
                  stroke="#065f46"
                  strokeDasharray="280 471.24"
                  strokeDashoffset="0"
                  strokeWidth="24"
                />
                <circle
                  className="transition-all hover:opacity-90 cursor-pointer"
                  cx="100"
                  cy="100"
                  fill="none"
                  r="75"
                  stroke="#10b981"
                  strokeDasharray="139 471.24"
                  strokeDashoffset="-282.7"
                  strokeWidth="24"
                />
                <circle
                  className="transition-all hover:opacity-90 cursor-pointer"
                  cx="100"
                  cy="100"
                  fill="none"
                  r="75"
                  stroke="#6ee7b7"
                  strokeDasharray="46 471.24"
                  strokeDashoffset="-424.1"
                  strokeWidth="24"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Total Saved</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">RM 3,450</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                  Target Exceeded
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#065f46]"></span>
                  <span className="font-semibold text-slate-800">Commercial Mall</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">RM 2,070</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">60%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                  <span className="font-semibold text-slate-800">Sports Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">RM 1,035</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">30%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#6ee7b7]"></span>
                  <span className="font-semibold text-slate-800">Smart Homes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">RM 345</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">10%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: AI STRATEGY & OPERATOR CONTROLS */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  AI Arbitrage Control Parameters
                </h2>
                <p className="text-xs text-slate-500">
                  Supervisory dispatch thresholds, autonomous risk envelopes, and real-time operational log.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Safety Interlock:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                PASS (IEC 61850)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Risk profile slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">AI Risk Profile</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    riskProfile < 35
                      ? 'text-blue-800 bg-blue-100/70'
                      : riskProfile > 65
                      ? 'text-amber-800 bg-amber-100/70'
                      : 'text-emerald-800 bg-emerald-100/70'
                  }`}
                >
                  {riskProfile < 35
                    ? `Conservative (${riskProfile}/100)`
                    : riskProfile > 65
                    ? `Aggressive (${riskProfile}/100)`
                    : `Balanced (${riskProfile}/100)`}
                </span>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">verified_user</span>
                  Conservative (Prioritize Backup)
                </span>
                <span className="text-slate-600 flex items-center gap-1">
                  Aggressive (Maximize ROI)
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">trending_up</span>
                </span>
              </div>
            </div>

            {/* Interactive Agent Terminal */}
            <div className="lg:col-span-2 relative transition-all duration-300">
              <div
                className={`bg-[#0b101b] border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/30 overflow-hidden flex flex-col font-mono ${
                  terminalExpanded ? 'ring-2 ring-emerald-500/40 shadow-2xl' : ''
                }`}
              >
                <div className="px-4 py-2.5 bg-[#070b13] border-b border-slate-800/90 flex items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <div className="h-3 w-px bg-slate-800"></div>
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-700/60 rounded-md text-[11px] text-slate-300 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-emerald-400">terminal</span>
                      <span className="tracking-tight text-slate-200">agent-dispatch.sh</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">PID: 8842</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-[10px] text-emerald-300">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                      </span>
                      <span className="tracking-wider font-semibold">STREAMING LIVE</span>
                    </div>

                    <button
                      onClick={() => {
                        setTerminalExpanded(!terminalExpanded);
                        if (!terminalExpanded) {
                          setIslandExpanded(true);
                          showToast('Terminal expanded • AI Dynamic Island Copilot Synchronized');
                        } else {
                          showToast('Terminal restored to standard view');
                        }
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-sans font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {terminalExpanded ? 'close_fullscreen' : 'open_in_full'}
                      </span>
                      <span>{terminalExpanded ? 'Minimize' : 'Expand Terminal'}</span>
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {['ALL', 'AUTO_DISPATCH', 'GRID_SYNC', 'BESS_CONTROL', 'IEC_61850'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          activeFilter === f
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {f === 'ALL'
                          ? `ALL (${logs.length})`
                          : f === 'AUTO_DISPATCH'
                          ? 'DISPATCH'
                          : f === 'GRID_SYNC'
                          ? 'GRID SYNC'
                          : f === 'BESS_CONTROL'
                          ? 'BESS'
                          : 'SAFETY'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <span className="hidden md:inline font-sans text-slate-500">
                      Auto-scroll: <strong className="text-emerald-400 font-mono">ON</strong>
                    </span>
                    <span className="text-slate-700">|</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(logs.map((l) => `${l.time} [${l.category}] ${l.text}`).join('\n'));
                        showToast('Terminal logs copied to clipboard');
                      }}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter('ALL');
                        showToast('Logs reset to default filter view');
                      }}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">clear_all</span>
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 space-y-2 overflow-y-auto ${
                    terminalExpanded ? 'max-h-96' : 'max-h-52'
                  } text-xs leading-relaxed transition-all duration-300`}
                >
                  {filteredLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 hover:bg-slate-900/60 px-2 py-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                    >
                      <span className="text-slate-500 font-mono select-none text-[11px] pt-0.5 shrink-0">{log.time}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${log.categoryColor}`}>
                        [{log.category}]
                      </span>
                      <p className="text-slate-200 flex-1">
                        {log.text}
                        {log.statusTag && (
                          <span className="inline-block ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                            {log.statusTag}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 bg-[#070b13] border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold select-none">&gt;</span>
                    <span className="text-slate-500 text-[11px]">telemetry@ecogrid-sanctuary:~$</span>
                    <input
                      className="bg-transparent border-none text-slate-200 text-xs placeholder-slate-600 focus:outline-none flex-1 font-mono"
                      placeholder="dispatch --now --target BESS_01 or tail -f"
                      type="text"
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      onKeyDown={handleCliSubmit}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>0 ms delay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs z-50 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
