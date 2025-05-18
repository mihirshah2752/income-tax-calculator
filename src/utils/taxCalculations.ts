// src/utils/taxCalculations.ts
import {
  CESS_RATE,
  OLD_REGIME_SLABS,
  OLD_REGIME_STANDARD_DEDUCTION,
  OLD_REGIME_REBATE_LIMIT_INCOME,
  OLD_REGIME_REBATE_MAX_AMOUNT,
  OLD_REGIME_SURCHARGE_RATES,
  NEW_REGIME_SLABS_FY2025_26,
  NEW_REGIME_STANDARD_DEDUCTION_FY2025_26,
  NEW_REGIME_REBATE_LIMIT_INCOME_FY2025_26,
  NEW_REGIME_REBATE_MAX_AMOUNT_FY2025_26,
  NEW_REGIME_SURCHARGE_RATES_FY2025_26,
  MAX_80C_DEDUCTION,
  MAX_80CCD1B_DEDUCTION,
  MAX_HOME_LOAN_INTEREST_SELF_OCCUPIED,
  MAX_80TTA_DEDUCTION,
  MAX_80TTB_DEDUCTION,
} from "./constants";

export interface OldRegimeDeductions {
  section80C: number;
  section80D: number;
  hra: number;
  homeLoanInterest: number; // Section 24(b)
  section80TTATTB: number;
  section80CCD1B: number; // NPS
  others: number;
}

export type AgeGroup = "below60" | "60to80" | "above80";

export interface TaxCalculationResult {
  finalTaxableIncome: number;
  taxOnIncome: number; // Tax calculated on taxable income based on slabs
  surchargeApplied: number;
  taxAfterSurcharge: number; // taxOnIncome + surchargeApplied (with marginal relief)
  rebateApplied: number;
  taxPayableBeforeCess: number; // taxAfterSurcharge - rebateApplied
  cessAmount: number;
  totalTaxPayable: number; // taxPayableBeforeCess + cessAmount
}

// Helper function to calculate tax based on income slabs
const calculateSlabTax = (
  income: number,
  slabs: Array<{ limit: number; rate: number }>
): number => {
  let tax = 0;
  let previousLimit = 0;
  for (const slab of slabs) {
    if (income <= previousLimit) break; // No more income to tax in higher slabs

    const taxableInSlab = Math.min(income, slab.limit) - previousLimit;
    tax += taxableInSlab * slab.rate;

    previousLimit = slab.limit;
    if (income <= slab.limit) break; // All income taxed
  }
  return tax;
};

// Helper function to calculate surcharge with marginal relief
const calculateSurchargeWithMarginalRelief = (
  netTaxableIncome: number,
  taxOnIncome: number,
  surchargeSlabs: Array<{ incomeLimit: number; till: number; rate: number }>
): number => {
  if (taxOnIncome <= 0) return 0; // No surcharge if no tax

  let surchargeRate = 0;
  let applicableSlab:
    | { incomeLimit: number; till: number; rate: number }
    | undefined = undefined;

  for (const slab of surchargeSlabs) {
    if (netTaxableIncome > slab.incomeLimit) {
      surchargeRate = slab.rate;
      applicableSlab = slab;
    } else {
      break; // Income is below this surcharge slab
    }
  }

  if (surchargeRate === 0 || !applicableSlab) {
    return 0; // No surcharge applicable
  }

  const surchargeWithoutRelief = taxOnIncome * surchargeRate;

  // Marginal Relief Calculation
  // Tax on the threshold income (e.g., 50L, 1Cr) + (Net Taxable Income - Threshold Income)
  const taxAtThresholdIncome = calculateSlabTax(
    applicableSlab.incomeLimit,
    netTaxableIncome < NEW_REGIME_REBATE_LIMIT_INCOME_FY2025_26 &&
      surchargeSlabs === NEW_REGIME_SURCHARGE_RATES_FY2025_26
      ? NEW_REGIME_SLABS_FY2025_26
      : OLD_REGIME_SLABS.below60 // This slab selection for marginal relief might need refinement based on specific regime context
  );
  // Note: The slab selection for taxAtThresholdIncome in marginal relief is a simplification.
  // Proper marginal relief calculates tax on the income at the lower end of the surcharge slab,
  // adds surcharge applicable at that lower end (if any from a previous slab),
  // and then compares (tax on current income + surcharge) vs (tax on threshold income + surcharge on that + (current income - threshold income)).

  const incomeExceedingThreshold =
    netTaxableIncome - applicableSlab.incomeLimit;
  const maxPermissibleTaxIncrease =
    taxAtThresholdIncome + incomeExceedingThreshold;

  // Surcharge is applicable on taxOnIncome. Marginal relief restricts (taxOnIncome + surcharge)
  const taxPlusSurchargeWithoutRelief = taxOnIncome + surchargeWithoutRelief;

  // Calculate tax on the income at the exact threshold of the current surcharge slab
  // This is complex because the tax function itself might call surcharge if nested.
  // Simplified approach for marginal relief:
  // The tax increase due to crossing the surcharge threshold should not be more than the income exceeding that threshold.
  // So, surcharge should not exceed (income_exceeding_threshold - (tax_on_current_income - tax_on_threshold_income))
  // This means: (Tax on income + Surcharge) should not be more than (Tax on threshold_income + (income - threshold_income))

  // Tax on income at the lower boundary of the current surcharge slab
  const taxOnLowerBoundary = calculateSlabTax(
    applicableSlab.incomeLimit,
    OLD_REGIME_SLABS.below60
  ); // Generic slabs for this example
  // Surcharge applicable just below this threshold (from previous surcharge slab, if any)
  let surchargeOnLowerBoundaryTax = 0;
  if (applicableSlab.incomeLimit > surchargeSlabs[0].incomeLimit) {
    // Check if not the first surcharge slab
    let rateForLowerBoundarySurcharge = 0;
    for (let i = surchargeSlabs.indexOf(applicableSlab) - 1; i >= 0; i--) {
      if (applicableSlab.incomeLimit > surchargeSlabs[i].incomeLimit) {
        rateForLowerBoundarySurcharge = surchargeSlabs[i].rate;
        break;
      }
    }
    surchargeOnLowerBoundaryTax =
      taxOnLowerBoundary * rateForLowerBoundarySurcharge;
  }

  const taxPayableAtLowerBoundary =
    taxOnLowerBoundary + surchargeOnLowerBoundaryTax;
  const allowedTaxIncrease = incomeExceedingThreshold;
  const maxTotalTaxWithSurcharge =
    taxPayableAtLowerBoundary + allowedTaxIncrease;

  if (taxPlusSurchargeWithoutRelief > maxTotalTaxWithSurcharge) {
    return maxTotalTaxWithSurcharge - taxOnIncome; // This is the relieved surcharge
  }

  return surchargeWithoutRelief;
};

export const calculateOldRegimeTax = (
  annualIncome: number,
  ageGroup: AgeGroup,
  deductions: OldRegimeDeductions,
  isSalaried: boolean
): TaxCalculationResult => {
  let taxableIncome = annualIncome;

  if (isSalaried) {
    taxableIncome -= OLD_REGIME_STANDARD_DEDUCTION;
  }

  const current80C = Math.min(deductions.section80C, MAX_80C_DEDUCTION);
  const current80CCD1B = Math.min(
    deductions.section80CCD1B,
    MAX_80CCD1B_DEDUCTION
  );
  // Note: 80C and 80CCD(1B) are separate. Total 80C + 80CCD(1) + 80CCE limit is 1.5L. 80CCD(1B) is over and above.
  // For simplicity, we are taking 80C and 80CCD(1B) and capping them individually.

  const currentHomeLoanInterest = Math.min(
    deductions.homeLoanInterest,
    MAX_HOME_LOAN_INTEREST_SELF_OCCUPIED
  );

  let current80TTATTB = 0;
  if (ageGroup === "below60") {
    current80TTATTB = Math.min(deductions.section80TTATTB, MAX_80TTA_DEDUCTION);
  } else {
    // Senior or Super Senior Citizen
    current80TTATTB = Math.min(deductions.section80TTATTB, MAX_80TTB_DEDUCTION);
  }

  taxableIncome -=
    current80C +
    current80CCD1B +
    deductions.section80D + // Assuming user enters eligible 80D amount
    currentHomeLoanInterest +
    current80TTATTB +
    deductions.hra + // Assuming user enters eligible HRA exemption
    deductions.others;

  taxableIncome = Math.max(0, taxableIncome);
  const finalTaxableIncome = taxableIncome;

  const slabs = OLD_REGIME_SLABS[ageGroup];
  const taxOnIncome = calculateSlabTax(finalTaxableIncome, slabs);

  // Calculate Surcharge
  const surchargeApplied = calculateSurchargeWithMarginalRelief(
    finalTaxableIncome,
    taxOnIncome,
    OLD_REGIME_SURCHARGE_RATES
  );
  const taxAfterSurcharge = taxOnIncome + surchargeApplied;

  // Apply Rebate u/s 87A (on tax after surcharge)
  let rebateApplied = 0;
  if (finalTaxableIncome <= OLD_REGIME_REBATE_LIMIT_INCOME) {
    rebateApplied = Math.min(taxAfterSurcharge, OLD_REGIME_REBATE_MAX_AMOUNT);
  }
  const taxPayableBeforeCess = taxAfterSurcharge - rebateApplied;

  const cessAmount = taxPayableBeforeCess * CESS_RATE;
  const totalTaxPayable = taxPayableBeforeCess + cessAmount;

  return {
    finalTaxableIncome,
    taxOnIncome,
    surchargeApplied,
    taxAfterSurcharge,
    rebateApplied,
    taxPayableBeforeCess,
    cessAmount,
    totalTaxPayable,
  };
};

export const calculateNewRegimeTax = (
  annualIncome: number,
  isSalaried: boolean
): TaxCalculationResult => {
  let taxableIncome = annualIncome;

  if (isSalaried) {
    taxableIncome -= NEW_REGIME_STANDARD_DEDUCTION_FY2025_26;
  }
  // No other deductions are generally allowed in the new regime, except for employer's NPS contribution (Sec 80CCD(2)),
  // which is typically reduced from salary by employer, or specific business deductions.
  // For this simple calculator, we assume no other deductions for the new regime.

  taxableIncome = Math.max(0, taxableIncome);
  const finalTaxableIncome = taxableIncome;

  const taxOnIncome = calculateSlabTax(
    finalTaxableIncome,
    NEW_REGIME_SLABS_FY2025_26
  );

  // Calculate Surcharge
  const surchargeApplied = calculateSurchargeWithMarginalRelief(
    finalTaxableIncome,
    taxOnIncome,
    NEW_REGIME_SURCHARGE_RATES_FY2025_26
  );
  const taxAfterSurcharge = taxOnIncome + surchargeApplied;

  // Apply Rebate u/s 87A (on tax after surcharge)
  let rebateApplied = 0;
  if (finalTaxableIncome <= NEW_REGIME_REBATE_LIMIT_INCOME_FY2025_26) {
    rebateApplied = Math.min(
      taxAfterSurcharge,
      NEW_REGIME_REBATE_MAX_AMOUNT_FY2025_26
    );
  }
  const taxPayableBeforeCess = taxAfterSurcharge - rebateApplied;

  const cessAmount = taxPayableBeforeCess * CESS_RATE;
  const totalTaxPayable = taxPayableBeforeCess + cessAmount;

  return {
    finalTaxableIncome,
    taxOnIncome,
    surchargeApplied,
    taxAfterSurcharge,
    rebateApplied,
    taxPayableBeforeCess,
    cessAmount,
    totalTaxPayable,
  };
};
