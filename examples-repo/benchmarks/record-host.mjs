#!/usr/bin/env node
// Print host facts and an empty timing row. This script does not run a model
// and does not write a tokens-per-second number.

import { arch, cpus, platform, release, totalmem } from 'node:os';

const cpu = cpus()[0];
const hardware = [
  platform(),
  arch(),
  release(),
  cpu ? cpu.model : 'unknown cpu',
  String(cpus().length) + ' logical cpus',
  String(totalmem()) + ' bytes RAM',
].join('; ');

const header = 'date,source,model,quant,tokens,elapsed_ms,tok_s,threads,gpu_layers,runtime,hardware,notes';
const row = [
  new Date().toISOString().slice(0, 10),
  'local measurement, not yet filled',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '"' + hardware.replaceAll('"', "'") + '"',
  '"Fill tok_s only after you measure it. Do not copy the 12.3 tok/s Xeon row."',
].join(',');

process.stdout.write(hardware + '\n\n' + header + '\n' + row + '\n');
