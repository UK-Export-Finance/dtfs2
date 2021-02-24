const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { validationApplicationCreate } = require('./validation/applicationExists');

const collectionName = 'gef-application';

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
  const collection = await db.getCollection(collectionName);
  const validateErrs = await validationApplicationCreate(collection, req.body.bankInternalRefName);
  if (validateErrs) {
    res.status(422).send(validateErrs);
  } else {
    const doc = await collection.insert(req.body);
    res.status(201).json(doc.ops[0]);
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(collectionName);
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
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  res.status(200).send(doc);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const status = await collection.updateOne({ _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const status = await collection.deleteOne({ _id: ObjectId(String(req.params.id)) });
  res.status(200).send(status);
};
