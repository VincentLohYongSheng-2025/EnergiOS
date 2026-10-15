import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/js/api.js', import.meta.url), 'utf8');

function loadClient(fetchImpl) {
  const window = {};
  const context = {
    window,
    fetch: fetchImpl,
    AbortController,
    performance,
    setTimeout,
    clearTimeout,
    Date,
    Error,
  };
  vm.runInNewContext(source, context, { filename: 'api.js' });
  return new window.EnergiOSApiClient();
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; },
  };
}

test('uses the same-origin proxy and resolves asset IDs before dependent calls', async () => {
  const calls = [];
  const assetId = 'fa2b11d5-f608-515e-97ab-6445ef048bff';
  const client = loadClient(async (url) => {
    calls.push(url);
    if (url.endsWith('/assets?limit=100')) return jsonResponse({ items: [{ id: assetId }] });
    if (url.includes('/readings')) return jsonResponse({ items: [] });
    if (url.includes('/forecast')) return jsonResponse({ items: [] });
    if (url.includes('/anomalies')) return jsonResponse({ items: [] });
    throw new Error(`Unexpected URL ${url}`);
  });

  const assets = await client.getAssets();
  const returnedId = assets.items[0].id;
  await client.getReadings(returnedId, { limit: 24 });
  await client.getForecast(returnedId);
  await client.getAnomalies(returnedId, { limit: 6 });

  assert.deepEqual(calls, [
    '/api/assets?limit=100',
    `/api/assets/${assetId}/readings?limit=24`,
    `/api/assets/${assetId}/forecast`,
    `/api/assets/${assetId}/anomalies?limit=6`,
  ]);
});

test('fails explicitly when the API is unavailable and does not return fallback data', async () => {
  const client = loadClient(async () => jsonResponse({ detail: 'Database-backed BDG2 data is unavailable' }, 503));
  await assert.rejects(
    client.getAssets(),
    (error) => error.name === 'EnergiOSApiError' && error.status === 503
      && error.message === 'Database-backed BDG2 data is unavailable',
  );
});

test('encodes asset IDs and timezone-aware date filters', async () => {
  let requestedUrl;
  const client = loadClient(async (url) => {
    requestedUrl = url;
    return jsonResponse({ items: [] });
  });
  await client.getReadings('asset/id', {
    limit: 10,
    from: '2017-01-01T00:00:00+08:00',
    to: '2017-01-02T00:00:00+08:00',
  });
  assert.match(requestedUrl, /asset%2Fid\/readings\?limit=10/);
  assert.match(requestedUrl, /from=2017-01-01T00%3A00%3A00%2B08%3A00/);
  assert.match(requestedUrl, /to=2017-01-02T00%3A00%3A00%2B08%3A00/);
});
