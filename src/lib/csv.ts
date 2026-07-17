export const escapeCSV = (value: string) => `"${value.replaceAll('"', '""')}"`;
