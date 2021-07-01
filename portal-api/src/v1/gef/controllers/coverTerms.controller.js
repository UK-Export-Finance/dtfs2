const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  coverTermsValidation,
  coverTermsStatus,
  isAutomaticCover,
} = require('./validation/coverTerms');
const { CoverTerms } = require('../models/coverTerms');

const collectionName = 'gef-cover-terms';

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  if (doc) {
    res.status(200)
      .send({
        status: coverTermsStatus(doc),
        details: doc,
        validation: coverTermsValidation(doc),
        isAutomaticCover: isAutomaticCover(doc),
        rows: ['Eligible for automatic cover?'],
      });
  } else {
    res.status(204)
      .send();
  }
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const update = new CoverTerms(req.body);
  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: update }, { returnOriginal: false },
  );
  let response;
  if (result.value) {
    response = {
      status: coverTermsStatus(result.value),
      details: result.value,
      validation: coverTermsValidation(result.value),
    };
  }
  res.status(utils.mongoStatus(result))
    .send(response);
};
