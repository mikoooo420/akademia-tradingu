type ClassValue = string | number | false | null | undefined | ClassValue[];

/** Łączy nazwy klas CSS, pomijając wartości fałszywe. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue) => {
    if (!value) return;
    if (Array.isArray(value)) value.forEach(walk);
    else out.push(String(value));
  };
  values.forEach(walk);
  return out.join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
