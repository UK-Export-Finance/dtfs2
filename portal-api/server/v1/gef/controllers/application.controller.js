const { ObjectId } = require('mongodb');
const {
  MONGO_DB_COLLECTIONS,
  DocumentNotDeletedError,
  DocumentNotFoundError,
  InvalidDealIdError,
  FacilityNotFoundError,
  DealNotFoundError,
} = require('@ukef/dtfs2-common');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteMany, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { validateApplicationReferences, validatorStatusCheckEnums } = require('./validation/application');
const { exporterStatus } = require('./validation/exporter');
const { supportingInfoStatus } = require('./validation/supportingInfo');

const { eligibilityCriteriaStatus } = require('./validation/eligibilityCriteria');
const { isSuperUser } = require('../../users/checks');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');

const { Application } = require('../models/application');
const { addSubmissionData } = require('./application-submit');
const api = require('../../api');
const { sendEmail } = require('../../../external-api/api');
const {
  EMAIL_TEMPLATE_IDS,
  DEAL: { DEAL_STATUS, DEAL_TYPE },
} = require('../../../constants');

exports.create = async (req, res) => {
  try {
    const newDeal = {
      ...req.body,
      maker: {
        ...req.user,
        _id: String(req.user._id),
      },
    };

    const applicationCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    const validateErrs = validateApplicationReferences(newDeal);

    if (validateErrs) {
      return res.status(422).send(validateErrs);
    }

    const eligibility = await getLatestEligibilityCriteria();

    if (newDeal.exporter) {
      newDeal.exporter.status = exporterStatus(newDeal.exporter);

      newDeal.exporter.updatedAt = Date.now();
    }

    const response = await api.findLatestGefMandatoryCriteria();
    if (response?.data?.version) {
      newDeal.mandatoryVersionId = response.data.version;
    }
    const auditDetails = generatePortalAuditDetails(req.user._id);
    newDeal.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const createdApplication = await applicationCollection.insertOne(new Application(newDeal, eligibility));

    const insertedId = String(createdApplication.insertedId);

    if (!ObjectId.isValid(insertedId)) {
      return res.status(400).send({ status: 400, message: 'Invalid Inserted Id' });
    }

    const application = await applicationCollection.findOne({
      _id: { $eq: ObjectId(insertedId) },
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error('Unable to create an application %o', error);
    return res.status(500).send({ status: 500, message: 'Unable to create an application' });
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const doc = await collection.find({ dealType: { $eq: DEAL_TYPE.GEF } }).toArray();

  if (doc.length && doc.supportingInformation) {
    doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
  }

  return res.status(200).send({
    items: doc,
  });
};

exports.getById = async (req, res) => {
  const _id = req.params.id;

  if (!ObjectId.isValid(_id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const doc = await collection.findOne({ _id: { $eq: ObjectId(_id) } });

  if (doc) {
    if (doc.supportingInformation) {
      doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
    }

    if (doc.eligibility) {
      doc.eligibility.status = eligibilityCriteriaStatus(doc.eligibility.criteria);
    }
    return res.status(200).send(doc);
  }

  return res.status(204).send();
};

exports.getStatus = async (req, res) => {
  const _id = req.params.id;

  if (!ObjectId.isValid(_id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const doc = await collection.findOne({
    _id: { $eq: ObjectId(_id) },
  });

  if (doc) {
    return res.status(200).send({ status: doc.status });
  }

  return res.status(204).send();
};

exports.update = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const update = new Application({
    ...req.body,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  });
  const validateErrs = validateApplicationReferences(update);
  if (validateErrs) {
    return res.status(422).send(validateErrs);
  }

  // TODO: DTFS2-4987 Write unit tests for editorId
  const updateAction = {};
  if (update.editorId) {
    updateAction.$addToSet = { editedBy: update.editorId };
    delete update.editorId;
  }

  if (update.exporter) {
    update.exporter.status = exporterStatus(update.exporter);
    update.exporter.updatedAt = Date.now();
  }

  updateAction.$set = update;

  const result = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(id) } }, updateAction, {
    returnNewDocument: true,
    returnDocument: 'after',
  });
  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result)).send(response);
};

exports.updateSupportingInformation = async (req, res) => {
  const { id: dealId } = req.params;
  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const { application, field, user } = req.body;
  const { _id: editorId } = user;
  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    {
      $addToSet: { editedBy: editorId },
      // set the updatedAt property to the current time in EPOCH format
      $set: { updatedAt: Date.now(), auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
      // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
      $push: { [`supportingInformation.${field}`]: application },
    },
  );

  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result)).send(response);
};

const sendStatusUpdateEmail = async (user, existingApplication, status) => {
  const { maker, status: previousStatus, bankInternalRefName, exporter } = existingApplication;

  // get maker user details
  const { firstname: firstName = '', surname = '' } = maker;

  // get exporter name
  const { companyName = '' } = exporter;

  user.bank.emails.forEach(async (email) => {
    await sendEmail(EMAIL_TEMPLATE_IDS.UPDATE_STATUS, email, {
      firstName,
      surname,
      submissionType: existingApplication.submissionType || '',
      supplierName: companyName,
      bankInternalRefName,
      currentStatus: status,
      previousStatus,
      updatedByName: `${user.firstname} ${user.surname}`,
      updatedByEmail: user.email,
    });
  });
};

exports.changeStatus = async (req, res) => {
  try {
    const dealId = req.params.id;

    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId);
    }

    const enumValidationErr = validatorStatusCheckEnums(req.body);

    if (enumValidationErr) {
      return res.status(422).send(enumValidationErr);
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const existingApplication = await collection.findOne({ _id: { $eq: ObjectId(dealId) } });
    if (!existingApplication) {
      throw new DealNotFoundError(dealId);
    }

    const { status } = req.body;

    const auditDetails = generatePortalAuditDetails(req.user._id);
    let applicationUpdate = {
      status,
      updatedAt: Date.now(),
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
      const submissionData = await addSubmissionData(dealId, existingApplication, auditDetails);

      applicationUpdate = {
        ...applicationUpdate,
        ...submissionData,
      };
    }

    const updatedDocument = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(dealId) } },
      { $set: applicationUpdate },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    let response;

    if (updatedDocument.value) {
      response = updatedDocument.value;

      if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
        await api.tfmDealSubmit(dealId, existingApplication.dealType, req.user);
      }
    }

    // If status of correct type, send update email
    if ([DEAL_STATUS.READY_FOR_APPROVAL, DEAL_STATUS.CHANGES_REQUIRED, DEAL_STATUS.SUBMITTED_TO_UKEF].includes(status)) {
      const { user } = req;
      await sendStatusUpdateEmail(user, existingApplication, status);
    }

    return res.status(utils.mongoStatus(updatedDocument)).send(response);
  } catch (error) {
    if (error instanceof InvalidDealIdError) {
      return res.status(400).send({ status: 400, message: error.message });
    }
    if (error instanceof DealNotFoundError) {
      return res.status(404).send({ status: 404, message: error.message });
    }
    return res.status(500).send({ status: 500, error });
  }
};

exports.delete = async (req, res) => {
  const { id: dealId } = req.params;
  const auditDetails = generatePortalAuditDetails(req.user._id);

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    const applicationDeleteResult = await deleteOne({
      documentId: new ObjectId(dealId),
      collectionName: MONGO_DB_COLLECTIONS.DEALS,
      db,
      auditDetails,
    });

    // remove facility information related to the application
    await deleteMany({
      filter: { dealId: { $eq: ObjectId(dealId) } },
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      db,
      auditDetails,
    });

    return res.status(200).send(applicationDeleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError || error instanceof DealNotFoundError || error instanceof FacilityNotFoundError) {
      return res.status(404).send({ status: 404, message: error.message });
    }

    if (error instanceof InvalidDealIdError) {
      return res.sendStatus(400).send({ status: 400, message: error.message });
    }

    if (error instanceof DocumentNotFoundError) {
      // The deletedCount refers to the number of deals deleted not the number of facilities.
      // DocumentNotFoundError is returned if no facilities are found, which occurs after the deal is successfully deleted
      return res.status(200).send({ acknowledged: true, deletedCount: 1 });
    }

    console.error(error);
    return res.status(500).send({ status: 500, error });
  }
};

const dealsFilters = (user, filters = []) => {
  const amendedFilters = [...filters];

  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    amendedFilters.push({ 'bank.id': { $eq: user.bank.id } });
  }

  let result = {};
  if (amendedFilters.length === 1) {
    [result] = amendedFilters;
  } else if (amendedFilters.length > 1) {
    result = {
      $and: amendedFilters,
    };
  }

  return result;
};

exports.findDeals = async (requestingUser, filters, start = 0, pagesize = 0) => {
  const sanitisedFilters = dealsFilters(requestingUser, filters);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const doc = await collection
    .aggregate([
      { $match: { $eq: sanitisedFilters } },
      {
        $sort: {
          updatedAt: -1,
          createdAt: -1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [{ $skip: start }, ...(pagesize ? [{ $limit: pagesize }] : [])],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          deals: true,
        },
      },
    ])
    .toArray();

  return doc;
};
