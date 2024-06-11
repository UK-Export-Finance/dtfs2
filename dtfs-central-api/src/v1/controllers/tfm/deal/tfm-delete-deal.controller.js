const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./tfm-get-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

exports.deleteDeal = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  return findOneDeal(id, async (deal) => {
    if (!deal) {
      return res.status(404).send({ status: 404, message: 'Deal not found' });
    }
    if (!ObjectId.isValid(deal._id)) {
      return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
    const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const status = await collection.deleteOne({ _id: { $eq: ObjectId(id) } });

    await facilitiesCollection.deleteMany({ 'facilitySnapshot.dealId': { $eq: deal._id } });
    return res.status(200).send(status);
  });
};
