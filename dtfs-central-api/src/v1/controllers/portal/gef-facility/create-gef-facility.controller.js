const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { findOneDeal } = require('../gef-deal/get-gef-deal.controller');

const createFacility = async (newFacility) => {
  const facility = newFacility;
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  facility.dealId = new ObjectId(facility.dealId);

  const response = await collection.insertOne(facility);
  const { insertedId } = response;

  return { _id: insertedId };
};

exports.createFacilityPost = async (req, res) => {
  const facility = req.body;

  return findOneDeal(facility.dealId, async (deal) => {
    if (deal) {
      if (typeof facility?.type !== 'string') {
        return res.status(400).send({ status: 400, message: 'Invalid facility payload' });
      }

      const updatedFacility = await createFacility(facility);

      return res.status(200).send(updatedFacility);
    }

    return res.status(404).send('Deal not found');
  });
};
