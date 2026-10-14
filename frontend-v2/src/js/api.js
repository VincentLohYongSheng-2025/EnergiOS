/**
 * EnergiOS Backend API Client
 * Connects directly to FastAPI endpoints:
 *   - GET /health
 *   - GET /assets
 *   - GET /assets/{asset_id}/readings
 *   - GET /assets/{asset_id}/forecast
 *   - GET /assets/{asset_id}/anomalies
 * Gracefully handles latency tracking, active endpoint configuration, and fallback data.
 */

class EnergiOSApiClient {
  constructor() {
    this.defaultBaseUrl = 'https://energios-backend.vercel.app';
    this.baseUrl = localStorage.getItem('energios_api_base') || this.defaultBaseUrl;
    this.status = {
      isLive: false,
      lastPingMs: null,
      lastChecked: null,
      usingFallback: false,
      error: null,
    };
    this.fallbackData = window.ENERGIOS_BDG2_DATA || null;
  }

  setBaseUrl(url) {
    this.baseUrl = url.trim().replace(/\/$/, '');
    localStorage.setItem('energios_api_base', this.baseUrl);
    return this.checkHealth();
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async checkHealth() {
    const t0 = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      const t1 = performance.now();

      if (res.ok) {
        const data = await res.json();
        this.status.isLive = data.status === 'ok';
        this.status.lastPingMs = Math.round(t1 - t0);
        this.status.lastChecked = new Date();
        this.status.usingFallback = false;
        this.status.error = null;
        return { ok: true, latencyMs: this.status.lastPingMs, data };
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      this.status.isLive = false;
      this.status.lastPingMs = null;
      this.status.lastChecked = new Date();
      this.status.usingFallback = true;
      this.status.error = err.message;
      return { ok: false, error: err.message, usingFallback: true };
    }
  }

  async getAssets() {
    try {
      const res = await fetch(`${this.baseUrl}/assets?limit=20`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.status.isLive = true;
      this.status.usingFallback = false;
      return data;
    } catch (err) {
      console.warn('[EnergiOS API] /assets failed, using verified BDG2 benchmark snapshot:', err.message);
      this.status.usingFallback = true;
      if (this.fallbackData && this.fallbackData.assets) {
        return this.fallbackData.assets;
      }
      throw err;
    }
  }

  async getReadings(assetId, options = {}) {
    const limit = options.limit || 168;
    let url = `${this.baseUrl}/assets/${assetId}/readings?limit=${limit}`;
    if (options.from && options.to) {
      url += `&from=${encodeURIComponent(options.from)}&to=${encodeURIComponent(options.to)}`;
    }

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.status.isLive = true;
      this.status.usingFallback = false;
      return data;
    } catch (err) {
      console.warn(`[EnergiOS API] /readings failed for ${assetId}, falling back to snapshot:`, err.message);
      this.status.usingFallback = true;
      const building = this.findFallbackBuilding(assetId);
      if (building && building.readings) {
        const sliced = { ...building.readings };
        if (limit && sliced.items) {
          sliced.items = sliced.items.slice(-limit);
          sliced.count = sliced.items.length;
        }
        return sliced;
      }
      throw err;
    }
  }

  async getForecast(assetId) {
    try {
      const res = await fetch(`${this.baseUrl}/assets/${assetId}/forecast`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.status.isLive = true;
      this.status.usingFallback = false;
      return data;
    } catch (err) {
      console.warn(`[EnergiOS API] /forecast failed for ${assetId}, falling back to snapshot:`, err.message);
      this.status.usingFallback = true;
      const building = this.findFallbackBuilding(assetId);
      if (building && building.forecast) {
        return building.forecast;
      }
      throw err;
    }
  }

  async getAnomalies(assetId, options = {}) {
    const limit = options.limit || 100;
    let url = `${this.baseUrl}/assets/${assetId}/anomalies?limit=${limit}`;
    if (options.from && options.to) {
      url += `&from=${encodeURIComponent(options.from)}&to=${encodeURIComponent(options.to)}`;
    }

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.status.isLive = true;
      this.status.usingFallback = false;
      return data;
    } catch (err) {
      console.warn(`[EnergiOS API] /anomalies failed for ${assetId}, falling back to snapshot:`, err.message);
      this.status.usingFallback = true;
      const building = this.findFallbackBuilding(assetId);
      if (building && building.anomalies) {
        const sliced = { ...building.anomalies };
        if (limit && sliced.items) {
          sliced.items = sliced.items.slice(0, limit);
        }
        return sliced;
      }
      throw err;
    }
  }

  findFallbackBuilding(assetId) {
    if (!this.fallbackData || !this.fallbackData.buildings) return null;
    for (const key of Object.keys(this.fallbackData.buildings)) {
      const b = this.fallbackData.buildings[key];
      if (b.asset && b.asset.id === assetId) return b;
    }
    return null;
  }

  // Pre-load snapshot data for fast comparison chart across all 4 buildings
  getAllBuildingsSnapshot() {
    if (this.fallbackData && this.fallbackData.buildings) {
      return this.fallbackData.buildings;
    }
    return {};
  }
}

window.apiClient = new EnergiOSApiClient();
