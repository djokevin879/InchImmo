#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const args = process.argv.slice(2);
const filteredArgs = args.filter(arg => arg !== '--host');

// Find the real next binary
const nextPath = path.resolve(process.cwd(), 'node_modules', '.bin', 'next');

const child = spawn(nextPath, filteredArgs, {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
