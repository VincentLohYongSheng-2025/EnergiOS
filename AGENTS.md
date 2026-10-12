# EnergiOS working rules

- Read `docs/EnergiOS_PRD.md` and `docs/EnergiOS_Backend_Implementation_Plan.md` completely before coding. The PRD governs product scope and API shapes; the plan governs task order.
- Inspect the workspace and preserve existing work. Implement only the currently authorised task. Do not advance past a failed deployment gate.
- Prototype scope rule: Treat the 20-item checklist as a triage list, not a requirement to complete every item. Implement only P0 items needed for the working EnergiOS hackathon prototype. Defer full authentication, separate staging infrastructure, Sentry, plugins/MCP setup, a formal design-system document, forecasting, solar simulation and multi-agent AI unless explicitly requested.
- Keep the PRD and backend implementation plan unchanged unless the agreed product scope, API contract, technology stack or deployment architecture changes.
- Current scope: preflight and a minimal Python 3.12 FastAPI service. Export `app` from `backend/app.py`. `/health` must return exactly `{"status":"ok","version":"1"}`. `/docs` documents only implemented routes.
- Use one shared repository and separate Vercel projects rooted at `backend/` and, once ready, `frontend/`. Confirm repository ownership, import access, target team/project and plan eligibility before deploying. Do not create or publish a remote repository without team approval.
- Before changing backend API contracts or handing them to the frontend team, check the latest accessible frontend commit. Compare its API requests, field names, units and status handling with the PRD and the current backend OpenAPI schema; report every mismatch and any unavailable frontend evidence. Preserve teammate files and commits, and coordinate contract changes instead of overwriting their work.
- No Supabase or analytics libraries until the tiny Vercel Preview deployment passes. Do not fabricate `/v1` endpoints, database results, credentials, real Sime Darby data, tariffs, carbon factors or integrations.
- Distinguish built, synthetic, estimated and planned functionality. Synthetic data must be labelled `Synthetic demonstration data`; financial/carbon outputs must be labelled `Assumption-based estimates`. No verified savings or confirmed HVAC cause claims.
- Keep real environment files, credentials, generated data and local tools out of Git. Future Supabase secrets/admin tokens belong only in backend environment settings. Never expose them in browser code or logs.
- Future database errors must fail explicitly, never substitute fabricated data. Missing energy intervals remain missing. Floor meters must not double-count an authoritative building total.
- From `backend/`: `uv sync --locked`, `uv run --locked pytest`, and `uv run --locked uvicorn app:app --host 127.0.0.1 --port 8000`.
- Before handoff, run relevant tests and actual HTTP smoke checks. Report exact changed files, test evidence, deployment state and unfinished work. Local success does not prove Vercel compatibility.
- Keep source documents and implementation status distinct. Record evidence in `docs/preflight-status.md`; never mark planned features built without verification.

