/* eslint-disable no-underscore-dangle */
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { validationApplicationCreate } = require('./validation/applicationExists');

const { Application } = require('../models/application');
const { Exporter } = require('../models/exporter');

const applicationCollectionName = 'gef-application';
const exporterCollectionName = 'gef-exporter';

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
    count: doc.length,
    data: doc,
    // pagination,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  res.status(200).send(doc);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const update = new Application(req.body);
  const response = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: update }, { returnOriginal: false },
  );
  res.status(utils.mongoStatus(response)).send(response.value);
};

exports.delete = async (req, res) => {
  const applicationCollection = await db.getCollection(applicationCollectionName);
  const exporterCollection = await db.getCollection(exporterCollectionName);
  const applicationResponse = await applicationCollection.findOneAndDelete({ _id: ObjectId(String(req.params.id)) });
  exporterCollection.findOneAndDelete({ _id: ObjectId(String(applicationResponse.value.exporterId)) });
  res.status(utils.mongoStatus(applicationResponse)).send(applicationResponse.value);
};
