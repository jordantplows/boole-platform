import { listAliases } from '../aliases.js';

export default function models(): void {
  const aliases = listAliases();
  const entries = Object.entries(aliases);

  const maxName = Math.max(...entries.map(([n]) => n.length));
  const maxParams = Math.max(...entries.map(([, e]) => e.params.length));

  process.stderr.write('\n');
  for (const [name, entry] of entries) {
    process.stderr.write(
      `  ${name.padEnd(maxName + 2)}${entry.params.padEnd(maxParams + 2)}${entry.description}\n`,
    );
  }
  process.stderr.write(
    `\nuse "boole run <alias> -p <prompt>" or a full specifier like <repo>:<quant>\n\n`,
  );
}
