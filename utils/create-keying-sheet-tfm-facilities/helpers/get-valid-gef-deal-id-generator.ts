import { Collection } from 'mongodb';
import { faker } from '@faker-js/faker';
import { mongoDbClient } from '../../drivers/db-client';

/**
 * TFM facilities should have a deal id which is linked to
 * a GEF Mongo DB deal. This function gets those valid ids
 * in the form of a generator so that each facility is
 * randomly linked to a specific deal
 */
export const getValidGefDealIdGenerator = async () => {
  const dealsCollection = (await mongoDbClient.getCollection('deals')) as Collection;
  const dealIds = await dealsCollection
    .find({ dealType: { $eq: 'GEF' } }, { projection: { _id: 1 } })
    .map(({ _id }) => _id)
    .toArray();

  if (dealIds.length === 0) {
    throw new Error('Failed to find any GEF deals');
  }

  return () => faker.helpers.arrayElement(dealIds);
};
