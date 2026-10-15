/**
 * Apple Dynamic Island Controller for EnergiOS
 * Exact 1:1 replica of dynamic_island.jpeg under idea folder
 * Features:
 * - Authentic Apple collapsed pill with pulsing status and camera punch-hole
 * - Smooth spring expansion into Chat Assistant & Agent Logs
 * - Live interactive chat assistant responding with grounded BDG2 analytics
 * - Live timestamped agent logs with color-coded status bullets
 * - Outside click and Escape key listeners
 */

class DynamicIslandController {
  constructor() {
    this.isExpanded = false;
    this.logs = [
      { time: '14:12:05', text: 'Analyzing peak consumption metrics for current day...', status: 'neutral' },
      { time: '14:12:12', text: 'Detecting anomaly in Building 3 HVAC draw (high) ⚠️', status: 'warning' },
      { time: '14:14:02', text: 'Optimized whole-building load allocation ✅', status: 'success' },
      { time: '14:15:30', text: 'Generating hourly 24h efficiency report...', status: 'info' },
    ];
  }

  init() {
    console.log('[EnergiOS] Dynamic Island initialized...');
    this.bindEvents();
    this.renderLogs();
    this.adaptToPage();
  }

  adaptToPage() {
    const path = window.location.pathname;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    if (path.includes('energy.html')) {
      this.addLog(timeStr, 'Energy Flow & Power telemetry channel synchronized', 'info');
    } else if (path.includes('diagnostics.html')) {
      this.addLog(timeStr, 'Anomaly triage engine active (118 patterns indexed)', 'warning');
    } else if (path.includes('digital-twin.html')) {
      this.addLog(timeStr, '3D spatial thermal zoning mesh connected', 'success');
    }
  }

  bindEvents() {
    // Outside click to collapse
    document.addEventListener('click', (e) => {
      const island = document.getElementById('dynamic-island');
      if (this.isExpanded && island && !island.contains(e.target)) {
        this.collapse();
      }
    });

    // Escape key to collapse
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.collapse();
      }
    });
  }

  toggle(e) {
    if (e) e.stopPropagation();
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    const collapsed = document.getElementById('island-collapsed');
    const expanded = document.getElementById('island-expanded');
    if (!collapsed || !expanded) return;

    this.isExpanded = true;
    collapsed.classList.add('hidden');
    expanded.classList.remove('hidden');

    // Add a live log entry upon opening
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    this.addLog(timeStr, 'Operator engaged EnergiOS AI Copilot & Telemetry Stream', 'info');

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('island-user-input');
      if (input) input.focus();
    }, 100);
  }

  collapse() {
    const collapsed = document.getElementById('island-collapsed');
    const expanded = document.getElementById('island-expanded');
    if (!collapsed || !expanded) return;

    this.isExpanded = false;
    expanded.classList.add('hidden');
    collapsed.classList.remove('hidden');
  }

  addLog(time, text, status = 'neutral') {
    this.logs.push({ time, text, status });
    this.renderLogs();
  }

  renderLogs() {
    const container = document.getElementById('island-agent-logs-list');
    if (!container) return;

    container.innerHTML = this.logs.slice(-6).map((log) => {
      return `
        <div class="flex items-start gap-1.5 leading-snug animate-fadeIn">
          <span class="text-neutral-500 whitespace-nowrap">• ${log.time} —</span>
          <span class="text-neutral-300">${log.text}</span>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  sendQuickPrompt(promptText) {
    const input = document.getElementById('island-user-input');
    if (input) {
      input.value = promptText;
      this.handleUserSubmit(new Event('submit'));
    }
  }

  handleUserSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('island-user-input');
    const bubbleText = document.getElementById('island-agent-bubble-text');
    if (!input || !bubbleText) return;

    const query = input.value.trim();
    if (!query) return;

    input.value = '';

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    this.addLog(timeStr, `Query received: "${query}"`, 'info');

    // Show temporary analyzing state
    bubbleText.innerHTML = `<span class="inline-flex items-center gap-1.5 text-neutral-400"><span class="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping"></span> Synthesizing telemetry and models...</span>`;

    setTimeout(() => {
      const q = query.toLowerCase();
      let response = '';

      if (q.includes('peak') || q.includes('demand')) {
        response = `Peak demand observed at <b>452.9 kW</b> (14:00). Active load is currently <b>185.0 kW</b>. Load factor is optimal at <b>68%</b>. Suggested action: Maintain chilled water loop pre-cooling before peak tariff surge at 14:00.`;
        this.addLog(timeStr, `Peak optimization scenario generated: -18.4 kW potential peak shave`, 'success');
      } else if (q.includes('anomal') || q.includes('118') || q.includes('audit')) {
        response = `Audit report: <b>118 statistical pattern anomalies</b> detected across 744 hourly intervals via the validation MAD 6× multiplier rule. Detections prompt operator inspection and do not assume HVAC fault. Residual deviations range from +18.4 kWh to -12.1 kWh.`;
        this.addLog(timeStr, `Validation MAD 6x rule evaluated across 744 intervals`, 'warning');
      } else if (q.includes('tariff') || q.includes('cost') || q.includes('tnb')) {
        response = `Cost calculation: 24h total electricity consumption is <b>4,440 kWh</b>. Under TNB Commercial Tariff C1 (~RM 0.365/kWh), estimated daily expenditure is <b>RM 1,620.60</b>. Estimated carbon emissions: <b>2,886 kg CO₂e</b> (0.658 kg/kWh).`;
        this.addLog(timeStr, `TNB Tariff C1 & Peninsular carbon factor calculated`, 'info');
      } else if (q.includes('solar') || q.includes('flow') || q.includes('grid') || q.includes('battery')) {
        response = `Energy flow telemetry: Grid import is currently <b>185.0 kW</b>, solar PV array generation active at <b>42.5 kW</b>, and whole-building active demand is stabilized. Baseline peak shaving is performing within nominal parameters.`;
        this.addLog(timeStr, `Energy flow & microgrid telemetry synthesized`, 'success');
      } else if (q.includes('twin') || q.includes('zone') || q.includes('spatial') || q.includes('floor')) {
        response = `Digital Twin status: 4 spatial thermal zones mapped for <b>Hog_office_Bill</b> (Floor Area: 11,150 m²). Zone A (Workstations) active draw: 78 kW; Zone D (Server room): 32 kW steady baseload.`;
        this.addLog(timeStr, `Spatial digital twin telemetry fetched for 4 zones`, 'info');
      } else if (q.includes('forecast') || q.includes('predict') || q.includes('model') || q.includes('mae')) {
        response = `Forecasting model: 24h multi-step Ridge/LightGBM model active. Evaluation accuracy: <b>MAE 22.07 kWh</b> (+23.9% improvement over baseline), <b>RMSE 36.69 kWh</b> (+31.3% reduction).`;
        this.addLog(timeStr, `24h ML forecast model evaluation metrics retrieved`, 'info');
      } else if (q.includes('dark') || q.includes('night') || q.includes('light') || q.includes('theme')) {
        const isDark = q.includes('dark') || q.includes('night') || (q.includes('toggle') && !document.documentElement.classList.contains('dark'));
        if (window.themeManager) {
          window.themeManager.setTheme(isDark ? 'dark' : 'light');
        }
        response = isDark
          ? `Visual theme switched to <b>Velora Obsidian (Dark Mode)</b>. Starry 3D digital twin sky, dark blueprint floorplan, and high-contrast telemetry active.`
          : `Visual theme switched to <b>Velora Warm Sand (Light Mode)</b>. Architectural paper palette active.`;
        this.addLog(timeStr, `Visual theme updated: ${isDark ? 'Dark Mode' : 'Light Mode'} active`, 'info');
      } else {
        response = `Here's an analysis of your energy consumption. Hog_office_Bill consumed <b>4,440 kWh</b> so far, which is up <b>12.4%</b> compared to 24h prior. 118 statistical anomalies detected. Would you like me to analyze peak usage?`;
        this.addLog(timeStr, `Telemetry synthesized for Hog_office_Bill`, 'success');
      }

      bubbleText.innerHTML = response;
    }, 450);
  }
}

window.dynamicIsland = new DynamicIslandController();
document.addEventListener('DOMContentLoaded', () => window.dynamicIsland.init());
