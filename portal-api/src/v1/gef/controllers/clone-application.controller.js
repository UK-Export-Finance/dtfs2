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

const cloneSupportingInformation = async (existingApplicationId, newApplicationId) => {
  const applicationCollectionName = 'gef-application';
  const applicationCollection = await db.getCollection(applicationCollectionName);
  const filesCollectionName = 'files';
  const filesCollection = await db.getCollection(filesCollectionName);

  // get all existing files
  const allFiles = await filesCollection.aggregate([{ $match: { parentId: ObjectID(String(existingApplicationId)) } }]).toArray();

  // check if there are any files in the db
  if (allFiles.length) {
    Object.entries(allFiles).forEach((key, val) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFiles[val]._id;
      // updated the `applicationId` property to match the new application ID
      allFiles[val].parentId = new ObjectID(newApplicationId);
    });

    await filesCollection.insertMany(allFiles);

    // get all existing files
    const existingFiles = await filesCollection.aggregate([{ $match: { parentId: ObjectID(String(newApplicationId)) } }]).toArray();

    if (existingFiles.length) {
      existingFiles.forEach(async (val) => {
        // convert the ids to string format
        val._id = (new ObjectID(val._id)).toHexString();
        val.parentId = (new ObjectID(val.parentId)).toHexString();
        await applicationCollection.findOneAndUpdate(
          { _id: { $eq: ObjectID(newApplicationId) } },
          {
            // set the updatedAt property to the current time in EPOCH format
            $set: { updatedAt: Date.now() },
            // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
            $push: { [`supportingInformation.${val.documentPath}`]: val }
          }
        );
      });
    }
  }
};

const cloneFacilities = async (currentApplicationId, newApplicationId) => {
  const facilitiesCollection = 'gef-facilities';
  const collection = await db.getCollection(facilitiesCollection);

  // get all existing facilities
  const allFacilities = await collection.aggregate([{ $match: { applicationId: ObjectID(String(currentApplicationId)) } }]).toArray();

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
    await collection.insertMany(allFacilities);
  }
};

const cloneDeal = async (applicationId, bankInternalRefName, additionalRefName, userId, bankId) => {
  const applicationCollection = 'gef-application';
  const collection = await db.getCollection(applicationCollection);
  const unusedProperties = ['_id', 'ukefDecision', 'comments', 'previousStatus', 'portalActivities'];
  const unusedSupportingInfo = ['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports', 'exportLicence'];

  // get the current GEF deal
  const existingDeal = await collection.findOne({
    _id: ObjectID(String(applicationId)),
  });

  const clonedDeal = existingDeal;

  // delete unused properties
  unusedProperties.forEach((property) => {
    delete clonedDeal[property];
  });
  // unusedSupportingInfo unused properties
  unusedSupportingInfo.forEach((property) => {
    delete clonedDeal.supportingInformation[property];
  });

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
  return { newApplicationId: newApplicationId.toHexString() };
};

exports.clone = async (req, res) => {
  const {
    body: {
      applicationId: existingApplicationId, bankInternalRefName, additionalRefName, userId, bankId,
    },
  } = req;

  // clone GEF deal
  const { newApplicationId } = await cloneDeal(existingApplicationId, bankInternalRefName, additionalRefName, userId, bankId);

  // clone the corresponding facilities
  await cloneFacilities(existingApplicationId, newApplicationId);

  // clone the supporting information
  await cloneSupportingInformation(existingApplicationId, newApplicationId);

  // clone the azure files from one folder to another
  await cloneAzureFiles(existingApplicationId, newApplicationId);

  res.send({ applicationId: newApplicationId });
};
