/**
 * EnergiOS - Spatial Digital Twin Controller (digital-twin.html)
 * 100% Inspired by building-dark.jpeg with real spatial telemetry,
 * interactive floorplan beacon inspections, and floor/building switching.
 */

class EnergiOSTwinApp {
  constructor() {
    this.state = {
      activeBuildingId: 'fa2b11d5-f608-515e-97ab-6445ef048bff', // Hog_office_Bill
      activeFloor: '1F',
      assets: [],
      currentBuilding: null,
      readings: null,
      anomalies: null,
    };
  }

  async init() {
    console.log('[EnergiOS Twin] Initializing digital twin spatial view...');
    await this.loadData();
  }

  async loadData() {
    try {
      const assetsData = await window.apiClient.getAssets();
      this.state.assets = assetsData.items || [];
      this.renderBuildingPicker();
      await this.selectBuilding(this.state.activeBuildingId);
    } catch (err) {
      console.warn('[EnergiOS Twin] Using verified BDG2 snapshot:', err);
      if (window.ENERGIOS_BDG2_DATA) {
        this.state.assets = window.ENERGIOS_BDG2_DATA.assets.items || [];
        this.renderBuildingPicker();
        await this.selectBuilding(this.state.activeBuildingId);
      }
    }
  }

  renderBuildingPicker() {
    const container = document.getElementById('building-picker-container');
    if (!container) return;

    container.innerHTML = this.state.assets.map((asset) => {
      const isSelected = asset.id === this.state.activeBuildingId;
      const cleanName = asset.name.replace('Hog_', '').replace('_', ' ');
      return `
        <button onclick="twinApp.selectBuilding('${asset.id}')" class="px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
          isSelected
            ? 'bg-[#1E2022] text-white shadow-xs font-semibold'
            : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/60'
        }">
          ${cleanName}
        </button>
      `;
    }).join('');
  }

  async selectBuilding(assetId) {
    this.state.activeBuildingId = assetId;
    this.renderBuildingPicker();

    try {
      const asset = this.state.assets.find((a) => a.id === assetId) || this.state.assets[0];
      this.state.currentBuilding = asset;

      const breadcrumbEl = document.getElementById('breadcrumb-asset-name');
      if (breadcrumbEl) breadcrumbEl.textContent = asset.name;

      const [readings, anomalies] = await Promise.all([
        window.apiClient.getReadings(assetId, { limit: 24 }),
        window.apiClient.getAnomalies(assetId, { limit: 100 }),
      ]);

      this.state.readings = readings;
      this.state.anomalies = anomalies;

      // Update popover with live latest reading
      if (readings.items && readings.items.length > 0) {
        const latest = readings.items[readings.items.length - 1];
        const powerEl = document.getElementById('popover-power');
        if (powerEl) powerEl.textContent = `${(latest.consumption_kwh * 0.42).toFixed(1)} kW`;
      }
    } catch (err) {
      console.error('[EnergiOS Twin] Error fetching telemetry:', err);
    }
  }

  setFloor(floor) {
    this.state.activeFloor = floor;
    document.querySelectorAll('.floor-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.textContent.trim() === floor);
    });
    this.showToast(`Switched view to Floor ${floor}`);
  }

  inspectZone(zoneName, status, temp, humidity, co2, power) {
    const nameEl = document.getElementById('popover-zone-name');
    const badgeEl = document.getElementById('popover-status-badge');
    const tempEl = document.getElementById('popover-temp');
    const humEl = document.getElementById('popover-humidity');
    const co2El = document.getElementById('popover-co2');
    const pwrEl = document.getElementById('popover-power');

    if (nameEl) nameEl.textContent = zoneName;
    if (tempEl) tempEl.textContent = temp;
    if (humEl) humEl.textContent = humidity;
    if (co2El) co2El.textContent = co2;
    if (pwrEl) pwrEl.textContent = power;

    if (badgeEl) {
      badgeEl.textContent = status;
      if (status.includes('Optimal') || status.includes('Normal')) {
        badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      } else if (status.includes('High')) {
        badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30';
      } else {
        badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30';
      }
    }

    // Subtle highlight animation on the popover
    const card = document.getElementById('twin-popover-card');
    if (card) {
      card.classList.add('ring-2', 'ring-sky-400');
      setTimeout(() => card.classList.remove('ring-2', 'ring-sky-400'), 400);
    }
  }

  openAlertDetails() {
    const modal = document.getElementById('velora-alert-modal');
    const listEl = document.getElementById('modal-anomalies-list');
    if (modal) modal.classList.remove('hidden');

    const anomalies = this.state.anomalies?.items || [];
    if (listEl) {
      if (anomalies.length === 0) {
        listEl.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">No active anomalies flagged.</div>`;
        return;
      }
      listEl.innerHTML = anomalies.slice(0, 15).map((a) => {
        const isAbove = a.direction === 'above_expected';
        const d = new Date(a.timestamp);
        return `
          <div class="p-3 rounded-xl ${isAbove ? 'bg-orange-50 border border-orange-100' : 'bg-blue-50 border border-blue-100'} text-[#1E2022]">
            <div class="flex justify-between font-bold ${isAbove ? 'text-orange-800' : 'text-blue-800'}">
              <span>${isAbove ? 'Above Expected' : 'Below Expected'} Flag</span>
              <span class="font-mono text-[11px]">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p class="text-[11px] mt-1 text-slate-700">Observed: <b>${a.observed_kwh.toFixed(1)} kWh</b> vs Forecast: <b>${a.forecast_kwh.toFixed(1)} kWh</b></p>
          </div>
        `;
      }).join('');
    }
  }

  closeAlertDetails() {
    const modal = document.getElementById('velora-alert-modal');
    if (modal) modal.classList.add('hidden');
  }

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
