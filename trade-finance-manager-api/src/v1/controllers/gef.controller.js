
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

const updateGefFacility = async (applicationId, applicationUpdate) => {
  const collection = await db.getCollection('gef-facilities');

  await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(applicationId)) } },
    {
      $set: applicationUpdate,
    },
    { returnOriginal: false },
  );
};

module.exports = {
  updateGefApplication,
  updateGefFacility,
};
