/* eslint-disable no-underscore-dangle */
const { ObjectID } = require('bson');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  validationApplicationCreate,
  validatorStatusCheckEnums,
} = require('./validation/applicationExists');
const { isSuperUser } = require('../../users/checks');

const { Application } = require('../models/application');
const { Exporter } = require('../models/exporter');
const { CoverTerms } = require('../models/coverTerms');
const { STATUS } = require('../enums');
const addSubmissionData = require('./application-submit');
const api = require('../../api');
const { sendEmail } = require('../../../reference-data/api');
const { EMAIL_TEMPLATE_IDS, DEAL: { GEF_STATUS } } = require('../../../constants');

const applicationCollectionName = 'gef-application';
const exporterCollectionName = 'gef-exporter';
const coverTermsCollectionName = 'gef-cover-terms';
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
    applicationCollectionName,
  );
  const exporterCollection = await db.getCollection(exporterCollectionName);
  const coverTermsCollection = await db.getCollection(coverTermsCollectionName);
  const validateErrs = await validationApplicationCreate(
    applicationCollection,
    req.body.bankInternalRefName,
  );
  if (validateErrs) {
    res.status(422).send(validateErrs);
  } else {
    const exporter = await exporterCollection.insertOne(new Exporter());
    const coverTerms = await coverTermsCollection.insertOne(new CoverTerms());

    const createdApplication = await applicationCollection.insertOne(
      new Application(req.body, exporter.insertedId, coverTerms.insertedId),
    );

    const application = await applicationCollection.findOne({
      _id: ObjectID(String(createdApplication.insertedId)),
    });

    res.status(201).json(application);
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);

  const doc = await collection.find({}).toArray();
  res.status(200).send({
    items: doc,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const doc = await collection.findOne({
    _id: ObjectID(String(req.params.id)),
  });
  if (doc) {
    res.status(200).send(doc);
  } else {
    res.status(204).send();
  }
};

exports.getStatus = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const doc = await collection.findOne({
    _id: ObjectID(String(req.params.id)),
  });
  if (doc) {
    res.status(200).send({ status: doc.status });
  } else {
    res.status(204).send();
  }
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const update = new Application(req.body);
  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(String(req.params.id)) } },
    { $set: update },
    { returnDocument: 'after', returnOriginal: false },
  );
  let response;
  if (result.value) {
    response = result.value;
  }
  res.status(utils.mongoStatus(result)).send(response);
};

const sendStatusUpdateEmail = async (user, existingApplication, status) => {
  const {
    userId,
    status: previousStatus,
    bankInternalRefName,
  } = existingApplication;

  // get maker user details
  const userCollection = await db.getCollection(userCollectionName);
  const { firstname: firstName = '', surname = '' } = userId
    ? await userCollection.findOne({ _id: new ObjectID(String(userId)) })
    : {};

  const exporterCollection = await db
    .getCollection(exporterCollectionName);
  // get exporter name
  const { companyName = '' } = await exporterCollection.findOne({
    _id: ObjectID(String(existingApplication.exporterId)),
  });

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
    return res.status(422).send(enumValidationErr);
  }

  const collection = await db.getCollection(applicationCollectionName);
  const existingApplication = await collection.findOne({
    _id: ObjectID(String(applicationId)),
  });

  if (!existingApplication) {
    return res.status(404).send();
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
    { returnDocument: 'after', returnOriginal: false },
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

  return res.status(utils.mongoStatus(updatedDocument)).send(response);
};

exports.delete = async (req, res) => {
  const applicationCollection = await db.getCollection(
    applicationCollectionName,
  );
  const applicationResponse = await applicationCollection.findOneAndDelete({
    _id: ObjectID(String(req.params.id)),
  });
  if (applicationResponse.value) {
    // remove exporter information related to the application
    if (applicationResponse.value.exporterId) {
      const exporterCollection = await db.getCollection(exporterCollectionName);
      await exporterCollection.findOneAndDelete({
        _id: ObjectID(String(applicationResponse.value.exporterId)),
      });
    }
    if (applicationResponse.value.coverTermsId) {
      const coverTermsCollection = await db.getCollection(
        coverTermsCollectionName,
      );
      await coverTermsCollection.findOneAndDelete({
        _id: ObjectID(String(applicationResponse.value.coverTermsId)),
      });
    }
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
  if (!isSuperUser(user)) { amendedFilters.push({ bankId: { $eq: user.bank.id } }); }

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

  const collection = await db.getCollection(applicationCollectionName);

  const doc = await collection
    .aggregate([
      {
        $lookup: {
          from: 'gef-exporter',
          localField: 'exporterId',
          foreignField: '_id',
          as: 'exporter',
        },
      },
      { $unwind: '$exporter' },
      {
        $lookup: {
          from: 'gef-cover-terms',
          localField: 'coverTermsId',
          foreignField: '_id',
          as: 'coverTerms',
        },
      },
      { $unwind: '$coverTerms' },
      { $match: sanitisedFilters },
      { $sort: { updatedAt: -1, createdAt: -1 } },
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
      { $project: { count: '$count.total', deals: 1 } },
    ])
    .toArray();

  return doc;
};
