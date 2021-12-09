const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  validateApplicationReferences,
  validatorStatusCheckEnums,
} = require('./validation/application');
const {
  supportingInfoStatus,
} = require('./validation/supportingInfo');

const {
  eligibilityCriteriaStatus,
} = require('./validation/eligibilityCriteria');
const { isSuperUser } = require('../../users/checks');
const { getLatestCriteria: getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');

const { Application } = require('../models/application');
const { STATUS } = require('../enums');
const { addSubmissionData } = require('./application-submit');
const api = require('../../api');
const { sendEmail } = require('../../../reference-data/api');
const {
  EMAIL_TEMPLATE_IDS,
  DEAL: { GEF_STATUS },
} = require('../../../constants');

const dealsCollectionName = 'deals';
const facilitiesCollectionName = 'gef-facilities';
const userCollectionName = 'users';

// const defaultPaginationOpts = {
//   sortBy: null,
//   sortDirection: null,
//   page: 1,
//   pageSize: 10,
// };

// const generatePagination = (req) => {
//   const paging = {
//     page: Number(req.query.page ? req.query.page : defaultPaginationOpts.page),
//     pageSize: Number(req.query.pageSize ? req.query.pageSize : defaultPaginationOpts.pageSize),
//   };
//   paging.startsAtIndex = (paging.page - 1) * paging.pageSize;
//   paging.endsAtIndex = paging.startsAtIndex + paging.pageSize;
//   if (req.query.sortBy && req.query.sortDirection) {
//     paging[req.query.sortBy] = req.query.sortDirection;
//   } else if (defaultPaginationOpts.sortBy && defaultPaginationOpts.sortDirection) {
//     paging[defaultPaginationOpts.sortBy] = defaultPaginationOpts.sortDirection;
//   }
//   return paging;
// };

exports.create = async (req, res) => {
  const applicationCollection = await db.getCollection(
    dealsCollectionName,
  );
  const validateErrs = validateApplicationReferences(
    req.body,
  );
  if (validateErrs) {
    res.status(422)
      .send(validateErrs);
  } else {
    const eligibility = await getLatestEligibilityCriteria();

    const createdApplication = await applicationCollection.insertOne(
      new Application(req.body, eligibility.terms),
    );

    const application = await applicationCollection.findOne({
      _id: ObjectID(String(createdApplication.insertedId)),
    });

    res.status(201)
      .json(application);
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(dealsCollectionName);

  const doc = await collection.find({})
    .toArray();

  if (doc.length && doc.supportingInformation) {
    doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
  }

  res.status(200)
    .send({
      items: doc,
    });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(dealsCollectionName);
  const doc = await collection.findOne({
    _id: ObjectID(String(req.params.id)),
  });

  if (doc) {
    if (doc.supportingInformation) {
      doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
    }

    if (doc.eligibility) {
      doc.eligibility.status = eligibilityCriteriaStatus(doc.eligibility.criteria);
    }
    res.status(200).send(doc);
  } else {
    res.status(204)
      .send();
  }
};

exports.getStatus = async (req, res) => {
  const collection = await db.getCollection(dealsCollectionName);
  const doc = await collection.findOne({
    _id: ObjectID(String(req.params.id)),
  });
  if (doc) {
    res.status(200)
      .send({ status: doc.status });
  } else {
    res.status(204)
      .send();
  }
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(dealsCollectionName);
  const update = new Application(req.body);
  const validateErrs = validateApplicationReferences(update);
  if (validateErrs) {
    return res.status(422)
      .send(validateErrs);
  }

  // TODO: DTFS2-4987 Write unit tests for editorId
  const updateAction = {};
  if (update.editorId) {
    updateAction.$addToSet = { editedBy: update.editorId };
    delete update.editorId;
  }
  updateAction.$set = update;

  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(String(req.params.id)) } },
    updateAction,
    { returnOriginal: false },
  );
  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result))
    .send(response);
};

exports.updateSupportingInformation = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);

  const { application, field } = req.body;
  const { id: applicationId } = req.params;

  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(applicationId) } },
    {
      // set the updatedAt property to the current time in EPOCH format
      $set: { updatedAt: Date.now() },
      // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
      $push: { [`supportingInformation.${field}`]: application }
    }
  );

  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result)).send(response);
};

const sendStatusUpdateEmail = async (user, existingApplication, status) => {
  const {
    userId,
    status: previousStatus,
    bankInternalRefName,
    exporter,
  } = existingApplication;

  // get maker user details
  const userCollection = await db.getCollection(userCollectionName);
  const {
    firstname: firstName = '',
    surname = '',
  } = userId
    ? await userCollection.findOne({ _id: new ObjectID(String(userId)) })
    : {};

  // get exporter name
  const { companyName = '' } = exporter;

  user.bank.emails.forEach(async (email) => {
    await sendEmail(EMAIL_TEMPLATE_IDS.UPDATE_STATUS, email, {
      firstName,
      surname,
      submissionType: existingApplication.submissionType || '',
      supplierName: companyName,
      bankSupplyContractID: bankInternalRefName,
      currentStatus: GEF_STATUS[status],
      previousStatus: GEF_STATUS[previousStatus],
      updatedByName: `${user.firstname} ${user.surname}`,
      updatedByEmail: user.email,
    });
  });
};

exports.changeStatus = async (req, res) => {
  const applicationId = req.params.id;

  const enumValidationErr = validatorStatusCheckEnums(req.body);
  if (enumValidationErr) {
    return res.status(422)
      .send(enumValidationErr);
  }

  const collection = await db.getCollection(dealsCollectionName);
  const existingApplication = await collection.findOne({
    _id: ObjectID(String(applicationId)),
  });

  if (!existingApplication) {
    return res.status(404)
      .send();
  }

  const { status } = req.body;

  let applicationUpdate = { status, ...{ updatedAt: Date.now() } };

  // TODO: DTFS2-4705 - protect so that only a user with checker role and associated bank can submit to UKEF.
  if (status === STATUS.SUBMITTED_TO_UKEF) {
    const submissionData = await addSubmissionData(
      applicationId,
      existingApplication,
    );

    applicationUpdate = {
      ...applicationUpdate,
      ...submissionData,
    };
  }

  const updatedDocument = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(String(applicationId)) } },
    {
      $set: applicationUpdate,
    },
    { returnOriginal: false },
  );

  let response;

  if (updatedDocument.value) {
    response = updatedDocument.value;

    // TODO: DTFS2-4705 - protect so that only a user with checker role and associated bank can submit to UKEF.
    if (status === STATUS.SUBMITTED_TO_UKEF) {
      await api.tfmDealSubmit(
        applicationId,
        existingApplication.dealType,
        req.user,
      );
    }
  }

  // If status of correct type, send update email
  if (
    [
      STATUS.BANK_CHECK,
      STATUS.CHANGES_REQUIRED,
      STATUS.SUBMITTED_TO_UKEF,
    ].includes(status)
  ) {
    const { user } = req;
    await sendStatusUpdateEmail(user, existingApplication, status);
  }

  return res.status(utils.mongoStatus(updatedDocument))
    .send(response);
};

exports.delete = async (req, res) => {
  const applicationCollection = await db.getCollection(
    dealsCollectionName,
  );
  const applicationResponse = await applicationCollection.findOneAndDelete({
    _id: ObjectID(String(req.params.id)),
  });
  if (applicationResponse.value) {
    // remove facility information related to the application
    const facilitiesCollection = await db.getCollection(
      facilitiesCollectionName,
    );
    await facilitiesCollection.deleteMany({ applicationId: req.params.id });
  }
  res
    .status(utils.mongoStatus(applicationResponse))
    .send(applicationResponse.value ? applicationResponse.value : null);
};

const dealsFilters = (user, filters = []) => {
  const amendedFilters = [...filters];

  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    amendedFilters.push({ bankId: { $eq: user.bank.id } });
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

exports.findDeals = async (
  requestingUser,
  filters,
  start = 0,
  pagesize = 0,
) => {
  const sanitisedFilters = dealsFilters(requestingUser, filters);

  const collection = await db.getCollection(dealsCollectionName);

  const doc = await collection
    .aggregate([
      { $match: sanitisedFilters },
      {
        $sort: {
          updatedAt: -1,
          createdAt: -1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [
            { $skip: start },
            ...(pagesize ? [{ $limit: pagesize }] : []),
          ],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          deals: 1,
        },
      },
    ])
    .toArray();

  return doc;
};
