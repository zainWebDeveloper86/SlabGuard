import { LuChartLine, LuLightbulb, LuZap } from "react-icons/lu";

// 2. Dummy Data (Missing - Chart ko chalane ke liye zaroori hai)
export const usageData = [
  { date: "1", units: 4 },
  { date: "2", units: 6 },
  { date: "3", units: 8 },
  { date: "4", units: 5 },
  { date: "5", units: 9 },
  { date: "6", units: 7 },
  { date: "7", units: 10 },
];

export const stats = [
  {
    title: "Current Units",
    value: "142.5",
    unit: "kWh",
    icon: <LuZap size={20} />,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Predicted Bill",
    value: "₨ 3,850",
    unit: "Est.",
    icon: <LuChartLine size={20} />,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Slab Status",
    value: "Protective",
    unit: "Safe",
    icon: <LuLightbulb size={20} />,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];
