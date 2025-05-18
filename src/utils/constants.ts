// src/utils/constants.ts

// Common Constants
export const CESS_RATE = 0.04;

// --- Old Tax Regime Constants ---
export const OLD_REGIME_STANDARD_DEDUCTION = 50000;
export const OLD_REGIME_REBATE_LIMIT_INCOME = 500000;
export const OLD_REGIME_REBATE_MAX_AMOUNT = 12500;

export const OLD_REGIME_SLABS = {
  below60: [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 }, // Taxable income from 2.5L to 5L
    { limit: 1000000, rate: 0.2 }, // Taxable income from 5L to 10L
    { limit: Infinity, rate: 0.3 }, // Taxable income above 10L
  ],
  "60to80": [
    // Senior Citizens (60 to 80 years)
    { limit: 300000, rate: 0 },
    { limit: 500000, rate: 0.05 }, // Taxable income from 3L to 5L
    { limit: 1000000, rate: 0.2 }, // Taxable income from 5L to 10L
    { limit: Infinity, rate: 0.3 }, // Taxable income above 10L
  ],
  above80: [
    // Super Senior Citizens (Above 80 years)
    { limit: 500000, rate: 0 },
    { limit: 1000000, rate: 0.2 }, // Taxable income from 5L to 10L
    { limit: Infinity, rate: 0.3 }, // Taxable income above 10L
  ],
};

// Surcharge Rates for Old Regime (on income tax if total income exceeds these limits)
export const OLD_REGIME_SURCHARGE_RATES = [
  { incomeLimit: 5000000, till: 10000000, rate: 0.1 }, // 50 Lakhs to 1 Crore
  { incomeLimit: 10000000, till: 20000000, rate: 0.15 }, // 1 Crore to 2 Crores
  { incomeLimit: 20000000, till: 50000000, rate: 0.25 }, // 2 Crores to 5 Crores
  { incomeLimit: 50000000, till: Infinity, rate: 0.37 }, // Above 5 Crores
];

// --- New Tax Regime Constants (FY 2025-26 / AY 2026-27) ---
export const NEW_REGIME_STANDARD_DEDUCTION_FY2025_26 = 75000;
export const NEW_REGIME_REBATE_LIMIT_INCOME_FY2025_26 = 1200000; // As per budget proposals for FY 25-26
export const NEW_REGIME_REBATE_MAX_AMOUNT_FY2025_26 = 60000; // As per budget proposals for FY 25-26

export const NEW_REGIME_SLABS_FY2025_26 = [
  // Proposed for FY 2025-26
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 0.05 },
  { limit: 1200000, rate: 0.1 },
  { limit: 1600000, rate: 0.15 },
  { limit: 2000000, rate: 0.2 },
  { limit: 2400000, rate: 0.25 },
  { limit: Infinity, rate: 0.3 },
];

// Surcharge Rates for New Regime (FY 2025-26) - Max surcharge is 25%
export const NEW_REGIME_SURCHARGE_RATES_FY2025_26 = [
  { incomeLimit: 5000000, till: 10000000, rate: 0.1 }, // 50 Lakhs to 1 Crore
  { incomeLimit: 10000000, till: 20000000, rate: 0.15 }, // 1 Crore to 2 Crores
  { incomeLimit: 20000000, till: Infinity, rate: 0.25 }, // Above 2 Crores (capped at 25%)
];

// --- Deduction Limits (Old Regime) ---
export const MAX_80C_DEDUCTION = 150000;
export const MAX_80CCD1B_DEDUCTION = 50000; // Additional NPS
export const MAX_HOME_LOAN_INTEREST_SELF_OCCUPIED = 200000; // Section 24(b)
export const MAX_80TTA_DEDUCTION = 10000; // For non-senior citizens
export const MAX_80TTB_DEDUCTION = 50000; // For senior citizens

// For 80D, limits are more complex (e.g., 25k for self/family <60, 50k if >=60; additional for parents)
// For simplicity, the form takes the total eligible 80D amount.
// A more advanced calculator would ask for age of self/family and parents separately.
