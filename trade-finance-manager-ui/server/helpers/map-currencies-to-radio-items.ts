import { CURRENCY, RadioItem } from '@ukef/dtfs2-common';

// TODO FN-2311: Add docs.
// TODO FN-2311: Add unit tests for this function.
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
