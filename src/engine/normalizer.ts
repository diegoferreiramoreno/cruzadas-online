export function normalizeWord(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}
