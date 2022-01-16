const { ObjectId } = require('bson');
const db = require('../../drivers/db-client');

const updateGefApplication = async (dealId, applicationUpdate) => {
  const collection = await db.getCollection('deals');

  const updatedApplication = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(dealId)) } },
    {
      $set: applicationUpdate,
    },
    { returnDocument: 'after', returnOriginal: false },
  );

  return updatedApplication;
};

const updateGefFacility = async (facilityId, facilityUpdate) => {
  const collection = await db.getCollection('facilities');

  const updatedFacility = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(facilityId)) } },
    {
      $set: facilityUpdate,
    },
    { returnDocument: 'after', returnOriginal: false },
  );

  return updatedFacility;
};

module.exports = {
  updateGefApplication,
  updateGefFacility,
};
