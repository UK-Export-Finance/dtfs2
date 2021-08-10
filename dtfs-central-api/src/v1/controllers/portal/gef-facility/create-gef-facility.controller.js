const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../gef-deal/get-gef-deal.controller');

const createFacility = async (facility) => {
  const collection = await db.getCollection('gef-facilities');

  const response = await collection.insertOne(facility);
  const createdFacility = response.ops[0];

  return createdFacility;
};

exports.createFacilityPost = async (req, res) => {
  const facility = req.body;

  return findOneDeal(facility.applicationId, async (deal) => {
    if (deal) {
      const updatedFacility = await createFacility(facility);

      return res.status(200).send(updatedFacility);
    }

    return res.status(404).send('Deal not found');
  });
};
