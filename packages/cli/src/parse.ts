export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | true>;
}

function looksLikeFlag(s: string): boolean {
  return (s.startsWith('--') && s.length > 2) ||
    (s.startsWith('-') && s.length === 2 && /[a-zA-Z]/.test(s[1]));
}

export function parseArgs(args: string[], booleans: Set<string> = new Set()): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--') {
      positional.push(...args.slice(i + 1));
      break;
    }

    let key: string | undefined;
    if (arg.startsWith('--') && arg.length > 2) {
      key = arg.slice(2);
    } else if (arg.startsWith('-') && arg.length === 2 && /[a-zA-Z]/.test(arg[1])) {
      key = arg.slice(1);
    }

    if (key) {
      const next = args[i + 1];
      if (booleans.has(key) || next === undefined || looksLikeFlag(next)) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

export function flag(parsed: ParsedArgs, long: string, short?: string): string | true | undefined {
  return parsed.flags[long] ?? (short ? parsed.flags[short] : undefined);
}

export function flagStr(parsed: ParsedArgs, long: string, short?: string): string | undefined {
  const v = flag(parsed, long, short);
  return typeof v === 'string' ? v : undefined;
}

export function flagBool(parsed: ParsedArgs, long: string, short?: string): boolean {
  return flag(parsed, long, short) !== undefined;
}
