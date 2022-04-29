const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { getUnixTime } = require('date-fns');
const db = require('../../../../drivers/db-client');
const { findAmendmentById } = require('./tfm-get-amendments.controller');

exports.updateTfmAmendment = async (req, res) => {
  const payload = req.body;
  const { amendmentId, id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId) && ObjectId.isValid(amendmentId)) {
    const findAmendment = await findAmendmentById(facilityId, amendmentId);
    if (findAmendment) {
      const collection = await db.getCollection('tfm-facilities');

      const update = { updatedAt: getUnixTime(new Date()), ...payload };

      await collection.updateOne(
        { _id: ObjectId(facilityId), 'amendments.amendmentId': ObjectId(amendmentId) },
        $.flatten({ 'amendments.$': update }),
      );
      const updatedAmendment = await findAmendmentById(facilityId, amendmentId);
      return res.status(200).json({ ...updatedAmendment });
    }
    return res.status(404).send({ status: 404, message: 'The amendment does not exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment id' });
};
