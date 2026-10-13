import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * EnergiOS Asset Diagnostics & Anomaly Triage Component
 * Fulfills requirements for:
 * - Unusual energy consumption pattern detection
 * - Historical hourly electricity readings (kWh)
 * - Forecast accuracy metrics (MAE: 1.42 kWh / RMSE: 1.88 kWh)
 */
export default function AssetDiagnostics() {
  const [activeRange, setActiveRange] = useState('24h');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [aiIslandExpanded, setAiIslandExpanded] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Asset Diagnostics Assistant active. 3 anomalies detected across BDG2 telemetry in the last 24 hours.' }
  ]);

  // Anomaly triage log records
  const [anomalies, setAnomalies] = useState([
    {
      id: 'ANOM-8821',
      asset: 'BDG2-BULL (AHU-04)',
      time: '14 Oct 02:00',
      type: 'Unscheduled Surge',
      val: '48.2 kWh',
      dev: '+18.4 kWh (+61.7%)',
      status: 'pending',
      severity: 'high'
    },
    {
      id: 'ANOM-8820',
      asset: 'BDG2-BEAR (Chiller-02)',
      time: '13 Oct 21:00',
      type: 'Compressor Stutter',
      val: '37.8 kWh',
      dev: '+9.3 kWh (+32.6%)',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: 'ANOM-8819',
      asset: 'BDG2-FOX (Ballroom HV)',
      time: '13 Oct 18:00',
      type: 'Ramp-up Spike',
      val: '42.6 kWh',
      dev: '+12.1 kWh (+39.7%)',
      status: 'acknowledged',
      severity: 'low'
    },
    {
      id: 'ANOM-8818',
      asset: 'BDG2-CROW (Main Incomer)',
      time: '13 Oct 14:00',
      type: 'Phase Imbalance Shift',
      val: '39.1 kWh',
      dev: '+7.4 kWh (+23.3%)',
      status: 'acknowledged',
      severity: 'low'
    }
  ]);

  // Terminal daemon log lines
  const [daemonLogs, setDaemonLogs] = useState([
    '[00:42:01.104] [INFO] daemon::isolation_forest: telemetry window sync completed (2,880 samples)',
    '[00:42:15.820] [INFO] daemon::evaluator: inference latency: 18.2ms | drift_metric: 0.014',
    '[00:43:02.419] [WARN] daemon::detector: ANOM-8821 flag raised at BDG2-BULL-AHU04 (z-score: 3.42)',
    '[00:43:05.109] [INFO] daemon::triage_bus: dispatching alert to SCADA edge controller (ACK: pending)',
    '[00:44:00.002] [INFO] daemon::health: watchdog ok | heap_alloc: 42.1MB | uptime: 18d 04h 12m'
  ]);

  const terminalEndRef = useRef(null);

  // Simulated live daemon log ingestion
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const messages = [
        `[${ts}] [INFO] daemon::readings: stream verification ok for 4 BDG2 building feeds (0 dropped)`,
        `[${ts}] [INFO] daemon::forecast_engine: MAE validated at 1.42 kWh, RMSE at 1.88 kWh`,
        `[${ts}] [HEARTBEAT] daemon::supervisor: edge telemetry socket alive | RTT: 24ms`,
        `[${ts}] [INFO] daemon::isolation_forest: zero false-positives registered during last 5-min epoch`
      ];
      const pick = messages[Math.floor(Math.random() * messages.length)];
      setDaemonLogs(prev => [...prev.slice(-30), pick]);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [daemonLogs]);

  const handleAcknowledge = (id) => {
    setAnomalies(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'acknowledged' } : item
      )
    );
    const ts = new Date().toTimeString().split(' ')[0];
    setDaemonLogs(prev => [
      ...prev,
      `[${ts}] [ACK_EVENT] operator::triage: incident ${id} marked ACKNOWLEDGED`
    ]);
  };

  const handleSendAi = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const q = aiQuery.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: q }]);
    setAiQuery('');
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Analysis for "${q}": Telemetry confirms anomalous draw was concentrated in AHU-04 supply fan inverter duty cycle. Forecast model confidence remains High Conf (98.4%). Recommendation: inspect AHU-04 filter pressure switch.`
        }
      ]);
    }, 600);
  };

  // 24 hourly data points (00:00 to 23:00)
  const hourlyData = useMemo(() => [
    { time: '00:00', kwh: 18.2, isAnomaly: false },
    { time: '01:00', kwh: 16.5, isAnomaly: false },
    { time: '02:00', kwh: 48.2, isAnomaly: true, deviation: '+18.4 kWh (+61.7%)', note: 'AHU-04 surge' },
    { time: '03:00', kwh: 15.9, isAnomaly: false },
    { time: '04:00', kwh: 14.8, isAnomaly: false },
    { time: '05:00', kwh: 17.1, isAnomaly: false },
    { time: '06:00', kwh: 22.4, isAnomaly: false },
    { time: '07:00', kwh: 31.0, isAnomaly: false },
    { time: '08:00', kwh: 44.5, isAnomaly: false },
    { time: '09:00', kwh: 52.8, isAnomaly: false },
    { time: '10:00', kwh: 58.3, isAnomaly: false },
    { time: '11:00', kwh: 61.2, isAnomaly: false },
    { time: '12:00', kwh: 59.4, isAnomaly: false },
    { time: '13:00', kwh: 57.0, isAnomaly: false },
    { time: '14:00', kwh: 39.1, isAnomaly: true, deviation: '+7.4 kWh (+23.3%)', note: 'Phase imbalance shift' },
    { time: '15:00', kwh: 55.6, isAnomaly: false },
    { time: '16:00', kwh: 53.2, isAnomaly: false },
    { time: '17:00', kwh: 49.8, isAnomaly: false },
    { time: '18:00', kwh: 42.6, isAnomaly: true, deviation: '+12.1 kWh (+39.7%)', note: 'Ramp-up spike' },
    { time: '19:00', kwh: 36.4, isAnomaly: false },
    { time: '20:00', kwh: 31.2, isAnomaly: false },
    { time: '21:00', kwh: 37.8, isAnomaly: true, deviation: '+9.3 kWh (+32.6%)', note: 'Chiller-02 stutter' },
    { time: '22:00', kwh: 24.5, isAnomaly: false },
    { time: '23:00', kwh: 19.8, isAnomaly: false }
  ], []);

  // SVG Chart Geometry
  const svgWidth = 900;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;
  const maxKwh = 70;

  const points = hourlyData.map((d, i) => {
    const x = padding.left + (i / (hourlyData.length - 1)) * chartW;
    const y = padding.top + chartH - (d.kwh / maxKwh) * chartH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none z-30">
        <div className="p-4 space-y-1">
          <div className="px-3 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-700">menu_open</span>
          </div>

          <nav className="space-y-1">
            <a href="homepage.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Overview</span>
            </a>
            <a href="energy.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">swap_vert</span>
              <span>Energy Arbitrage</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#006948] font-bold">AUTO</span>
            </a>
            <a href="digital-twin.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
              <span>Digital Twin</span>
            </a>
            {/* ACTIVE GREEN STATE */}
            <a href="asset-diagnostics.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#006948] text-white shadow-sm shadow-[#006948]/25 transition-all">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
              <span>Asset Diagnostics</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                {anomalies.filter(a => a.status === 'pending').length}
              </span>
            </a>
            <a href="homepage.html#carbon" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">co2</span>
              <span>Carbon Analytics</span>
            </a>
          </nav>
        </div>

        {/* Sidebar bottom township context */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="bg-slate-50 p-2.5 rounded-xl flex items-center gap-2.5 border border-slate-200/60">
            <div className="w-8 h-8 rounded-lg bg-[#006948]/10 text-[#006948] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">location_city</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Township</span>
              <span className="text-xs font-bold text-slate-900 truncate">Bandar Eco Sanctuary</span>
              <span className="text-[10px] text-emerald-700 font-medium">4 BDG2 Buildings Online</span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#006948] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span> Anomaly Daemon
            </span>
            <span className="text-[10px] text-emerald-800 font-mono">v1.4.2</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER: Brand + Interactive AI Dynamic Island */}
        <header className="h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00a651] flex items-center justify-center text-white shadow-sm shadow-[#006948]/30">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">EnergyOS</h1>
              <span className="text-[11px] text-slate-500 font-medium">Asset Diagnostics &amp; Anomaly Triage</span>
            </div>
          </div>

          {/* DYNAMIC ISLAND AI CHAT */}
          <div className="relative">
            <div
              onClick={() => setAiIslandExpanded(!aiIslandExpanded)}
              className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
            >
              <div className="w-2 h-2 rounded-full bg-[#00a651] animate-ping" />
              <span className="text-xs font-semibold">EnergiOS AI Engine</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                {aiIslandExpanded ? 'CLOSE' : 'EXPAND'}
              </span>
            </div>

            {aiIslandExpanded && (
              <div className="absolute right-0 top-11 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006948] text-base">smart_toy</span>
                    Diagnostic Copilot
                  </span>
                  <button onClick={() => setAiIslandExpanded(false)} className="text-slate-400 hover:text-slate-700">
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
                <div className="h-48 overflow-y-auto py-2 space-y-2 text-xs">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`p-2 rounded-xl ${m.sender === 'ai' ? 'bg-slate-50 text-slate-800 border border-slate-100' : 'bg-[#006948] text-white ml-6'}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendAi} className="pt-2 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask about anomaly root cause..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#006948]"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-[#006948] text-white rounded-lg text-xs font-semibold hover:bg-[#005137]">
                    Ask
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TOP ROW: 3 KPI CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CARD 1: SYSTEM HEALTH */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Card 1: System Health</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" title="Active Anomaly Detected"></span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-3xl font-extrabold text-slate-900">
                  {anomalies.filter(a => a.status === 'pending').length}
                  <span className="text-sm font-semibold text-rose-600 ml-2">Active Anomalies</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">ACTION REQ.</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Unusual energy consumption pattern detection across 4 BDG2 building meters.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                <span>Total Assets: <strong>4 Buildings (12 Meters)</strong></span>
                <span className="text-emerald-700 font-semibold">97.8% Fleet Normal</span>
              </div>
            </div>

            {/* CARD 2: FORECAST ACCURACY */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Card 2: Forecast Accuracy</span>
                {/* PROMINENT GREEN 'High Conf.' BADGE */}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006948] text-xs font-bold border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                  High Conf.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">MAE</span>
                  <div className="text-2xl font-extrabold text-slate-900">1.42 <span className="text-xs font-semibold text-slate-500">kWh</span></div>
                  <span className="text-[10px] text-emerald-600 font-semibold">↓ 0.18 vs benchmark</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">RMSE</span>
                  <div className="text-2xl font-extrabold text-slate-900">1.88 <span className="text-xs font-semibold text-slate-500">kWh</span></div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Target &lt; 2.2 kWh</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Model: LightGBM Multi-Quantile</span>
                <span className="font-mono text-slate-700">R² = 0.964</span>
              </div>
            </div>

            {/* CARD 3: LIVE API STATUS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Card 3: Live API Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ALL HEALTHY</span>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-mono text-slate-600">GET /v1/assets</span>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">18 ms</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-mono text-slate-600">GET /v1/readings</span>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">24 ms</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="font-mono text-slate-600">POST /v1/forecast</span>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">38 ms</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Telemetry Ingestion: 60s Epoch</span>
                <span className="text-[#006948] font-bold">0% Packet Loss</span>
              </div>
            </div>
          </section>

          {/* MIDDLE SECTION: TIME-SERIES LINE CHART 'Meter Readings & Anomalies' */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Meter Readings &amp; Anomalies</h2>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">BDG2 Electricity</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historical hourly electricity readings (kWh) as a solid line with high-contrast red scatter point markers.
                </p>
              </div>

              {/* CONTROLS */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                  {['24h', '7d', '30d'].map(rng => (
                    <button
                      key={rng}
                      onClick={() => setActiveRange(rng)}
                      className={`px-3 py-1 rounded-lg transition-colors ${activeRange === rng ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                      {rng}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-[#006948]"
                >
                  <option value="all">All BDG2 Buildings Aggregate</option>
                  <option value="bull">Bull_education_office (Main Meter)</option>
                  <option value="bear">Bear_retail_complex (Chiller Submeter)</option>
                  <option value="fox">Fox_assembly_hall (Incomer)</option>
                  <option value="crow">Crow_education_lab (Lab Feeder)</option>
                </select>
              </div>
            </div>

            {/* CHART VIEWPORT */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[720px] select-none"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006948" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#006948" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 15, 30, 45, 60].map(val => {
                  const y = padding.top + chartH - (val / maxKwh) * chartH;
                  return (
                    <g key={val}>
                      <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                        {val} kWh
                      </text>
                    </g>
                  );
                })}

                {/* X-axis ticks */}
                {points.filter((_, idx) => idx % 3 === 0).map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={padding.top + chartH + 20}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 font-mono"
                  >
                    {pt.time}
                  </text>
                ))}

                {/* Filled gradient area */}
                <path d={areaD} fill="url(#areaGrad)" />

                {/* SOLID LINE FOR HISTORICAL HOURLY READINGS */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#006948"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* REGULAR HOURLY POINTS */}
                {points.map((pt, idx) => !pt.isAnomaly && (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#006948"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* HIGH-CONTRAST RED SCATTER POINT MARKERS FOR ANOMALIES */}
                {points.map((pt, idx) => pt.isAnomaly && (
                  <g key={`anom-${idx}`} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Pulsing ring */}
                    <circle cx={pt.x} cy={pt.y} r="10" fill="#e11d48" opacity="0.25">
                      <animate attributeName="r" values="7;14;7" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Solid high-contrast red marker */}
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
                  </g>
                ))}
              </svg>

              {/* CUSTOM HOVER TOOLTIP */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-slate-700 z-30 transition-all transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                    top: `${(hoveredPoint.y / svgHeight) * 100 - 4}%`
                  }}
                >
                  <div className="font-bold text-slate-200 flex items-center justify-between gap-3 mb-1">
                    <span>{hoveredPoint.time} (Hourly Log)</span>
                    {hoveredPoint.isAnomaly ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">ANOMALY</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-700 text-white">NORMAL</span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {hoveredPoint.kwh} kWh
                  </div>
                  {hoveredPoint.isAnomaly && (
                    <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-rose-300">
                      Deviation: <strong>{hoveredPoint.deviation}</strong>
                      <div className="text-[10px] text-slate-400 mt-0.5">{hoveredPoint.note}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CHART FOOTER LEGEND */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-4 h-0.5 bg-[#006948]"></span> Historical Hourly Electricity (kWh)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-600">
                  <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-sm"></span> High-Contrast Anomaly Point
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">Synthetic demonstration data — Sime Darby BDG2 Buildings</span>
            </div>
          </section>

          {/* BOTTOM SECTION: SPLIT INTO TWO COLUMNS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: ANOMALY TRIAGE LOG TABLE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Anomaly Triage Log</h3>
                    <p className="text-xs text-slate-500">Recent unusual energy patterns flagged by the ML pipeline.</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold font-mono">
                    {anomalies.length} Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/70 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-2.5">Incident</th>
                        <th className="pb-2.5">Asset / Pattern</th>
                        <th className="pb-2.5">Reading &amp; Dev</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {anomalies.map(anom => (
                        <tr key={anom.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3">
                            <span className="font-mono font-bold text-slate-800">{anom.id}</span>
                            <div className="text-[10px] text-slate-400">{anom.time}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-slate-900">{anom.asset}</div>
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                              anom.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                              anom.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {anom.type}
                            </span>
                          </td>
                          <td className="py-3 font-mono">
                            <div className="font-bold text-slate-800">{anom.val}</div>
                            <span className="text-[11px] text-rose-600 font-semibold">{anom.dev}</span>
                          </td>
                          <td className="py-3 text-right">
                            {anom.status === 'pending' ? (
                              <button
                                onClick={() => handleAcknowledge(anom.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white font-semibold text-xs transition-colors shadow-sm"
                              >
                                Acknowledge
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[14px]">check</span> ACK'D
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Filter: All Severities</span>
                <span className="text-slate-500">Auto-refresh active (30s)</span>
              </div>
            </div>

            {/* RIGHT COLUMN: DARK-THEMED TERMINAL WINDOW (Real-time daemon logs) */}
            <div className="bg-[#0f172a] text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between font-mono">
              <div>
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="ml-2 text-xs font-semibold text-slate-400">daemon::anomaly_detector.sh</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                      LIVE STREAM
                    </span>
                    <span className="text-slate-500">PID: 9402</span>
                  </div>
                </div>

                {/* Log Stream Output */}
                <div
                  ref={terminalEndRef}
                  className="h-64 overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2 scrollbar-thin scrollbar-thumb-slate-700"
                >
                  {daemonLogs.map((log, index) => {
                    const isWarn = log.includes('[WARN]');
                    const isAck = log.includes('[ACK_EVENT]');
                    return (
                      <div
                        key={index}
                        className={`leading-relaxed whitespace-pre-wrap ${
                          isWarn ? 'text-amber-300 bg-amber-950/20 px-1 rounded' :
                          isAck ? 'text-emerald-300 font-bold bg-emerald-950/20 px-1 rounded' : 'text-slate-300'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span>&gt;</span>
                    <span className="w-2 h-4 bg-emerald-400 animate-pulse"></span>
                  </div>
                </div>
              </div>

              {/* Terminal Footer Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Buffer: 30 events</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDaemonLogs(prev => [...prev, `[${new Date().toTimeString().split(' ')[0]}] [TRIGGER] user::manual_scan: full model pass initiated`])}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-colors"
                  >
                    Run Force Scan
                  </button>
                  <button
                    onClick={() => setDaemonLogs([])}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
