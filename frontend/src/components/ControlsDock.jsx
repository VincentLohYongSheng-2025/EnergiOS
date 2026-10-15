import React from 'react';

export default function ControlsDock({
  showEnergyFlow,
  setShowEnergyFlow,
  isNightMode,
  setIsNightMode,
  wireframeMode,
  setWireframeMode,
  onResetCamera
}) {
  return (
    <div className="absolute right-4 top-20 z-20 flex flex-col gap-2 glass-panel p-2 rounded-2xl shadow-md border border-slate-200">
      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors shadow-2xs"
        title="Reset Camera to Township Overview"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">center_focus_strong</span>
      </button>

      {/* Toggle Energy Flow Conduits */}
      <button
        onClick={() => setShowEnergyFlow(!showEnergyFlow)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-2xs ${
          showEnergyFlow
            ? 'bg-emerald-700 text-white shadow-sm'
            : 'bg-slate-100 text-slate-400 hover:text-slate-600'
        }`}
        title="Toggle Energy Flow Conduits"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
      </button>

      {/* Toggle Day / Night Lighting */}
      <button
        onClick={() => setIsNightMode(!isNightMode)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-2xs ${
          isNightMode
            ? 'bg-slate-900 text-white shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:text-slate-900'
        }`}
        title={isNightMode ? "Switch to Daylight" : "Switch to Night Lighting"}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">
          {isNightMode ? 'dark_mode' : 'light_mode'}
        </span>
      </button>

      {/* Toggle Wireframe / X-Ray Mode */}
      <button
        onClick={() => setWireframeMode(!wireframeMode)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-2xs ${
          wireframeMode
            ? 'bg-amber-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-400 hover:text-slate-600'
        }`}
        title="Toggle Wireframe Mode"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
      </button>
    </div>
  );
}
