import { Currency, RadioItem } from '@ukef/dtfs2-common';

export const aCurrencyRadioItem = (currency: Currency): RadioItem => ({
  text: currency,
  value: currency,
  checked: false,
  attributes: {
    'data-cy': `currency-${currency}`,
  },
});
