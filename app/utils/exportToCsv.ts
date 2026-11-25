export const exportToCsv = ({
  data,
  headers,
  filename,
}: {
  data: Record<string, unknown>[];
  headers: { key: string; label: string }[];
  filename: string;
}) => {
  const escapeField = (value: unknown): string => {
    if (value == null) return "";
    let str = String(value);
    // Spreadsheet formula injection: a cell that opens with one of these is
    // run as a formula by Excel and Sheets, and every value here was typed by
    // somebody -- a patient named =HYPERLINK(...) would be live in the export.
    // A leading apostrophe makes the cell text. A value made only of digits
    // and phone punctuation is left alone: it cannot call anything, and an
    // international number like +55 11 91234-5678 must export as typed.
    if (
      typeof value === "string" &&
      /^[=+\-@\t\r]/.test(str) &&
      !/^[+-]?[\d\s().-]+$/.test(str)
    ) {
      str = `'${str}`;
    }
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map((h) => escapeField(h.label)).join(",");
  const rows = data.map((row) =>
    headers.map((h) => escapeField(row[h.key])).join(",")
  );
  const csvContent = [headerRow, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
