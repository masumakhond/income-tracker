import type { Entry } from "./income";
import { MONTHS, buildRunningTotals, monthLabel, summarizeEntries } from "./income";

function formatMoney(value: number) {
  return `Tk ${Math.round(value).toLocaleString("en-US")}`;
}

const tableDefaults = {
  styles: {
    fontSize: 8,
    cellPadding: 2,
    overflow: "linebreak" as const,
    lineColor: [220, 220, 220] as [number, number, number],
    lineWidth: 0.1,
  },
  headStyles: {
    fillColor: [37, 99, 235] as [number, number, number],
    textColor: 255,
    fontStyle: "bold" as const,
  },
  amountColumnStyles: {
    2: { halign: "right" as const, cellWidth: 24 },
    5: { halign: "right" as const, cellWidth: 26 },
    6: { halign: "right" as const, cellWidth: 24 },
    7: { halign: "right" as const, cellWidth: 24 },
  },
};

export async function downloadMonthPdf(
  entries: Entry[],
  monthId: string,
  year: string,
  month: string
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const monthEntries = entries.filter((entry) => entry.monthId === monthId);
  const displayEntries = buildRunningTotals(monthEntries);
  const totals = summarizeEntries(monthEntries);
  const monthName = MONTHS.find((item) => item.value === month)?.label ?? month;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(`Income Ledger - ${monthName} ${year}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString("en-US")}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Date",
        "Earned From",
        "Amount",
        "Earned By",
        "Note",
        "Total (M&T)",
        "Total (M)",
        "Total (T)",
      ],
    ],
    body: displayEntries.map((entry) => [
      entry.date,
      entry.earnedFrom,
      formatMoney(Number(entry.amount) || 0),
      entry.earnedBy,
      entry.note,
      formatMoney(entry.runningTotal),
      formatMoney(entry.runningM),
      formatMoney(entry.runningT),
    ]),
    styles: tableDefaults.styles,
    headStyles: tableDefaults.headStyles,
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 42 },
      ...tableDefaults.amountColumnStyles,
      4: { cellWidth: 36 },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY;
  doc.setFontSize(11);
  doc.text(
    `Masum: ${formatMoney(totals.masum)}   |   Toyeeba: ${formatMoney(totals.toyeeba)}   |   Overall: ${formatMoney(totals.total)}`,
    14,
    (finalY ?? 28) + 10
  );

  doc.save(`income-${year}-${month}.pdf`);
}

export async function downloadYearPdf(entries: Entry[], year: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const yearEntries = entries.filter((entry) => entry.monthId.startsWith(`${year}-`));
  const monthIds = Array.from(new Set(yearEntries.map((entry) => entry.monthId))).sort();

  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(`Income Ledger - Year ${year}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString("en-US")}`, 14, 23);

  let startY = 30;
  let yearMasum = 0;
  let yearToyeeba = 0;

  for (const monthId of monthIds) {
    const monthEntries = yearEntries.filter((entry) => entry.monthId === monthId);
    const displayEntries = buildRunningTotals(monthEntries);
    const totals = summarizeEntries(monthEntries);
    yearMasum += totals.masum;
    yearToyeeba += totals.toyeeba;

    doc.setFontSize(12);
    doc.text(monthLabel(monthId), 14, startY);

    autoTable(doc, {
      startY: startY + 4,
      head: [["Date", "Earned From", "Amount", "Earned By", "Note"]],
      body: displayEntries.map((entry) => [
        entry.date,
        entry.earnedFrom,
        formatMoney(Number(entry.amount) || 0),
        entry.earnedBy,
        entry.note,
      ]),
      styles: tableDefaults.styles,
      headStyles: {
        fillColor: [22, 163, 74] as [number, number, number],
        textColor: 255,
        fontStyle: "bold" as const,
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 52 },
        2: { halign: "right", cellWidth: 26 },
        3: { cellWidth: 22 },
        4: { cellWidth: 40 },
      },
    });

    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY;
    startY = (finalY ?? startY) + 8;

    doc.setFontSize(9);
    doc.text(
      `Month total - Masum: ${formatMoney(totals.masum)} | Toyeeba: ${formatMoney(totals.toyeeba)} | Overall: ${formatMoney(totals.total)}`,
      14,
      startY
    );
    startY += 12;

    if (startY > 250 && monthId !== monthIds[monthIds.length - 1]) {
      doc.addPage();
      startY = 20;
    }
  }

  doc.setFontSize(12);
  doc.text(
    `Year ${year} total - Masum: ${formatMoney(yearMasum)} | Toyeeba: ${formatMoney(yearToyeeba)} | Overall: ${formatMoney(yearMasum + yearToyeeba)}`,
    14,
    Math.min(startY + 4, 285)
  );

  doc.save(`income-${year}.pdf`);
}
