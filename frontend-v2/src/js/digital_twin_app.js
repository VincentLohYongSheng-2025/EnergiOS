/**
 * EnergiOS - Spatial Digital Twin Application Controller (digital-twin.html)
 * Unifies Three.js 3D Township Microgrid, 2D Floorplan CAD,
 * Velora Design System, and Apple Dynamic Island Copilot.
 */

class EnergiOSTwinApp {
  constructor() {
    this.buildingsData = window.BUILDINGS_DATA || {};
    this.townshipSummary = window.TOWNSHIP_SUMMARY || {};
    this.tnbTariff = window.TNB_TARIFF || {};

    this.state = {
      viewMode: '3d', // '3d' | '2d'
      selectedBuildingId: null,
      selectedFloorId: null,
      activeDrawerTab: 'hvac', // 'hvac' | 'energy' | 'cost' | 'anomalies'
      isNightMode: false,
      showEnergyFlow: true,
      wireframeMode: false,
      macroCollapsed: false,
      acknowledgedAnomalies: {},
      customSetpoints: {},
    };

    this.scene3d = null;
    this.floorplan2d = null;
  }

  async init() {
    console.log('[EnergiOS Twin] Initializing Spatial 3D Digital Twin with Velora design...');

    // 1. Initialize 3D Scene
    const canvasContainer = document.getElementById('township-3d-container');
    if (canvasContainer && window.Township3DScene && window.THREE) {
      this.scene3d = new window.Township3DScene({
        container: canvasContainer,
        onSelectBuilding: (bId) => this.handle3DSelectBuilding(bId),
        onSelectFloor: (fId) => this.handle3DSelectFloor(fId),
      });
    }

    // 1b. Initialize Procedural 2D Architectural CAD Floorplan
    const floorplanContainer = document.getElementById('floorplan-2d-container');
    if (floorplanContainer && window.Floorplan2DView) {
      this.floorplan2d = new window.Floorplan2DView({
        container: floorplanContainer,
        onInspectZone: (zoneName) => {
          this.renderDrawer();
        }
      });
      window.floorplanView = this.floorplan2d;
    }

    // 2. Render Building Switcher & Initial Views
    this.renderBuildingPicker();
    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();

    // 3. Sync Dynamic Island Log
    if (window.dynamicIsland && window.dynamicIsland.addLog) {
      window.dynamicIsland.addLog('Township 3D Microgrid twin initialized (4 assets, 18 telemetry nodes)', 'normal');
    }

    // 4. Sync Initial Theme with Scene & Floorplan
    if (window.themeManager && window.themeManager.isDark()) {
      if (this.scene3d) this.scene3d.toggleNightMode(true);
      if (this.floorplan2d) this.floorplan2d.setTheme('blueprint');
    }

    // 5. Listen for Theme Changed Event
    window.addEventListener('energios:theme-changed', (e) => {
      const isDark = e.detail ? e.detail.isDark : (window.themeManager ? window.themeManager.isDark() : false);
      if (this.scene3d) {
        this.scene3d.toggleNightMode(isDark);
        this.state.isNightMode = isDark;
      }
      if (this.floorplan2d) {
        this.floorplan2d.setTheme(isDark ? 'blueprint' : 'architectural');
      }
    });
  }

  // ==========================================
  // Building & Floor Navigation
  // ==========================================

  renderBuildingPicker() {
    const container = document.getElementById('building-picker-container');
    if (!container) return;

    const buildings = Object.values(this.buildingsData);
    let html = `
      <button onclick="twinApp.resetView()" class="velora-pill ${!this.state.selectedBuildingId ? 'active' : ''}">
        Township Overview
      </button>
    `;

    buildings.forEach((b) => {
      const isSelected = this.state.selectedBuildingId === b.id;
      html += `
        <button onclick="twinApp.selectBuilding('${b.id}')" class="velora-pill flex items-center gap-1.5 ${isSelected ? 'active' : ''}">
          <span class="w-2 h-2 rounded-full" style="background-color: ${b.accentColor}"></span>
          <span>${b.shortName || b.name.split(' (')[0]}</span>
          <span class="text-[10px] font-mono opacity-70">(${b.demandKw} kW)</span>
        </button>
      `;
    });

    container.innerHTML = html;
  }

  renderFloorPicker() {
    const container = document.getElementById('floor-picker-container');
    if (!container) return;

    if (!this.state.selectedBuildingId) {
      container.innerHTML = `
        <div class="velora-pill-container bg-white border border-[#EBE7DF] shadow-xs">
          <button class="velora-pill active">All Buildings</button>
        </div>
      `;
      return;
    }

    const building = this.buildingsData[this.state.selectedBuildingId];
    if (!building) return;

    let html = `
      <div class="velora-pill-container bg-white border border-[#EBE7DF] shadow-xs">
        <button onclick="twinApp.selectFloor(null)" class="velora-pill ${!this.state.selectedFloorId ? 'active' : ''}">
          All Floors
        </button>
    `;

    building.floors.forEach((f) => {
      const isSelected = this.state.selectedFloorId === f.id;
      const hasAnomaly = !!f.anomaly;
      html += `
        <button onclick="twinApp.selectFloor('${f.id}')" class="velora-pill flex items-center gap-1 ${isSelected ? 'active' : ''}">
          <span>${f.id.toUpperCase()}</span>
          ${hasAnomaly ? '<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>' : ''}
        </button>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  selectBuilding(buildingId) {
    this.state.selectedBuildingId = buildingId;
    this.state.selectedFloorId = null;

    if (this.scene3d) {
      this.scene3d.selectBuilding(buildingId);
    }

    if (this.floorplan2d) {
      this.floorplan2d.setBuildingAndFloor(buildingId, this.state.selectedFloorId);
    }

    this.renderBuildingPicker();
    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();

    if (buildingId && this.buildingsData[buildingId]) {
      const b = this.buildingsData[buildingId];
      this.showToast(`Selected ${b.name}`);
      if (window.dynamicIsland && window.dynamicIsland.addLog) {
        window.dynamicIsland.addLog(`Focused on ${b.shortName}: ${b.type} · ${b.totalAreaSqM} m² · EUI ${b.eui}`, 'normal');
      }
    }
  }

  selectFloor(floorId) {
    this.state.selectedFloorId = floorId;

    if (this.scene3d) {
      this.scene3d.selectFloor(floorId);
    }

    if (this.floorplan2d) {
      this.floorplan2d.setBuildingAndFloor(this.state.selectedBuildingId, floorId);
    }

    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();

    if (floorId && this.state.selectedBuildingId) {
      const b = this.buildingsData[this.state.selectedBuildingId];
      const f = b.floors.find((fl) => fl.id === floorId);
      if (f) {
        this.showToast(`Inspecting ${f.name}`);
        if (window.dynamicIsland && window.dynamicIsland.addLog) {
          window.dynamicIsland.addLog(`Inspecting ${b.shortName} ${f.id.toUpperCase()}: ${f.hvac.ahuTag} (${f.hvac.spaceTempC}°C)`, f.anomaly ? 'high' : 'normal');
        }
      }
    }
  }

  resetView() {
    this.state.selectedBuildingId = null;
    this.state.selectedFloorId = null;

    if (this.scene3d) {
      this.scene3d.resetView();
    }

    if (this.floorplan2d) {
      this.floorplan2d.setBuildingAndFloor(null, null);
    }

    this.renderBuildingPicker();
    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();
    this.showToast('Reset view to Township Overview');

    if (window.dynamicIsland && window.dynamicIsland.addLog) {
      window.dynamicIsland.addLog('Camera reset to Township Macro Grid (4 Buildings)', 'normal');
    }
  }

  handle3DSelectBuilding(buildingId) {
    this.state.selectedBuildingId = buildingId;
    if (this.floorplan2d) {
      this.floorplan2d.setBuildingAndFloor(buildingId, this.state.selectedFloorId);
    }
    this.renderBuildingPicker();
    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();
  }

  handle3DSelectFloor(floorId) {
    this.state.selectedFloorId = floorId;
    if (this.floorplan2d) {
      this.floorplan2d.setBuildingAndFloor(this.state.selectedBuildingId, floorId);
    }
    this.renderFloorPicker();
    this.renderDrawer();
    this.updateBreadcrumbs();
  }

  updateBreadcrumbs() {
    const el = document.getElementById('breadcrumb-asset-name');
    if (!el) return;

    if (this.state.selectedBuildingId && this.buildingsData[this.state.selectedBuildingId]) {
      const b = this.buildingsData[this.state.selectedBuildingId];
      if (this.state.selectedFloorId) {
        const f = b.floors.find((fl) => fl.id === this.state.selectedFloorId);
        el.textContent = `${b.shortName} › ${f ? f.id.toUpperCase() : ''}`;
      } else {
        el.textContent = b.name;
      }
    } else {
      el.textContent = 'Township Central Core';
    }
  }

  // ==========================================
  // 3D Controls
  // ==========================================

  toggleEnergyFlow() {
    if (this.scene3d) {
      const val = this.scene3d.toggleEnergyFlow();
      this.state.showEnergyFlow = val;
      const btn = document.getElementById('btn-energy-flow');
      if (btn) {
        btn.classList.toggle('text-[#FF7A00]', val);
        btn.classList.toggle('bg-[#FFF3EB]', val);
      }
      this.showToast(`Energy Flow Conduits: ${val ? 'Visible' : 'Hidden'}`);
    }
  }

  toggleNightMode() {
    if (this.scene3d) {
      const val = this.scene3d.toggleNightMode();
      this.state.isNightMode = val;
      const btn = document.getElementById('btn-night-mode');
      const icon = document.getElementById('icon-night-mode');
      if (btn) {
        btn.classList.toggle('bg-[#1E2022]', val);
        btn.classList.toggle('text-white', val);
      }
      if (icon) {
        icon.textContent = val ? 'light_mode' : 'dark_mode';
      }
      this.showToast(val ? 'Night Lighting Activated' : 'Daylight Scene Activated');
    }
  }

  toggleWireframe() {
    if (this.scene3d) {
      const val = this.scene3d.toggleWireframe();
      this.state.wireframeMode = val;
      const btn = document.getElementById('btn-wireframe');
      if (btn) {
        btn.classList.toggle('bg-amber-50', val);
        btn.classList.toggle('text-amber-700', val);
      }
      this.showToast(`Wireframe Mode: ${val ? 'On' : 'Off'}`);
    }
  }

  toggleMacroMetrics() {
    this.state.macroCollapsed = !this.state.macroCollapsed;
    const cards = document.getElementById('macro-metrics-cards');
    const toggleText = document.getElementById('macro-toggle-text');
    const toggleIcon = document.getElementById('macro-toggle-icon');

    if (cards) cards.classList.toggle('hidden', this.state.macroCollapsed);
    if (toggleText) toggleText.textContent = this.state.macroCollapsed ? 'Expand' : 'Collapse';
    if (toggleIcon) toggleIcon.textContent = this.state.macroCollapsed ? 'expand_more' : 'expand_less';
  }

  setViewMode(mode) {
    this.state.viewMode = mode;
    const btn3d = document.getElementById('btn-view-3d');
    const btn2d = document.getElementById('btn-view-2d');
    const container3d = document.getElementById('township-3d-container');
    const container2d = document.getElementById('floorplan-2d-container');

    if (mode === '3d') {
      if (btn3d) btn3d.classList.add('active');
      if (btn2d) btn2d.classList.remove('active');
      if (container3d) container3d.classList.remove('hidden');
      if (container2d) container2d.classList.add('hidden');
      if (this.scene3d) this.scene3d._handleResize();
      if (window.dynamicIsland && window.dynamicIsland.addLog) {
        window.dynamicIsland.addLog('Switched viewport to 3D Microgrid Spatial Twin', 'normal');
      }
    } else {
      if (btn3d) btn3d.classList.remove('active');
      if (btn2d) btn2d.classList.add('active');
      if (container3d) container3d.classList.add('hidden');
      if (container2d) container2d.classList.remove('hidden');
      if (this.floorplan2d) {
        this.floorplan2d.setBuildingAndFloor(this.state.selectedBuildingId || 'commercial-mall', this.state.selectedFloorId || 'l3');
      }
      if (window.dynamicIsland && window.dynamicIsland.addLog) {
        window.dynamicIsland.addLog('Switched viewport to 2D CAD Blueprint Mode (HVAC & Hydronic Overlay)', 'normal');
      }
    }
  }

  // ==========================================
  // Velora Floor & HVAC Analytics Drawer
  // ==========================================

  setDrawerTab(tab) {
    this.state.activeDrawerTab = tab;
    this.renderDrawer();
  }

  setSetpoint(temp) {
    if (!this.state.selectedBuildingId || !this.state.selectedFloorId) return;
    const key = `${this.state.selectedBuildingId}_${this.state.selectedFloorId}`;
    this.state.customSetpoints[key] = temp;
    this.renderDrawer();
    this.showToast(`Thermostat setpoint adjusted to ${temp}°C`);
  }

  acknowledgeAnomaly(anomId) {
    this.state.acknowledgedAnomalies[anomId] = true;
    this.renderDrawer();
    this.showToast(`Anomaly ${anomId} Acknowledged`);
    if (window.dynamicIsland && window.dynamicIsland.addLog) {
      window.dynamicIsland.addLog(`Anomaly ${anomId} acknowledged by operator · Work Order dispatched`, 'normal');
    }
  }

  renderDrawer() {
    const drawerEl = document.getElementById('velora-analytics-drawer');
    if (!drawerEl) return;

    if (!this.state.selectedBuildingId) {
      drawerEl.classList.add('translate-x-[110%]', 'opacity-0', 'pointer-events-none');
      drawerEl.classList.remove('translate-x-0', 'opacity-100', 'pointer-events-auto');
      return;
    }

    // Show drawer with smooth slide-in
    drawerEl.classList.remove('translate-x-[110%]', 'opacity-0', 'pointer-events-none');
    drawerEl.classList.add('translate-x-0', 'opacity-100', 'pointer-events-auto');

    const building = this.buildingsData[this.state.selectedBuildingId];
    if (!building) return;

    const activeFloor = this.state.selectedFloorId
      ? building.floors.find((f) => f.id === this.state.selectedFloorId)
      : null;

    const hvac = activeFloor?.hvac || {
      ahuTag: `${building.code}-MAIN-CHILLER`,
      status: 'OPTIMAL RUNNING',
      supplyTempC: 14.0,
      returnTempC: 23.5,
      spaceTempC: 22.2,
      setpointC: 22.0,
      airflowCfm: 5200,
      chwSupplyC: 6.8,
      chwReturnC: 12.4,
      chwDeltaTC: 5.6,
      chwValvePercent: 72,
      fanSpeedPercent: 78,
      rhPercent: 52,
      co2Ppm: 510,
      filterHealthPercent: 95,
      diffuserCount: 6,
    };

    const spKey = `${building.id}_${activeFloor?.id || 'main'}`;
    const currentSetpoint = this.state.customSetpoints[spKey] || hvac.setpointC;

    const dailyKwh = activeFloor ? activeFloor.dailyKwh : building.dailyKwh;
    const demandKw = activeFloor ? activeFloor.demandKw : building.demandKw;
    const peakKwh = dailyKwh * 0.65;
    const offPeakKwh = dailyKwh * 0.35;
    const peakCostMyr = peakKwh * this.tnbTariff.peakRateMyr;
    const offPeakCostMyr = offPeakKwh * this.tnbTariff.offPeakRateMyr;
    const totalCostMyr = peakCostMyr + offPeakCostMyr;
    const costAvoidedMyr = (activeFloor?.solarGenKwh || 0) * this.tnbTariff.peakRateMyr;
    const co2Kg = dailyKwh * this.tnbTariff.gridFactorKgCo2PerKwh;
    const co2AvoidedKg = (activeFloor?.solarGenKwh || 0) * this.tnbTariff.gridFactorKgCo2PerKwh;

    // Build Drawer Inner HTML
    drawerEl.innerHTML = `
      <!-- Header -->
      <div class="p-4 bg-white border-b border-[#EBE7DF] flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${building.accentColor}"></span>
            <span class="text-[10px] font-mono uppercase font-bold text-[#71767B]">
              ${building.code} • ${building.gbiTier}
            </span>
          </div>
          <h2 class="text-base font-bold text-[#1E2022] mt-0.5 tracking-tight font-sans">
            ${building.name}
          </h2>
          <div class="text-xs text-[#71767B] font-mono mt-0.5">
            Total Area: <strong class="text-[#1E2022]">${building.totalAreaSqM.toLocaleString()} m²</strong> • EUI: <strong class="text-emerald-700">${building.eui} kWh/m²/yr</strong>
          </div>
        </div>
        <button onclick="twinApp.resetView()" class="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#F4F0E8] text-[#71767B] hover:text-[#1E2022] flex items-center justify-center transition-colors" title="Close Drawer">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Floor Selection Pills -->
      <div class="p-3 bg-[#FAF8F5] border-b border-[#EBE7DF]">
        <div class="flex items-center justify-between text-[11px] font-mono text-[#71767B] mb-1.5 font-bold uppercase">
          <span>${activeFloor ? 'Focused Floor:' : 'Floor Plates:'}</span>
          ${activeFloor ? `<button onclick="twinApp.selectFloor(null)" class="text-[#FF7A00] hover:underline flex items-center gap-1 font-bold">← View All Floors</button>` : ''}
        </div>
        <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
          ${building.floors.map((f) => {
            const isSelected = activeFloor && f.id === activeFloor.id;
            const hasAnomaly = !!f.anomaly;
            return `
              <button onclick="twinApp.selectFloor('${f.id}')" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center gap-0.5 border ${
                isSelected
                  ? 'bg-[#1E2022] text-white border-[#1E2022] shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-[#1E2022] border-[#EBE7DF]'
              }">
                <div class="flex items-center gap-1">
                  <span>${f.id.toUpperCase()}</span>
                  ${hasAnomaly ? '<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>' : ''}
                </div>
                <span class="text-[9px] font-mono opacity-70">${f.demandKw}kW</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Navigation Tabs (HVAC, Energy, Cost, Anomalies) -->
      <div class="flex border-b border-[#EBE7DF] bg-white px-2 pt-1 gap-1 text-xs">
        <button onclick="twinApp.setDrawerTab('hvac')" class="px-3 py-2 font-semibold border-b-2 transition-all ${this.state.activeDrawerTab === 'hvac' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-[#71767B] hover:text-[#1E2022]'}">
          HVAC Telemetry
        </button>
        <button onclick="twinApp.setDrawerTab('energy')" class="px-3 py-2 font-semibold border-b-2 transition-all ${this.state.activeDrawerTab === 'energy' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-[#71767B] hover:text-[#1E2022]'}">
          Power Breakdown
        </button>
        <button onclick="twinApp.setDrawerTab('cost')" class="px-3 py-2 font-semibold border-b-2 transition-all ${this.state.activeDrawerTab === 'cost' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-[#71767B] hover:text-[#1E2022]'}">
          TNB Tariff Cost
        </button>
        <button onclick="twinApp.setDrawerTab('anomalies')" class="px-3 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${this.state.activeDrawerTab === 'anomalies' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-[#71767B] hover:text-[#1E2022]'}">
          <span>Anomalies</span>
          ${activeFloor?.anomaly ? `<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>` : ''}
        </button>
      </div>

      <!-- Scrollable Tab Content Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        ${this._renderDrawerTabContent({
          building,
          activeFloor,
          hvac,
          currentSetpoint,
          dailyKwh,
          demandKw,
          peakCostMyr,
          offPeakCostMyr,
          totalCostMyr,
          costAvoidedMyr,
          co2Kg,
          co2AvoidedKg,
        })}
      </div>
    `;
  }

  _renderDrawerTabContent(ctx) {
    const { building, activeFloor, hvac, currentSetpoint, dailyKwh, demandKw, peakCostMyr, offPeakCostMyr, totalCostMyr, costAvoidedMyr, co2Kg, co2AvoidedKg } = ctx;

    // TAB 1: HVAC Telemetry
    if (this.state.activeDrawerTab === 'hvac') {
      const isAnomaly = hvac.status.includes('ANOMALY');
      return `
        <!-- AHU Tag & Live Status -->
        <div class="p-3 rounded-2xl ${isAnomaly ? 'bg-rose-50 border border-rose-200' : 'bg-[#FAF8F5] border border-[#EBE7DF]'} flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-mono font-bold text-[#71767B] block">Air Handling Unit Node</span>
            <span class="text-sm font-extrabold text-[#1E2022] font-mono">${hvac.ahuTag}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${isAnomaly ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'}">
            ${hvac.status}
          </span>
        </div>

        <!-- 4 Core Gauges (Space Temp, Supply, Return, Setpoint) -->
        <div class="grid grid-cols-2 gap-2.5 font-mono">
          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs">
            <span class="text-[10px] text-[#71767B] block uppercase font-bold">Space Temperature</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-xl font-extrabold text-[#1E2022]">${hvac.spaceTempC}</span>
              <span class="text-xs text-[#71767B]">°C</span>
            </div>
            <span class="text-[9px] text-[#71767B] mt-0.5 block">Target: ${currentSetpoint}°C</span>
          </div>

          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs">
            <span class="text-[10px] text-sky-700 block uppercase font-bold">Supply Air Temp</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-xl font-extrabold text-sky-700">${hvac.supplyTempC}</span>
              <span class="text-xs text-sky-600">°C</span>
            </div>
            <span class="text-[9px] text-[#71767B] mt-0.5 block">Return: ${hvac.returnTempC}°C</span>
          </div>

          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs">
            <span class="text-[10px] text-indigo-700 block uppercase font-bold">Hydronic CHW ΔT</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-xl font-extrabold text-indigo-700">${hvac.chwDeltaTC}</span>
              <span class="text-xs text-indigo-600">°C</span>
            </div>
            <span class="text-[9px] text-[#71767B] mt-0.5 block">${hvac.chwSupplyC}°C → ${hvac.chwReturnC}°C</span>
          </div>

          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs">
            <span class="text-[10px] text-emerald-700 block uppercase font-bold">Airflow Volume</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-xl font-extrabold text-emerald-700">${hvac.airflowCfm.toLocaleString()}</span>
              <span class="text-xs text-emerald-600">CFM</span>
            </div>
            <span class="text-[9px] text-[#71767B] mt-0.5 block">${hvac.diffuserCount} Swirl Diffusers</span>
          </div>
        </div>

        <!-- Damper & Fan Metrics -->
        <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="text-[#71767B]">Chilled Water Valve Position</span>
            <span class="font-mono font-bold text-[#1E2022]">${hvac.chwValvePercent}%</span>
          </div>
          <div class="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden">
            <div class="h-full bg-sky-500 rounded-full" style="width: ${hvac.chwValvePercent}%"></div>
          </div>

          <div class="flex justify-between items-center text-xs pt-1">
            <span class="text-[#71767B]">VFD Supply Fan Speed</span>
            <span class="font-mono font-bold text-[#1E2022]">${hvac.fanSpeedPercent}%</span>
          </div>
          <div class="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: ${hvac.fanSpeedPercent}%"></div>
          </div>
        </div>

        <!-- Indoor Environmental Quality (IEQ) -->
        <div class="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] flex items-center justify-between text-xs">
          <div>
            <span class="text-[10px] text-[#71767B] block uppercase font-bold font-mono">Relative Humidity</span>
            <span class="font-bold text-[#1E2022] font-mono text-sm">${hvac.rhPercent}% RH</span>
          </div>
          <div class="w-px h-7 bg-[#EBE7DF]"></div>
          <div>
            <span class="text-[10px] text-[#71767B] block uppercase font-bold font-mono">CO₂ Concentration</span>
            <span class="font-bold text-[#1E2022] font-mono text-sm">${hvac.co2Ppm} ppm</span>
          </div>
          <div class="w-px h-7 bg-[#EBE7DF]"></div>
          <div>
            <span class="text-[10px] text-[#71767B] block uppercase font-bold font-mono">Filter Health</span>
            <span class="font-bold text-emerald-700 font-mono text-sm">${hvac.filterHealthPercent}%</span>
          </div>
        </div>

        <!-- Interactive Smart Thermostat Setpoint Slider -->
        <div class="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-[#1E2022]">Smart Thermostat Setpoint</span>
            <span class="font-mono font-bold text-[#FF7A00] text-sm">${currentSetpoint}°C</span>
          </div>
          <input
            type="range"
            min="20"
            max="26"
            step="0.5"
            value="${currentSetpoint}"
            oninput="twinApp.setSetpoint(parseFloat(this.value))"
            class="w-full accent-[#FF7A00] cursor-pointer"
          />
          <div class="flex justify-between text-[10px] font-mono text-[#71767B]">
            <span>20.0°C (Comfort Max)</span>
            <span>23.0°C (GBI Target)</span>
            <span>26.0°C (Eco-Active)</span>
          </div>
        </div>
      `;
    }

    // TAB 2: Power Breakdown
    if (this.state.activeDrawerTab === 'energy') {
      const hvacKw = activeFloor?.hvacLoadKw || (demandKw * 0.52).toFixed(1);
      const lightKw = activeFloor?.lightingLoadKw || (demandKw * 0.24).toFixed(1);
      const plugKw = activeFloor?.plugLoadKw || (demandKw * 0.24).toFixed(1);
      const solarKwh = activeFloor?.solarGenKwh || (building.floors.find((f) => f.id === 'roof')?.solarGenKwh || 0);

      return `
        <div class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1">
          <span class="text-[10px] uppercase font-mono font-bold text-[#71767B] block">Current Power Draw</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-[#1E2022] font-mono">${demandKw}</span>
            <span class="text-xs font-bold text-[#71767B]">kW Active Demand</span>
          </div>
          <span class="text-xs text-[#71767B] block">Total Daily Consumed: <strong class="text-[#1E2022]">${dailyKwh.toLocaleString()} kWh</strong></span>
        </div>

        <!-- Power Distribution Bars -->
        <div class="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-3">
          <span class="text-[10px] uppercase font-mono font-bold text-[#71767B] block">Sub-System Load Partition</span>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-[#1E2022]">HVAC Chiller & AHU Loops</span>
              <span class="font-mono font-bold text-sky-700">${hvacKw} kW</span>
            </div>
            <div class="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
              <div class="h-full bg-sky-600 rounded-full" style="width: ${(hvacKw / demandKw * 100).toFixed(0)}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-[#1E2022]">Smart LED Architectural Lighting</span>
              <span class="font-mono font-bold text-amber-700">${lightKw} kW</span>
            </div>
            <div class="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: ${(lightKw / demandKw * 100).toFixed(0)}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-[#1E2022]">Plug Loads & Server Racks</span>
              <span class="font-mono font-bold text-indigo-700">${plugKw} kW</span>
            </div>
            <div class="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 rounded-full" style="width: ${(plugKw / demandKw * 100).toFixed(0)}%"></div>
            </div>
          </div>
        </div>

        <!-- Rooftop Solar Generation -->
        <div class="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase font-bold text-emerald-800 block">Clean Solar Yield</span>
            <span class="text-lg font-extrabold text-emerald-900 font-mono">${solarKwh.toLocaleString()} kWh</span>
          </div>
          <span class="material-symbols-outlined text-2xl text-emerald-600">solar_power</span>
        </div>
      `;
    }

    // TAB 3: TNB Tariff Cost
    if (this.state.activeDrawerTab === 'cost') {
      return `
        <div class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-1">
          <span class="text-[10px] uppercase font-mono font-bold text-[#71767B] block">Daily Electricity Expenditure</span>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-extrabold text-[#1E2022] font-mono">RM ${totalCostMyr.toFixed(2)}</span>
          </div>
          <span class="text-[11px] text-[#71767B] block font-mono">Malaysian TNB Commercial Tariff C1 Rate</span>
        </div>

        <div class="space-y-2.5">
          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-[#1E2022] block">Peak Consumption Window</span>
              <span class="text-[10px] text-[#71767B] font-mono">08:00 – 22:00 @ RM 0.584 / kWh</span>
            </div>
            <span class="font-mono font-bold text-[#1E2022] text-sm">RM ${peakCostMyr.toFixed(2)}</span>
          </div>

          <div class="p-3 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-[#1E2022] block">Off-Peak Night Window</span>
              <span class="text-[10px] text-[#71767B] font-mono">22:00 – 08:00 @ RM 0.220 / kWh</span>
            </div>
            <span class="font-mono font-bold text-emerald-700 text-sm">RM ${offPeakCostMyr.toFixed(2)}</span>
          </div>

          <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-emerald-900 block">Solar & BESS Savings Offset</span>
              <span class="text-[10px] text-emerald-700 font-mono">Peak Demand Shaving Avoided</span>
            </div>
            <span class="font-mono font-bold text-emerald-800 text-sm">-RM ${costAvoidedMyr.toFixed(2)}</span>
          </div>
        </div>

        <!-- Scope 2 Carbon Emissions -->
        <div class="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1">
          <span class="text-[10px] font-mono uppercase font-bold text-sky-800 block">Scope 2 Carbon Footprint</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-extrabold text-sky-950 font-mono">${(co2Kg / 1000).toFixed(2)}</span>
            <span class="text-xs text-sky-800">tCO₂e (${Math.round(co2Kg).toLocaleString()} kg)</span>
          </div>
          <span class="text-[10px] text-sky-700 block font-mono">Grid Factor: 0.658 kg CO₂e / kWh (Energy Commission)</span>
        </div>
      `;
    }

    // TAB 4: Anomalies
    if (this.state.activeDrawerTab === 'anomalies') {
      const anom = activeFloor?.anomaly;
      if (!anom) {
        return `
          <div class="p-8 text-center space-y-2">
            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <h4 class="font-bold text-[#1E2022]">No Active Anomalies Flagged</h4>
            <p class="text-[11px] text-[#71767B]">All zone meters, VAV dampers, and supply fan baselines are running within 6× MAD nominal bounds.</p>
          </div>
        `;
      }

      const isAck = this.state.acknowledgedAnomalies[anom.id];

      return `
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-rose-700 block">Statistical Deviation Detected</span>
              <h4 class="font-extrabold text-[#1E2022] text-sm mt-0.5">${anom.type}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white font-mono">
              ${anom.severity}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span class="text-[#71767B] block text-[10px]">Excess Draw</span>
              <strong class="text-rose-700">${anom.deltaKwh}</strong>
            </div>
            <div>
              <span class="text-[#71767B] block text-[10px]">Detection Time</span>
              <strong class="text-[#1E2022]">${anom.time}</strong>
            </div>
          </div>

          <p class="text-xs text-[#1E2022] leading-relaxed pt-1 border-t border-rose-200/80">
            ${anom.detail}
          </p>

          <div class="pt-2 flex items-center justify-between">
            <button
              onclick="twinApp.acknowledgeAnomaly('${anom.id}')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isAck
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
              }"
            >
              ${isAck ? '✓ Acknowledged' : 'Acknowledge & Dispatch'}
            </button>
            <button onclick="twinApp.showToast('Copilot analyzing root cause...')" class="text-xs font-semibold text-sky-700 hover:underline">
              Copilot Diagnosis ›
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  // ==========================================
  // Toast Notification
  // ==========================================

  showToast(msg) {
    const toast = document.getElementById('velora-toast');
    const text = document.getElementById('velora-toast-text');
    if (!toast || !text) return;

    text.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 2800);
  }
}

window.twinApp = new EnergiOSTwinApp();
document.addEventListener('DOMContentLoaded', () => window.twinApp.init());
