// src/components/TaxInputForm.tsx
import React, { useState } from "react";

export interface FormData {
  annualIncome: string;
  isSalaried: boolean;
  ageGroup: "below60" | "60to80" | "above80";
  section80C: string;
  section80D: string;
  hra: string;
  homeLoanInterest: string; // Section 24(b) for self-occupied
  section80TTATTB: string; // Interest on Savings/Deposits
  section80CCD1B: string; // NPS specific deduction
  otherDeductionsOld: string;
}

interface TaxInputFormProps {
  onCalculate: (data: FormData) => void;
}

const TaxInputForm: React.FC<TaxInputFormProps> = ({ onCalculate }) => {
  const [formData, setFormData] = useState<FormData>({
    annualIncome: "",
    isSalaried: true,
    ageGroup: "below60",
    section80C: "",
    section80D: "",
    hra: "",
    homeLoanInterest: "",
    section80TTATTB: "",
    section80CCD1B: "",
    otherDeductionsOld: "",
  });
  const [showOldRegimeDeductions, setShowOldRegimeDeductions] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      // Allow only numbers and a single decimal point for numeric inputs
      if (
        e.target.getAttribute("type") === "number" &&
        value !== "" &&
        !/^\d*\.?\d*$/.test(value)
      ) {
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.annualIncome || parseFloat(formData.annualIncome) < 0) {
      alert("Please enter a valid Annual Income."); // Simple validation
      return;
    }
    onCalculate(formData);
  };

  // Enhanced Tailwind classes for inputs and labels
  const inputClass =
    "w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-400 focus:border-sky-500 outline-none transition-all duration-200 ease-in-out shadow-sm placeholder-slate-400 text-sm sm:text-base";
  const labelClass = "block mb-1.5 text-sm font-medium text-slate-300";
  const descriptionClass = "text-xs text-slate-500 mt-1.5";
  const sectionTitleClass =
    "text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-sky-400 border-b border-slate-700 pb-3";
  const checkboxLabelClass =
    "flex items-center space-x-2.5 text-slate-300 cursor-pointer group";
  const checkboxClass =
    "form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800 transition-all duration-150 group-hover:border-sky-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div>
        <h2 className={sectionTitleClass}>Your Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6">
          <div>
            <label htmlFor="annualIncome" className={labelClass}>
              Annual Gross Income (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" // Changed to text to handle custom validation for numerics if needed, but number is fine with pattern
              name="annualIncome"
              id="annualIncome"
              value={formData.annualIncome}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 1000000"
              min="0"
              step="any" // Allows decimal input
              required
            />
          </div>
          <div>
            <label htmlFor="ageGroup" className={labelClass}>
              Age Group <span className="text-red-400">*</span>
            </label>
            <select
              name="ageGroup"
              id="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              className={`${inputClass} appearance-none`} // remove default arrow for custom styling if desired
            >
              <option value="below60">Below 60 years</option>
              <option value="60to80">60 to 80 years (Senior Citizen)</option>
              <option value="above80">
                Above 80 years (Super Senior Citizen)
              </option>
            </select>
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <label htmlFor="isSalaried" className={checkboxLabelClass}>
            <input
              type="checkbox"
              name="isSalaried"
              id="isSalaried"
              checked={formData.isSalaried}
              onChange={handleChange}
              className={checkboxClass}
            />
            <span className="text-sm sm:text-base">
              I am a Salaried Individual / Pensioner
            </span>
          </label>
          <p className={descriptionClass}>
            Affects Standard Deduction (Old: ₹50K, New FY25-26: ₹75K)
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-sky-400">
            Deductions{" "}
            <span className="text-sm font-normal text-slate-400">
              (Old Regime Only)
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setShowOldRegimeDeductions(!showOldRegimeDeductions)}
            className="text-sm text-sky-400 hover:text-sky-300 focus:outline-none p-1 rounded hover:bg-slate-700 transition-colors"
            aria-expanded={showOldRegimeDeductions}
            aria-controls="deductions-panel"
          >
            {showOldRegimeDeductions ? "Hide Deductions" : "Show Deductions"}
            {/* Simple Chevron Icon for expand/collapse */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`inline-block w-4 h-4 ml-1 transition-transform duration-200 ${
                showOldRegimeDeductions ? "rotate-180" : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {showOldRegimeDeductions && (
          <div
            id="deductions-panel"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6 transition-all duration-300 ease-in-out"
          >
            <div>
              <label htmlFor="section80C" className={labelClass}>
                Sec 80C (PPF, EPF, etc.) (₹)
              </label>
              <input
                type="number"
                name="section80C"
                id="section80C"
                value={formData.section80C}
                onChange={handleChange}
                className={inputClass}
                placeholder="Max ₹1,50,000"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label htmlFor="section80CCD1B" className={labelClass}>
                Sec 80CCD(1B) - NPS (₹)
              </label>
              <input
                type="number"
                name="section80CCD1B"
                id="section80CCD1B"
                value={formData.section80CCD1B}
                onChange={handleChange}
                className={inputClass}
                placeholder="Max ₹50,000"
                min="0"
                step="any"
              />
              <p className={descriptionClass}>Additional to 80C limit.</p>
            </div>
            <div>
              <label htmlFor="section80D" className={labelClass}>
                Sec 80D (Health Insurance) (₹)
              </label>
              <input
                type="number"
                name="section80D"
                id="section80D"
                value={formData.section80D}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., 25000"
                min="0"
                step="any"
              />
              <p className={descriptionClass}>Limit varies based on age.</p>
            </div>
            <div>
              <label htmlFor="homeLoanInterest" className={labelClass}>
                Sec 24(b) - Home Loan Int. (Self-Occupied) (₹)
              </label>
              <input
                type="number"
                name="homeLoanInterest"
                id="homeLoanInterest"
                value={formData.homeLoanInterest}
                onChange={handleChange}
                className={inputClass}
                placeholder="Max ₹2,00,000"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label htmlFor="section80TTATTB" className={labelClass}>
                Sec 80TTA/TTB - Savings Int. (₹)
              </label>
              <input
                type="number"
                name="section80TTATTB"
                id="section80TTATTB"
                value={formData.section80TTATTB}
                onChange={handleChange}
                className={inputClass}
                placeholder="Auto-selects TTA/TTB"
                min="0"
                step="any"
              />
              <p className={descriptionClass}>
                Max ₹10K (80TTA &lt;60) or ₹50K (80TTB &ge;60).
              </p>
            </div>
            <div>
              <label htmlFor="hra" className={labelClass}>
                HRA Exemption Claimed (₹)
              </label>
              <input
                type="number"
                name="hra"
                id="hra"
                value={formData.hra}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter eligible HRA"
                min="0"
                step="any"
              />
              <p className={descriptionClass}>Enter actual exempted amount.</p>
            </div>
            <div className="md:col-span-2">
              {" "}
              {/* Make "Other Deductions" full width on medium screens and above if only one item left, or keep it half */}
              <label htmlFor="otherDeductionsOld" className={labelClass}>
                Other Allowable Deductions (Old Regime) (₹)
              </label>
              <input
                type="number"
                name="otherDeductionsOld"
                id="otherDeductionsOld"
                value={formData.otherDeductionsOld}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Professional Tax"
                min="0"
                step="any"
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-center pt-3 sm:pt-4">
        <button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 text-white font-semibold px-8 sm:px-12 py-3 sm:py-3.5 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
        >
          Calculate Tax
        </button>
      </div>
    </form>
  );
};

export default TaxInputForm;
