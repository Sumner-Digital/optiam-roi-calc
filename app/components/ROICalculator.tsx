"use client";

import { useState, useMemo } from "react";

const WORKING_DAYS_PER_YEAR = 252;
const DOWNTIME_REDUCTION_FACTOR = 0.5;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface InputFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  placeholder: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  touched: boolean;
  onBlur: () => void;
}

function InputField({
  label,
  required,
  optional,
  placeholder,
  helperText,
  value,
  onChange,
  touched,
  onBlur,
}: InputFieldProps) {
  const isInvalid = touched && required && (!value || isNaN(Number(value)) || Number(value) <= 0);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-slate-400 font-normal ml-1">(Optional)</span>}
      </label>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || /^\d*\.?\d*$/.test(val)) {
            onChange(val);
          }
        }}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all ${
            isInvalid
              ? "border-red-400 bg-red-50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
      />
      {isInvalid && (
        <p className="text-red-500 text-sm mt-1 font-medium">
          Please enter a valid {placeholder}
        </p>
      )}
      {helperText && (
        <p className="text-slate-500 text-xs mt-2 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
}

export default function ROICalculator() {
  const [teamSize, setTeamSize] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [hourlyCostDowntime, setHourlyCostDowntime] = useState("");
  const [downtimeHours, setDowntimeHours] = useState("");

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const totalSavings = useMemo(() => {
    const team = Number(teamSize) || 0;
    const rate = Number(hourlyRate) || 0;
    const baseSavings = team * rate * WORKING_DAYS_PER_YEAR;

    const costDowntime = Number(hourlyCostDowntime) || 0;
    const hours = Number(downtimeHours) || 0;
    const downtimeSavings =
      costDowntime > 0 && hours > 0
        ? costDowntime * hours * DOWNTIME_REDUCTION_FACTOR
        : 0;

    return baseSavings + downtimeSavings;
  }, [teamSize, hourlyRate, hourlyCostDowntime, downtimeHours]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">
            ROI Calculator
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            The return on investment of using a CMMS
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            By answering a few simple questions, you can determine the return on
            investment of using a computerized maintenance management system.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-8">
            <InputField
              label="How many people are on your team?"
              required
              placeholder="Team Size"
              helperText="This includes all managers and employees, whether or not they have the potential to use or come in contact with the app."
              value={teamSize}
              onChange={setTeamSize}
              touched={!!touchedFields.teamSize}
              onBlur={() => markTouched("teamSize")}
            />
            <InputField
              label="What's the average hourly rate per team member?"
              required
              placeholder="Hourly Rate"
              helperText="This is to be the calculated average. If you are not sure of the average hourly rate of your team members, enter the median amount."
              value={hourlyRate}
              onChange={setHourlyRate}
              touched={!!touchedFields.hourlyRate}
              onBlur={() => markTouched("hourlyRate")}
            />
            <InputField
              label="What is the average hourly cost of downtime?"
              optional
              placeholder="Hourly Cost"
              helperText="This is to be the calculated average. If you are not sure of the average hourly rate of downtime, enter the median amount."
              value={hourlyCostDowntime}
              onChange={setHourlyCostDowntime}
              touched={!!touchedFields.hourlyCostDowntime}
              onBlur={() => markTouched("hourlyCostDowntime")}
            />
            <InputField
              label="How many hours of downtime do you have per year?"
              optional
              placeholder="Downtime Hours"
              value={downtimeHours}
              onChange={setDowntimeHours}
              touched={!!touchedFields.downtimeHours}
              onBlur={() => markTouched("downtimeHours")}
            />
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-xl shadow-lg p-8 text-center lg:sticky lg:top-8">
              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">
                Projected yearly Savings
              </h3>
              <p className="text-4xl md:text-5xl font-bold text-white mb-8">
                {formatCurrency(totalSavings)}
              </p>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Request Personalized Demo
                </button>
                <button className="w-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Free Trial Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24" />
    </div>
  );
}
