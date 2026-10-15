import React from 'react';
import { TOWNSHIP_SUMMARY, BUILDINGS_DATA } from '../data/townshipData';

export default function TownshipStatsBar({ selectedBuildingId, onSelectBuilding }) {
  return (
    <div className="absolute bottom-4 inset-x-4 md:inset-x-6 z-20 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
      {/* Left: Quick Building Selection Pills */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
        <span className="hidden xl:inline-block glass-panel px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-600 uppercase font-bold border border-slate-200 shadow-sm">
          Select Asset:
        </span>
        {Object.values(BUILDINGS_DATA).map((b) => {
          const isSelected = selectedBuildingId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBuilding(b.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'glass-panel text-slate-700 hover:text-slate-950 hover:bg-white border-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.accentColor }}></span>
              <span>{b.name.split(' (')[0]}</span>
              <span className="text-[10px] font-mono opacity-80">({b.demandKw} kW)</span>
            </button>
          );
        })}
      </div>

      {/* Right: Township Quick Telemetry Bar (Visible when no building is selected) */}
      {!selectedBuildingId && (
        <div className="pointer-events-auto glass-panel p-2.5 rounded-2xl flex items-center gap-4 text-xs font-mono shadow-md border border-slate-200">
          {/* Stat 1: Total Load */}
          <div className="px-2">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">TOTAL LOAD</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-slate-900 font-numeral">
                {TOWNSHIP_SUMMARY.totalLoadMw}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">MW</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200"></div>

          {/* Stat 2: Clean Solar */}
          <div className="px-2">
            <span className="text-[10px] text-emerald-700 block uppercase font-bold">CLEAN SOLAR</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-emerald-700 font-numeral">
                {TOWNSHIP_SUMMARY.solarGenMw}
              </span>
              <span className="text-[11px] text-emerald-600 font-sans">MW</span>
              <span className="text-[10px] text-emerald-800 font-bold ml-1">
                ({TOWNSHIP_SUMMARY.cleanEnergyRatioPercent}%)
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200"></div>

          {/* Stat 3: BESS Storage */}
          <div className="px-2">
            <span className="text-[10px] text-sky-700 block uppercase font-bold">BESS STORAGE</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-sky-800 font-numeral">
                {TOWNSHIP_SUMMARY.bessStoredMwh}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">/ 5.0 MWh</span>
              <span className="text-[10px] text-sky-700 font-bold ml-1">
                ({TOWNSHIP_SUMMARY.bessSocPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
