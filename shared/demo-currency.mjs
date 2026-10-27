// Synthetic fixture denomination only; never reclassifies a LIVE warehouse contract.
export const DEMO_BASE_CURRENCY = "CRC";
export const demoCurrencyUnit = (unit) =>
  unit === "USD" ? DEMO_BASE_CURRENCY : unit;
