import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { mongoDbClient as db } from '../../../../drivers/db-client';

export const findAll = async (_id, callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  const facilities = await collection.find().toArray();

  if (callback) {
    callback(facilities);
  }

  return facilities;
};

export const findAllFacilitiesByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    // BSS facilities
    const facilities = await collection.find({ dealId: { $eq: ObjectId(dealId) }, $or: [{ type: { $eq: 'Bond' } }, { type: { $eq: 'Loan' } }] }).toArray();
    return facilities;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

export const findAllGet = async (req, res) => {
  const facilities = await findAll();
  return res.status(200).send(facilities);
};
