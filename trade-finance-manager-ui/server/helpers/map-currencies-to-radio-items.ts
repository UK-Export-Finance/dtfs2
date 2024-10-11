import { CURRENCY, RadioItem } from '@ukef/dtfs2-common';

/**
 * Maps currencies to radio items for form input.
 * Uses the {@link CURRENCY} enum to get all available currencies.
 * @param checkedCurrency - The currency radio item to be marked as checked
 * (optional)
 * @returns An array of RadioItem objects representing currency options
 */
export const mapCurrenciesToRadioItems = (checkedCurrency?: string): RadioItem[] => {
  const currencies = Object.values(CURRENCY);

  return currencies.map((currency) => ({
    text: currency,
    value: currency,
    checked: checkedCurrency === currency,
    attributes: {
      'data-cy': `currency-${currency}`,
    },
  }));
};
