// src/utils/taxCalculator.ts

type AgeGroup = "below60" | "senior" | "superSenior";

export interface TaxInput {
  income: number;
  ageGroup: AgeGroup;
  deductions: {
    section80C?: number;
    section80D?: number;
    hra?: number;
    others?: number;
  };
}

export function calculateNewRegimeTax(income: number): number {
  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];

  let taxable = income;
  let tax = 0;
  let prevLimit = 0;

  for (const slab of slabs) {
    if (taxable > slab.limit) {
      tax += (slab.limit - prevLimit) * slab.rate;
      prevLimit = slab.limit;
    } else {
      tax += (taxable - prevLimit) * slab.rate;
      break;
    }
  }

  if (income <= 700000) return 0; // Rebate u/s 87A
  return Math.round(tax);
}

export function calculateOldRegimeTax({
  income,
  ageGroup,
  deductions,
}: TaxInput): number {
  let exemption = 250000;
  if (ageGroup === "senior") exemption = 300000;
  if (ageGroup === "superSenior") exemption = 500000;

  const totalDeduction =
    Math.min(deductions.section80C || 0, 150000) +
    (deductions.section80D || 0) +
    (deductions.hra || 0) +
    (deductions.others || 0);

  let taxable = Math.max(income - totalDeduction, 0);
  let tax = 0;

  if (taxable <= exemption) return 0;

  taxable -= exemption;

  if (taxable <= 250000) tax = taxable * 0.05;
  else if (taxable <= 750000) tax = 250000 * 0.05 + (taxable - 250000) * 0.2;
  else tax = 250000 * 0.05 + 500000 * 0.2 + (taxable - 750000) * 0.3;

  if (income - totalDeduction <= 500000) return 0; // Rebate u/s 87A
  return Math.round(tax);
}
