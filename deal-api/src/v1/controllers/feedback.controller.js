const assert = require('assert');
const db = require('../../drivers/db-client');

const findOneFeedback = async (_id, callback) => {
  const collection = await db.getCollection('feedback');

  let cb;

  if (typeof callback === 'function') {
    cb = (err, result) => {
      assert.equal(err, null);
      callback(result);
    };
  }

  return collection.findOne({ _id }, cb);
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('feedback');
  const response = await collection.insertOne(req.body);

  const createdFeedback = response.ops[0];
  return res.status(200).send(createdFeedback);
};

exports.findOne = (req, res) => (
  findOneFeedback(req.params.id, (feedback) => res.status(200).send(feedback))
);

exports.delete = async (req, res) => {
  const collection = await db.getCollection('feedback');
  const status = await collection.deleteOne({ code: req.params.code });
  res.status(200).send(status);
};
