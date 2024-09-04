import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { mongoDbClient as db } from '../../../../drivers/db-client';

export const findOneFacility = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    const facility = await collection.findOne({ _id: { $eq: ObjectId(_id) } });

    if (callback) {
      callback(facility);
    }

    return facility;
  }
  return { status: 400, message: 'Invalid Facility Id' };
};

export const findOneFacilityGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facility = await findOneFacility(req.params.id);

    if (facility) {
      return res.status(200).send(facility);
    }

    return res.status(404).send();
  }

  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
