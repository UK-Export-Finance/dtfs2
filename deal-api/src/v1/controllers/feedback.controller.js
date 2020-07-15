const { ObjectID } = require('mongodb');
const assert = require('assert');

const db = require('../../drivers/db-client');

const findOneFeedback = async (id, callback) => {
  const collection = await db.getCollection('feedback');

  collection.findOne({ _id: new ObjectID(id) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('feedback');
  const response = await collection.insertOne(req.body);

  const createdFeedback = response.ops[0];
  return res.status(200).send(createdFeedback);
};

exports.findOne = (req, res) => (
  findOneFeedback(req.params.id, (feedback) => {
    if (!feedback) {
      res.status(404).send();
    } else {
      return res.status(200).send(feedback);
    }
    return res.status(404).send();
  })
);

exports.delete = async (req, res) => {
  findOneFeedback(req.params.id, async (feedback) => {
    if (!feedback) {
      return res.status(404).send();
    } else {
      const collection = await db.getCollection('feedback');
      const status = await collection.deleteOne({ _id: new ObjectID(req.params.id) });
      return res.status(200).send(status);
    }
  });
};
