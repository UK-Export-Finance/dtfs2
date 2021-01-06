const db = require('../../../drivers/db-client');
const now = require('../../../now');
const { generateFacilityId } = require('../../../utils/generate-ids');
const getFacilityErrors = require('../../validation/create-facility');

const createFacility = async (req) => {
  const collection = await db.getCollection('facilities');
  const facilityId = await generateFacilityId();

  const { facilityType } = req.body;

  const newFacility = {
    _id: facilityId,
    facilityType,
    createdDate: now(),
  };

  const validationErrors = getFacilityErrors(newFacility);

  if (validationErrors.count !== 0) {
    return { validationErrors };
  }

  const response = await collection.insertOne(newFacility);

  const createdFacility = response.ops[0];

  return {
    facility: createdFacility,
  };
};

exports.createFacilityPost = async (req, res) => {
  const {
    validationErrors,
    facility,
  } = await createFacility(req);

  if (validationErrors) {
    return res.status(400).send({
      validationErrors,
    });
  }

  return res.status(200).send(facility);
};
