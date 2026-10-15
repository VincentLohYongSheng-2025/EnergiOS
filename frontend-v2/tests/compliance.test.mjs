import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('methodology visibly cites BDG2, its paper, licence, scope, and missing-data rule', async () => {
  const methodology = await read('../methodology.html');
  assert.match(methodology, /Building Data Genome Project 2 v1\.0/);
  assert.match(methodology, /https:\/\/doi\.org\/10\.5281\/zenodo\.3887306/);
  assert.match(methodology, /https:\/\/doi\.org\/10\.1038\/s41597-020-00712-x/);
  assert.match(methodology, /CC BY 4\.0/);
  assert.match(methodology, /This is public benchmark data and is not Sime Darby Property operational data\./);
  assert.match(methodology, /Missing source readings remain missing and are not replaced with synthetic observations\./);
});

test('persistent disclosure and all six classifications are present', async () => {
  const classifications = await read('../src/js/data_classification.js');
  const methodology = await read('../methodology.html');
  assert.match(classifications, /Demo uses BDG2 public benchmark data and clearly labelled simulations\./);
  assert.match(classifications, /It does not use Sime Darby Property operational data\./);
  for (const label of [
    'Observed public benchmark data',
    'Calculated forecast',
    'Detected unusual consumption pattern',
    'Derived benchmark comparison',
    'Simulated assumption',
    'Illustrative visual',
  ]) assert.match(methodology, new RegExp(label));
});

test('simulation and portfolio outputs carry explicit non-measured labels', async () => {
  const energy = await read('../src/js/energy_simulator.js');
  const portfolio = await read('../src/js/portfolio_view.js');
  assert.match(energy, /Simulation — not measured operational data/);
  assert.match(energy, /Simulated assumption — no live control action performed/);
  assert.match(energy, /Illustrative estimate based on user-entered tariff/);
  assert.match(energy, /microgrid-assumption-summary/);
  assert.match(energy, /classificationBadge\('simulated', 'Simulation — not measured operational data'\)/);
  assert.match(portfolio, /Illustrative portfolio view — not a measured digital twin/);
  assert.match(portfolio, /Illustrative visual — not measured spatial data/);
  assert.doesNotMatch(energy, /Observed (solar|battery|tariff)/i);
  assert.match(portfolio, /do not represent Sime Darby assets/i);
  assert.match(portfolio, /not measured (geometry|spatial data)/i);
});

test('empty anomaly wording is honest and avoids unsupported cause claims', async () => {
  const dashboard = await read('../src/js/velora_app.js');
  const energy = await read('../src/js/energy_simulator.js');
  const required = 'No unusual consumption patterns were detected for this asset and selected period.';
  assert.match(dashboard, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(energy, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(dashboard, /not proof that the building has no inefficiency/i);
  assert.match(energy, /do not establish HVAC, lighting, ghost-load, equipment, waste, or other causes/i);
});
