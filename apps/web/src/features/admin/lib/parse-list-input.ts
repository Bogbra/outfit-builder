export function parseListInput(value: string, separator: RegExp = /,/): string[] {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}
