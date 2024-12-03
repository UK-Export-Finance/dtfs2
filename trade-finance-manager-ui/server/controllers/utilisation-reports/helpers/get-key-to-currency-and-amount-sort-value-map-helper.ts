import orderBy from 'lodash.orderby';
import { Currency } from '@ukef/dtfs2-common';

export type GetKeyToSortValueMapItem = {
  currency?: Currency | undefined;
  amount?: number | undefined;
  key: number | string;
};

/**
 * Gets the key to currency and amount sort value map
 *
 * This function generates a map to get the numeric sort value for
 * the list supplied, where the key is specified in each item of
 * the list. Where currency and amounts are undefined, the are set
 * to an empty string or zero respectively for the sorting step,
 * causing them to be positioned at the start of the sorted list.
 * Otherwise, the items are sorted alphabetically by currency and
 * numerically by amount in ascending order.
 * @param items - List of the currency and amount to sort by and key
 * @returns The key to sort value map
 */
export const getKeyToCurrencyAndAmountSortValueMap = (items: GetKeyToSortValueMapItem[]): Record<number, number> => {
  const sortedProperties = orderBy(items, [({ currency }) => currency ?? '', ({ amount }) => amount ?? 0], ['asc']);
  return sortedProperties.reduce(
    (propertyMap, sortedProperty, dataSortValue) => ({
      ...propertyMap,
      [sortedProperty.key]: dataSortValue,
    }),
    {},
  );
};
