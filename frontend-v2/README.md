# EnergiOS — Frontend Dashboard (v2)

Modern, Bento-grid energy monitoring, 24-hour ML forecasting, and anomaly detection dashboard for EnergiOS, built with inspiration from modern cleantech designs (Velora / Solario).

## Architecture & Visual Design
- **Bento-Grid Layout:** Rounded cards with subtle shadows, soft warm background (`#F6F5F0`), clean typography (`Outfit`, `Space Grotesk`, `Inter`).
- **Spatial 3D Digital Twin Card:** Features 3D architectural renders for each building (`Hog_office_Bill`, `Hog_education_Donnie`, `Hog_assembly_Dona`, `Hog_lodging_Francisco`), telemetry specs, gross floor area (m²), electricity meter mappings, and interactive spatial zones.
- **Operational Radial Gauge:** Real-time load factor percentage (`Current Demand / Peak Demand`) with baseline statistics.
- **Bento KPI Cards:**
  - **Current Demand:** Latest observed interval kWh with 24-hour trend.
  - **24h Total Energy:** Cumulative sum with hourly average draw.
  - **Forecast Accuracy (MAE):** Model MAE (`22.07 kWh` vs baseline `29.02 kWh`, +23.9% accuracy).
  - **Forecast Accuracy (RMSE):** Model RMSE (`36.69 kWh` vs baseline `53.40 kWh`, +31.3% error reduction).
- **Time-Series Chart:** Historical observed hourly readings (kWh) with continuous handoff to the 24-hour ML forecast curve and flagged anomaly markers.
- **Anomaly Detection Triage Panel:** Filterable list of unusual consumption patterns detected by the backend (`above_expected` / `below_expected`) with "Locate on Chart" navigation. Strictly compliant with PRD rules: labeled `unusual_consumption_pattern` without unsubstantiated HVAC or waste claims.
- **4-Building Benchmark Comparison:** Side-by-side comparison across all 4 BDG2 buildings with toggle between Demand (kWh) and Energy Use Intensity (EUI in Wh/m²).

## Live Backend API Integration
The dashboard connects directly to the live backend at `https://energios-backend.vercel.app` (or local `http://127.0.0.1:8000`):
- `GET /health` — Application health & liveness.
- `GET /assets` — Catalogue of 4 BDG2 whole-building assets.
- `GET /assets/{asset_id}/readings?limit=168` — Historical observed hourly interval-kWh readings.
- `GET /assets/{asset_id}/forecast` — 24-hour multi-step forecast with model evaluation metrics.
- `GET /assets/{asset_id}/anomalies?limit=100` — Statistical unusual pattern detections via validation MAD threshold.

### Zero-Breakage Offline Redundancy
If the remote backend is sleeping, offline, or restricted by browser CORS policies, the dashboard automatically activates the verified BDG2 public benchmark snapshot (`src/data/bdg2_data.js`), ensuring zero broken UI states while tracking latency and status in the header.

## How to Run Locally

You can serve the directory using Python's built-in HTTP server:

```bash
cd frontend-v2
python3 -m http.server 3000
```

Then open `http://127.0.0.1:3000` in your web browser.
