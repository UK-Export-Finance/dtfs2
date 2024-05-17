import orderBy from 'lodash.orderby';
import { Currency } from '@ukef/dtfs2-common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FeeRecordItem } from '../../../api-response-types';

export type GetFeeRecordItemIndexToDataSortValueMapItem = {
  currency?: Currency | undefined;
  amount?: number | undefined;
  feeRecordIndex: number;
};

/**
 * Gets the fee record item index to data sort value map
 *
 * This function generates a map to get the data sort value for
 * the list supplied. The list is expected to be for a property
 * in the {@link FeeRecordItem} object which has a currency and
 * amount property. As some of these properties can also be
 * null, this function allows for those inputs as well. Null
 * values will result in the `currency` and `amount` properties
 * being undefined, which will cause them to be put to the top
 * of the sorted list.
 * @param items - The fee record items
 * @returns The fee record index to data sort value map
 */
export const getFeeRecordItemIndexToDataSortValueMap = (items: GetFeeRecordItemIndexToDataSortValueMapItem[]): { [key: number]: number } => {
  const sortedProperties = orderBy(items, [({ currency }) => currency ?? '', ({ amount }) => amount ?? 0], ['asc']);
  return sortedProperties.reduce(
    (propertyMap, sortedProperty, dataSortValue) => ({
      ...propertyMap,
      [sortedProperty.feeRecordIndex]: dataSortValue,
    }),
    {},
  );
};
