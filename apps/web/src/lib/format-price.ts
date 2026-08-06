const currencyFormatters = new Map<string, Intl.NumberFormat>();

// priceMinor is integer minor units (cents) — see calculateOutfitTotalPrice
// in packages/contracts/src/logic/price.ts for why prices are stored that
// way instead of as a Float major-unit amount.
export function formatPrice(priceMinor: number, currency: string): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(priceMinor / 100);
}
