"""Minimal deployment probe; no database or energy features are implemented."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    version: Literal["1"] = "1"


app = FastAPI(
    title="EnergiOS API",
    version="1",
    description=(
        "Built: process health and API documentation only. "
        "Database connectivity, synthetic energy data, analytics, "
        "and assumption-based estimates are planned and unavailable."
    ),
    redoc_url=None,
)


@app.get("/health", response_model=HealthResponse, tags=["Operations"])
async def health() -> HealthResponse:
    """Report application liveness only; this does not check a database."""
    return HealthResponse()

