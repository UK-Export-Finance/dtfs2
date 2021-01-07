const db = require('../../../drivers/db-client');
const now = require('../../../now');
const { generateFacilityId } = require('../../../utils/generate-ids');
const getFacilityErrors = require('../../validation/create-facility');
const { findOneDeal } = require('../deal/get-deal.controller');
const { addFacilityIdToDeal } = require('../deal/update-deal.controller');

const createFacility = async (req) => {
  const collection = await db.getCollection('facilities');
  const facilityId = await generateFacilityId();

  const {
    user,
    facilityType,
    associatedDealId,
  } = req.body;

  const newFacility = {
    _id: facilityId,
    facilityType,
    associatedDealId,
    createdDate: now(),
  };

  const response = await collection.insertOne(newFacility);
  const createdFacility = response.ops[0];

  await addFacilityIdToDeal(
    associatedDealId,
    createdFacility._id, // eslint-disable-line no-underscore-dangle
    user,
  );

  return createdFacility;
};

exports.createFacilityPost = async (req, res) => {
  // TODO add user / user object to validation
  const validationErrors = getFacilityErrors(req.body);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const { associatedDealId } = req.body;

  return findOneDeal(associatedDealId, async (deal) => {
    if (deal) {
      const facility = await createFacility(req);

      return res.status(200).send(facility);
    }

    return res.status(404).send('Deal not found');
  });
};
