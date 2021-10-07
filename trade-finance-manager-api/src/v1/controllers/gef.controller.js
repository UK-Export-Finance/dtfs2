
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');

const updateGefApplication = async (applicationId, applicationUpdate) => {
  const collection = await db.getCollection('gef-application');

  const updatedApplication = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(applicationId)) } },
    {
      $set: applicationUpdate,
    },
    { returnOriginal: false },
  );

  return updatedApplication;
};

const updateGefFacility = async (facilityId, facilityUpdate) => {
  const collection = await db.getCollection('gef-facilities');

  const updatedFacility = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(facilityId)) } },
    {
      $set: facilityUpdate,
    },
    { returnOriginal: false },
  );

  return updatedFacility;
};

module.exports = {
  updateGefApplication,
  updateGefFacility,
};
