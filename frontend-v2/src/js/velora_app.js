/**
 * EnergiOS - Exact 1:1 Inspiration Layout with Real Project Telemetry
 * Binds live BDG2 API readings, 24-hour ML forecasts, and statistical anomalies
 * into the 100% exact visual design of idea-02-light.jpeg.
 */

class EnergiOSDashboard {
  constructor() {
    this.state = {
      activeTimeframe: 'Hourly', // 'Hourly', 'Daily', 'Monthly'
      activeBuildingId: null,
      assets: [],
      currentBuilding: null,
      readings: null,
      forecast: null,
      anomalies: null,
    };
    this.energyChart = null;

    // Building image mapping
    this.buildingImages = {
      Hog_office_Bill: 'assets/idea_crops/exact_building_perfect.jpeg',
      Hog_education_Donnie: 'assets/buildings/Hog_education_Donnie.jpg',
      Hog_assembly_Dona: 'assets/buildings/Hog_assembly_Dona.jpg',
      Hog_lodging_Francisco: 'assets/buildings/Hog_lodging_Francisco.jpg',
    };
  }

  async init() {
    console.log('[EnergiOS] Initializing dashboard with project readings...');
    this.renderPowerDialTicks();
    this.setupEventListeners();
    await this.loadData();
  }

  /**
   * Render the 42 radial tick marks around the Power dial (speedometer style from idea-02)
   */
  renderPowerDialTicks(currentKwh = 0, maxKwh = 1) {
    const container = document.getElementById('power-dial-ticks');
    if (!container) return;

    const totalTicks = 42;
    const radius = 58;
    const cx = 70;
    const cy = 70;
    let svgContent = '';

    const ratio = Math.min(1, Math.max(0.05, currentKwh / (maxKwh || 1)));
    const filledTicks = Math.round(ratio * totalTicks);

    for (let i = 0; i < totalTicks; i++) {
      const angleDeg = 135 + (i / (totalTicks - 1)) * 270;
      const angleRad = (angleDeg * Math.PI) / 180;

      const innerX = cx + (radius - 8) * Math.cos(angleRad);
      const innerY = cy + (radius - 8) * Math.sin(angleRad);
      const outerX = cx + radius * Math.cos(angleRad);
      const outerY = cy + radius * Math.sin(angleRad);

      const isFilled = i <= filledTicks;
      const strokeColor = isFilled ? '#FF7A00' : '#E2E8F0';
      const strokeWidth = i % 5 === 0 ? 2 : 1.2;

      svgContent += `<line x1="${innerX.toFixed(1)}" y1="${innerY.toFixed(1)}" x2="${outerX.toFixed(1)}" y2="${outerY.toFixed(1)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
    }

    container.innerHTML = svgContent;
  }

  async loadData() {
    try {
      const assetsData = await window.apiClient.getAssets();
      this.state.assets = assetsData.items || [];
      if (this.state.assets.length === 0) {
        throw new Error('The live API returned no BDG2 benchmark assets.');
      }
      this.state.activeBuildingId = this.state.assets[0].id;
      this.renderBuildingPicker();
      await this.selectBuilding(this.state.activeBuildingId);
    } catch (err) {
      console.error('[EnergiOS] Live API data unavailable:', err);
      this.renderDataError(err.message);
    }
  }

  renderDataError(message) {
    const container = document.getElementById('building-picker-container');
    if (container) {
      container.innerHTML = '<span class="text-xs text-rose-700">Live BDG2 data unavailable. Retry by refreshing the page.</span>';
    }
    this.showToast(message || 'Live BDG2 data is temporarily unavailable.');
  }

  renderBuildingPicker() {
    const container = document.getElementById('building-picker-container');
    if (!container) return;

    container.innerHTML = this.state.assets.map((asset) => {
      const isSelected = asset.id === this.state.activeBuildingId;
      const cleanName = asset.name.replace('Hog_', '').replace('_', ' ');
      return `
        <button onclick="veloraApp.selectBuilding('${asset.id}')" class="px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
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
    if (!this.state.assets.some((asset) => asset.id === assetId)) {
      this.renderDataError('The selected asset is not available from the live API.');
      return;
    }
    this.state.activeBuildingId = assetId;
    this.renderBuildingPicker();

    try {
      const asset = this.state.assets.find((a) => a.id === assetId) || this.state.assets[0];
      this.state.currentBuilding = asset;

      // Update building photo
      const imgEl = document.getElementById('hero-building-photo');
      if (imgEl) {
        const imgSrc = this.buildingImages[asset.name] || 'assets/idea_crops/exact_building_perfect.jpeg';
        imgEl.src = imgSrc;
      }

      // Fetch real project data concurrently
      const [readings, forecast, anomalies] = await Promise.all([
        window.apiClient.getReadings(assetId, { limit: 168 }),
        window.apiClient.getForecast(assetId),
        window.apiClient.getAnomalies(assetId, { limit: 100 }),
      ]);

      this.state.readings = readings;
      this.state.forecast = forecast;
      this.state.anomalies = anomalies;

      // Update Header Subtitle Tag
      const subEl = document.getElementById('site-subtitle-tag');
      if (subEl) {
        subEl.textContent = `// PUBLIC BENCHMARK DATA · BDG2 V1.0 · ${asset.name.toUpperCase()} · WHOLE-BUILDING METER`;
      }

      // Update all project readings
      this.updateProjectReadings();

      // Render Energy Overview Time-Series Chart
      this.renderEnergyOverviewChart();

      // Update 24-cell forecast heatmap
      this.renderForecastHeatmap();
    } catch (err) {
      console.error('[EnergiOS] Error updating building data:', err);
    }
  }

  updateProjectReadings() {
    const readings = this.state.readings?.items || [];
    const forecast = this.state.forecast || {};
    const anomalies = this.state.anomalies?.items || [];
    const anomalyCount = this.state.anomalies?.count ?? anomalies.length;
    const testMetrics = forecast.test_metrics || {};

    if (readings.length === 0) return;

    // 1. Latest Reading & 24h Sum
    const recent24 = readings.slice(-24);
    const latestReading = recent24[recent24.length - 1];
    const prevDayReading = readings.length > 24 ? readings[readings.length - 25] : readings[0];
    const sum24h = recent24.reduce((acc, r) => acc + r.consumption_kwh, 0);

    // Delta vs previous day
    const delta = latestReading.consumption_kwh - prevDayReading.consumption_kwh;
    const deltaPct = ((delta / (prevDayReading.consumption_kwh || 1)) * 100).toFixed(1);
    const isHigher = delta >= 0;

    // 1. HERO METRIC 1: Total 24h Observed Energy
    const valTotalEl = document.getElementById('metric-total-val');
    const deltaTotalEl = document.getElementById('metric-total-delta');
    if (valTotalEl) valTotalEl.textContent = Math.round(sum24h).toLocaleString();
    if (deltaTotalEl) {
      deltaTotalEl.textContent = `${isHigher ? '+' : ''}${deltaPct}% vs 24h prior`;
      deltaTotalEl.className = `text-xs font-semibold ${isHigher ? 'text-[#FF7A00]' : 'text-[#22C55E]'} mt-1 block`;
    }

    // 2. HERO METRIC 2: Current Demand (kWh)
    const valCurrentEl = document.getElementById('metric-current-val');
    const statusCurrentEl = document.getElementById('metric-current-status');
    if (valCurrentEl) valCurrentEl.textContent = latestReading.consumption_kwh.toFixed(1);
    if (statusCurrentEl) statusCurrentEl.textContent = 'Observed interval';

    // 3. HERO METRIC 3: Forecast Accuracy (MAE kWh)
    const valExportEl = document.getElementById('metric-export-val');
    const deltaExportEl = document.getElementById('metric-export-delta');
    if (testMetrics.model) {
      const modelMae = testMetrics.model.mae_kwh;
      if (valExportEl) valExportEl.textContent = modelMae.toFixed(2);
      if (deltaExportEl) {
        if (testMetrics.baseline?.mae_kwh) {
          const baselineMae = testMetrics.baseline.mae_kwh;
          const gainPct = (((baselineMae - modelMae) / baselineMae) * 100).toFixed(1);
          deltaExportEl.textContent = `${Number(gainPct) >= 0 ? '+' : ''}${gainPct}% vs Baseline`;
        } else {
          deltaExportEl.textContent = 'Calculated forecast output';
        }
      }
    }

    // 4. POWER DIAL GAUGE
    const dialValEl = document.getElementById('dial-power-val');
    const minValEl = document.getElementById('dial-min-val');
    const maxValEl = document.getElementById('dial-max-val');
    const avgValEl = document.getElementById('dial-avg-val');

    const minKwh = Math.min(...recent24.map((r) => r.consumption_kwh));
    const maxKwh = Math.max(...recent24.map((r) => r.consumption_kwh));
    const avgKwh = sum24h / recent24.length;

    if (dialValEl) dialValEl.textContent = latestReading.consumption_kwh.toFixed(1);
    if (minValEl) minValEl.textContent = `${minKwh.toFixed(1)} kWh`;
    if (maxValEl) maxValEl.textContent = `${maxKwh.toFixed(1)} kWh`;
    if (avgValEl) avgValEl.textContent = `${avgKwh.toFixed(1)} kWh`;

    // Re-render ticks dynamically to match this building's demand ratio
    this.renderPowerDialTicks(latestReading.consumption_kwh, maxKwh);

    // 5. LOAD & EFFICIENCY CARD (Replaces Battery)
    const loadFactor = Math.min(100, Math.round((latestReading.consumption_kwh / (maxKwh || 1)) * 100));
    const batteryPctEl = document.getElementById('battery-pct-val');
    if (batteryPctEl) batteryPctEl.textContent = `${loadFactor}%`;

    const floorArea = this.state.currentBuilding?.floor_area_m2;
    const dailyEui = floorArea ? (sum24h / floorArea).toFixed(2) : null;

    const barEnergyValEl = document.getElementById('bar-energy-val');
    const barConsumingValEl = document.getElementById('bar-consuming-val');
    const barTempValEl = document.getElementById('bar-temp-val');

    if (barEnergyValEl) barEnergyValEl.textContent = `${latestReading.consumption_kwh.toFixed(1)} / ${maxKwh.toFixed(1)} kWh`;
    if (barConsumingValEl) barConsumingValEl.textContent = dailyEui ? `${dailyEui} kWh/m² · 24h` : 'Area unavailable';
    const modelMae = testMetrics.model ? testMetrics.model.mae_kwh.toFixed(2) : null;
    if (barTempValEl) barTempValEl.textContent = modelMae ? `MAE ${modelMae} kWh` : 'Metric unavailable';

    // Progress bar widths
    const barEnergyEl = document.getElementById('progress-bar-energy');
    const barConsumingEl = document.getElementById('progress-bar-consuming');
    const barTempEl = document.getElementById('progress-bar-temp');

    if (barEnergyEl) barEnergyEl.style.width = `${loadFactor}%`;
    if (barConsumingEl) barConsumingEl.style.width = dailyEui ? `${Math.min(100, Math.round((parseFloat(dailyEui) / 0.5) * 100))}%` : '0%';
    if (barTempEl) barTempEl.style.width = modelMae ? `${Math.min(100, Math.round((parseFloat(modelMae) / (avgKwh || 1)) * 120))}%` : '0%';

    // 6. ANOMALY ALERTS CARD
    const alertsCountEl = document.getElementById('alerts-count-tag');
    if (alertsCountEl) alertsCountEl.textContent = `${anomalyCount} Flags`;

    const costEl = document.getElementById('impact-cost-val');
    const carbonEl = document.getElementById('impact-carbon-val');
    const euiEl = document.getElementById('impact-eui-val');

    if (costEl) costEl.textContent = 'Unavailable — no approved tariff';
    if (carbonEl) carbonEl.textContent = 'Unavailable — no approved factor';
    if (euiEl) euiEl.textContent = dailyEui ? `${dailyEui} kWh/m² · 24h` : 'Area unavailable';
  }

  renderEnergyOverviewChart() {
    const ctx = document.getElementById('energy-overview-chart');
    if (!ctx) return;

    if (this.energyChart) {
      this.energyChart.destroy();
    }

    const readings = this.state.readings?.items || [];
    const forecasts = this.state.forecast?.items || [];
    const activeReadings = readings.slice(-24);
    const activeForecasts = forecasts.slice(0, 24);
    const chartLabels = [...activeReadings, ...activeForecasts].map((item) =>
      new Date(item.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', hour12: true,
      })
    );
    const chartObserved = [
      ...activeReadings.map((item) => Number(item.consumption_kwh.toFixed(1))),
      ...activeForecasts.map(() => null),
    ];
    const chartForecast = [
      ...activeReadings.map(() => null),
      ...activeForecasts.map((item) => Number(item.forecast_kwh.toFixed(1))),
    ];
    const yUnit = 'kWh';

    this.energyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: `Observed History (${yUnit})`,
            data: chartObserved,
            borderColor: '#FF7A00', // Burnt orange from idea-02
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            tension: 0.42,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FF7A00',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 2,
          },
          {
            label: `Forecast (${yUnit})`,
            data: chartForecast,
            borderColor: '#FACC15', // Bright yellow from idea-02
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            tension: 0.42,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FACC15',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(30, 32, 34, 0.94)',
            titleFont: { size: 11, family: 'Inter' },
            bodyFont: { size: 12, family: 'Inter' },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              label: function (c) {
                return ` ${c.dataset.label}: ${Number(c.raw).toFixed(1)} ${yUnit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: '#9CA3AF',
              font: { size: 11, family: 'Inter' },
            },
          },
          y: {
            ticks: {
              color: '#9CA3AF',
              font: { size: 11, family: 'Inter' },
              callback: function (val) {
                return val + ' ' + yUnit;
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.04)',
              drawBorder: false,
            },
          },
        },
      },
    });
  }

  renderForecastHeatmap() {
    const forecasts = this.state.forecast?.items || [];
    const containerA = document.getElementById('heatmap-row-a');
    const containerB = document.getElementById('heatmap-row-b');
    if (!containerA || !containerB) return;

    // Split 24 forecast hours into Row AM (hours 1-12) and Row PM (hours 13-24)
    const rowA = forecasts.slice(0, 12);
    const rowB = forecasts.slice(12, 24);

    const maxFc = Math.max(...forecasts.map((f) => f.forecast_kwh), 1);

    const renderCells = (items, startHour) => items.map((item, idx) => {
      const hourNum = startHour + idx;
      const kwh = item.forecast_kwh;
      const ratio = kwh / maxFc;
      // Hour 5 is highlighted as active midday peak as in idea-02
      const isPeak = hourNum === 5 || ratio > 0.88;
      const bgClass = isPeak
        ? 'bg-[#FF7A00] shadow-sm shadow-orange-500/30'
        : (ratio > 0.65 ? 'bg-[#FACC15]' : 'bg-[#FEF08A]');
      return `<div class="heatmap-cell ${bgClass} cursor-pointer transition-transform hover:scale-110" title="Hour +${hourNum}: ${kwh.toFixed(1)} kWh ML forecast"></div>`;
    }).join('');

    containerA.innerHTML = renderCells(rowA, 1);
    containerB.innerHTML = renderCells(rowB, 13);
  }

  setTimeframe(tab) {
    if (tab !== 'Hourly') {
      this.showToast('Daily and monthly views are unavailable for this bounded live API response.');
      return;
    }
    this.state.activeTimeframe = 'Hourly';
    document.querySelectorAll('.timeframe-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.timeframe === tab);
    });
    this.renderEnergyOverviewChart();
    this.showToast(`View updated to ${tab} telemetry`);
  }

  openAlertDetails() {
    const modal = document.getElementById('velora-alert-modal');
    const listEl = document.getElementById('modal-anomalies-list');
    if (modal) modal.classList.remove('hidden');

    const anomalies = this.state.anomalies?.items || [];
    if (listEl) {
      if (anomalies.length === 0) {
        listEl.innerHTML = `
          <div class="p-4 text-center text-slate-400 text-xs">
            No unusual consumption patterns were detected for this asset and selected period.<br>
            <span class="mt-2 inline-block">This is not proof that the building has no inefficiency.</span>
          </div>
        `;
        return;
      }

      listEl.innerHTML = anomalies.slice(0, 15).map((a) => {
        const isAbove = a.direction === 'above_expected';
        const d = new Date(a.timestamp);
        const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="p-3 rounded-xl ${isAbove ? 'bg-orange-50 border border-orange-100' : 'bg-blue-50 border border-blue-100'} text-[#1E2022]">
            <div class="flex justify-between font-bold ${isAbove ? 'text-orange-800' : 'text-blue-800'}">
              <span>${isAbove ? 'Above Expected' : 'Below Expected'} Flag</span>
              <span class="font-mono text-[11px]">${timeStr}</span>
            </div>
            <p class="text-[11px] mt-1 text-slate-700">
              Observed: <span class="font-bold">${a.observed_kwh.toFixed(1)} kWh</span> vs Expected: <span class="font-bold">${a.forecast_kwh.toFixed(1)} kWh</span> (Δ ${a.residual_kwh.toFixed(1)} kWh).
            </p>
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

  setupEventListeners() {
    const alertCard = document.getElementById('alerts-card-trigger');
    if (alertCard) {
      alertCard.onclick = () => this.openAlertDetails();
    }

    window.addEventListener('energios:theme-changed', () => {
      if (this.energyChart && this.energyChart.options && this.energyChart.options.scales) {
        const colors = window.getChartThemeColors ? window.getChartThemeColors() : null;
        if (colors) {
          if (this.energyChart.options.scales.x) this.energyChart.options.scales.x.ticks.color = colors.textColor;
          if (this.energyChart.options.scales.y) {
            this.energyChart.options.scales.y.grid.color = colors.gridColor;
            this.energyChart.options.scales.y.ticks.color = colors.textColor;
          }
          this.energyChart.update();
        }
      }
    });
  }
}

window.veloraApp = new EnergiOSDashboard();
document.addEventListener('DOMContentLoaded', () => window.veloraApp.init());
