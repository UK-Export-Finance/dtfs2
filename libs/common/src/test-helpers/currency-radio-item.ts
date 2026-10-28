import { Currency, RadioItem } from '@ukef/types';

type CurrencyRadioItemParams = {
  currency: Currency;
  checked: boolean;
};

export const aCurrencyRadioItem = ({ currency, checked }: CurrencyRadioItemParams): RadioItem => ({
  text: currency,
  value: currency,
  checked,
  attributes: {
    'data-cy': `currency-${currency}`,
  },
});
