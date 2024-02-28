const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { getUnixTime } = require('date-fns');
const db = require('../../../../drivers/db-client').default;
const { findAmendmentById } = require('./tfm-get-amendments.controller');
const { DB_COLLECTIONS } = require('../../../../constants');

exports.updateTfmAmendment = async (req, res) => {
  const payload = req.body;
  const { amendmentId, facilityId } = req.params;
  if (ObjectId.isValid(facilityId) && ObjectId.isValid(amendmentId)) {
    const findAmendment = await findAmendmentById(facilityId, amendmentId);
    if (findAmendment) {
      const collection = await db.getCollection(DB_COLLECTIONS.TFM_FACILITIES);
      const protectedProperties = ['_id', 'amendmentId', 'facilityId', 'dealId', 'createdAt', 'updatedAt', 'version'];

      for (const property of protectedProperties) {
        delete payload[property];
      }

      const update = { ...payload, updatedAt: getUnixTime(new Date()) };

      await collection.updateOne(
        { _id: { $eq: ObjectId(facilityId) }, 'amendments.amendmentId': { $eq: ObjectId(amendmentId) } },
        $.flatten({ 'amendments.$': update }),
      );

      const updatedAmendment = await findAmendmentById(facilityId, amendmentId);
      return res.status(200).json({ ...updatedAmendment });
    }
    return res.status(404).send({ status: 404, message: 'The amendment does not exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment id' });
};
