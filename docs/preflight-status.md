# Preflight evidence — 13 October 2026 (Malaysia)

**Milestone status: locally verified; deployment gate incomplete. Do not start the next major task.**

## Inspection

- Read both supplied Markdown documents completely before writing code. Copies in this directory match their originals in Downloads by SHA-256.
- Initial workspace `C:\Users\Vincent Loh\Desktop\EnergyOS` contained zero entries, including hidden files. No local `.git`, `AGENTS.md`, frontend/backend source, packages or deployment files existed. No ancestor `AGENTS.md` was found in the inspected path through `C:\`.
- Git inspection failed with `fatal: cannot change to 'C:/Users/Vincent Loh'`; no repository, owner, default branch or collaborator access was inferred. No Git repository was initialised, created remotely, moved, committed or pushed.
- Frontend framework is unknown. No frontend directory or competing app was generated.
- Read-only Vercel discovery found the team `vincentlohys-8109s-projects` and two unrelated projects (`vincent-portfolio`, `jejakspm-malaysia`); no EnergiOS project. They were not modified. Intended destination and plan eligibility remain unconfirmed.

## Exact source changes

All files are additions; nothing was overwritten or deleted.

| File | Purpose |
| --- | --- |
| `.gitignore` | Exclude secrets, environments, caches, tools, local Vercel state and generated/model artifacts. |
| `AGENTS.md` | Scope, authority, commands, test and deployment gates, data labels and prohibited claims. |
| `README.md` | Setup, built/synthetic/estimated/planned boundary, health sample, deployment procedure and limitations. |
| `docs/EnergiOS_PRD.md` | Unchanged copy of product/API authority. |
| `docs/EnergiOS_Backend_Implementation_Plan.md` | Unchanged copy of engineering workflow; unchecked items remain unchecked. |
| `docs/preflight-status.md` | This evidence and outstanding-decision record. |
| `backend/app.py` | Stateless FastAPI entrypoint, typed exact `/health` response, automatic `/docs` and `/openapi.json`. |
| `backend/pyproject.toml` | Python 3.12 constraint, exact runtime/dev package pins and test configuration. |
| `backend/uv.lock` | Resolved transitive versions and package hashes from public PyPI. |
| `backend/.python-version` | Python 3.12 selection. |
| `backend/.env.example` | Blank, unused names reserved for later backend settings. No credentials. |
| `backend/.vercelignore` | Exclude local environments, test files, caches and environment files from uploads. |
| `backend/src/__init__.py` | Namespace reserved for later authorised backend modules. |
| `backend/tests/test_api.py` | Three tests for the health contract, docs/OpenAPI and absent planned routes. |

Local generated tooling, excluded by `.gitignore`: `.tools/` holds uv 0.13.0, Python 3.12.15 and download/cache files; `backend/.venv/` holds installed dependencies; Python/pytest generated their usual caches. System Python 3.13 was not replaced.

## Verification

- Python **3.12.15**.
- `backend/.venv/Scripts/python.exe -m pytest`, executed from `backend/`: **3 passed in 2.12s**, one upstream Starlette deprecation warning about its `httpx` test-client integration. No failed tests; the warning is not suppressed.
- `uv pip check`: all **23 installed packages compatible**.
- Actual Uvicorn HTTP requests at `http://127.0.0.1:8000`:
  - `/health`: **200**, exact body `{"status":"ok","version":"1"}`; first observed request 546 ms, repeat 6 ms. These are local client timings, not Vercel cold-start measurements.
  - `/docs`: **200**, Swagger HTML (8 ms).
  - `/openapi.json`: **200**, only `/health` in `paths` (16 ms).
- In-app browser rendered **EnergiOS API / Swagger UI** with the health route, response schema and explicit planned-feature disclaimer. Browser warning/error log was empty. The documentation tab was left open.
- Initial sandboxed Python test/server processes stalled and loopback requests were denied. Those processes were interrupted. Tests and server smoke checks succeeded outside the sandbox; this was an execution-environment restriction, not a claimed application pass from the failed attempts.
- The successfully verified local Uvicorn server was left running on loopback port 8000 for the documentation tab.

## Still incomplete

- Confirm shared repository URL, owner, branch/collaborators and Vercel import access. Confirm intended Vercel team/project and applicable plan/hackathon eligibility. A clarification was requested; no destination was invented.
- Create/import the dedicated backend project with Root Directory `backend/`, deploy a Preview, inspect build/runtime logs and verify public HTTPS `/health` and `/docs`. **No deployment was attempted; no deployed base URL exists.** Local tests do not establish platform compatibility.
- Supabase project/account/region and free-plan capacity checks are deferred. No database project, credentials, schema, RLS, seeds or connection was created. The minimal app does not need them.
- Frontend owner/framework, separate frontend Vercel project, API URL variable, exact CORS origins and teammate handoff remain unconfirmed.
- All `/v1` data routes, synthetic generation, analytics, financial/carbon estimates, protected writes and final end-to-end demo remain planned. No synthetic or estimated outputs are served at this stage.

## Current platform references

Checked the official [FastAPI entrypoint guide](https://vercel.com/docs/frameworks/backend/fastapi) and [Python runtime guide](https://vercel.com/docs/functions/runtimes/python): standard `app.py` is supported, Python 3.12 is available and a `uv.lock` can accompany `pyproject.toml`. The root-directory design follows the PRD and [monorepo guide](https://vercel.com/docs/monorepos).

The [fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) retain the non-commercial personal-use restriction for Hobby and direct uncertain cases to Vercel Support. No conclusion about this competition's eligibility was invented, and no support message was sent.

## Git handoff preparation — 13 October 2026 (Malaysia)

- The user confirmed and authorised pushing to `https://github.com/VincentLohYongSheng-2025/EnergiOS.git`. GitHub metadata identifies it as public, owned by the user account `VincentLohYongSheng-2025`; remote inspection found no existing refs or commits before initialisation.
- Git inspection outside the sandbox discovered an unrelated ancestor repository at `C:\Users\Vincent Loh\.git`. A separate repository was initialised in this project on `codex/phase-0-scaffold`; the ancestor repository was not modified.
- `origin` points to the authorised shared repository. Only the 14 scaffold files listed above are intended for this commit. Local tooling, virtual environments, caches and actual environment files are ignored; the example settings remain blank.
- Pre-commit verification: the API suite passed again, **3 passed in 1.05s**, with the same single upstream deprecation warning.
- This section records preparation for the initial commit/push. The final handoff reports the actual commit hash and verifies the remote branch after pushing. The original PRD and implementation plan remain unchanged.
- The next outstanding backend deployment task is Preflight item 3: deploy this minimal app as a separate Vercel project with Root Directory `backend/`, then test public `/health` and `/docs`. The deployment gate remains incomplete. The current authorisation covers Git handoff only; Vercel creation, credentials and Supabase work are deferred.

## Minimal deployment verification — 13 October 2026 (Malaysia)

This update supersedes the earlier deployment blocker. The user authorised a best-effort temporary demo deployment while explicitly acknowledging that Vercel Hobby eligibility remains unconfirmed. No support confirmation or eligibility claim is made.

- Team: `vincentlohys-8109s-projects`.
- Created project: `energios-backend` (`prj_kyOkrLnMczkJaul3djhsyGGzeqZK`), linked to `VincentLohYongSheng-2025/EnergiOS` with FastAPI framework and Root Directory `backend`.
- Deployed source: `9f071d9d5eb5036de373ae60b73dc8053d90527b`, branch `codex/phase-0-scaffold`.
- Deployment: `dpl_2ec4WzptU2HCM9sYTEuLXEWu7amW`, Vercel status **READY**, target **production** (selected by Vercel for the default branch).
- Public base URL: `https://energios-backend.vercel.app`.
- Build logs confirm Python **3.12** from `backend/.python-version`, dependencies installed from `uv.lock`, and build completed in **4 seconds**. No application source or dependency changes were needed.
- Unauthenticated requests with redirects disabled verified:
  - `https://energios-backend.vercel.app/health`: **200**, exact raw body `{"status":"ok","version":"1"}` on both requests (376 ms and 305 ms).
  - `https://energios-backend.vercel.app/docs`: **200**, Swagger UI HTML referencing `/openapi.json` (300 ms). The in-app browser rendered the health operation and schema, with an empty warning/error log.
  - `https://energios-backend.vercel.app/openapi.json`: **200**, API version `1`, only `/health` advertised, literal `ok`/`1` response schema (328 ms).
- These are observed request timings; they do not establish a Vercel cold start.
- Deployment-specific hostname `energios-backend-c6ltblmaj-vincentlohys-8109s-projects.vercel.app` and team alias `energios-backend-vincentlohys-8109s-projects.vercel.app` returned **302** with `Protected by Vercel Authentication` for all three endpoints. No protection settings or bypass credentials were changed. The automatically assigned production domain above is publicly accessible.
- The most recent local test run before deployment passed **3 tests**, with one existing upstream Starlette deprecation warning. No application code changed afterward.
- No Vercel payment/upgrade request was returned, no plan upgrade or paid add-on was selected, and no application secrets/environment variables were added.
- Frontend teammate can use the public base URL for API documentation and health checks. Browser cross-origin integration still needs the teammate's exact frontend origin and CORS configuration; no frontend framework or origin has been invented. `/v1` functionality and all data/savings features remain unavailable.
- A separate Preview deployment has not been verified; this evidence is for the public production deployment. Supabase, database, AI and frontend work remain unstarted.

## Day 1 Task 2/3 evidence — 13 October 2026 (Malaysia)

This update supersedes the earlier statement that schema/seed work is unstarted.
The deployment remains unchanged.

- The user reports hosted Supabase security verification passed for all five
  tables: RLS true, anon/authenticated access false, service read true, no policies.
  This is user-provided catalogue evidence, not an agent-run hosted request.
  Details are in `docs/schema-verification.md`, committed separately as
  `251a765a121819a534b37db44f520dfdb80afcbc` (documentation only).
- Day 1 Task 3 is built offline: a versioned fictional fixture specification,
  standard-library generator, run manifest and insert-only SQL export. Four
  assets, seven meters, 28 days and 4,704 hourly readings use `synthetic_demo`.
  One Floor 2 event adds 60.0 kWh at `2026-10-08T12:00:00Z`; building totals
  reconcile exactly with all floors. Repeated generation is an unchanged no-op.
- Verification: 8 Python tests and 10 local PostgreSQL tests passed. Actual seed
  SQL was applied twice to a disposable database; conflicting existing readings
  caused complete rollback without overwriting rows. RLS/grants stayed unchanged.
- Public `/health` was tested again: HTTP 200, exact body
  `{"status":"ok","version":"1"}`. No app, dependency or Vercel changes.
- Remote branch inspection still finds only `codex/phase-0-scaffold` at
  `9f071d9d5eb5036de373ae60b73dc8053d90527b`, with no frontend code.
  Frontend compatibility remains unverified; `/v1` endpoints remain planned.
- No hosted seed writes or credential inspection occurred. Configure backend-only
  Supabase variables privately before applying the reviewed export. Hosted seed
  idempotency/capacity and real backend database reads remain unverified.
- See `docs/seed-verification.md` for exact generation/test commands, provenance
  boundaries and the gated manual load action. No later task has started.

## Minimal BDG2 migration and isolated import — 13 October 2026 (Malaysia)

- Official files were fetched from pinned commit
  `3d0cbaf7ba281029ce04887503ab56f3c8344575` and kept under the Git-ignored
  `data/source/` directory. SHA-256 verification matched the assessment:
  metadata `992d0b29f24f96ad4332bc4dbb534b7bdd7dd2689aad093f94e93068ecddca02`;
  cleaned electricity `b01056f4ceec1992ce019297e674d6d6ecd0240e50a2aaeb6f958c65efdc282d`.
- The additive migration was reduced to the hackathon-safe minimum: one source
  table, one import-run table, direct source/run identifiers, source-scoped
  unique keys and essential public-benchmark validation. It adds no composite
  foreign keys, triggers, views, cascading deletes or advanced rollback layer.
- The migration and import ran only in disposable PGlite 0.5.9 (PostgreSQL
  18.6-compatible). Hosted `energios-demo` PostgreSQL 17.11 was not modified;
  the project has no Supabase branch and the local Docker daemon is stopped.
- The imported cohort contains four `Hog` whole-building electricity meters and
  **70,152** accepted hourly interval-kWh readings. The extractor verified
  17,544 source timestamps, 70,176 bounded cells, 70,168 non-null values,
  8 missing values, 16 quarantined ambiguous/nonexistent DST values, 0 zeros
  and 0 invalid values. UTC coverage is `2016-01-01T06:00:00Z` through
  `2018-01-01T05:00:00Z`; source timezone is `US/Central`, normalisation uses
  `America/Chicago`, and `tzdata==2026.5` is locked.
- A second complete import produced unchanged counts and aggregates: one source,
  one run, four assets, four meters and 70,152 readings. Stable source keys,
  per-meter counts/sums/ranges, units and provenance reconciled to the manifest.
- Security/catalogue checks passed: all seven tables have RLS, no public-client
  policies or grants exist, and every original row, non-provenance constraint,
  index, grant, RLS flag and policy remains unchanged in the isolated test.
- Final verification: 15 Node/PostgreSQL tests passed; 9 Python tests passed with
  one existing Starlette/httpx deprecation warning. No frontend, API, model,
  deployment, hosted database, credential, commit or push operation occurred.

## BDG2 forecast and unusual-pattern evaluation — 13 October 2026 (Malaysia)

- The evaluator reads only the verified local `bdg2_v1` import bundle, checks
  its `public_benchmark` provenance, accepted count and canonical reading hash,
  and uses all four whole-building electricity meters. No synthetic fixture is
  used for training or reported performance.
- Calendar boundaries are chronological: train starts
  `2016-01-01T06:00:00Z`, validation starts `2017-03-14T06:00:00Z`, test starts
  `2017-08-07T06:00:00Z`, and test ends `2018-01-01T06:00:00Z` exclusive.
  Validation fits use only train observations; the final test fit uses train
  plus validation. Rolling origins forecast the next 24 hours using only prior
  observations.
- The small standard-library model blends a 168-hour seasonal profile with the
  previous-day same-hour value. The blend weight and robust residual threshold
  are selected on validation only. The held-out test has 14,081 comparable
  readings: model MAE **24.223073 kWh** and RMSE **37.903324 kWh**, versus
  baseline MAE **27.180704 kWh** and RMSE **47.311611 kWh**.
- Validation MAD thresholds detected **144** held-out observations, all labelled
  `unusual_consumption_pattern` with no asserted cause. The generated report
  includes 24 future hourly forecasts per meter and is retained only under the
  ignored `data/local/` path.
- `docs/bdg2-model-evaluation.md` records per-meter metrics, method evidence and
  limitations. No schedule, after-hours, HVAC, waste, tariff, savings,
  Sime Darby or Elmina claim is made.
- Locked-environment verification passed: **12/12** analytics/import/seed tests
  using a workspace-local pytest temp directory, plus **3/3** existing API
  contract tests outside the sandbox's loopback restriction. The API tests emit
  the existing Starlette/httpx deprecation warning. Two consecutive evaluator
  runs returned `status: unchanged`; the generated report SHA-256 is
  `78c37bec07b47d1de9c8b3d152cd0661c5971c9efd6cb72884700eecdb47af79`.
- No API, frontend, chatbot, hosted Supabase, deployment, credential, commit or
  push operation occurred. The next P0 task is the bounded DB-backed readings
  and forecast/anomaly API.

## Read-only BDG2 API — 13 October 2026 (Malaysia)

- Four unversioned routes are implemented locally: `GET /assets`,
  `GET /assets/{asset_id}/readings`, `GET /assets/{asset_id}/forecast` and
  `GET /assets/{asset_id}/anomalies`. OpenAPI advertises these routes plus the
  unchanged `/health` contract; `/v1` routes remain absent.
- The service accepts only a completed `bdg2_v1` `public_benchmark` import whose
  source/run IDs and accepted reading count match the stored manifest. It reads
  assets, meters and all observations through the backend-only Supabase Data
  API and prepares the already validated deterministic analytics before serving
  data requests. Missing credentials, incomplete imports, lineage mismatches and
  database failures return an explicit 503; no synthetic or file fallback exists.
- IDs use UUID validation. Reading ranges require paired timezone-aware `from`
  and `to` values, are half-open and capped at 31 days; reading limits are
  1–1,000. Anomaly ranges are capped at 366 days and limits at 1–500. Asset list
  limits are 1–100. Unknown valid asset IDs return 404.
- Responses retain UTC and source-local timestamps, interval kWh units,
  `public_benchmark` provenance and the BDG2 attribution. Readings are labelled
  `observed`, forecast values `forecast`, and detections only
  `unusual_consumption_pattern` with a null cause.
- Route tests use an isolated in-memory SQLite database populated with all
  70,152 verified local BDG2 import readings. The complete locked Python suite
  passed **26 tests** in 26.31 seconds. It emits the existing Starlette/httpx
  deprecation warning. The focused PGlite import/replay/security suite passed
  **3 tests** in 17.35 seconds. Lock validation, Python compilation and `git
  diff --check` also passed.
- Current official Supabase guidance was rechecked: Data API table exposure and
  grants are separate from RLS. The existing migration explicitly grants the
  backend `service_role` its required reads while public clients remain denied.
  No grant, policy or schema change was made in this API task.
- The latest accessible local and remote Git trees contain no frontend code, so
  frontend request compatibility remains unverified. The PRD now records the
  owner-approved unversioned route contract.
- Hosted Supabase and Vercel were not modified or queried. Since the hosted
  database does not yet contain this verified import, no deployed data endpoint
  success is claimed. No credential, commit or push operation occurred.
