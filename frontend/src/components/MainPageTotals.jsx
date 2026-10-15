import React, { useState } from 'react';
import { TOWNSHIP_SUMMARY, TNB_TARIFF } from '../data/townshipData';

export default function MainPageTotals({ isVisible = true }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="absolute top-16 left-4 md:left-6 z-20 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto flex flex-col gap-2 max-w-[380px] sm:max-w-[420px]">
        {/* Header Strip with Collapse Toggle */}
        <div className="glass-panel px-3.5 py-2 rounded-xl flex items-center justify-between shadow-md border border-slate-200/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono">
              Township Daily Macro Telemetry
            </span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{collapsed ? 'Show Stats' : 'Minimize'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {collapsed ? 'expand_more' : 'expand_less'}
            </span>
          </button>
        </div>

        {/* 3 Core Metric Cards */}
        {!collapsed && (
          <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Metric 1: Total Energy Consumption Used */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 shadow-md flex items-start gap-3 hover:border-emerald-500 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Total Energy Consumed
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    TODAY
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-numeral">
                    {TOWNSHIP_SUMMARY.totalEnergyUsedKwh.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">kWh</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({TOWNSHIP_SUMMARY.totalEnergyUsedMwh} MWh)
                  </span>
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Solar Self-Sufficiency:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {TOWNSHIP_SUMMARY.cleanEnergyRatioPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Total Electricity Cost */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 shadow-md flex items-start gap-3 hover:border-amber-500 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Total Electricity Cost
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                    TNB C1 TARIFF
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-numeral">
                    RM {TOWNSHIP_SUMMARY.totalCostMyr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Solar & BESS Avoided:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    -RM {TOWNSHIP_SUMMARY.costAvoidedMyr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Total Carbon Emissions */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 shadow-md flex items-start gap-3 hover:border-sky-500 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">co2</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Total Carbon Emissions
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                    SCOPE 2
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-numeral">
                    {TOWNSHIP_SUMMARY.totalCarbonTonnes}
                  </span>
                  <span className="text-xs font-bold text-slate-500">tCO₂e</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({Math.round(TOWNSHIP_SUMMARY.totalCarbonKg).toLocaleString()} kg)
                  </span>
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Net Clean Offset Today:</span>
                  <span className="font-bold text-sky-700 font-mono">
                    -{TOWNSHIP_SUMMARY.carbonAvoidedTonnes} tCO₂e
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
