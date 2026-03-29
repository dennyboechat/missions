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
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
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
