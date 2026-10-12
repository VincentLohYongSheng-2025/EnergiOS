# EnergiOS — Product Requirements Document

**Version:** 1.0 planning baseline · **Date:** 13 October 2026 (Malaysia)  
**Theme:** Sime Darby Property University Hackathon 2026 — PLANET / Energy Efficiency  
**Release target:** Working prototype and 5-minute demo for the 23 October 2026, 11:59 p.m. submission  
**Status:** Design decisions for a prototype, not claims about Sime Darby Property's internal systems

## 1. Product decision

EnergiOS is a **township energy opportunity workflow**: ingest available meter readings, identify a potentially avoidable consumption pattern, show where it occurred, compare a practical intervention, and record the basis of the estimated benefit. The prototype focuses on **one managed commercial building with an after-hours HVAC-related anomaly**. A small set of other synthetic assets makes the township map and portfolio comparison meaningful.

This is not a claim that Sime Darby Property has no centralised energy platform. Its 2025 Sustainability Report describes a centralised digital platform for portfolio energy monitoring and also identifies visibility limitations for some assets. The **specific gap in floor-level integration and operational actionability is a hypothesis to validate** with an asset/facilities team. No real Sime Darby meter data or internal integration is assumed available.

**Problem statement:** Energy data gaps make township-wide savings harder to unlock. Incomplete visibility across certain properties can make it harder to find inefficiencies, compare interventions and realise potential electricity savings.

**Product promise:** Given authorised, sufficiently granular data, EnergiOS helps an operator move from an unusual reading to a traceable, human-approved efficiency action and an honest savings estimate.

## 2. User, job and success

**Primary user:** Facilities/energy operator responsible for monitoring managed assets. **Secondary user:** Asset/sustainability manager who prioritises investments. These are proposed users; interviews and access rights remain to be validated.

**Core job:** “Which monitored building or floor needs investigation, what evidence supports the alert, and is a proposed action worth taking?”

The demonstrable journey is:

1. Operator sees a map with four **fictional, clearly labelled demo assets** and a recent alert.
2. Operator selects the commercial building and inspects a 3D floor view. Floor-level readings are displayed **only for floors with synthetic submeters**; the 3D geometry is a navigation aid, not a physically accurate energy model.
3. Backend flags after-hours consumption above a comparable historical baseline and shows observed kWh, expected kWh, time window, and data provenance. It does **not** assert that HVAC caused it.
4. Operator opens a proposed “review HVAC schedule” scenario. The interface shows editable assumptions, potential kWh/RM/CO₂e savings, and any implementation cost or payback where applicable.
5. Manager reviews the proposal; the public demo leaves the alert open. Optional acknowledgement requires authorised backend access. No equipment setting is changed by the product. “Post-action measured savings” remains unavailable until actual subsequent data and a defensible adjusted baseline exist.

**Prototype success gates:** The entire journey works against deployed API responses; one seeded anomaly is reproducibly detected; the frontend can distinguish observed data from assumed savings; the prototype/code link and a 5-minute demo are ready for submission. Scores or savings are **not** claimed as validated corporate results.

## 3. Scope and priorities

| Priority | Capability | Acceptance condition |
| --- | --- | --- |
| P0 | Asset and meter catalogue | Four demo assets appear; one commercial building has three explicitly metered floors. |
| P0 | Energy ingestion and history | Deterministic synthetic hourly kWh readings are stored with timestamps, units and provenance; duplicate meter/time writes are handled safely. |
| P0 | Portfolio and floor summaries | Backend returns per-asset totals without counting building and floor meters twice; UI can drill into a metered floor. |
| P0 | Reproducible anomaly and alert | One seeded after-hours event generates one deduplicated alert with comparison window, baseline and evidence. |
| P0 | Action and savings preview | One public, stateless and bounded HVAC schedule calculation for synthetic data produces transparent calculations and “estimated, not verified” labels; no privileged key enters the browser. |
| P0 | Frontend API contract and deployment | Documented JSON responses, `/docs`, deployed health check and end-to-end frontend smoke test. |
| P1 | Short-horizon energy forecast | 24-hour hourly kWh forecast with comparison against a seasonal-naive baseline and error reported on a holdout; no model-accuracy claim if validation fails. |
| P1 | Protected scenario storage and alert acknowledgement | A backend-authorised operator can save a scenario and mark an alert acknowledged; neither mutation is required for the public demo. |
| P2 | Solar/lighting investment comparison | Only if P0/P1 work; solar is separately labelled **supply substitution**, not energy-efficiency savings. |
| P2 | LLM explanation or multi-agent review | Not required for release. Never allow generated text to invent a cause, tariff, factor or savings number. |

**Explicitly out of scope for this prototype:** Real household/TNB/BMS connections, live control of HVAC, exact site coordinates, real-time guarantees, autonomous remediation, authenticated corporate production use, proven RM-million savings, and verified post-intervention savings. No invisible fallback to invented readings when the database is unavailable.

## 4. Locked technical choices

- **Backend:** Python 3.12, FastAPI and Pydantic; one stateless ASGI app. Its source will live at `backend/app.py` exporting `app = FastAPI(...)`.
- **Persistence:** Supabase PostgreSQL; the backend is the sole database-facing application component for this prototype. Use the official Python client or another documented, pinned Postgres access path; do not mix two persistence strategies casually.
- **Analytics:** NumPy/Pandas and scikit-learn **only where a tested model beats or usefully supplements a simple baseline**. Deterministic formulas/rules own billing, carbon and initial alert logic. Do not run model training in a normal GET request.
- **Hosting:** Two Vercel projects linked to one repository, with `backend/` and `frontend/` configured as their respective project Root Directories. The frontend calls the deployed backend base URL. This keeps Python dependency builds separate from the React/Three.js build. Both remain on Vercel; no Render/Railway is required.
- **UI:** The frontend team chooses its React build framework; Three.js renders the visual drill-down. The backend returns data and identifiers, not 3D meshes.
- **Updates:** The frontend polls a small alerts/summary endpoint for the demo or refreshes on interaction. There is no persistent in-process polling worker or WebSocket requirement.

Vercel documents FastAPI as a single Function with supported entrypoints, including root `app.py`. The backend must be tested on a Vercel preview before the deployment architecture is treated as proven. Keep libraries and payloads small; check function build, cold-start latency, and the current Hobby limits before any expansion.

## 5. Data contract

All timestamps are UTC ISO 8601 (`...Z`), displayed in `Asia/Kuala_Lumpur` in the UI. Energy readings are **interval energy in kWh**, not instantaneous kW. Money is MYR. Display no false precision: kWh to one decimal and estimates to sensible rounded MYR.

| Table | Essential fields and rules |
| --- | --- |
| `assets` | `id`, `name`, `asset_type`, optional **schematic** map coordinates, `floor_area_m2`, `timezone`, `data_status`; fictional labels and non-real map positions. |
| `meters` | `id`, `asset_id`, `floor_label` nullable, `meter_role` (`building_total` or `floor`), `source_kind`, `is_active`. A floor can have a measured value only with an associated meter. |
| `energy_readings` | `meter_id`, `recorded_at`, `interval_minutes=60`, `consumption_kwh >= 0`, `provenance='synthetic_demo'`; unique (`meter_id`, `recorded_at`). |
| `alerts` | `id`, `meter_id`, `window_start`, `window_end`, `observed_kwh`, `baseline_kwh`, `rule_code`, `severity`, `status`, `evidence_json`, `created_at`; unique key for meter/window/rule so re-analysis does not duplicate. |
| `scenarios` | P1 storage: `id`, `asset_id`, optional `alert_id`, `action_code`, `assumptions_json`, `results_json`, `created_at`; label all stored results as estimates. P0 preview is stateless. |

**Aggregation rule:** If an asset has an authoritative `building_total` meter, use it for asset-level consumption; floor meters are diagnostic breakdowns and are not added to that total. If it has only floor meters, their sum may be used and labelled “sum of available metered floors,” not “complete building total.” Missing periods stay missing, not zero. The seed generator should make building and floor readings internally consistent.

**Synthetic seed:** Fixed random seed and a recorded generator version, about four weeks of hourly readings for four assets; three metered floors for the focus building; one deliberate after-hours anomaly. Realistic-looking values are still fictional. Seed only an appropriately sized subset for the demo and verify the free database capacity. Keep a manifest of asset names, meter IDs, anomaly interval and expected alert.

## 6. API contract, version 1

All responses use stable IDs, units and provenance. Validation errors are ordinary 4xx responses; database failures return a clear 5xx rather than fabricated data. List endpoints paginate or cap their time range and row count. Backend owns `/v1` paths; the frontend receives its base URL through an environment variable.

| Method/path | Output or purpose | Access |
| --- | --- | --- |
| `GET /health` | `{ "status": "ok", "version": "1" }`; separate DB check may report unavailable. | Public |
| `GET /v1/assets` | Asset IDs, names, types, schematic map positions, latest status. | Public **synthetic demo only** |
| `GET /v1/assets/{id}/summary` | Timestamped asset total kWh, provenance, completeness and metered-floor summary. | Public demo |
| `GET /v1/assets/{id}/readings?from=...&to=...&meter_id=...` | Bounded hourly `{ recorded_at, consumption_kwh, meter_id, provenance }` series. | Public demo |
| `GET /v1/alerts` | Active/recent alerts with asset and meter IDs, severity, observed/baseline kWh and status. | Public demo |
| `POST /v1/readings` | Validated batch ingestion; upsert by meter/time, return accepted/duplicate/rejected counts. | Protected admin token |
| `POST /v1/analysis/run` | Analyse a specified bounded asset/time window, persist deduplicated alerts and return findings. | Protected admin token |
| `POST /v1/scenarios/preview` | Validate small, bounded synthetic-data assumptions; calculate without writing; return every input, formula output and caveat. | Public demo |
| `POST /v1/scenarios` | P1: calculate and store an authorised scenario using the same validated calculator. | Protected admin token |
| `PATCH /v1/alerts/{id}` | Change status from `open` to `acknowledged` with timestamp. | Protected admin token |
| `GET /v1/assets/{id}/forecast` | P1: 24 hourly predictions, method, train/test period and holdout metric, or an explicit `insufficient_data` response. | Public demo |

**Example alert shape (fields, not real results):**

```json
{
  "id": "alert-uuid",
  "asset_id": "asset-uuid",
  "meter_id": "meter-uuid",
  "window_start": "2026-10-08T12:00:00Z",
  "window_end": "2026-10-08T13:00:00Z",
  "observed_kwh": 120.0,
  "baseline_kwh": 60.0,
  "rule_code": "AFTER_HOURS_EXCESS",
  "status": "open",
  "provenance": "synthetic_demo",
  "interpretation": "Unusual after-hours use; investigate HVAC schedule. Cause not confirmed."
}
```

The exact example numbers are illustrative. IDs and expected readings must come from the committed seed manifest once built. Do not write frontend components against an invented endpoint or field: generate/OpenAPI-check the backend contract first.

## 7. Analytics and financial rules

**Alert P0:** Compare an hourly reading with the median of comparable hours on prior days of the same operating category, excluding the alert hour. Require a minimum comparison sample and explicit after-hours schedule. Trigger only if both an absolute excess and a configurable relative threshold are exceeded; store the thresholds and sample count in `evidence_json`. Test normal, missing, duplicate, and anomalous data. An anomaly is a prompt to investigate, **not proof of waste or HVAC causation**.

**Forecast P1:** First compute a seasonal-naive same-hour reference; evaluate an optional simple scikit-learn model on a chronological holdout against that reference (for example MAE in kWh). Serve the simpler approach if the trained model adds no supported value. A four-week synthetic set demonstrates the pipeline, not generalisable predictive performance; label it accordingly.

**Scenario P0:** `potential_kwh_saved = affected_hours × estimated_avoidable_kwh_per_hour × realisation_fraction`, bounded between zero and relevant baseline consumption. `potential_RM_saved = potential_kwh_saved × assumed_effective_RM_per_kwh`. `potential_kgCO2e_avoided = potential_kwh_saved × assumed_grid_kgCO2e_per_kwh`. Simple payback in years applies only when one-time cost > 0 and positive annual net savings are defined; otherwise `null`/“not applicable.” Return the tariff and emissions-factor **input, unit, source/date if known, and assumption label**. Never silently hard-code a Sime Darby tariff or government emissions factor. Solar outputs must separate reduced grid purchases from reduced total energy use.

**No verified savings claim:** A post-action measurement module is future work unless there is real intervention and post-period data with weather/operating adjustments. Demo “after” curves may be shown only as simulated scenarios.

## 8. Safety, operations and honest demo labels

- Synthetic-only public endpoints, including the stateless scenario preview, are permitted for an open hackathon link. Bound preview input size and numeric ranges and use platform rate protections if needed. Any move to real asset, tenant or household data requires access approval, stronger authentication/authorisation, minimisation and a privacy review.
- Enable RLS on every exposed Supabase table; do not grant blanket public row access. Keep the Supabase **secret/service credential exclusively in Vercel backend environment variables**. Do not commit `.env` files or expose the credential through frontend-prefixed variables. The app validates its own protected write token and request size; no one can use the public dashboard to mutate readings or alerts.
- CORS allow-list only the known frontend deployment origin(s) and localhost during development. Use HTTPS in deployment. Log failures without secrets or personal data.
- All changes to equipment remain human-approved and outside the prototype. Generated advice, if later added, may explain already computed evidence but may not supply financial inputs or call control endpoints.
- Every demo screen labels source as **Synthetic demonstration data**, and financial/carbon figures as **Assumption-based estimates**. The pitch distinguishes built, simulated, and proposed integrations.

## 9. Questions that require confirmation, not agent invention

1. Which specific Sime Darby managed asset and existing monitoring workflow would a pilot enhance? Is the target integration gap real, and who owns it?
2. Are building/floor submeters, HVAC schedules, operating hours, occupancy and historical meter exports available under authorisation?
3. What tariff structure, baseline method and approved emissions factor should a pilot use? Who approves assumptions?
4. Is the team repository personal or an organisation repository, and can both Vercel projects import it on the chosen plan?
5. Who on the team owns frontend, 3D asset, design, business case, and demo video? Backend scope here should not silently absorb those roles.
6. Vercel Hobby restricts use to non-commercial personal deployments. Because the organiser's briefing describes transfer of submitted IP and possible commercialisation, the team should check the competition terms and ask Vercel whether this particular hackathon demo is eligible for Hobby; do not assume free-tier eligibility for later commercial use.

If an answer is unavailable, keep the corresponding capability explicitly simulated or deferred. **No coding agent may convert an open question into a claimed fact.**

## 10. Sources and authority

- Organiser briefing: uploaded 23-slide ZIP, especially PLANET theme slide, submission requirements, judging slide and IP/terms slide. Submission deadline: **23 October 2026 at 11:59 p.m.** Required: up to 10 main pitch slides, 5-minute video/live demo link, prototype/code/GitHub link.
- [Sime Darby Property Sustainability Report 2025](https://www.simedarbyproperty.com/sites/default/files/2026-04/SDP%20SR2025%20%28Mobile%29.pdf): evidence of existing centralised monitoring and some visibility limitations; **not** evidence that every system is disconnected or millions are lost.
- [Vercel FastAPI deployment](https://vercel.com/docs/frameworks/backend/fastapi), [Python runtime](https://vercel.com/docs/functions/runtimes/python), and [monorepo project roots](https://vercel.com/docs/monorepos): implementation constraints to recheck at build time.
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) and [platform limits](https://vercel.com/docs/limits): Hobby-use and organisation-owned repository caveats.
- [Supabase securing data](https://supabase.com/docs/guides/database/secure-data): RLS and backend-only secret guidance.

**Change control:** This PRD governs the prototype. If the team changes an endpoint, data unit, scope boundary, or deployment topology, update this file, the implementation plan and the frontend contract together before claiming completion.
