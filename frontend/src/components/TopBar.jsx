import React from 'react';
import { BUILDINGS_DATA, TOWNSHIP_SUMMARY, TNB_TARIFF } from '../data/townshipData';

export default function TopBar({
  selectedBuildingId,
  selectedFloorId,
  onResetView,
  onViewAllFloors
}) {
  const activeBuilding = selectedBuildingId ? BUILDINGS_DATA[selectedBuildingId] : null;
  const activeFloor = activeBuilding && selectedFloorId
    ? activeBuilding.floors.find((f) => f.id === selectedFloorId)
    : null;

  return (
    <header className="absolute top-0 inset-x-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between pointer-events-none">
      {/* Left: Brand & Breadcrumb Navigation */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 glass-panel px-3.5 py-2 rounded-xl shadow-sm border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm tracking-tight text-slate-900">
                Energi<span className="text-emerald-700">OS</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                3D Twin
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              Municipal Microgrid Core
            </span>
          </div>
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 border border-slate-200 shadow-sm">
          <button
            onClick={onResetView}
            className={`hover:text-emerald-700 transition-colors flex items-center gap-1 ${
              !activeBuilding ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">location_city</span>
            <span>Bandar Eco Sanctuary</span>
          </button>

          {activeBuilding && (
            <>
              <span className="text-slate-400">&gt;</span>
              <button
                onClick={onViewAllFloors}
                className={`hover:text-emerald-700 transition-colors ${
                  !activeFloor ? 'text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                {activeBuilding.name.split(' (')[0]}
              </button>
            </>
          )}

          {activeFloor && (
            <>
              <span className="text-slate-400">&gt;</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px] border border-emerald-300">
                {activeFloor.name.split(':')[0]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Stage Navigation Buttons */}
      <div className="pointer-events-auto flex items-center gap-2">
        {activeFloor && (
          <button
            onClick={onViewAllFloors}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-sm border border-slate-300 transition-all cursor-pointer"
            title="View All Floors of this Building"
          >
            <span className="material-symbols-outlined text-[16px]">unfold_more</span>
            <span>View All Floors</span>
          </button>
        )}

        {activeBuilding && (
          <button
            onClick={onResetView}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_out_map</span>
            <span>Back to Township</span>
          </button>
        )}
      </div>

      {/* Right: Weather & Tariff HUD */}
      <div className="hidden lg:flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-3 text-xs font-mono border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="material-symbols-outlined text-[16px] text-amber-500">wb_sunny</span>
            <span>{TOWNSHIP_SUMMARY.temperatureC}°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold">{TOWNSHIP_SUMMARY.solarIrradianceWm2} W/m²</span>
          </div>

          <div className="pl-2 border-l border-slate-200 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
              TNB PEAK
            </span>
            <span className="text-slate-800 font-bold">RM {TNB_TARIFF.peakRateMyr} / kWh</span>
          </div>
        </div>
      </div>
    </header>
  );
}
