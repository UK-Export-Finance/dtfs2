const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;
const getCreateFacilityErrors = require('../../../validation/create-facility');
const { findOneDeal } = require('../deal/get-deal.controller');
const { addFacilityIdToDeal } = require('../deal/update-deal.controller');

const createFacility = async (facility, user, routePath) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  const { dealId } = facility;

  const newFacility = {
    ...facility,
    dealId: new ObjectId(facility.dealId),
    createdDate: Date.now(),
    updatedAt: Date.now(),
  };

  const response = await collection.insertOne(newFacility);
  const { insertedId } = response;

  await addFacilityIdToDeal(
    dealId,
    insertedId,
    user,
    routePath,
  );

  return { _id: insertedId };
};

exports.createFacilityPost = async (req, res) => {
  const { facility, user } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  if (typeof facility?.type !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid facility payload' });
  }

  const validationErrors = getCreateFacilityErrors(facility);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const deal = await findOneDeal(facility.dealId);

  if (deal) {
    const createdFacility = await createFacility(facility, user, req.routePath);

    return res.status(200).send(createdFacility);
  }

  return res.status(404).send('Deal not found');
};
