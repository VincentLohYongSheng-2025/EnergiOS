/**
 * Local, data-grounded explainer for the dashboard.
 * This is not an AI service and sends no prompt or credential anywhere.
 */
class DynamicIslandController {
  constructor() {
    this.isExpanded = false;
    this.logs = [
      { time: '--:--:--', text: 'Waiting for live BDG2 public-benchmark data', status: 'neutral' },
      { time: '--:--:--', text: 'Forecasts are calculated outputs', status: 'info' },
      { time: '--:--:--', text: 'Detections are unusual consumption patterns without confirmed causes', status: 'warning' },
    ];
  }

  init() {
    document.addEventListener('click', (event) => {
      const island = document.getElementById('dynamic-island');
      if (this.isExpanded && island && !island.contains(event.target)) this.collapse();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.collapse();
    });
    this.renderLogs();
  }

  currentState() {
    return window.veloraApp?.state || {};
  }

  expand() {
    const collapsed = document.getElementById('island-collapsed');
    const expanded = document.getElementById('island-expanded');
    if (!collapsed || !expanded) return;
    this.isExpanded = true;
    collapsed.classList.add('hidden');
    expanded.classList.remove('hidden');
    document.getElementById('island-user-input')?.focus();
  }

  collapse() {
    const collapsed = document.getElementById('island-collapsed');
    const expanded = document.getElementById('island-expanded');
    if (!collapsed || !expanded) return;
    this.isExpanded = false;
    expanded.classList.add('hidden');
    collapsed.classList.remove('hidden');
  }

  addLog(text, status = 'neutral') {
    const time = new Date().toTimeString().split(' ')[0];
    this.logs.push({ time, text, status });
    this.renderLogs();
  }

  renderLogs() {
    const container = document.getElementById('island-agent-logs-list');
    if (!container) return;
    container.innerHTML = this.logs.slice(-6).map((log) => `
      <div class="flex items-start gap-1.5 leading-snug">
        <span class="text-neutral-500 whitespace-nowrap">• ${log.time} —</span>
        <span class="text-neutral-300">${log.text}</span>
      </div>
    `).join('');
  }

  sendQuickPrompt(promptText) {
    const input = document.getElementById('island-user-input');
    if (!input) return;
    input.value = promptText;
    this.handleUserSubmit(new Event('submit'));
  }

  handleUserSubmit(event) {
    event?.preventDefault?.();
    const input = document.getElementById('island-user-input');
    const bubble = document.getElementById('island-agent-bubble-text');
    if (!input || !bubble) return;
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    input.value = '';

    const state = this.currentState();
    const asset = state.currentBuilding;
    const forecast = state.forecast;
    const anomalies = state.anomalies;
    let response;

    if (query.includes('forecast') || query.includes('model') || query.includes('mae')) {
      const model = forecast?.test_metrics?.model;
      const baseline = forecast?.test_metrics?.baseline;
      response = model && baseline
        ? `The selected whole-building meter has a <b>24-hour calculated forecast</b>. Held-out model MAE is <b>${model.mae_kwh.toFixed(2)} kWh</b> versus <b>${baseline.mae_kwh.toFixed(2)} kWh</b> for the previous-day baseline.`
        : 'Forecast evidence is not available until the live API request completes.';
    } else if (query.includes('anomal') || query.includes('unusual') || query.includes('pattern')) {
      const count = anomalies?.count;
      response = Number.isInteger(count)
        ? `The API returned <b>${count} unusual consumption patterns</b> for ${asset?.name || 'the selected asset'}. They are statistical detections and do not establish waste, HVAC faults, schedules, or causes.`
        : 'Unusual-pattern evidence is not available until the live API request completes.';
    } else if (query.includes('unavailable') || query.includes('scope') || query.includes('tariff') || query.includes('carbon') || query.includes('solar') || query.includes('battery') || query.includes('floor') || query.includes('hvac')) {
      response = 'BDG2 supports whole-building electricity only. Tariffs, carbon factors, savings, floors, rooms, HVAC causes, solar, batteries, live control, and Sime Darby or Elmina performance are unavailable.';
    } else {
      response = asset
        ? `Showing <b>${asset.name}</b> from <b>Public benchmark data — Building Data Genome Project 2 v1.0</b>. Ask about the forecast, unusual patterns, or scope limits.`
        : 'Waiting for live BDG2 public-benchmark data. No fallback or invented values will be shown.';
    }

    bubble.innerHTML = response;
    this.addLog(`Explained approved data for ${asset?.name || 'current view'}`, 'info');
  }
}

window.dynamicIsland = new DynamicIslandController();
document.addEventListener('DOMContentLoaded', () => window.dynamicIsland.init());
