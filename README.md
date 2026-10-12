# EnergiOS

Township energy opportunity prototype. Product/API authority: [PRD](docs/EnergiOS_PRD.md). Engineering workflow: [implementation plan](docs/EnergiOS_Backend_Implementation_Plan.md).

## Current scope

| Category | Status |
| --- | --- |
| Built locally | Minimal FastAPI application, `/health`, `/docs`, `/openapi.json` and contract tests. See the evidence record for verification results. |
| Synthetic | No generator, readings or demo assets exist yet. Future demo data must be explicitly fictional. |
| Estimated | No savings, tariffs, carbon factors or forecasts are implemented. |
| Planned | Supabase/RLS, ingestion, `/v1` API, anomaly rule, scenario calculator, frontend and Vercel deployment verification. |

`GET /health` returns `{"status":"ok","version":"1"}`. This is application liveness, not database readiness. OpenAPI advertises only this implemented route. There are no equipment controls, real corporate connections, measured savings or hidden fallback readings.

## Local setup and tests

Use Python 3.12 and uv (the initial workspace bootstrap uses uv 0.13.0). From the repository root in PowerShell:

```powershell
Set-Location backend
uv sync --locked
uv run --locked pytest
uv run --locked uvicorn app:app --host 127.0.0.1 --port 8000
```

For the isolated tools installed in this workspace, replace `uv` above with `..\.tools\bin\uv.exe`, after setting:

```powershell
$env:UV_PYTHON_INSTALL_DIR = (Resolve-Path ..\.tools\python).Path
$env:UV_CACHE_DIR = (Resolve-Path ..\.tools\uv-cache).Path
```

Open <http://127.0.0.1:8000/health> and <http://127.0.0.1:8000/docs>. Swagger UI loads its assets from a CDN, so the interactive page requires internet access. No environment variables or credentials are required. `backend/.env.example` contains only blank names reserved for later work; this app does not load them. There is no seed command yet.

## Vercel deployment gate

1. Confirm the shared repository, owner, collaborators, intended Vercel team and plan eligibility. The local folder was empty and not a checked-out repository at preflight. Do not publish or create a remote repository implicitly.
2. Import the authorised repository into a dedicated backend project with **Root Directory `backend`**, FastAPI framework detection, Python 3.12, and default build/install settings. No secrets are needed for this milestone. The eventual frontend gets its own project; its framework remains unconfirmed.
3. Deploy a **Preview**. Verify the detected framework, runtime version and successful build. Root Directory is a Vercel project setting, not a `vercel.json` key. No custom routes or legacy Python builder are needed for the standard `app.py` entrypoint.
4. Verify unauthenticated HTTPS `/health`, `/docs` and `/openapi.json`. The health JSON must match above; OpenAPI must advertise only `/health`. Check a first request and a repeated request and record timings, without claiming the first call proves a cold start. Inspect runtime logs and render Swagger UI in a browser. A protected preview does not satisfy the public URL gate.
5. Record the actual URL and evidence in [preflight status](docs/preflight-status.md). Resolve any build/runtime failure before adding database or ML dependencies. Do not advance to the schema/seed task while this gate is incomplete.

References checked during preflight: [Vercel FastAPI](https://vercel.com/docs/frameworks/backend/fastapi), [Python runtime](https://vercel.com/docs/functions/runtimes/python), [monorepos](https://vercel.com/docs/monorepos), [fair use](https://vercel.com/docs/limits/fair-use-guidelines). The PRD requires clarification of hackathon Hobby eligibility; it is not assumed here.

## Limitations and ownership

No frontend has been created, so its framework, API environment variable, CORS origins and team handoff are unconfirmed. No Supabase project has been provisioned. The minimal service deliberately needs no database dependency. Deployment and final demo readiness require separate evidence; local tests alone are insufficient.
