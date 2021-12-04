const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');

const { cloneAzureFiles } = require('../utils/clone-azure-files.utils');

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
  clonedExporter.createdAt = Date.now();
  // update the `updatedAt` property and set it to null - default value
  clonedExporter.updatedAt = Date.now();

  // insert a new exporter in the database
  const newExporter = await collection.insertOne(clonedExporter);

  // return the new inserted ID
  return newExporter.insertedId;
};

const cloneSupportingInformation = async (newApplicationId) => {
  const applicationCollection = 'gef-application';
  const collection = await db.getCollection(applicationCollection);

  // get the current GEF deal
  const deal = await collection.findOne({
    _id: ObjectID(String(newApplicationId)),
  });

  const { supportingInformation } = deal;

  // check if there are any documents uploaded
  if ((Object.keys(supportingInformation).length)) {
    const extraInfo = ['status', 'securityDetails'];
    // loop through all document types
    Object.keys(supportingInformation).forEach((docType) => {
      // skip `status` and `securityDetails` properties
      if (!extraInfo.includes(docType)) {
        // loop through the values of each document type
        Object.values(supportingInformation[docType]).forEach((docValue) => {
          // generate a new Object ID for each document
          docValue._id = (new ObjectID()).toHexString();
          docValue.parentId = newApplicationId;
        });
      }
    });

    // update the `supportingInformation` to include the new `parentId` & unique `_id`
    await collection.findOneAndUpdate({ _id: ObjectID(String(newApplicationId)) }, { $set: { supportingInformation } });
  }

  return {};
};

const cloneFacilities = async (currentApplicationId, newApplicationId) => {
  const facilitiesCollection = 'gef-facilities';
  const collection = await db.getCollection(facilitiesCollection);

  // get all existing facilities
  const allFacilities = await collection
    .aggregate([
      {
        $match: { applicationId: ObjectID(String(currentApplicationId)) },
      },
    ])
    .toArray();

  // check if there are any facilities in the db
  if (allFacilities.length) {
    Object.entries(allFacilities).forEach((key, val) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFacilities[val]._id;

      // updated the `applicationId` property to match the new application ID
      allFacilities[val].applicationId = new ObjectID(newApplicationId);
      // update the `createdAt` property to match the current time in EPOCH format
      allFacilities[val].createdAt = Date.now();
      // update the `updatedAt` property to match the current time in EPOCH format
      allFacilities[val].updatedAt = Date.now();
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
  // delete the `comments` property
  delete clonedDeal.comments;
  delete clonedDeal.activity;
  delete clonedDeal.activities;

  clonedDeal.createdAt = Date.now();
  clonedDeal.updatedAt = Date.now();
  clonedDeal.facilitiesUpdated = Date.now();
  clonedDeal.eligibility.updatedAt = Date.now();
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
  const newApplicationId = createdApplication.insertedId;

  // return the ID for the newly inserted deal
  return { newApplicationId };
};

exports.clone = async (req, res) => {
  const {
    body: {
      applicationId: existingApplicationId, bankInternalRefName, additionalRefName, userId, bankId,
    },
  } = req;

  // clone GEF deal
  const { newApplicationId } = await cloneGEFdeal(existingApplicationId, bankInternalRefName, additionalRefName, userId, bankId);

  // clone the corresponding facilities for the cloned deal
  await cloneFacilities(existingApplicationId, newApplicationId.toHexString());

  // clone the supporting information
  await cloneSupportingInformation(newApplicationId.toHexString());

  // clone the azure files from one folder to another
  await cloneAzureFiles(existingApplicationId, newApplicationId.toHexString());

  res.send({ applicationId: newApplicationId });
};
