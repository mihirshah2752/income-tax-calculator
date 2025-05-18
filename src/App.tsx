// src/App.tsx
import React, { useState, useCallback } from "react";
import TaxInputForm, { type FormData } from "./components/TaxInputForm";
import TaxResultsTable, { type Results } from "./components/TaxResultTable";
import {
  calculateOldRegimeTax,
  calculateNewRegimeTax,
} from "./utils/taxCalculations";
import {
  OLD_REGIME_STANDARD_DEDUCTION,
  NEW_REGIME_STANDARD_DEDUCTION_FY2025_26,
} from "./utils/constants";

const App: React.FC = () => {
  const [results, setResults] = useState<Results | null>(null);
  const [suggestedRegime, setSuggestedRegime] = useState<string | null>(null);

  const handleCalculate = useCallback((data: FormData) => {
    // --- Parsing input values ---
    const annualIncome = parseFloat(data.annualIncome) || 0;
    const section80C = parseFloat(data.section80C) || 0;
    const section80D = parseFloat(data.section80D) || 0;
    const hra = parseFloat(data.hra) || 0;
    const section80TTATTB = parseFloat(data.section80TTATTB) || 0;
    const homeLoanInterest = parseFloat(data.homeLoanInterest) || 0;
    const section80CCD1B = parseFloat(data.section80CCD1B) || 0;
    const otherDeductionsOld = parseFloat(data.otherDeductionsOld) || 0;

    // --- Consolidating deductions for Old Regime ---
    const deductionsOldRegime = {
      section80C,
      section80D,
      hra,
      section80TTATTB,
      homeLoanInterest,
      section80CCD1B,
      others: otherDeductionsOld,
    };

    // --- Old Regime Calculation ---
    const taxOldResult = calculateOldRegimeTax(
      annualIncome,
      data.ageGroup,
      deductionsOldRegime,
      data.isSalaried
    );
    const totalTaxOld = taxOldResult.totalTaxPayable;

    // --- New Regime Calculation (FY 2025-26) ---
    const taxNewResult = calculateNewRegimeTax(annualIncome, data.isSalaried);
    const totalTaxNew = taxNewResult.totalTaxPayable;

    // --- Calculating total deductions for display ---
    const totalDeductionsOldRegime =
      (data.isSalaried ? OLD_REGIME_STANDARD_DEDUCTION : 0) +
      section80C +
      section80CCD1B +
      section80D +
      homeLoanInterest +
      section80TTATTB +
      hra +
      otherDeductionsOld;

    // --- Setting results for display ---
    setResults({
      oldRegime: {
        grossIncome: annualIncome,
        totalDeductions: totalDeductionsOldRegime,
        standardDeduction: data.isSalaried ? OLD_REGIME_STANDARD_DEDUCTION : 0,
        taxableIncome: taxOldResult.finalTaxableIncome,
        taxBeforeSurcharge: taxOldResult.taxOnIncome,
        surcharge: taxOldResult.surchargeApplied,
        taxAfterSurchargeBeforeRebate: taxOldResult.taxAfterSurcharge,
        rebateApplied: taxOldResult.rebateApplied,
        taxBeforeCess: taxOldResult.taxPayableBeforeCess,
        cess: taxOldResult.cessAmount,
        totalTax: totalTaxOld,
      },
      newRegime: {
        grossIncome: annualIncome,
        totalDeductions: data.isSalaried
          ? NEW_REGIME_STANDARD_DEDUCTION_FY2025_26
          : 0,
        standardDeduction: data.isSalaried
          ? NEW_REGIME_STANDARD_DEDUCTION_FY2025_26
          : 0,
        taxableIncome: taxNewResult.finalTaxableIncome,
        taxBeforeSurcharge: taxNewResult.taxOnIncome,
        surcharge: taxNewResult.surchargeApplied,
        taxAfterSurchargeBeforeRebate: taxNewResult.taxAfterSurcharge,
        rebateApplied: taxNewResult.rebateApplied,
        taxBeforeCess: taxNewResult.taxPayableBeforeCess,
        cess: taxNewResult.cessAmount,
        totalTax: totalTaxNew,
      },
    });

    // --- Suggesting the better regime ---
    if (totalTaxOld < totalTaxNew) {
      setSuggestedRegime(
        `The Old Tax Regime seems more beneficial, potentially saving ₹${(
          totalTaxNew - totalTaxOld
        ).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`
      );
    } else if (totalTaxNew < totalTaxOld) {
      setSuggestedRegime(
        `The New Tax Regime (FY 2025-26) seems more beneficial, potentially saving ₹${(
          totalTaxOld - totalTaxNew
        ).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`
      );
    } else {
      setSuggestedRegime("Both regimes result in the same tax liability.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-6 sm:py-8 px-4 font-sans text-slate-100 selection:bg-sky-500 selection:text-white">
      <div className="container mx-auto max-w-3xl lg:max-w-4xl">
        {" "}
        {/* Adjusted max-width for better desktop view */}
        <header className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">
            Income Tax Calculator
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400">
            India - FY 2025-26 (AY 2026-27)
          </p>
        </header>
        <main className="bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-5 sm:p-8 md:p-10">
          {" "}
          {/* Added backdrop-blur */}
          <TaxInputForm onCalculate={handleCalculate} />
          {results && (
            <div className="mt-10 sm:mt-12">
              <TaxResultsTable results={results} />
              {suggestedRegime && (
                <div className="mt-8 p-5 sm:p-6 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/30 rounded-lg text-center shadow-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-sky-300">
                    Suggestion:
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-200">
                    {suggestedRegime}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
        <footer className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-slate-500">
          <p>
            Disclaimer: This calculator is for illustrative purposes only and
            based on proposed budget changes for FY 2025-26. Surcharge
            calculations include marginal relief. Always consult a qualified tax
            professional for financial advice.
          </p>
          <p className="mt-5 font-mono font-bold">
            Created by Mihir Shah © 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
