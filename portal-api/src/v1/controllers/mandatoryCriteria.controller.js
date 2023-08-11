const assert = require('assert');

const db = require('../../drivers/db-client');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('mandatoryCriteria');

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (version, callback) => {
  if (typeof version !== 'string') {
    throw new Error('Invalid Version');
  }

  const collection = await db.getCollection('mandatoryCriteria');
  collection.findOne({ version: { $eq: Number(version) } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  // MC insertion on non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const collection = await db.getCollection('mandatoryCriteria');
    const mandatoryCriteria = await collection.insertOne(req.body);

    res.status(200).send(mandatoryCriteria);
  }

  res.status(400).send();
};

exports.findAll = (req, res) => (
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        count: mandatoryCriteria.length,
        mandatoryCriteria: sortedMandatoryCriteria,
      })))
);

exports.findOne = (req, res) => (
  findOneMandatoryCriteria(
    req.params.version,
    (mandatoryCriteria) => res.status(200).send(mandatoryCriteria),
  )
);

const findLatestMandatoryCriteria = async () => {
  const collection = await db.getCollection('mandatoryCriteria');
  const latest = await collection.find().sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatestMandatoryCriteria = findLatestMandatoryCriteria;

exports.findLatest = async (req, res) => {
  const latest = await findLatestMandatoryCriteria();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  if (typeof req.params.version !== 'string') {
    res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  // MC insertion on non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const collection = await db.getCollection('mandatoryCriteria');
    const status = await collection.updateOne({ version: { $eq: Number(req.params.version) } }, { $set: { criteria: req.body.criteria } }, {});
    return res.status(200).send(status);
  }

  return res.status(400).send();
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const { version } = req.params;
  const versionNumber = Number(version);

  if (!Number.isNaN(versionNumber)) {
    const status = await collection.deleteOne({ version: { $eq: versionNumber } });
    return res.status(200).send(status);
  }

  return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria version number' });
};
