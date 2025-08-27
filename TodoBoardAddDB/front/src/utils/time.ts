const HHMM_STRICT = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidHHmm(hhmm: string): boolean {
  return HHMM_STRICT.test(hhmm);
}

export function toMinutes(hhmm: string): number {
  if (!isValidHHmm(hhmm)) {
    throw new Error(`Invalid HH:mm: ${hhmm}`);
  }
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = toMinutes(aStart),
    ae = toMinutes(aEnd);
  const bs = toMinutes(bStart),
    be = toMinutes(bEnd);
  return as < be && bs < ae;
}
