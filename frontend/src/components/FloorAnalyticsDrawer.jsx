import React, { useState } from 'react';
import { BUILDINGS_DATA, TNB_TARIFF } from '../data/townshipData';

export default function FloorAnalyticsDrawer({
  selectedBuildingId,
  selectedFloorId,
  onSelectFloor,
  onViewAllFloors,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('energy'); // 'energy' | 'cost' | 'carbon' | 'anomalies'
  const [acknowledgedAnomalies, setAcknowledgedAnomalies] = useState({});

  if (!selectedBuildingId || !BUILDINGS_DATA[selectedBuildingId]) return null;

  const building = BUILDINGS_DATA[selectedBuildingId];
  const activeFloor = selectedFloorId ? building.floors.find((f) => f.id === selectedFloorId) : null;

  // HVAC & Indoor Climate Telemetry
  const hvac = activeFloor?.hvac || {
    ahuTag: "AHU-FLOOR",
    status: "RUNNING - NORMAL",
    supplyTempC: 14.2,
    returnTempC: 23.8,
    spaceTempC: 22.4,
    setpointC: 22.0,
    airflowCfm: 4200,
    chwSupplyC: 6.8,
    chwReturnC: 12.4,
    chwDeltaTC: 5.6,
    chwValvePercent: 68,
    fanSpeedPercent: 76,
    rhPercent: 52,
    co2Ppm: 540,
    filterHealthPercent: 94,
    diffuserCount: 4
  };

  const [activeSetpoint, setActiveSetpoint] = useState(hvac.setpointC);

  // Energy & Cost Calculations for Active Floor (if selected)
  const dailyKwh = activeFloor ? activeFloor.dailyKwh : building.dailyKwh;
  const demandKw = activeFloor ? activeFloor.demandKw : building.demandKw;

  const peakKwh = dailyKwh * 0.65;
  const offPeakKwh = dailyKwh * 0.35;
  const peakCostMyr = peakKwh * TNB_TARIFF.peakRateMyr;
  const offPeakCostMyr = offPeakKwh * TNB_TARIFF.offPeakRateMyr;
  const totalFloorCostMyr = peakCostMyr + offPeakCostMyr;
  const costAvoidedMyr = activeFloor ? (activeFloor.solarGenKwh || 0) * TNB_TARIFF.peakRateMyr : 0;

  // Carbon Calculations (0.658 kg CO2e / kWh)
  const floorCo2Kg = dailyKwh * TNB_TARIFF.gridFactorKgCo2PerKwh;
  const carbonAvoidedKg = activeFloor ? (activeFloor.solarGenKwh || 0) * TNB_TARIFF.gridFactorKgCo2PerKwh : 0;

  const handleAcknowledge = (anomId) => {
    setAcknowledgedAnomalies((prev) => ({ ...prev, [anomId]: true }));
  };

  return (
    <div className="absolute top-16 right-4 bottom-4 w-[92vw] sm:w-[460px] z-30 flex flex-col glass-panel rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans transition-all animate-in slide-in-from-right duration-300">
      {/* Top Drawer Header */}
      <div className="p-4 bg-white/95 border-b border-slate-200 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: building.accentColor }}
            ></span>
            <span className="text-[11px] font-mono uppercase font-bold text-slate-500">
              {building.code} • {building.type}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 mt-0.5 tracking-tight">
            {building.name}
          </h2>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Total Area: <strong className="text-slate-800">{building.totalAreaSqM.toLocaleString()} m²</strong> • EUI:{' '}
            <strong className="text-emerald-700">{building.eui} kWh/m²/yr</strong>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close Inspector"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Floor Selection Ribbon */}
      <div className="p-3 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5 font-bold uppercase">
          <span>{activeFloor ? 'Focused Floor Plate:' : 'Select Floor to Inspect:'}</span>
          {activeFloor && (
            <button
              onClick={onViewAllFloors}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
            >
              <span>← View All Floors</span>
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {building.floors.map((f) => {
            const isFloorActive = activeFloor && f.id === activeFloor.id;
            const hasAnomaly = !!f.anomaly;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFloor(f.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 border cursor-pointer ${
                  isFloorActive
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{f.id.toUpperCase()}</span>
                <span className="text-[9px] font-mono opacity-80">{f.demandKw}kW</span>
                {hasAnomaly && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-white"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CASE A: NO FLOOR SELECTED YET -> SHOW BUILDING OVERVIEW & FLOOR DIRECTORY */}
      {!activeFloor && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
            <span className="text-xs font-bold text-emerald-900 block">
              Exploded 3D Architectural View Active
            </span>
            <p className="text-[11px] text-emerald-700 mt-1">
              Click on any floor slab in the 3D scene or select from the list below to zoom in and clearly inspect its complete room layout, submeters, and telemetry.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase font-mono block">
              Building Levels Directory ({building.floors.length} Floors)
            </span>

            {building.floors.map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectFloor(f.id)}
                className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      {f.id.toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {f.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {f.areaSqM.toLocaleString()} m² • {f.demandKw} kW demand
                      </span>
                    </div>
                  </div>

                  {f.anomaly ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                      ALERT
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE B: FLOOR SELECTED -> SHOW DEEP DIVE FLOOR INSPECTION */}
      {activeFloor && (
        <>
          {/* Active Floor Strip */}
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{activeFloor.name}</div>
              <div className="text-[10px] text-slate-500">{activeFloor.description}</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-extrabold text-emerald-800">{activeFloor.demandKw} kW</span>
              <span className="text-[10px] text-slate-500 block">{activeFloor.areaSqM.toLocaleString()} m²</span>
            </div>
          </div>

          {/* Analytical Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white text-xs font-bold">
            {[
              { id: 'energy', label: 'Energy (kWh)', icon: 'bolt' },
              { id: 'cost', label: 'Cost (RM)', icon: 'payments' },
              { id: 'carbon', label: 'Carbon (CO₂)', icon: 'co2' },
              {
                id: 'anomalies',
                label: activeFloor.anomaly ? 'Alerts (1)' : 'Alerts (0)',
                icon: 'warning',
                alert: !!activeFloor.anomaly
              }
            ].map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                    isCurrent
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  } ${tab.alert && !isCurrent ? 'text-rose-600 font-extrabold' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-body-sm text-xs bg-slate-50/50">
            {/* TAB 1: ENERGY CONSUMPTION */}
            {activeTab === 'energy' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                      DAILY CONSUMPTION
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 font-numeral mt-0.5 block">
                      {dailyKwh.toLocaleString()} <span className="text-xs font-sans text-slate-500">kWh</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">Normal seasonal pattern</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                      INSTANT DEMAND
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800 font-numeral mt-0.5 block">
                      {demandKw} <span className="text-xs font-sans text-slate-500">kW</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Power Factor: 0.98 lag</span>
                  </div>
                </div>

                {/* Submeter Load Breakdown */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Sub-meter Circuit Telemetry</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">Floor Subsystem Split</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${(activeFloor.hvacLoadKw / demandKw) * 100}%` }}
                      className="bg-emerald-600 h-full"
                      title="HVAC Chiller / Air Handling"
                    />
                    <div
                      style={{ width: `${(activeFloor.lightingLoadKw / demandKw) * 100}%` }}
                      className="bg-sky-500 h-full"
                      title="Lighting Circuits"
                    />
                    <div
                      style={{ width: `${(activeFloor.plugLoadKw / demandKw) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title="Tenant Plug Loads"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> HVAC LOOP
                      </span>
                      <span className="font-bold text-slate-900">{activeFloor.hvacLoadKw} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> LIGHTING
                      </span>
                      <span className="font-bold text-slate-900">{activeFloor.lightingLoadKw} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> PLUG LOADS
                      </span>
                      <span className="font-bold text-slate-900">{activeFloor.plugLoadKw} kW</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Smart Air Conditioning & HVAC Card */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[17px] animate-spin" style={{ animationDuration: '4s' }}>
                          mode_fan
                        </span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{hvac.ahuTag}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            AIR COND ACTIVE
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {hvac.diffuserCount}x 4-Way Diffusers • {hvac.airflowCfm.toLocaleString()} CFM
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      activeFloor.anomaly
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {hvac.status}
                    </span>
                  </div>

                  {/* Primary Temperature Readings */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">SPACE TEMP</span>
                      <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                        {hvac.spaceTempC}°C
                      </span>
                      <span className="text-[9px] text-slate-500">Setpoint: {activeSetpoint}°C</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-sky-600 block uppercase font-bold">SUPPLY AIR</span>
                      <span className="text-base font-extrabold text-sky-700 block mt-0.5">
                        {hvac.supplyTempC}°C
                      </span>
                      <span className="text-[9px] text-slate-500">Chilled Coil</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-purple-600 block uppercase font-bold">RETURN AIR</span>
                      <span className="text-base font-extrabold text-purple-700 block mt-0.5">
                        {hvac.returnTempC}°C
                      </span>
                      <span className="text-[9px] text-slate-500">Plenum Loop</span>
                    </div>
                  </div>

                  {/* Chilled Water Hydronic Loop & Flow Specs */}
                  <div className="space-y-1.5 pt-0.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span> Chilled Water Loop (CHW)
                      </span>
                      <span className="font-bold text-slate-800">
                        {hvac.chwSupplyC}°C In / {hvac.chwReturnC}°C Out (ΔT {hvac.chwDeltaTC}°C)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Modulating Valve / Fan VFD
                      </span>
                      <span className="font-bold text-slate-800">
                        Valve {hvac.chwValvePercent}% • Fan {hvac.fanSpeedPercent}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Indoor Air Quality (IAQ)
                      </span>
                      <span className="font-bold text-emerald-800">
                        CO₂ {hvac.co2Ppm} ppm • {hvac.rhPercent}% RH
                      </span>
                    </div>
                  </div>

                  {/* Interactive Thermostat Setpoint Selector */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold mb-1.5">
                      <span>DIGITAL THERMOSTAT SETPOINT:</span>
                      <span className="text-sky-700 font-bold">{activeSetpoint.toFixed(1)}°C Selected</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[21.0, 22.0, 23.0, 24.0].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => setActiveSetpoint(deg)}
                          className={`py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                            activeSetpoint === deg
                              ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {deg.toFixed(1)}°C {deg === 22.0 ? '🌿' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anomaly Diagnosis if present */}
                  {activeFloor.anomaly && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                      <strong className="block font-bold">⚠️ HVAC Diagnostic Alert:</strong>
                      <span>{activeFloor.anomaly.detail}</span>
                    </div>
                  )}
                </div>

                {activeFloor.solarGenKwh > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">Rooftop Solar PV Array</span>
                      <span className="text-[10px] text-emerald-700">Clean on-site generation offset</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-base font-extrabold text-emerald-800">
                        +{activeFloor.solarGenKwh.toLocaleString()} kWh
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Surplus export enabled</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ELECTRICITY COST */}
            {activeTab === 'cost' && (
              <div className="space-y-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                    ESTIMATED DAILY ELECTRICITY COST
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-numeral">
                      RM {totalFloorCostMyr.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">/ day</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Calculated according to TNB Commercial Tariff C1 structure.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">TNB Time-of-Use Rate Breakdown</span>

                  <div className="space-y-2 pt-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                      <div>
                        <span className="font-bold text-rose-900 block">Peak Window (13:30–17:00)</span>
                        <span className="text-[10px] text-rose-700">Rate: RM {TNB_TARIFF.peakRateMyr} / kWh</span>
                      </div>
                      <span className="font-extrabold text-rose-800">RM {peakCostMyr.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                      <div>
                        <span className="font-bold text-blue-900 block">Off-Peak Window (22:00–08:00)</span>
                        <span className="text-[10px] text-blue-700">Rate: RM {TNB_TARIFF.offPeakRateMyr} / kWh</span>
                      </div>
                      <span className="font-extrabold text-blue-800">RM {offPeakCostMyr.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {costAvoidedMyr > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">BESS & Solar Cost Avoided</span>
                      <span className="text-[10px] text-emerald-700">Peak tariff penalty avoided today</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-800 font-mono">
                      -RM {costAvoidedMyr.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CARBON EMISSIONS */}
            {activeTab === 'carbon' && (
              <div className="space-y-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                    DAILY SCOPE 2 EMISSIONS
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-numeral">
                      {floorCo2Kg.toFixed(1)} <span className="text-sm font-sans text-slate-500">kg CO₂e</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Evaluated with Peninsular Malaysia Grid Factor (0.658 kg CO₂e / kWh).
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Green Building Index (GBI) Rating</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                      {building.gbiTier}
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-700">
                      <span>Building EUI:</span>
                      <strong className="text-emerald-800">{building.eui} kWh/m²/yr</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GBI Baseline Standard:</span>
                      <span>185.0 kWh/m²/yr</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-100">
                      <span>Efficiency Delta:</span>
                      <span>23.0% below standard</span>
                    </div>
                  </div>
                </div>

                {carbonAvoidedKg > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">Clean Energy Offset</span>
                      <span className="text-[10px] text-emerald-700">Rooftop Solar contribution</span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      -{carbonAvoidedKg.toFixed(1)} kg CO₂e
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ANOMALIES & ALERTS */}
            {activeTab === 'anomalies' && (
              <div className="space-y-3">
                {activeFloor.anomaly ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-rose-600 text-[18px]">warning</span>
                        <span className="font-bold text-rose-900 text-xs">{activeFloor.anomaly.type}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 text-[9px] font-mono font-bold">
                        {activeFloor.anomaly.severity}
                      </span>
                    </div>

                    <div className="text-xs text-rose-800 leading-relaxed">
                      {activeFloor.anomaly.detail}
                    </div>

                    <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">{activeFloor.anomaly.time}</span>
                      <span className="text-rose-700 font-bold">{activeFloor.anomaly.deltaKwh}</span>
                    </div>

                    <div className="pt-1">
                      {acknowledgedAnomalies[activeFloor.anomaly.id] ? (
                        <div className="py-1 px-2 rounded bg-emerald-100 text-emerald-800 text-center text-xs font-semibold flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Incident Acknowledged
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(activeFloor.anomaly.id)}
                          className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          Acknowledge & Dispatch Tech
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
                    <div className="text-sm font-bold text-slate-800">All Clear on This Floor</div>
                    <p className="text-xs text-slate-500">
                      No unusual consumption spikes or equipment hunting detected in the last 24 hours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
