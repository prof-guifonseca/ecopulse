const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formats a value stored as integer cents into a localized BRL string. */
export function formatCurrencyCents(cents: number): string {
  return BRL.format(cents / 100);
}
