const { ObjectID } = require('mongodb');
const { getUnixTime } = require('date-fns');
const db = require('../../../drivers/db-client');
const now = require('../../../now');

const cloneExporter = async (exporterId) => {
  const exporterCollection = 'gef-exporter';
  const collection = await db.getCollection(exporterCollection);

  // get the current exporter
  const currentExporter = await collection.findOne({
    _id: ObjectID(String(exporterId))
  });

  const clonedExporter = currentExporter;

  // delete the existing `_id` property - this will be re-created when a new deal is inserted
  delete clonedExporter._id;

  // update the `createdAt` property to match the current time in EPOCH format
  clonedExporter.createdAt = getUnixTime(new Date());
  // update the `updatedAt` property and set it to null - default value
  clonedExporter.updatedAt = getUnixTime(new Date());

  // insert a new exporter in the database
  const newExporter = await collection.insertOne(clonedExporter);

  // return the new inserted ID
  return newExporter.insertedId;
};

const cloneFacilities = async (applicationId, newApplicationId) => {
  const facilitiesCollection = 'gef-facilities';
  const collection = await db.getCollection(facilitiesCollection);

  // get all existing facilities
  const allFacilities = await collection
    .aggregate([
      {
        $match: { applicationId: ObjectID(String(applicationId)) },
      },
    ])
    .toArray();

  // check if there are any facilities in the db
  if (allFacilities.length) {
    Object.entries(allFacilities).forEach((key, val) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFacilities[val]._id;
      delete allFacilities[val].applicationId;

      // update the `createdAt` property to match the current time in EPOCH format
      allFacilities[val].applicationId = newApplicationId;
      allFacilities[val].createdAt = now();
      // update the `updatedAt` property to match the current time in EPOCH format
      allFacilities[val].updatedAt = now();
    });
  }

  const createdFacilities = await collection.insertMany(allFacilities);
  return createdFacilities;
};

const cloneGEFdeal = async (applicationId, bankInternalRefName, additionalRefName, userId, bankId) => {
  const applicationCollection = 'gef-application';
  const collection = await db.getCollection(applicationCollection);

  // get the current GEF deal
  const existingDeal = await collection.findOne({
    _id: ObjectID(String(applicationId)),
  });

  const clonedDeal = existingDeal;
  // delete the existing `_id` property - this will be re-created when a new deal is inserted
  delete clonedDeal._id;
  // delete the existing `ukefDecision` property - this does not exist on a new deal
  delete clonedDeal.ukefDecision;

  clonedDeal.createdAt = now();
  clonedDeal.updatedAt = now();
  clonedDeal.facilitiesUpdated = now();
  clonedDeal.eligibility.updatedAt = now();
  clonedDeal.status = 'DRAFT';
  clonedDeal.submissionCount = 0;
  clonedDeal.submissionDate = null;
  clonedDeal.submissionType = null;
  clonedDeal.bankInternalRefName = bankInternalRefName;
  clonedDeal.additionalRefName = additionalRefName;
  clonedDeal.userId = userId;
  clonedDeal.bankId = bankId;
  clonedDeal.ukefDealId = null;
  clonedDeal.checkerId = null;
  clonedDeal.editedBy = [userId];
  clonedDeal.exporterId = await cloneExporter(clonedDeal.exporterId);

  // insert the cloned deal in the database
  const createdApplication = await collection.insertOne(clonedDeal);
  // return the ID for the newly inserted deal
  return createdApplication.insertedId;
};

exports.clone = async (req, res) => {
  const {
    body: {
      applicationId, bankInternalRefName, additionalRefName, userId, bankId,
    },
  } = req;

  // clone GEF deal
  const newApplicationId = await cloneGEFdeal(applicationId, bankInternalRefName, additionalRefName, userId, bankId);

  // clone the corresponding facilities for the cloned deal
  await cloneFacilities(applicationId, newApplicationId);
  res.send({ applicationId: newApplicationId });
};
