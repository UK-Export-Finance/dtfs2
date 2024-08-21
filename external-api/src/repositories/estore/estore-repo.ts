import { ObjectId, UpdateFilter, WithoutId } from 'mongodb';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { getCollection } from '../../database';

export const update = async (dealId: ObjectId, document: UpdateFilter<WithoutId<object>>) => {
  const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

  return collection.updateOne({ 'payload.dealId': { $eq: new ObjectId(dealId) } }, { $set: { document } });
};
