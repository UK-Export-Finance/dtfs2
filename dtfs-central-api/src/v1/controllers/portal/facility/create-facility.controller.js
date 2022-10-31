const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');
const getCreateFacilityErrors = require('../../../validation/create-facility');
const { findOneBssDeal, findOneGefDeal } = require('../deal/get-deal.controller');
const { addFacilityIdToDeal } = require('../deal/update-deal.controller');

const createBssFacility = async (facility, user, routePath) => {
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

  await addFacilityIdToDeal(dealId, insertedId, user, routePath);

  return { _id: insertedId };
};

exports.postBssFacility = async (req, res) => {
  const { facility, user } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  const validationErrors = getCreateFacilityErrors(facility);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const deal = await findOneBssDeal(facility.dealId);

  if (deal) {
    const createdFacility = await createBssFacility(facility, user, req.routePath);
    return res.status(200).send(createdFacility);
  }

  return res.status(404).send('Deal not found');
};

const createGefFacility = async (newFacility) => {
  const facility = newFacility;
  const collection = await db.getCollection('facilities');

  facility.dealId = new ObjectId(facility.dealId);

  const response = await collection.insertOne(facility);
  const { insertedId } = response;

  return { _id: insertedId };
};

exports.postGefFacility = async (req, res) => {
  const facility = req.body;
  const deal = await findOneGefDeal(facility.dealId);
  if (deal) {
    const updatedFacility = await createGefFacility(facility);
    return res.status(200).send(updatedFacility);
  }
  return res.status(404).send('Deal not found');
};
