"use client";

import { useState, useMemo } from "react";

// ─── Constants ───────────────────────────────────────────────
const DOWNTIME_REDUCTION = 0.73;
const EMERGENCY_COST_MULTIPLIER = 3;
const ADMIN_TIME_SAVED_PER_TECH_PER_DAY = 1;
const WORKING_DAYS_PER_MONTH = 21;

// ─── Helpers ─────────────────────────────────────────────────
function fmt(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

// ─── InputField Component ────────────────────────────────────
interface InputFieldProps {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

function InputField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step,
  prefix,
  suffix,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState("");

  return (
    <div className="mb-[18px] last:mb-0">
      <label className="block text-[0.85rem] font-semibold text-txt mb-1">
        {label}
      </label>
      <p className="text-[0.75rem] text-txt-light mb-1.5">{hint}</p>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-light font-semibold text-[0.95rem] pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={isFocused ? localValue : value}
          onFocus={() => {
            setIsFocused(true);
            setLocalValue(String(value));
          }}
          onChange={(e) => {
            setLocalValue(e.target.value);
            const parsed = parseFloat(e.target.value);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
          onBlur={() => setIsFocused(false)}
          className={`w-full py-2.5 border-2 border-border rounded-lg text-base font-medium text-txt transition-colors outline-none focus:border-primary ${
            prefix ? "pl-[26px] pr-3" : suffix ? "px-3 pr-[50px]" : "px-3"
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-light text-[0.8rem] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ResultRow Component ─────────────────────────────────────
interface ResultRowProps {
  label: string;
  value: string;
  type?: "default" | "revenue" | "cost";
  bold?: boolean;
  large?: boolean;
}

function ResultRow({
  label,
  value,
  type = "default",
  bold = false,
  large = false,
}: ResultRowProps) {
  const colorClass =
    type === "revenue"
      ? "text-green-text"
      : type === "cost"
        ? "text-red-text"
        : "text-txt";
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
      <span
        className={`text-[0.85rem] ${bold ? "font-bold" : ""} text-txt`}
      >
        {label}
      </span>
      <span
        className={`${large ? "text-[1.2rem]" : "text-[0.85rem]"} ${bold ? "font-bold" : "font-medium"} ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ROICalculator() {
  // Card 1: Your Operation
  const [totalAssets, setTotalAssets] = useState(50);
  const [maintenanceTechs, setMaintenanceTechs] = useState(5);
  const [avgHourlyRate, setAvgHourlyRate] = useState(45);

  // Card 2: Current Downtime
  const [unplannedDowntimeHrs, setUnplannedDowntimeHrs] = useState(40);
  const [costPerDowntimeHr, setCostPerDowntimeHr] = useState(500);

  // Card 3: Current Maintenance Spend
  const [monthlyMaintenanceBudget, setMonthlyMaintenanceBudget] =
    useState(25000);
  const [pctReactive, setPctReactive] = useState(60);

  // Card 4: OptiAM Investment
  const [monthlySubscription, setMonthlySubscription] = useState(500);
  const [implementationCost, setImplementationCost] = useState(5000);

  const calc = useMemo(() => {
    // Core
    const reactiveSpend = monthlyMaintenanceBudget * (pctReactive / 100);

    // Downtime savings
    const downtimeHoursSaved = unplannedDowntimeHrs * DOWNTIME_REDUCTION;
    const monthlyDowntimeSavings = downtimeHoursSaved * costPerDowntimeHr;

    // Maintenance efficiency savings
    const reactiveReduction = reactiveSpend * DOWNTIME_REDUCTION;
    const maintenanceSavings =
      reactiveReduction * (1 - 1 / EMERGENCY_COST_MULTIPLIER);

    // Labor efficiency
    const laborHoursSaved =
      maintenanceTechs *
      ADMIN_TIME_SAVED_PER_TECH_PER_DAY *
      WORKING_DAYS_PER_MONTH;
    const laborSavings = laborHoursSaved * avgHourlyRate;

    // Totals
    const totalMonthlySavings =
      monthlyDowntimeSavings + maintenanceSavings + laborSavings;
    const monthlyNetSavings = totalMonthlySavings - monthlySubscription;
    const annualNetSavings = monthlyNetSavings * 12 - implementationCost;

    // Payback & ROI
    const totalFirstYearCost =
      monthlySubscription * 12 + implementationCost;
    const paybackMonths =
      totalMonthlySavings > monthlySubscription
        ? totalFirstYearCost / totalMonthlySavings
        : Infinity;
    const firstYearROI =
      totalFirstYearCost > 0
        ? ((totalMonthlySavings * 12 - totalFirstYearCost) /
            totalFirstYearCost) *
          100
        : 0;

    // Comparison table
    const reactiveMonthlyDowntimeCost =
      unplannedDowntimeHrs * costPerDowntimeHr;
    const preventiveMonthlyDowntimeCost =
      reactiveMonthlyDowntimeCost * (1 - DOWNTIME_REDUCTION);

    // Annual stat cards
    const annualDowntimeHoursSaved = downtimeHoursSaved * 12;
    const annualMaintenanceSavings = (maintenanceSavings + laborSavings) * 12;
    const emergencyRepairsEliminated = Math.round(
      totalAssets * (pctReactive / 100) * DOWNTIME_REDUCTION * 12
    );

    return {
      monthlyDowntimeSavings,
      maintenanceSavings,
      laborSavings,
      totalMonthlySavings,
      monthlyNetSavings,
      annualNetSavings,
      paybackMonths,
      firstYearROI,
      reactiveMonthlyDowntimeCost,
      preventiveMonthlyDowntimeCost,
      annualDowntimeHoursSaved,
      annualMaintenanceSavings,
      emergencyRepairsEliminated,
      totalFirstYearCost,
      reactiveSpend,
    };
  }, [
    totalAssets,
    maintenanceTechs,
    avgHourlyRate,
    unplannedDowntimeHrs,
    costPerDowntimeHr,
    monthlyMaintenanceBudget,
    pctReactive,
    monthlySubscription,
    implementationCost,
  ]);

  // Payback display
  const paybackDisplay =
    calc.paybackMonths === Infinity || calc.paybackMonths < 0
      ? "N/A"
      : calc.paybackMonths < 1
        ? "< 1 month"
        : calc.paybackMonths.toFixed(1) + " months";

  const roiDisplay =
    calc.firstYearROI > 0
      ? Math.round(calc.firstYearROI).toLocaleString() + "%"
      : "0%";

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Hero Banner ─── */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-12 px-6 text-center">
        <h1 className="text-[2.2rem] max-md:text-[1.6rem] font-bold text-white tracking-tight">
          OptiAM ROI Calculator
        </h1>
        <p className="text-[1.1rem] text-white/90 max-w-[600px] mx-auto mt-2">
          See how predictive maintenance with OptiAM protects your bottom line
          and eliminates costly unplanned downtime.
        </p>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1100px] mx-auto px-5 py-8 pb-[60px] max-md:px-3.5 max-md:py-5 max-md:pb-10">
        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-7 items-start max-md:grid-cols-1">
          {/* ─── LEFT: Input Cards ─── */}
          <div>
            {/* Card 1 */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 mb-5">
              <h2 className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-bg flex items-center justify-center text-sm shrink-0">
                  1
                </span>
                Your Operation
              </h2>
              <InputField
                label="Number of Assets Managed"
                hint="Equipment, vehicles, facilities, or any assets requiring maintenance"
                value={totalAssets}
                onChange={setTotalAssets}
                min={1}
                max={10000}
              />
              <InputField
                label="Maintenance Team Size"
                hint="Number of technicians and maintenance staff"
                value={maintenanceTechs}
                onChange={setMaintenanceTechs}
                min={1}
                max={500}
              />
              <InputField
                label="Average Hourly Labor Rate"
                hint="Fully loaded cost per technician hour (wages + benefits)"
                value={avgHourlyRate}
                onChange={setAvgHourlyRate}
                prefix="$"
              />
            </div>

            {/* Card 2 */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 mb-5">
              <h2 className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-bg flex items-center justify-center text-sm shrink-0">
                  2
                </span>
                Current Downtime Costs
              </h2>
              <InputField
                label="Unplanned Downtime Hours per Month"
                hint="Hours of unplanned equipment downtime your operation experiences"
                value={unplannedDowntimeHrs}
                onChange={setUnplannedDowntimeHrs}
                suffix="hrs/mo"
              />
              <InputField
                label="Cost per Hour of Downtime"
                hint="Lost production, labor, and opportunity cost per hour of downtime"
                value={costPerDowntimeHr}
                onChange={setCostPerDowntimeHr}
                prefix="$"
              />
            </div>

            {/* Card 3 */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 mb-5">
              <h2 className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-bg flex items-center justify-center text-sm shrink-0">
                  3
                </span>
                Current Maintenance Spend
              </h2>
              <InputField
                label="Monthly Maintenance Budget"
                hint="Total monthly spend on maintenance (parts, labor, contractors)"
                value={monthlyMaintenanceBudget}
                onChange={setMonthlyMaintenanceBudget}
                prefix="$"
              />
              <InputField
                label="% of Maintenance That Is Reactive"
                hint="Percentage of work orders that are unplanned/emergency repairs"
                value={pctReactive}
                onChange={setPctReactive}
                min={0}
                max={100}
                suffix="%"
              />
            </div>

            {/* Card 4 */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7">
              <h2 className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-bg flex items-center justify-center text-sm shrink-0">
                  4
                </span>
                OptiAM Investment
              </h2>
              <InputField
                label="OptiAM Monthly Subscription"
                hint="Monthly licensing cost for OptiAM"
                value={monthlySubscription}
                onChange={setMonthlySubscription}
                prefix="$"
              />
              <InputField
                label="Implementation &amp; Training Cost"
                hint="One-time setup, data migration, and training cost"
                value={implementationCost}
                onChange={setImplementationCost}
                prefix="$"
              />
            </div>
          </div>

          {/* ─── RIGHT: Results Panel ─── */}
          <div className="sticky top-5 max-md:static">
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7">
              <h2 className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-green-bg flex items-center justify-center text-sm shrink-0 text-green-text">
                  $
                </span>
                Monthly Breakdown
              </h2>

              <ResultRow
                label="Downtime Savings"
                value={fmt(calc.monthlyDowntimeSavings)}
                type="revenue"
              />
              <ResultRow
                label="Maintenance Efficiency Savings"
                value={fmt(calc.maintenanceSavings)}
                type="revenue"
              />
              <ResultRow
                label="Labor Productivity Savings"
                value={fmt(calc.laborSavings)}
                type="revenue"
              />

              {/* Solid divider */}
              <div className="border-t-2 border-border mt-2 pt-2">
                <ResultRow
                  label="Gross Monthly Savings"
                  value={fmt(calc.totalMonthlySavings)}
                  type="revenue"
                  bold
                  large
                />
              </div>

              <ResultRow
                label="OptiAM Subscription"
                value={"-" + fmt(monthlySubscription)}
                type="cost"
              />

              {/* Dashed divider */}
              <div className="border-t-2 border-dashed border-border mt-3 pt-3">
                <ResultRow
                  label="Net Monthly Savings"
                  value={fmt(calc.monthlyNetSavings)}
                  type="revenue"
                  bold
                />
              </div>
            </div>

            {/* Annual Impact Banner */}
            <div className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-5 text-center mt-4 text-white">
              <p className="text-[0.85rem] opacity-90 font-semibold uppercase tracking-wider">
                Annual Net Impact
              </p>
              <p className="text-[2.4rem] font-extrabold my-1">
                {fmt(calc.annualNetSavings)}
              </p>
              <p className="text-[0.85rem] opacity-85">
                {calc.annualNetSavings >= 0
                  ? "net savings per year"
                  : "net cost per year"}
              </p>
            </div>

            {/* Payback & ROI */}
            <div className="flex gap-3 mt-3 max-md:flex-col">
              <div className="flex-1 bg-blue-bg rounded-xl py-4 px-5 text-center">
                <p className="text-[0.8rem] text-txt-light font-semibold">
                  Payback Period
                </p>
                <p className="text-2xl font-extrabold text-primary">
                  {paybackDisplay}
                </p>
              </div>
              <div className="flex-1 bg-blue-bg rounded-xl py-4 px-5 text-center">
                <p className="text-[0.8rem] text-txt-light font-semibold">
                  First Year ROI
                </p>
                <p className="text-2xl font-extrabold text-primary">
                  {roiDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stat Cards Row ─── */}
        <div className="grid grid-cols-3 gap-4 mt-7 max-md:grid-cols-1">
          <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
            <p className="text-[1.8rem] font-extrabold text-primary">
              {Math.round(calc.annualDowntimeHoursSaved).toLocaleString()}
            </p>
            <p className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
              Downtime Hours Saved per Year
            </p>
          </div>
          <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
            <p className="text-[1.8rem] font-extrabold text-primary">
              {fmt(calc.annualMaintenanceSavings)}
            </p>
            <p className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
              Annual Maintenance Savings
            </p>
          </div>
          <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
            <p className="text-[1.8rem] font-extrabold text-primary">
              {calc.emergencyRepairsEliminated.toLocaleString()}
            </p>
            <p className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
              Emergency Repairs Eliminated / Year
            </p>
          </div>
        </div>

        {/* ─── Comparison Table ─── */}
        <h2 className="text-[1.3rem] font-bold text-txt text-center mt-10 mb-5">
          Reactive Maintenance vs. Preventive with OptiAM
        </h2>
        <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-primary text-white py-3.5 px-5 text-[0.85rem] font-semibold text-left">
                  Metric
                </th>
                <th className="bg-primary text-white py-3.5 px-5 text-[0.85rem] font-semibold text-right">
                  Reactive (Current)
                </th>
                <th className="bg-primary text-white py-3.5 px-5 text-[0.85rem] font-semibold text-right">
                  Preventive (OptiAM)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Monthly Downtime Cost
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  {fmt(calc.reactiveMonthlyDowntimeCost)}
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  {fmt(calc.preventiveMonthlyDowntimeCost)}
                  <span className="inline-block bg-green-bg text-green-text py-0.5 px-2 rounded-md text-[0.75rem] font-bold ml-1 border border-green-text/20">
                    Save 73%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Maintenance Cost Approach
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  Emergency / break-fix
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Planned / predictive
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Avg. Response to Failure
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  After breakdown
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  30 days advance warning
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Emergency Repair Frequency
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  High ({pctReactive}% reactive)
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Reduced by 73%
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Admin &amp; Paperwork
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  Manual / paper-based
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Automated with OptiAM GO
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-[0.9rem]">
                  Equipment Lifespan Impact
                </td>
                <td className="py-3 px-5 text-[0.9rem] text-right">
                  Shortened by reactive damage
                </td>
                <td className="py-3 px-5 text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Extended through preventive care
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ─── Assumptions & Notes ─── */}
        <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] mt-10 py-6 px-7">
          <h3 className="text-[0.9rem] text-txt-light mb-2.5 font-semibold">
            Assumptions &amp; Notes
          </h3>
          <ul className="list-none grid grid-cols-2 gap-x-6 gap-y-1.5 max-md:grid-cols-1">
            {[
              "Emergency repairs typically cost 3-9x more than scheduled maintenance (we use a conservative 3x multiplier)",
              "OptiAM users report a 73% reduction in emergency repairs",
              "Labor efficiency assumes ~1 hour saved per technician per day through automated scheduling and digital work orders",
              "Downtime costs vary widely by industry ($500/hr default is a moderate estimate)",
              "Implementation costs are one-time and may vary based on number of assets and users",
              "21 working days per month, 252 working days per year",
            ].map((note, i) => (
              <li
                key={i}
                className="text-[0.8rem] text-txt-light pl-3.5 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-border"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* ─── CTA ─── */}
        <div className="text-center mt-12">
          <p className="text-base text-txt-light mb-4">
            Ready to transform reactive maintenance into predictive excellence?
          </p>
          <div className="flex justify-center gap-3 max-md:flex-col max-md:items-center">
            <button className="inline-block bg-gradient-to-br from-primary to-primary-dark text-white py-3.5 px-9 rounded-[10px] text-base font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,118,110,0.3)] transition-all cursor-pointer">
              Schedule a Demo
            </button>
            <button className="inline-block border-2 border-primary text-primary py-3.5 px-9 rounded-[10px] text-base font-bold hover:bg-primary hover:text-white transition-all cursor-pointer">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
