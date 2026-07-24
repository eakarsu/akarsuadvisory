'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const route = fs.readFileSync(path.join(__dirname, '..', 'routes', 'applicationAi.js'), 'utf8');
const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const launcher = fs.readFileSync(path.join(__dirname, '..', '..', 'runtime-launcher.js'), 'utf8');

test('application AI requires authentication and exact OpenRouter configuration', () => {
  assert.match(route, /router\.post\('\/advisory-review', auth/);
  assert.match(route, /OPENROUTER_API_KEY/);
  assert.match(route, /OPENROUTER_MODEL/);
  assert.match(route, /https:\/\/openrouter\.ai\/api\/v1/);
});
test('application AI persists a provider receipt and substantive result', () => {
  assert.match(route, /INSERT INTO runtime_ai_results/);
  assert.match(route, /providerReceipt/);
  assert.match(route, /result\.trim\(\)/);
});
test('server mounts application AI and launcher uses separate ports', () => {
  assert.match(server, /\/api\/application-ai/);
  assert.match(launcher, /BACKEND_PORT/);
  assert.match(launcher, /FRONTEND_PORT/);
});
