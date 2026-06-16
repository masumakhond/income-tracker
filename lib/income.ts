export type Entry = {
  id: string;
  monthId: string;
  date: string;
  earnedFrom: string;
  amount: number;
  earnedBy: "Masum" | "Toyeeba" | "";
  note: string;
};

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

export function getLastMonthYearMonth() {
  const now = new Date();
  now.setDate(1);
  now.setMonth(now.getMonth() - 1);
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, "0"),
  };
}

export function monthLabel(monthId: string) {
  const month = monthId.split("-")[1];
  return MONTHS.find((item) => item.value === month)?.label ?? monthId;
}

export function buildRunningTotals(entries: Entry[]) {
  let runningM = 0;
  let runningT = 0;

  return [...entries]
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .map((entry) => {
      const amount = Number(entry.amount) || 0;
      if (entry.earnedBy === "Masum") runningM += amount;
      if (entry.earnedBy === "Toyeeba") runningT += amount;
      return {
        ...entry,
        runningM,
        runningT,
        runningTotal: runningM + runningT,
      };
    });
}

export function summarizeEntries(entries: Entry[]) {
  const masum = entries
    .filter((entry) => entry.earnedBy === "Masum")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const toyeeba = entries
    .filter((entry) => entry.earnedBy === "Toyeeba")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  return { masum, toyeeba, total: masum + toyeeba };
}
