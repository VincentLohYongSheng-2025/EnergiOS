import { classificationBadge, createPersistentDisclosure } from './data_classification.js';
import { runMicrogridScenario, runPeakShiftScenario, suggestedShiftHours } from './simulation_engine.js';

class EnergyScenarioApp {
  constructor() {
    this.assets = [];
    this.asset = null;
    this.forecast = null;
    this.anomalies = null;
    this.microgridChart = null;
    this.shiftChart = null;
  }

  async init() {
    this.mount();
    try {
      const response = await window.apiClient.getAssets();
      this.assets = response.items || [];
      if (!this.assets.length) throw new Error('The live API returned no BDG2 benchmark assets.');
      this.renderAssetOptions();
      await this.selectAsset(this.assets[0].id);
    } catch (error) {
      this.renderError(error.message);
    }
  }

  mount() {
    Array.from(document.body.children).forEach((child) => {
      child.hidden = true;
      child.style.display = 'none';
      child.setAttribute('aria-hidden', 'true');
    });
    document.body.className = 'module-surface';
    const root = document.createElement('main');
    root.id = 'energy-scenario-app';
    root.className = 'module-shell';
    root.innerHTML = `
      <header class="flex flex-col gap-5 border-b border-[#E5E0D7] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <a href="index.html" class="text-xs font-extrabold uppercase tracking-[0.18em] text-[#FF7A00]">← EnergiOS dashboard</a>
          <h1 class="mt-3 text-3xl font-black tracking-tight md:text-5xl">Energy scenario lab</h1>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-[#5F6469]">The demand input is the selected asset’s live 24-hour calculated BDG2 forecast. Solar, storage, price, and flexible load values are hypothetical inputs that you can change.</p>
        </div>
        <a href="methodology.html" class="module-button">Data sources & methodology</a>
      </header>

      <section class="module-disclosure mt-6 rounded-2xl border p-4 text-sm" aria-label="Simulation disclosure">
        <strong>Simulation — not measured operational data.</strong> No live control action is performed. Results do not represent Sime Darby Property, Elmina Lakeside Mall, verified savings, or measured solar and battery performance.
      </section>

      <section class="mt-6 module-card p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label class="block flex-1 text-xs font-bold uppercase tracking-wider text-[#71767B]">BDG2 benchmark asset
            <select id="scenario-asset" class="module-input mt-2 normal-case tracking-normal" aria-label="BDG2 benchmark asset"></select>
          </label>
          <div id="scenario-source-status" class="flex flex-wrap gap-2"></div>
        </div>
      </section>

      <div id="scenario-loading" class="mt-6 module-card p-8 text-center text-sm text-[#71767B]">Loading live BDG2 forecast…</div>
      <div id="scenario-error" class="mt-6 hidden rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900" role="alert"></div>

      <div id="scenario-content" class="hidden">
        <section class="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form id="microgrid-form" class="module-card p-5" aria-label="Microgrid simulated assumptions">
            <div class="flex items-start justify-between gap-3">
              <div><p class="text-xs font-black uppercase tracking-wider text-[#FF7A00]">Scenario A</p><h2 class="mt-1 text-xl font-black">Microgrid assumptions</h2></div>
              ${classificationBadge('simulated')}
            </div>
            <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              ${this.numberInput('solar-capacity', 'Solar capacity', 'kW', 120, 0)}
              ${this.numberInput('battery-capacity', 'Battery capacity', 'kWh', 250, 0)}
              ${this.numberInput('battery-power', 'Charge/discharge limit', 'kW', 75, 0)}
              ${this.numberInput('starting-soc', 'Starting battery state', '%', 50, 0, 100)}
              ${this.numberInput('grid-price', 'Optional flat grid price', 'MYR/kWh', '', 0, null, 'Leave blank to hide financial output')}
            </div>
            <button class="module-button mt-5 w-full" type="submit">Run simulated microgrid</button>
            <div class="mt-5 rounded-xl bg-[#F8F6F2] p-4 text-xs leading-5 text-[#5F6469]">
              <strong class="text-[#1E2022]">Assumptions currently used:</strong> <span id="microgrid-assumption-summary">Loading values…</span><br>
              The solar shape is a hypothetical normalized daytime curve; hourly kWh is divided by its one-hour interval to derive interval-average kW; battery charging is solar-only; the battery is idealized with no losses.
            </div>
          </form>

          <div class="space-y-6">
            <section class="module-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3"><div><h2 class="text-xl font-black">Baseline vs simulated grid demand</h2><p class="mt-1 text-xs text-[#71767B]">24 one-hour intervals · derived interval-average kW</p></div>${classificationBadge('simulated', 'Simulation — not measured operational data')}</div>
              <div class="module-chart-wrap mt-5"><canvas id="microgrid-chart" aria-label="Baseline forecast and simulated grid demand chart"></canvas></div>
            </section>
            <section id="microgrid-results" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite"></section>
          </div>
        </section>

        <section class="mt-6 module-card p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div><p class="text-xs font-black uppercase tracking-wider text-[#FF7A00]">Scenario B</p><h2 class="mt-1 text-xl font-black">Peak-shaving load shift</h2><p class="mt-2 max-w-2xl text-sm text-[#5F6469]">Moves a user-entered flexible load between two calculated forecast intervals. It does not send a command to equipment.</p></div>
            ${classificationBadge('simulated', 'Simulated assumption — no live control action performed')}
          </div>
          <form id="peak-form" class="mt-5 grid gap-4 md:grid-cols-4" aria-label="Peak shaving simulated assumptions">
            ${this.numberInput('flexible-load', 'Flexible load', 'kWh', 40, 0)}
            <label class="text-xs font-bold text-[#5F6469]">Shift from forecast interval<select id="shift-from" class="module-input mt-2" aria-label="Shift flexible load from"></select></label>
            <label class="text-xs font-bold text-[#5F6469]">Shift to forecast interval<select id="shift-to" class="module-input mt-2" aria-label="Shift flexible load to"></select></label>
            <button class="module-button self-end" type="submit">Simulate shift</button>
          </form>
          <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="module-chart-wrap"><canvas id="peak-chart" aria-label="Before and after peak-shaving simulation chart"></canvas></div>
            <div id="peak-results" class="grid content-start gap-3" aria-live="polite"></div>
          </div>
        </section>

        <section class="mt-6 module-card p-5">
          <div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-lg font-black">Unusual-consumption-pattern status</h2><p class="mt-1 text-xs text-[#71767B]">Statistical detections only; no cause is assigned.</p></div>${classificationBadge('detected')}</div>
          <p id="scenario-anomaly-state" class="mt-4 text-sm leading-6 text-[#5F6469]"></p>
        </section>
      </div>
    `;
    document.body.appendChild(root);
    createPersistentDisclosure();

    document.getElementById('scenario-asset').addEventListener('change', (event) => this.selectAsset(event.target.value));
    document.getElementById('microgrid-form').addEventListener('submit', (event) => { event.preventDefault(); this.renderMicrogrid(); });
    document.getElementById('peak-form').addEventListener('submit', (event) => { event.preventDefault(); this.renderPeakShift(); });
  }

  numberInput(id, label, unit, value, min, max = null, help = '') {
    const maxAttribute = max == null ? '' : `max="${max}"`;
    return `<label class="text-xs font-bold text-[#5F6469]">${label} <span class="font-normal">(${unit})</span><input id="${id}" class="module-input mt-2" type="number" value="${value}" min="${min}" ${maxAttribute} step="any" aria-label="${label} in ${unit}">${help ? `<span class="mt-1 block text-[10px] font-normal">${help}</span>` : ''}</label>`;
  }

  renderAssetOptions() {
    const select = document.getElementById('scenario-asset');
    select.innerHTML = this.assets.map((asset) => `<option value="${asset.id}">${asset.name.replaceAll('_', ' ')}</option>`).join('');
  }

  async selectAsset(assetId) {
    document.getElementById('scenario-loading').classList.remove('hidden');
    document.getElementById('scenario-content').classList.add('hidden');
    document.getElementById('scenario-error').classList.add('hidden');
    try {
      this.asset = this.assets.find((asset) => asset.id === assetId);
      if (!this.asset) throw new Error('The selected asset is not available from the live API.');
      [this.forecast, this.anomalies] = await Promise.all([
        window.apiClient.getForecast(assetId),
        window.apiClient.getAnomalies(assetId, { limit: 100 }),
      ]);
      if (this.forecast?.items?.length !== 24) throw new Error('A complete 24-hour forecast is unavailable for this asset.');
      document.getElementById('scenario-source-status').innerHTML = `${classificationBadge('calculated')} ${classificationBadge('observed', 'BDG2 source history')}`;
      this.renderHourOptions();
      this.renderMicrogrid();
      this.renderPeakShift();
      this.renderAnomalyState();
      document.getElementById('scenario-loading').classList.add('hidden');
      document.getElementById('scenario-content').classList.remove('hidden');
    } catch (error) {
      this.renderError(error.message);
    }
  }

  values() { return this.forecast.items.map((item) => item.forecast_kwh); }

  renderHourOptions() {
    const options = this.forecast.items.map((item, index) => `<option value="${index}">${new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</option>`).join('');
    document.getElementById('shift-from').innerHTML = options;
    document.getElementById('shift-to').innerHTML = options;
    const suggested = suggestedShiftHours(this.values());
    document.getElementById('shift-from').value = String(suggested.fromHour);
    document.getElementById('shift-to').value = String(suggested.toHour);
  }

  assumptions() {
    return {
      solarCapacityKw: document.getElementById('solar-capacity').value,
      batteryCapacityKwh: document.getElementById('battery-capacity').value,
      batteryPowerKw: document.getElementById('battery-power').value,
      startingSocPercent: document.getElementById('starting-soc').value,
      gridPriceMyrPerKwh: document.getElementById('grid-price').value,
    };
  }

  renderMicrogrid() {
    try {
      const assumptions = this.assumptions();
      const result = runMicrogridScenario(this.values(), assumptions);
      const tariff = result.priceEstimate ? `MYR ${Number(assumptions.gridPriceMyrPerKwh).toFixed(3)}/kWh` : 'no grid price entered';
      document.getElementById('microgrid-assumption-summary').textContent = `solar ${Number(assumptions.solarCapacityKw).toFixed(1)} kW; battery ${Number(assumptions.batteryCapacityKwh).toFixed(1)} kWh; charge/discharge limit ${Number(assumptions.batteryPowerKw).toFixed(1)} kW; starting state ${Math.min(100, Number(assumptions.startingSocPercent)).toFixed(1)}%; ${tariff}.`;
      const labels = this.forecast.items.map((item) => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (this.microgridChart) this.microgridChart.destroy();
      this.microgridChart = new Chart(document.getElementById('microgrid-chart'), {
        type: 'line',
        data: { labels, datasets: [
          { label: 'Calculated forecast input (kW interval average)', data: result.baseline, borderColor: '#1d4ed8', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3, pointRadius: 0 },
          { label: 'Simulated grid demand (kW interval average)', data: result.simulated, borderColor: '#be123c', backgroundColor: 'rgba(190,18,60,0.08)', fill: true, borderWidth: 2.5, tension: 0.3, pointRadius: 0 },
          { label: 'Simulated solar profile (kW)', data: result.solar, borderColor: '#f59e0b', borderDash: [5, 5], borderWidth: 1.5, tension: 0.3, pointRadius: 0 },
        ] },
        options: this.chartOptions('Derived interval-average kW'),
      });
      const money = result.priceEstimate
        ? this.resultCard('Illustrative cost difference', `MYR ${result.priceEstimate.illustrativeDifferenceMyr.toFixed(2)}`, 'Illustrative estimate based on user-entered tariff')
        : this.resultCard('Financial estimate', 'Not calculated', 'Enter a grid price assumption to enable');
      document.getElementById('microgrid-results').innerHTML = [
        this.resultCard('Estimated peak reduction', `${result.estimatedPeakReductionKw.toFixed(1)} kW`, 'Simulated assumption'),
        this.resultCard('Solar utilised', `${result.solarUsedKwh.toFixed(1)} kWh`, 'Simulated assumption'),
        this.resultCard('Battery movement', `${result.batteryDischargedKwh.toFixed(1)} kWh out`, `${result.batteryChargedKwh.toFixed(1)} kWh in · idealized`),
        money,
      ].join('');
    } catch (error) {
      this.renderError(error.message);
    }
  }

  renderPeakShift() {
    try {
      const result = runPeakShiftScenario(this.values(), {
        flexibleLoadKwh: document.getElementById('flexible-load').value,
        fromHour: document.getElementById('shift-from').value,
        toHour: document.getElementById('shift-to').value,
      });
      const labels = this.forecast.items.map((item) => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (this.shiftChart) this.shiftChart.destroy();
      this.shiftChart = new Chart(document.getElementById('peak-chart'), {
        type: 'line',
        data: { labels, datasets: [
          { label: 'Calculated forecast before shift', data: result.baseline, borderColor: '#1d4ed8', borderWidth: 2, pointRadius: 0, tension: 0.25 },
          { label: 'Simulated demand after shift', data: result.simulated, borderColor: '#be123c', borderWidth: 2.5, pointRadius: 0, tension: 0.25 },
        ] },
        options: this.chartOptions('Derived interval-average kW'),
      });
      document.getElementById('peak-results').innerHTML = [
        this.resultCard('Shifted energy', `${result.shiftedKwh.toFixed(1)} kWh`, 'Simulated assumption'),
        this.resultCard('Estimated peak reduction', `${result.estimatedPeakReductionKw.toFixed(1)} kW`, 'Simulated assumption — no live control action performed'),
        this.resultCard('Energy balance', `${result.energyBalanceKwh.toFixed(2)} kWh`, 'Before/after total difference'),
      ].join('');
    } catch (error) {
      this.renderError(error.message);
    }
  }

  chartOptions(unit) {
    return { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${Number(context.raw).toFixed(1)} ${unit}` } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: unit } } } };
  }

  resultCard(label, value, detail) {
    return `<article class="module-card p-4"><p class="text-[10px] font-black uppercase tracking-wider text-[#71767B]">${label}</p><p class="mt-2 text-xl font-black">${value}</p><div class="mt-3">${classificationBadge('simulated', 'Simulation — not measured operational data')}</div><p class="mt-2 text-[11px] leading-4 text-[#71767B]">${detail}</p></article>`;
  }

  renderAnomalyState() {
    const element = document.getElementById('scenario-anomaly-state');
    if ((this.anomalies?.count ?? 0) === 0) {
      element.textContent = 'No unusual consumption patterns were detected for this asset and selected period. This is not proof that the building has no inefficiency.';
      return;
    }
    element.textContent = `${this.anomalies.count} unusual consumption patterns were returned for this asset. They are statistical detections and do not establish HVAC, lighting, ghost-load, equipment, waste, or other causes.`;
  }

  renderError(message) {
    document.getElementById('scenario-loading')?.classList.add('hidden');
    const error = document.getElementById('scenario-error');
    if (error) { error.textContent = message || 'The live EnergiOS API is temporarily unavailable.'; error.classList.remove('hidden'); }
  }
}

window.energyScenarioApp = new EnergyScenarioApp();
document.addEventListener('DOMContentLoaded', () => window.energyScenarioApp.init());
