const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { getUnixTime } = require('date-fns');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

exports.postTfmAmendment = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection('tfm-facilities');

    const amendment = {
      amendmentId: new ObjectId(),
      createdAt: getUnixTime(new Date()),
      updatedAt: getUnixTime(new Date()),
      status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS,
    };

    await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(facilityId) } },
      { $push: { 'amendments.history': amendment } },
      { returnDocument: 'after', upsert: true },
    );

    return res.status(200).json({ amendmentId: amendment.amendmentId.toHexString() });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility id' });
};

exports.updateTfmAmendment = async (req, res) => {
  const payload = req.body;
  const { amendmentId, id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId) && ObjectId.isValid(amendmentId)) {
    const collection = await db.getCollection('tfm-facilities');

    const update = {
      updatedAt: getUnixTime(new Date()),
      ...payload,
    };

    const { value } = await collection.findOneAndUpdate(
      { _id: ObjectId(facilityId), 'amendments.history.amendmentId': ObjectId(amendmentId) },
      $.flatten({ 'amendments.history.$': update }),
      { returnDocument: 'after' },
    );

    if (value) {
      return res.status(200).json(value);
    }
    return res.status(404).send({ status: 404, message: 'The amendment does not exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment id' });
};
