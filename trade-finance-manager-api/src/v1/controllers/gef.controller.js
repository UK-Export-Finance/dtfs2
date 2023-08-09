const { ObjectId } = require('bson');
const db = require('../../drivers/db-client');

const updateGefApplication = async (dealId, applicationUpdate) => {
  const collection = await db.getCollection('deals');

  const updatedApplication = await collection.findOneAndUpdate( // TODO SR-8
    { _id: { $eq: ObjectId(String(dealId)) } },
    {
      $set: applicationUpdate,
    },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  return updatedApplication;
};

const updateGefFacility = async (facilityId, facilityUpdate) => {
  const collection = await db.getCollection('facilities');

  const updatedFacility = await collection.findOneAndUpdate( // TODO SR-8
    { _id: { $eq: ObjectId(facilityId) } },
    {
      $set: facilityUpdate,
    },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  return updatedFacility;
};

module.exports = {
  updateGefApplication,
  updateGefFacility,
};
