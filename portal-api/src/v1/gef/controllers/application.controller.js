/* eslint-disable no-underscore-dangle */
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { validationApplicationCreate, validatorStatusCheckEnums } = require('./validation/applicationExists');

const { Application } = require('../models/application');
const { Exporter } = require('../models/exporter');

const applicationCollectionName = 'gef-application';
const exporterCollectionName = 'gef-exporter';
const facilitiesCollectionName = 'gef-facilities';

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
  const applicationCollection = await db.getCollection(applicationCollectionName);
  const exporterCollection = await db.getCollection(exporterCollectionName);
  const validateErrs = await validationApplicationCreate(applicationCollection, req.body.bankInternalRefName);
  if (validateErrs) {
    res.status(422).send(validateErrs);
  } else {
    const exporter = await exporterCollection.insertOne(new Exporter());
    const doc = await applicationCollection.insertOne(new Application(req.body, exporter.ops[0]._id));
    res.status(201).json(doc.ops[0]);
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  // const pagination = generatePagination(req);
  const doc = await collection
    .find({})
    // .sort(pagination.sort)
    // .skip(pagination.startsAtIndex)
    // .limit(pagination.pageSize)
    .toArray();
  res.status(200).send({
    items: doc,
    // pagination,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  if (doc) {
    res.status(200).send(doc);
  } else {
    res.status(204).send();
  }
};

exports.getStatus = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
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
    { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: update }, { returnOriginal: false },
  );
  let response;
  if (result.value) {
    response = result.value;
  }
  res.status(utils.mongoStatus(result)).send(response);
};

exports.changeStatus = async (req, res) => {
  const enumValidationErr = validatorStatusCheckEnums(req.body);
  if (enumValidationErr) {
    res.status(422).send(enumValidationErr);
  } else {
    const collection = await db.getCollection(applicationCollectionName);
    const result = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: { status: req.body.status } }, { returnOriginal: false },
    );
    let response;
    if (result.value) {
      response = result.value;
    }
    res.status(utils.mongoStatus(result)).send(response);
  }
};

exports.delete = async (req, res) => {
  const applicationCollection = await db.getCollection(applicationCollectionName);
  const applicationResponse = await applicationCollection.findOneAndDelete({ _id: ObjectId(String(req.params.id)) });
  if (applicationResponse.value) {
    // remove exporter information related to the application
    if (applicationResponse.value.exporterId) {
      const exporterCollection = await db.getCollection(exporterCollectionName);
      await exporterCollection.findOneAndDelete({ _id: ObjectId(String(applicationResponse.value.exporterId)) });
    }
    // remove facility information related to the application
    const facilitiesCollection = await db.getCollection(facilitiesCollectionName);
    await facilitiesCollection.deleteMany({ applicationId: req.params.id });
  }
  res.status(utils.mongoStatus(applicationResponse)).send(applicationResponse.value ? applicationResponse.value : null);
};
