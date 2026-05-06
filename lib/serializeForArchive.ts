export function serializeForArchive(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return undefined;
  if (typeof value === 'bigint') return Number(value);

  if (Array.isArray(value)) {
    const out = value
      .map((item) => serializeForArchive(item, seen))
      .filter((item) => item !== undefined);
    return out.length > 0 ? out : undefined;
  }

  if (typeof value === 'object') {
    const objRef = value as object;
    if (seen.has(objRef)) return '[Circular]';
    seen.add(objRef);

    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const next = serializeForArchive(val, seen);
      if (next !== undefined) out[key] = next;
    }
    seen.delete(objRef);

    return Object.keys(out).length > 0 ? out : undefined;
  }

  return value;
}
