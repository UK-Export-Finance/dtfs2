/**
 * Interface representing a country.
 */
export interface CountryInterface {
  /**
   * The unique identifier for the country.
   */
  id: number;

  /**
   * The name of the country.
   */
  name: string;

  /**
   * Country ISO code e.g. 'GBR'.
   */
  code: string;

  /**
   * Indicates whether the country is disabled.
   * @default false
   */
  disabled?: boolean;
}
