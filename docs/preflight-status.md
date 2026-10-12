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
