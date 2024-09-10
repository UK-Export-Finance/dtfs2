import orderBy from 'lodash.orderby';
import { parseISO } from 'date-fns';
import { IsoDateTimeStamp } from '@ukef/dtfs2-common';

export type GetKeyToDateSortValueMapItem = {
  date?: IsoDateTimeStamp;
  key: number | string;
};

/**
 * Gets the key to date sort value map
 *
 * This function generates a map to get the numeric sort value for
 * the list supplied, where the key is specified in each item of
 * the list. Where date timestamps are undefined, they are set to
 * -1 for the sorting step, causing them to be positioned at the
 * start of the sorted list. Otherwise, the items are sorted by
 * date timestamp ascending.
 * @param items - List of the timestamps to sort by and key
 * @returns The key to sort value map
 */
export const getKeyToDateSortValueMap = (items: GetKeyToDateSortValueMapItem[]): Record<number, number> => {
  const sortedProperties = orderBy(items, [({ date }): number => (date ? parseISO(date).getTime() : -1)], ['asc']);
  return sortedProperties.reduce(
    (propertyMap, sortedProperty, dataSortValue) => ({
      ...propertyMap,
      [sortedProperty.key]: dataSortValue,
    }),
    {},
  );
};
