#!/usr/bin/env tsx

import { EXIT } from './exit.js';

const args = process.argv.slice(2);
const command = args[0];

const HELP = `
usage: boole <command> [flags]

Commands:
  run       Run a prompt against a model
  pull      Download a model to the local cache
  doctor    Detect hardware and print system info
  models    List available model aliases
  serve     Start an OpenAI-compatible HTTP server
  list      List downloaded models

Run "boole <command> --help" for command-specific usage.

Exit codes:
  0  success
  1  runtime failure
  2  bad usage / invalid arguments
  3  model unavailable
`;

switch (command) {
  case 'doctor':
    await (await import('./commands/doctor.js')).default();
    break;

  case 'run':
    await (await import('./commands/run.js')).default(args.slice(1));
    break;

  case 'pull':
    await (await import('./commands/pull.js')).default(args.slice(1));
    break;

  case 'models':
    (await import('./commands/models.js')).default();
    break;

  case 'serve':
  case 'list':
    process.stderr.write(`boole ${command} is not yet implemented\n`);
    process.exit(EXIT.RUNTIME);
    break;

  case '--help':
  case '-h':
  case undefined:
    process.stderr.write(HELP);
    process.exit(command ? 0 : EXIT.BAD_USAGE);
    break;

  case '--version':
  case '-v':
    process.stderr.write('boole 0.0.1\n');
    process.exit(0);
    break;

  default:
    process.stderr.write(`unknown command: ${command}\n`);
    process.stderr.write(HELP);
    process.exit(EXIT.BAD_USAGE);
}
