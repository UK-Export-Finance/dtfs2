import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../../../drivers/db-client';

const createDeal = async (deal) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const response = await collection.insertOne(deal);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

export const createDealPost = async (req, res) => {
  const deal = req?.body;

  if (typeof deal?.dealType !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid deal type' });
  }

  const createdDeal = await createDeal(deal);

  return res.status(200).send(createdDeal);
};
