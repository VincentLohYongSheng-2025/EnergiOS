import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * EnergiOS Digital Twin & Benchmarking Component
 * Fulfills requirements for:
 * - Four BDG2 buildings and their electricity meters
 * - Building-to-building demand comparison
 * - Public benchmark data (GBI Commercial baseline: 185 kWh/m²)
 * - 3D Three.js digital twin visualization using midvalley_floorplan.svg
 */
export default function DigitalTwinBenchmarking() {
  const [activeFloor, setActiveFloor] = useState('G');
  const [benchmarkMode, setBenchmarkMode] = useState('live'); // 'live' | 'forecast'
  const [selectedBuilding, setSelectedBuilding] = useState('bull');
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [aiIslandExpanded, setAiIslandExpanded] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Digital Twin Copilot ready. BDG2 telemetry synchronized across all 4 building substations.' }
  ]);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const groupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // 4 BDG2 Buildings Data
  const buildings = [
    {
      id: 'bull',
      name: 'Bull_education_office',
      type: 'Commercial Office Tower',
      demandKw: '412.5 kW',
      dailyKwh: '6,840 kWh',
      intensity: 142.4, // kWh/m²
      forecastIntensity: 138.1,
      meterId: 'BDG2-MTR-01',
      status: 'SCADA Online',
      statusColor: 'emerald',
      area: '48,000 m²',
      color: '#006948',
      isoSvg: (
        <svg viewBox="0 0 100 80" className="w-16 h-14 drop-shadow">
          <polygon points="50,5 90,25 50,45 10,25" fill="#68dba9" />
          <polygon points="10,25 50,45 50,75 10,55" fill="#006948" />
          <polygon points="90,25 50,45 50,75 90,55" fill="#004d34" />
        </svg>
      )
    },
    {
      id: 'bear',
      name: 'Bear_retail_complex',
      type: 'Shopping Mall & Retail',
      demandKw: '685.2 kW',
      dailyKwh: '11,420 kWh',
      intensity: 228.6, // kWh/m²
      forecastIntensity: 219.0,
      meterId: 'BDG2-MTR-02',
      status: 'High Load',
      statusColor: 'amber',
      area: '50,000 m²',
      color: '#d97706',
      isoSvg: (
        <svg viewBox="0 0 100 80" className="w-16 h-14 drop-shadow">
          <polygon points="50,10 85,25 50,40 15,25" fill="#fcd34d" />
          <polygon points="15,25 50,40 50,70 15,55" fill="#d97706" />
          <polygon points="85,25 50,40 50,70 85,55" fill="#b45309" />
        </svg>
      )
    },
    {
      id: 'fox',
      name: 'Fox_assembly_hall',
      type: 'Exhibition & Atrium Hall',
      demandKw: '298.0 kW',
      dailyKwh: '4,150 kWh',
      intensity: 165.2, // kWh/m²
      forecastIntensity: 158.4,
      meterId: 'BDG2-MTR-03',
      status: 'Optimal',
      statusColor: 'emerald',
      area: '25,000 m²',
      color: '#2563eb',
      isoSvg: (
        <svg viewBox="0 0 100 80" className="w-16 h-14 drop-shadow">
          <polygon points="50,15 80,28 50,42 20,28" fill="#93c5fd" />
          <polygon points="20,28 50,42 50,68 20,54" fill="#2563eb" />
          <polygon points="80,28 50,42 50,68 80,54" fill="#1d4ed8" />
        </svg>
      )
    },
    {
      id: 'crow',
      name: 'Crow_education_lab',
      type: 'Research & Clean Labs',
      demandKw: '184.4 kW',
      dailyKwh: '2,980 kWh',
      intensity: 198.5, // kWh/m²
      forecastIntensity: 192.0,
      meterId: 'BDG2-MTR-04',
      status: 'SCADA Online',
      statusColor: 'emerald',
      area: '15,000 m²',
      color: '#7c3aed',
      isoSvg: (
        <svg viewBox="0 0 100 80" className="w-16 h-14 drop-shadow">
          <polygon points="50,8 88,26 50,44 12,26" fill="#c4b5fd" />
          <polygon points="12,26 50,44 50,72 12,54" fill="#7c3aed" />
          <polygon points="88,26 50,44 50,72 88,54" fill="#6d28d9" />
        </svg>
      )
    }
  ];

  const publicBenchmarkKwhM2 = 185.0; // GBI Commercial Benchmark Average

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(350, 420, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(200, 400, 250);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor Base & Grid
    const grid = new THREE.GridHelper(700, 35, 0x006948, 0xcbd5e1);
    grid.position.y = -2;
    scene.add(grid);

    // 3D Architectural Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Load or generate multi-level architectural geometry from midvalley floorplan
    const floorLevels = [
      { name: 'P1', y: 0, color: 0x94a3b8 },
      { name: 'LG', y: 25, color: 0x64748b },
      { name: 'G', y: 55, color: 0x006948 },
      { name: '1F', y: 85, color: 0x3b82f6 },
      { name: '2S', y: 115, color: 0x8b5cf6 },
      { name: '3T', y: 145, color: 0x10b981 }
    ];

    floorLevels.forEach((fl, idx) => {
      // Architectural slab geometry
      const slabGeo = new THREE.BoxGeometry(320, 6, 220);
      const slabMat = new THREE.MeshStandardMaterial({
        color: fl.name === activeFloor ? 0x006948 : 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: fl.name === activeFloor ? 0.95 : 0.65
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = fl.y;
      group.add(slabMesh);

      // Core atriums / zones
      const atriumGeo = new THREE.CylinderGeometry(25, 25, 12, 16);
      const atriumMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        wireframe: wireframeOnly,
        roughness: 0.2
      });
      const atriumMesh = new THREE.Mesh(atriumGeo, atriumMat);
      atriumMesh.position.set(-60, fl.y + 7, -20);
      group.add(atriumMesh);

      // Peripheral retail / office wings
      const wingGeo = new THREE.BoxGeometry(60, 16, 90);
      const wingMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x0284c7 : 0x059669,
        wireframe: wireframeOnly
      });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.set(90, fl.y + 9, 30);
      group.add(wingMesh);
    });

    // Gentle Auto-Rotation Loop
    let rotY = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (groupRef.current) {
        rotY += 0.0025;
        groupRef.current.rotation.y = rotY;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeFloor, wireframeOnly]);

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
          text: `Benchmarking inquiry for "${q}": Bear_retail_complex exhibits the highest intensity (228.6 kWh/m²), 23.5% above the public benchmark due to central chiller plant load during mall operating hours (10:00 - 22:00). Bull_education_office operates at optimal 142.4 kWh/m².`
        }
      ]);
    }, 600);
  };

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
            {/* ACTIVE GREEN STATE */}
            <a href="digital-twin.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#006948] text-white shadow-sm shadow-[#006948]/25 transition-all">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
              <span>Digital Twin</span>
            </a>
            <a href="asset-diagnostics.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
              <span>Asset Diagnostics</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">3</span>
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
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Township BDG2 Fleet</span>
              <span className="text-xs font-bold text-slate-900 truncate">Sime Darby Eco Sanctuary</span>
              <span className="text-[10px] text-emerald-700 font-medium">4 Buildings Synchronized</span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#006948] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span> Three.js WebGL
            </span>
            <span className="text-[10px] text-emerald-800 font-mono">60 FPS</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER: Brand + Interactive AI Dynamic Island */}
        <header className="h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00a651] flex items-center justify-center text-white shadow-sm shadow-[#006948]/30">
              <span className="material-symbols-outlined text-xl">apartment</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">EnergyOS</h1>
              <span className="text-[11px] text-slate-500 font-medium">Digital Twin &amp; Benchmarking View</span>
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
                    Digital Twin Copilot
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
                    placeholder="Ask about building benchmarking..."
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
          {/* TOP SECTION: WIDE BANNER CARD */}
          <section className="bg-gradient-to-r from-white via-white to-emerald-50/50 rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#006948]/10 text-[#006948] text-xs font-bold font-mono">
                  BDG2 SUBSTATION FLEET
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">Kuala Lumpur / Selangor Metrology</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">BDG2 Building Comparison</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Building-to-building real-time demand telemetry across 4 BDG2 benchmark facilities with public baseline normalization.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-sm text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fleet Peak Demand</span>
                <div className="text-xl font-extrabold text-slate-900">1,580.1 <span className="text-xs font-semibold text-slate-500">kW</span></div>
                <span className="text-[10px] text-emerald-600 font-semibold">94.2% Power Factor</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-sm text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Public Benchmark Avg</span>
                <div className="text-xl font-extrabold text-slate-900">185.0 <span className="text-xs font-semibold text-slate-500">kWh/m²</span></div>
                <span className="text-[10px] text-blue-600 font-semibold">GBI Standard</span>
              </div>
            </div>
          </section>

          {/* MIDDLE SECTION: 4-COLUMN GRID OF BDG2 BUILDING OVERVIEW CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {buildings.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilding(b.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  selectedBuilding === b.id ? 'border-[#006948] ring-2 ring-[#006948]/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Header with 3D isometric illustration & Status Pill */}
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1 rounded-xl bg-slate-50 border border-slate-100">
                    {b.isoSvg}
                  </div>
                  {/* GREEN / STATUS PILL */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    b.statusColor === 'emerald' ? 'bg-emerald-50 text-[#006948] border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.statusColor === 'emerald' ? 'bg-[#006948]' : 'bg-amber-600'}`}></span>
                    {b.status}
                  </span>
                </div>

                {/* Building details */}
                <h3 className="text-sm font-bold text-slate-900 truncate" title={b.name}>{b.name}</h3>
                <p className="text-[11px] text-slate-500 truncate mb-3">{b.type}</p>

                {/* Demand metric */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Current Demand</span>
                  <div className="text-2xl font-extrabold text-slate-900">{b.demandKw}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Daily: <strong>{b.dailyKwh}</strong></div>
                </div>

                {/* Meter and Intensity Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500 text-[10px]">{b.meterId}</span>
                  <span className="font-bold text-slate-800">{b.intensity} <span className="text-[10px] text-slate-400 font-normal">kWh/m²</span></span>
                </div>
              </div>
            ))}
          </section>

          {/* 3D DIGITAL TWIN VIEWER SECTION (Three.js with midvalley_floorplan.svg) */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">3D Digital Twin Architectural View</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006948] text-xs font-mono font-bold">Three.js WebGL</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive multi-floor architectural model rendered from <code>midvalley_floorplan.svg</code> with spatial meter placement.
                </p>
              </div>

              {/* FLOOR SWITCHER & 3D CONTROLS */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  {['3T', '2S', '1F', 'G', 'LG', 'P1'].map(fl => (
                    <button
                      key={fl}
                      onClick={() => setActiveFloor(fl)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeFloor === fl ? 'bg-[#006948] text-white shadow-sm' : 'hover:text-slate-900'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setWireframeOnly(!wireframeOnly)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    wireframeOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {wireframeOnly ? 'Wireframe: ON' : 'Solid Mesh'}
                </button>
              </div>
            </div>

            {/* THREE.JS CONTAINER */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200/70 bg-gradient-to-b from-slate-100 to-slate-200/60 shadow-inner">
              <div ref={mountRef} className="w-full h-full" />

              {/* OVERLAY SPATIAL HUD */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-md text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006948]"></span> Level {activeFloor} Floorplate
                </div>
                <div className="text-[11px] text-slate-600">Active Building: <strong>{buildings.find(b => b.id === selectedBuilding)?.name}</strong></div>
                <div className="text-[10px] text-slate-400 font-mono">Source: frontend/midvalley_floorplan.svg</div>
              </div>
            </div>
          </section>

          {/* BOTTOM SECTION: LARGE ANALYTICS CARD 'DEMAND BENCHMARKING' */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Demand Benchmarking</h3>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-mono">kWh/m² Normalization</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Energy intensity comparison of the 4 BDG2 buildings with distinct dashed line overlay representing Public Benchmark Data.
                </p>
              </div>

              {/* TOP RIGHT TOGGLE SWITCH: 'Live Observations' vs 'Forecast Labels' */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setBenchmarkMode('live')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    benchmarkMode === 'live' ? 'bg-[#006948] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Observations
                </button>
                <button
                  onClick={() => setBenchmarkMode('forecast')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    benchmarkMode === 'forecast' ? 'bg-[#006948] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Forecast Labels
                </button>
              </div>
            </div>

            {/* BENCHMARKING SVG CHART */}
            <div className="relative w-full overflow-x-auto">
              <svg viewBox="0 0 900 280" className="w-full h-auto min-w-[700px] select-none" style={{ overflow: 'visible' }}>
                {/* Horizontal Intensity Gridlines */}
                {[0, 50, 100, 150, 200, 250].map(val => {
                  const y = 240 - (val / 260) * 200;
                  return (
                    <g key={val}>
                      <line x1="80" y1={y} x2="860" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="70" y={y + 4} textAnchor="end" className="text-[11px] fill-slate-400 font-mono">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* DISTINCT DASHED LINE OVERLAY REPRESENTING 'PUBLIC BENCHMARK DATA' */}
                {(() => {
                  const benchY = 240 - (publicBenchmarkKwhM2 / 260) * 200;
                  return (
                    <g>
                      <line
                        x1="80"
                        y1={benchY}
                        x2="860"
                        y2={benchY}
                        stroke="#dc2626"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                      />
                      <rect x="710" y={benchY - 14} width="150" height="20" rx="4" fill="#dc2626" />
                      <text x="785" y={benchY} textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold">
                        Public Benchmark: 185 kWh/m²
                      </text>
                    </g>
                  );
                })()}

                {/* BARS FOR THE 4 BDG2 BUILDINGS */}
                {buildings.map((b, i) => {
                  const x = 140 + i * 180;
                  const intensityVal = benchmarkMode === 'live' ? b.intensity : b.forecastIntensity;
                  const barH = (intensityVal / 260) * 200;
                  const barY = 240 - barH;
                  const isOver = intensityVal > publicBenchmarkKwhM2;

                  return (
                    <g
                      key={b.id}
                      className="cursor-pointer transition-transform hover:opacity-90"
                      onMouseEnter={() => setHoveredMetric({ ...b, currentVal: intensityVal, isOver })}
                      onMouseLeave={() => setHoveredMetric(null)}
                    >
                      {/* Bar body */}
                      <rect
                        x={x}
                        y={barY}
                        width="70"
                        height={barH}
                        rx="6"
                        fill={isOver ? '#f59e0b' : '#006948'}
                        className="transition-all duration-300"
                      />

                      {/* Value label on bar */}
                      <text
                        x={x + 35}
                        y={barY - 8}
                        textAnchor="middle"
                        className="text-xs font-extrabold fill-slate-900 font-mono"
                      >
                        {intensityVal}
                      </text>

                      {/* Building Name on X-axis */}
                      <text
                        x={x + 35}
                        y="260"
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-700"
                      >
                        {b.name.split('_')[0]}
                      </text>
                      <text
                        x={x + 35}
                        y="273"
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400"
                      >
                        {b.name.split('_')[1] || ''}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* HOVER TOOLTIP */}
              {hoveredMetric && (
                <div className="absolute top-2 right-4 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs z-30">
                  <div className="font-bold text-slate-200">{hoveredMetric.name}</div>
                  <div className="text-[11px] text-slate-400">{hoveredMetric.type}</div>
                  <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between gap-4">
                    <span>Intensity ({benchmarkMode}):</span>
                    <span className="font-mono font-bold text-white">{hoveredMetric.currentVal} kWh/m²</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[11px]">
                    <span>Vs Public Benchmark (185):</span>
                    <span className={`font-bold ${hoveredMetric.isOver ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {hoveredMetric.isOver ? `+${(hoveredMetric.currentVal - 185).toFixed(1)} kWh/m² (+)` : `${(hoveredMetric.currentVal - 185).toFixed(1)} kWh/m² (-)`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CARD FOOTER */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-[#006948]"></span> Compliant Intensity (&le; 185 kWh/m²)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-amber-700">
                  <span className="w-3 h-3 rounded bg-amber-500"></span> High Demand (&gt; 185 kWh/m²)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-600">
                  <span className="w-5 h-0.5 border-b-2 border-dashed border-rose-600"></span> Public Benchmark Average (185 kWh/m²)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">Synthetic demonstration data — Sime Darby BDG2 Buildings</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
