export function assertIntCents(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer number of cents`);
  }
  if (value < 0) {
    throw new Error(`${fieldName} must be >= 0`);
  }
  return value;
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  return `${sign}${dollars}.${remainder.toString().padStart(2, "0")}`;
}
