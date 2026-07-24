'use strict';

const path = require('node:path');
const { spawn } = require('node:child_process');

const apiPort = Number(process.env.BACKEND_PORT);
const uiPort = Number(process.env.FRONTEND_PORT);
const root = __dirname;
const children = [
  spawn('npm', ['start'], {
    cwd: path.join(root, 'backend'),
    env: { ...process.env, PORT: String(apiPort) },
    stdio: 'inherit',
  }),
  spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(uiPort), '--strictPort'], {
    cwd: path.join(root, 'frontend'),
    env: { ...process.env, BACKEND_PORT: String(apiPort) },
    stdio: 'inherit',
  }),
];

let stopping = false;
function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(signal));
for (const child of children) {
  child.on('error', (error) => {
    console.error('Unable to start runtime', error.message);
    process.exitCode = 1;
    stop();
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      process.exitCode = code ?? (signal ? 1 : 0);
      stop();
    }
  });
}
