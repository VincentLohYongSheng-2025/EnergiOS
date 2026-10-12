# EnergiOS — Two-Day Backend Implementation Plan

**Version:** 1.0 · **Companion:** `EnergiOS_PRD.md` · **Owner:** Backend engineer  
**Goal:** Deploy a working FastAPI service on Vercel, backed by Supabase and connected to the frontend, for one defensible energy-efficiency demonstration. This is a task plan, not an assertion that code already exists.

## Build rule and release gate

Build the vertical slice in this order: **synthetic hourly reading → persisted asset/floor history → reproducible alert → human-readable evidence → assumption-based HVAC scenario → frontend display → deployed live test**. Do not start a multi-agent system or rooftop solar simulator until this slice is complete.

Release gate: a judge can load the Vercel frontend, select a demo building, see its actual API-fed floor readings and alert, inspect the alert evidence, calculate a scenario, and understand which data is simulated and which outputs are estimates. The API and UI must use the same IDs, units, timezone conversion and labels.

## 0. Preflight (first 60–90 minutes)

1. Confirm the shared Git repository, its folder structure and frontend framework with teammates. Use one repo with `backend/` and `frontend/`; if a frontend app exists, preserve its structure. Decide repository ownership and Vercel import access before deployment work. Vercel Hobby currently does **not** import Git-organisation-owned repositories. Also check its non-commercial personal-use rule against the competition's IP/commercialisation terms; ask Vercel Support if eligibility is unclear.
2. Create a Supabase project **for synthetic demo data only**. Record the project URL/secret in a password manager or local env and Vercel settings, not a chat, screenshot or commit. Confirm the free plan's current limits.
3. Create a minimal FastAPI app exporting `app` in `backend/app.py`; include `/health` and `/docs`. Pin Python 3.12 and package versions. Deploy **this tiny app first** as a separate Vercel project whose Root Directory is `backend/`. Test the public `/health` and `/docs` URLs. This is the earliest test of framework detection and Python Function compatibility.
4. Set a frontend Vercel project Root Directory to `frontend/` when the frontend is ready. Set its `VITE_API_BASE_URL` (Vite) or matching framework-specific public API URL. Do not assume the variable name until the frontend framework is confirmed.
5. Agree on the `/v1` JSON contract in the PRD and provide the actual deployed backend URL plus one sample response to the frontend teammate. Any change is communicated and documented.

**Stop condition:** If a minimal FastAPI deployment fails, resolve the Vercel build error before adding database or ML libraries. Do not switch hosts silently. If Git import is blocked by organisation ownership, do not move/copy the repository without its owners' approval; obtain an eligible Vercel team/plan or ask the team to choose another authorised deployment path. Vercel Services does not override Hobby's repository ownership or commercial-use restrictions.

## Project setup checklist (carry forward)

This translates the attached 20-step workflow into the Codex/GitHub workflow for EnergiOS. “Planned” means documented but not yet implemented; it must not be reported as complete.

| Screenshot item | EnergiOS status | Required action |
| --- | --- | --- |
| Write PRD; state value, pain and ICP | **Done in planning** | PRD defines the pain, primary/secondary users, product promise and release gate. Revalidate the real operating gap with a Sime Darby mentor. |
| Export PRD as Markdown and load it into coding agent | **Done / repeat at build start** | `EnergiOS_PRD.md` and this plan are Markdown. The building Codex session must read both before editing code. |
| Write `CLAUDE.md` | **Not applicable as named** | Create root `AGENTS.md` for Codex instead. It must summarise mandatory scope, commands, tests, API contract authority, “synthetic vs estimated” labels and prohibited claims. If another teammate uses Claude Code, generate `CLAUDE.md` from the same rules and keep the two aligned. |
| Install coding-agent plugins | **Not done; optional** | Do not install plugins by habit. Use only reviewed, task-relevant tools; pin versions and document why each is needed. None is required to start the FastAPI backend. |
| Connect GitHub | **Not done** | Confirm authorised repository/owner, default branch and collaborator access. Never create, move or make a repo public without team approval. Check Vercel plan eligibility first. |
| Add `.gitignore` | **Planned, not implemented** | Ignore `.env*` except `.env.example`, Python caches/virtualenvs, test caches, local Vercel state, IDE files, model artifacts and generated data not intended for Git. Verify secrets are absent before first push. |
| Generate brand document | **Not done; frontend/brand owner** | Create a one-page EnergiOS brand/UI brief after the team confirms visual direction: audience, tone, colour tokens, typography, logo rules, chart colours and “Synthetic data / Estimated impact” badges. |
| Lock technology stack | **Done in planning** | FastAPI + Python 3.12, Supabase PostgreSQL, lightweight Python analytics, React/Three.js frontend and Vercel. Pin actual versions when scaffolding. |
| Build design system | **Not done; frontend owner with backend support** | Define reusable UI tokens/components and chart states. Backend must provide stable status/severity/provenance values; it does not own visual components. |
| Split PRD into tasks | **Done in planning** | Day 1/Day 2 tables, P0/P1/P2 scope and acceptance evidence are the task baseline. Convert them to GitHub issues/checklist only after the repository is confirmed. |
| Database and authentication | **Planned, not implemented** | Implement schema/RLS first. Public demo reads and stateless scenario preview require no user login; protected writes use a backend-only admin token for the prototype. Do not build full user authentication unless the demo genuinely needs it. |
| Move keys to environment variables | **Planned, not implemented** | Create `.env.example`; put real values only in local/Vercel environment settings. Never expose Supabase secret/service credentials in frontend variables. |
| Separate staging and production | **Missing; required before final deployment** | Use Vercel Preview for staging and Production for the submitted URL, with environment-specific API origins/secrets. Prefer a separate Supabase staging project if available; otherwise keep Preview read-only or reseedable and never let preview tests mutate production demo state. |
| Write README | **Not done** | Document purpose, built/simulated/planned boundary, stack, local setup, environment-variable names, seed command, tests, deployment, `/docs`, demo flow and limitations. |
| Plan folder structure | **Done in planning** | Use the proposed layout below, but reconcile it with the actual repository before creating files. |
| Add error tracking | **Partially planned** | P0: structured logs with request/correlation ID and safe exception responses; verify Vercel runtime logs. Optional after core flow: Sentry or equivalent free tier. Do not delay the demo to install it. |
| State what the product will not do | **Done** | PRD has explicit out-of-scope, safety and non-claim sections. Keep them in README and pitch. |
| Commit small and often | **Not yet applicable; required during build** | One coherent change per commit; run relevant tests before commit. Suggested sequence: scaffold, schema, seed, read API, alert rule, scenario preview, security, deployment, docs. Never commit secrets or bundle unrelated teammate changes. |

**Do not mark setup complete merely because it appears in this table.** “Done in planning” means the specification exists. Implementation items become done only after their stated evidence is produced and checked.

## Day 1 — data and API (target: 6–8 focused hours)

| Order | Task | Evidence of done |
| --- | --- | --- |
| 1 | Set up `backend/app.py`, `backend/requirements.txt` or `pyproject.toml`, `backend/src/` modules and `backend/tests/`. Add `.env.example` with names only and ignore actual `.env` files. | Local `/health` and `/docs`; locked dependency versions. |
| 2 | Create versioned SQL schema for the five PRD tables. Primary/foreign keys, nonnegative kWh constraint, unique meter/timestamp and alert deduplication key. Enable RLS on exposed tables; no blanket `anon` grants. | Tables and policies inspected; a read through backend succeeds; direct anonymous write is denied. |
| 3 | Write deterministic seed generator and manifest: four fictional assets, focus building with three floor submeters, ~four weeks hourly data, one after-hours event; optional building-total meter consistent with floor sum. Load through a local script or protected batch ingestion. | Re-run does not duplicate rows; sample meter/asset totals reconcile. |
| 4 | Implement asset, bounded readings, summary and alert read endpoints from Supabase; validate IDs/date ranges, limit responses, return explicit missing-data state. | OpenAPI contract and tests for normal, unknown asset, invalid dates and missing intervals. |
| 5 | Wire frontend to actual endpoint shapes as soon as available, before the 3D scene is polished. | One building and its meter values render from deployed/local API, not a frontend hardcoded object. |

**Day-1 checkpoint:** If the deployed API cannot serve DB-backed readings, defer all ML work. The 3D teammate may proceed against the committed sample JSON contract but must replace mocks before release.

## Day 2 — insight, scenario and verification (target: 6–8 focused hours)

| Order | Task | Evidence of done |
| --- | --- | --- |
| 1 | Implement after-hours comparison rule, sample-size check, two thresholds, evidence JSON and idempotent alert write. Add protected bounded `POST /v1/analysis/run`. | Seeded anomaly creates exactly one alert on repeated runs; ordinary and missing readings do not trigger it. |
| 2 | Implement stateless `POST /v1/scenarios/preview` for the public synthetic demo, with Pydantic bounds, capped savings, MYR/CO₂e formulas, assumptions echoed and explicit `estimated` status. Never require an admin secret in the browser. | Unit tests cover zero/negative tariff, impossible savings, no payback and rounding; frontend preview succeeds without a secret. |
| 3 | Implement protected `POST /v1/readings`; if time remains, add protected scenario storage and alert acknowledgement. Keep the demo admin token backend-side and enforce request-size/batch limits. | Unauthorised writes fail; authorised write becomes visible on read. |
| 4 | Add P1 24-hour forecast only if P0 gates pass. Compare seasonal-naive baseline with an optional lightweight scikit-learn model on chronological holdout; record MAE and training window. | Forecast fields show method/provenance and no unsupported accuracy claim; insufficient history returns explicit state. |
| 5 | Deploy backend to Vercel; set backend-only Supabase secret and admin token; configure known-origin CORS. Test deployed endpoints, reconnect frontend and exercise the entire journey. | Cold first request and warm request both succeed; no secret appears in logs, payload or frontend bundle. |
| 6 | Prepare a 2–3 minute operator walkthrough within the team's 5-minute required video. Capture demo labels and calculation assumptions in slides/script. | Recording shows one complete scenario and distinguishes synthetic/estimated/proposed. |

**Day-2 checkpoint:** P0 works end to end. If forecasting or scikit-learn adds build/bundle or validation problems, disable the P1 route with a clear “not available” state; keep the verified anomaly + scenario slice. A claimed ML model is never a condition for a working demo.

## Proposed repo layout (adapt to the existing repo)

```text
repo/
  backend/
    app.py                  # FastAPI entrypoint, app instance, route registration
    pyproject.toml          # Python version and pinned dependencies/lockfile
    .env.example            # variable names only
    src/
      config.py             # env validation and CORS settings
      models.py             # Pydantic request/response schemas
      repository.py         # Supabase access, bounded queries
      analytics.py          # deterministic alert/baseline/optional forecast
      scenarios.py          # deterministic energy/cost/carbon calculations
      seed.py               # repeatable synthetic fixture, not a live meter bridge
    sql/
      001_demo_schema.sql   # schema + RLS, reviewed before application
    tests/
      test_api.py
      test_analytics.py
      test_scenarios.py
  frontend/                  # owned by frontend teammate
  docs/
    EnergiOS_PRD.md          # copy/update companion PRD if repo is available
    EnergiOS_Backend_Implementation_Plan.md
```

When the team provides the actual repository, place these files there and reconcile with any existing conventions. Do not create a second competing app or change unrelated code.

## Operational contract and calculations

Implement the paths and schemas exactly as written in PRD §6. For `GET /v1/assets/{id}/summary`, provide the aggregation method (`building_total_meter` or `sum_available_floor_meters`) and completeness count. For `/readings`, cap the queried range and maximum returned points. For alerts, expose window, observed/baseline kWh, rule code, comparator count and thresholds. Display floor-specific data only when floor meters exist.

Minimum test fixture:

- 4 fictional assets; 1 focus asset with 3 metered floors.
- 28 days × 24 hourly intervals as a starting point; trim if free capacity or frontend latency warrants it.
- 1 injected after-hours excess on 1 floor and an internally consistent building total if that meter exists.
- Baseline excludes injected interval. Repeated analysis yields one alert.
- Scenario defaults are **illustrative, configurable**, not claimed tariffs/emissions factors. Save effective inputs alongside results.

The backend should never calculate “verified savings” from the injected anomaly. A projected savings number is only a scenario based on the given avoidable load, affected hours and realisation fraction.

## Security and deployment checklist

- [ ] Supabase URL and secret are stored only in backend local environment/Vercel backend settings. No secrets in Git, client JS, screenshots or demo video.
- [ ] RLS enabled on all exposed tables and least-privilege policy/grant decision reviewed. Public writes are denied. Backend secret use is restricted to demo-only synthetic data.
- [ ] Protected writes validate admin token with secure comparison and reject absent/invalid tokens; use request bounds and no unbounded batch upload. The public stateless scenario preview has tight numeric/payload bounds and no database write.
- [ ] CORS includes exact deployed frontend origin and localhost for development, not `*` with credentials.
- [ ] Seed and tests do not automatically run during normal web requests or deployment imports. No background daemon/in-memory durable state on Vercel.
- [ ] Python build is within current Function bundle limits; `/health` and a representative DB-backed endpoint respond after a cold start.
- [ ] API returns only fictional/synthetic data; errors never leak stack traces, secret values or database credentials.
- [ ] Deployed frontend uses the right production backend URL. Try the demo in a private/incognito browser without local services running.

## Verification matrix and handoff

| Check | Expected result |
| --- | --- |
| `pytest` on API, analytics and scenario units | All pass locally. |
| OpenAPI `/docs` | Each `/v1` endpoint and schema matches PRD; no phantom functionality. |
| DB seed twice | Stable counts and unchanged meter/time uniqueness. |
| Run analysis twice | One alert, same ID or deduplicated result. |
| Missing meter / incomplete floor | Clear unavailable/partial status, never a fabricated zero. |
| Invalid or unauthorised POST | Validation or 401/403 response; database unchanged. |
| Cold deployed call + frontend flow | No timeouts, CORS problems, wrong API URL or mocked numbers. |
| Scenario math spot-check | Independently recomputed kWh × tariff and kWh × emissions factor agree. |

**Backend handoff to teammates:** Deployed base URL, `/docs` URL, sample JSON, seed manifest, exact assumptions, known limitations, which functions are truly implemented, and a two-minute script for the anomaly → recommendation → scenario sequence. Never hand over secret keys.

## Open decisions and change discipline

The user's locked stack is **FastAPI + Supabase + Python analytics/scikit-learn where justified + Vercel**. Frontend framework, Vercel repository import and Hobby eligibility are not yet confirmed. The plan picks **two Vercel projects** because it isolates Python and frontend builds; Vercel Services is an approved architecture alternative only if the team deliberately changes that choice and plan eligibility remains satisfied. Do not invent credentials, real datasets, tariff rates, carbon factors, corporate floor plans, precision targets or external integrations.

Before each coding step, the next Codex session should read the PRD and this plan, inspect the repository and its `AGENTS.md`/existing code, implement the smallest next unchecked task, run its tests, and update the documentation when reality differs. A passing local test is not a passing Vercel deployment. The 23 October submission still requires the team's pitch deck and video/demo link in addition to the backend.
