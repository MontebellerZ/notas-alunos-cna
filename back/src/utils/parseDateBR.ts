function parseDateBR(dateStr: string): string {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return dateStr;
  const [day, month, yearRaw] = parts;
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
}

export default parseDateBR;
