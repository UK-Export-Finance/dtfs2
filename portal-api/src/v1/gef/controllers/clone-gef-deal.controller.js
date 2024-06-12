const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../../drivers/db-client');

const { validateApplicationReferences } = require('./validation/application');
const { exporterStatus } = require('./validation/exporter');
const CONSTANTS = require('../../../constants');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');

const cloneExporter = (currentExporter) => {
  const clonedExporter = currentExporter;

  // update the `updatedAt` property and set it to null - default value
  clonedExporter.updatedAt = Date.now();
  clonedExporter.status = exporterStatus(clonedExporter);

  return clonedExporter;
};

// TODO: DTFS2-5907 Re-enable cloneSupportingInformation for GEF deals

const cloneFacilities = async (currentDealId, newDealId, auditDetails) => {
  if (!ObjectId.isValid(currentDealId)) {
    throw new Error('Invalid Current Deal Id');
  }

  if (!ObjectId.isValid(newDealId)) {
    throw new Error('Invalid New Deal Id');
  }

  const facilitiesCollection = 'facilities';
  const collection = await db.getCollection(facilitiesCollection);

  // get all existing facilities
  const allFacilities = await collection
    .aggregate([
      {
        $match: { dealId: { $eq: ObjectId(currentDealId) } },
      },
    ])
    .toArray();

  // check if there are any facilities in the db
  if (allFacilities.length) {
    Object.entries(allFacilities).forEach((value, index) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFacilities[index]._id;

      // updated the `dealId` property to match the new application ID
      allFacilities[index].dealId = ObjectId(newDealId);
      // update the `createdAt` property to match the current time in EPOCH format
      allFacilities[index].createdAt = Date.now();
      // update the `updatedAt` property to match the current time in EPOCH format
      allFacilities[index].updatedAt = Date.now();
      // reset the ukefFacilityId
      allFacilities[index].ukefFacilityId = null;
      // reset canResubmitIssuedFacilities to null
      allFacilities[index].canResubmitIssuedFacilities = null;
      // reset issueDate to null
      allFacilities[index].issueDate = null;
      // reset coverDateConfirmed to null
      allFacilities[index].coverDateConfirmed = null;
      // reset coverDateConfirmed to null
      allFacilities[index].unissuedToIssuedByMaker = {};
      allFacilities[index].hasBeenIssuedAndAcknowledged = null;
      allFacilities[index].submittedAsIssuedDate = null;
      allFacilities[index].auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);
      const difference = currentTime - new Date(allFacilities[index].coverStartDate).getTime();
      // check if the coverStartDate is in the past
      if (difference > 0) {
        // if it is, then ask the user to update it
        allFacilities[index].coverStartDate = null;
      }
    });
    await collection.insertMany(allFacilities);
  }
};

const cloneDeal = async ({ dealId, bankInternalRefName, additionalRefName, maker, userId, bank, auditDetails }) => {
  if (!ObjectId.isValid(dealId)) {
    return { status: 400, message: 'Invalid Deal Id' };
  }

  if (typeof bank.id !== 'string') {
    return { status: 400, message: 'Invalid Bank Id' };
  }

  const applicationCollection = 'deals';
  const collection = await db.getCollection(applicationCollection);
  // remove unused properties at the top of the Object (i.e. _id, ukefDecision, etc).
  // any additional fields that are located at the root of the object and that need removing can be added here
  const unusedProperties = [
    '_id',
    'ukefDecision',
    'ukefDecisionAccepted',
    'checkerMIN',
    'manualInclusionNoticeSubmissionDate',
    'comments',
    'previousStatus',
    'dataMigration',
  ];

  // get the current GEF deal
  const existingDeal = await collection.findOne({ _id: { $eq: ObjectId(dealId) }, 'bank.id': { $eq: bank.id } });
  if (existingDeal) {
    const clonedDeal = existingDeal;
    const eligibility = await getLatestEligibilityCriteria();

    // delete unused properties
    unusedProperties.forEach((property) => {
      if (clonedDeal[property]) {
        delete clonedDeal[property];
      }
    });

    clonedDeal.createdAt = Date.now();
    clonedDeal.updatedAt = Date.now();
    clonedDeal.facilitiesUpdated = Date.now();
    clonedDeal.eligibility = eligibility;
    clonedDeal.eligibility.updatedAt = Date.now();
    clonedDeal.status = CONSTANTS.DEAL.DEAL_STATUS.DRAFT;
    clonedDeal.submissionType = null;
    clonedDeal.submissionDate = null;
    clonedDeal.submissionCount = 0;
    clonedDeal.bankInternalRefName = bankInternalRefName;
    clonedDeal.additionalRefName = additionalRefName;
    clonedDeal.maker = maker;
    clonedDeal.bank = bank;
    clonedDeal.ukefDealId = null;
    clonedDeal.checkerId = null;
    clonedDeal.editedBy = [userId];
    clonedDeal.exporter = cloneExporter(clonedDeal.exporter);
    clonedDeal.portalActivities = [];
    clonedDeal.supportingInformation = {};
    clonedDeal.clonedDealId = dealId;
    clonedDeal.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    // insert the cloned deal in the database
    const createdApplication = await collection.insertOne(clonedDeal);
    const newDealId = createdApplication.insertedId;

    // return the ID for the newly inserted deal
    return { newDealId: newDealId.toHexString(), status: 200 };
  }
  return { status: 404 };
};

exports.clone = async (req, res) => {
  const {
    body: { dealId: existingDealId, bankInternalRefName, additionalRefName, userId, bank },
  } = req;

  const validateErrs = validateApplicationReferences(req.body);

  if (validateErrs) {
    return res.status(422).send(validateErrs);
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);
  // clone GEF deal
  const response = await cloneDeal({
    dealId: existingDealId,
    bankInternalRefName,
    additionalRefName,
    maker: req.user,
    userId,
    bank,
    auditDetails,
  });

  if (response.status === 200) {
    const { newDealId } = response;
    // clone the corresponding facilities
    await cloneFacilities(existingDealId, newDealId, auditDetails);

    return res.status(200).send({ dealId: newDealId });
  }
  return res.status(404).send({ message: 'The resource that you are trying to access does not exist' });
};
