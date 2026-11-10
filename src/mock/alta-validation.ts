import schemas from '../../schemas.json';

const EMPTY_DATES = new Set(['last_height_course_date', 'contract_end_date']);
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

type SchemaKind = 'string' | 'number' | 'boolean' | 'date';
type FieldSpec = [SchemaKind, boolean];

function matchesKind(value: unknown, kind: SchemaKind): boolean {
  if (kind === 'string') {
    return typeof value === 'string';
  }
  if (kind === 'number') {
    return typeof value === 'number' && Number.isFinite(value);
  }
  if (kind === 'boolean') {
    return typeof value === 'boolean';
  }
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function validAlta(body: unknown): body is Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return false;
  }
  const record = body as Record<string, unknown>;
  const schema = schemas.alta as unknown as Record<string, FieldSpec>;
  const allowed = new Set([...Object.keys(schema), 'magneto_id']);
  if (Object.keys(record).some((k) => !allowed.has(k))) {
    return false;
  }
  if (
    'magneto_id' in record &&
    typeof record.magneto_id !== 'string'
  ) {
    return false;
  }
  for (const [field, [kind, required]] of Object.entries(schema)) {
    if (!(field in record)) {
      if (required) {
        return false;
      }
      continue;
    }
    const value = record[field];
    if (EMPTY_DATES.has(field) && value === '') {
      continue;
    }
    if (!matchesKind(value, kind)) {
      return false;
    }
  }
  return true;
}
