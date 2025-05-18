// src/components/TaxResultsTable.tsx
import React from "react";

interface RegimeResult {
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number; // Sum of all deductions including standard
  taxableIncome: number;
  taxBeforeSurcharge: number; // Tax calculated on taxable income based on slabs
  surcharge: number;
  taxAfterSurchargeBeforeRebate: number; // Tax + Surcharge
  rebateApplied: number;
  taxBeforeCess: number; // Tax + Surcharge - Rebate
  cess: number;
  totalTax: number;
}

export interface Results {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
}

interface TaxResultsTableProps {
  results: Results;
}

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const TaxResultsTable: React.FC<TaxResultsTableProps> = ({ results }) => {
  const { oldRegime, newRegime } = results;

  const tableHeaderClass =
    "px-5 py-4 border-b-2 border-slate-700 bg-slate-700/50 text-left text-xs font-semibold text-sky-300 uppercase tracking-wider";
  const tableCellClass =
    "px-5 py-4 border-b border-slate-700 text-sm text-slate-200";
  const highlightCellClass =
    "px-5 py-4 border-b border-slate-700 text-sm font-semibold";

  return (
    <div className="mt-10 bg-slate-800/50 shadow-xl rounded-lg overflow-hidden">
      <h2 className="text-2xl font-semibold p-6 text-sky-400 border-b border-slate-700">
        Tax Calculation Summary
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className={tableHeaderClass}>Particulars</th>
              <th className={`${tableHeaderClass} text-center`}>Old Regime</th>
              <th className={`${tableHeaderClass} text-center`}>
                New Regime (FY 2025-26)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tableCellClass}>Gross Annual Income</td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.grossIncome)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.grossIncome)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>Standard Deduction</td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.standardDeduction)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.standardDeduction)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>Other Deductions Claimed</td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(
                  oldRegime.totalDeductions - oldRegime.standardDeduction
                )}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(
                  newRegime.totalDeductions - newRegime.standardDeduction
                )}
              </td>
            </tr>
            <tr className="bg-slate-700/30">
              <td className={`${highlightCellClass} text-slate-300`}>
                Total Deductions
              </td>
              <td
                className={`${highlightCellClass} text-slate-100 text-center`}
              >
                {formatCurrency(oldRegime.totalDeductions)}
              </td>
              <td
                className={`${highlightCellClass} text-slate-100 text-center`}
              >
                {formatCurrency(newRegime.totalDeductions)}
              </td>
            </tr>
            <tr className="bg-slate-700/30">
              <td className={`${highlightCellClass} text-slate-300`}>
                Net Taxable Income
              </td>
              <td
                className={`${highlightCellClass} text-slate-100 text-center`}
              >
                {formatCurrency(oldRegime.taxableIncome)}
              </td>
              <td
                className={`${highlightCellClass} text-slate-100 text-center`}
              >
                {formatCurrency(newRegime.taxableIncome)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>Income Tax (on Taxable Income)</td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.taxBeforeSurcharge)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.taxBeforeSurcharge)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                Surcharge (incl. Marginal Relief)
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.surcharge)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.surcharge)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                Tax + Surcharge (Before Rebate)
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.taxAfterSurchargeBeforeRebate)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.taxAfterSurchargeBeforeRebate)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>Rebate u/s 87A Applied</td>
              <td className={`${tableCellClass} text-center text-green-400`}>
                {oldRegime.rebateApplied > 0
                  ? `-${formatCurrency(oldRegime.rebateApplied)}`
                  : formatCurrency(0)}
              </td>
              <td className={`${tableCellClass} text-center text-green-400`}>
                {newRegime.rebateApplied > 0
                  ? `-${formatCurrency(newRegime.rebateApplied)}`
                  : formatCurrency(0)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>
                Tax Payable (After Rebate, Before Cess)
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.taxBeforeCess)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.taxBeforeCess)}
              </td>
            </tr>
            <tr>
              <td className={tableCellClass}>Health & Education Cess (4%)</td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(oldRegime.cess)}
              </td>
              <td className={`${tableCellClass} text-center`}>
                {formatCurrency(newRegime.cess)}
              </td>
            </tr>
            <tr className="bg-sky-500/10">
              <td className={`${highlightCellClass} text-sky-300 text-lg`}>
                Total Tax Payable
              </td>
              <td
                className={`${highlightCellClass} text-sky-200 text-center text-lg`}
              >
                {formatCurrency(oldRegime.totalTax)}
              </td>
              <td
                className={`${highlightCellClass} text-sky-200 text-center text-lg`}
              >
                {formatCurrency(newRegime.totalTax)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxResultsTable;
