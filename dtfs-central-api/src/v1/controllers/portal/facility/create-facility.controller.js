const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const getCreateFacilityErrors = require('../../../validation/create-facility');
const { findOneDeal } = require('../deal/get-deal.controller');

const createFacility = async (facility) => {
  const collection = await db.getCollection('facilities');

  const { dealId } = facility;

  const newFacility = {
    ...facility,
    dealId: new ObjectId(facility.dealId),
    createdDate: Date.now(),
    updatedAt: Date.now(),
  };

  const response = await collection.insertOne(newFacility);
  const { insertedId } = response;

  return { _id: insertedId };
};

exports.createFacilityPost = async (req, res) => {
  const { facility } = req.body;

  const validationErrors = getCreateFacilityErrors(facility);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const deal = await findOneDeal(facility.dealId);

  if (deal) {
    const createdFacility = await createFacility(facility);

    return res.status(200).send(createdFacility);
  }

  return res.status(404).send('Deal not found');
};
