/**
 * Interface representing a currency.
 */
export interface CurrencyInterface {
  /**
   * The unique identifier for the currency.
   */
  currencyId: number;

  /**
   * The display text for the currency.
   */
  text: string;

  /**
   * The unique identifier for the currency instance e.g. 'GBP'.
   */
  id: string;

  /**
   * Indicates whether the currency is disabled.
   * @default false
   */
  disabled?: boolean;
}
